"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { newPasswordSchema } from "@/lib/validations/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NewPasswordForm = z.infer<typeof newPasswordSchema>;

function NewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      token: token || "",
    }
  });

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-headline-sm font-bold text-error">Invalid Link</h1>
        <p className="text-body-sm text-neutral-variant-on">This password reset link is invalid or has expired.</p>
        <Link href="/reset-password">
          <Button className="mt-4">Request new link</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: NewPasswordForm) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to reset password");
        return;
      }
      
      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-headline-sm font-bold text-success">Password reset</h1>
          <p className="text-body-sm text-neutral-variant-on">
            Your password has been successfully updated.
          </p>
        </div>
        <Button onClick={() => router.push("/login")} className="w-full">
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-headline-sm font-bold text-neutral-on">New password</h1>
        <p className="text-body-sm text-neutral-variant-on">
          Enter your new password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-error bg-error-container rounded-md">
            {error}
          </div>
        )}

        <Input type="hidden" {...register("token")} />

        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            {...register("password")}
            className={errors.password ? "border-error" : ""}
          />
          {errors.password && (
            <p className="text-label-sm text-error">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className={errors.confirmPassword ? "border-error" : ""}
          />
          {errors.confirmPassword && (
            <p className="text-label-sm text-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save password"}
        </Button>
      </form>
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordContent />
    </Suspense>
  );
}
