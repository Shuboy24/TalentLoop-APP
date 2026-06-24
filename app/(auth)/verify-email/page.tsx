"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"pending" | "success" | "error">(token ? "pending" : "pending");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json();
        
        if (res.ok && json.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(json.error || "Verification failed");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg("Network error occurred");
      }
    };
    verify();
  }, [token]);

  if (token) {
    if (status === "pending") {
      return (
        <div className="text-center space-y-4">
          <h1 className="text-headline-sm font-bold">Verifying your email</h1>
          <p className="text-body-sm text-neutral-variant-on">Please wait...</p>
        </div>
      );
    }
    
    if (status === "success") {
      return (
        <div className="text-center space-y-6">
          <div className="mx-auto w-12 h-12 bg-success-container rounded-full flex items-center justify-center">
            <Mail className="text-success" />
          </div>
          <div className="space-y-2">
            <h1 className="text-headline-sm font-bold">Email verified!</h1>
            <p className="text-body-sm text-neutral-variant-on">Your account is now active.</p>
          </div>
          <Button onClick={() => router.push("/login")} className="w-full">
            Continue to Login
          </Button>
        </div>
      );
    }

    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-headline-sm font-bold text-error">Verification failed</h1>
          <p className="text-body-sm text-neutral-variant-on">{errorMsg}</p>
        </div>
        <Button onClick={() => router.push("/login")} className="w-full">
          Back to Login
        </Button>
      </div>
    );
  }

  // No token, tell user to check email
  return (
    <div className="text-center space-y-6">
      <div className="mx-auto w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
        <Mail className="text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-headline-sm font-bold">Check your email</h1>
        <p className="text-body-sm text-neutral-variant-on">
          We've sent a verification link to your email address. Please click it to activate your account.
        </p>
      </div>
      <div className="text-sm">
        <Link href="/login" className="text-primary hover:underline font-medium">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
