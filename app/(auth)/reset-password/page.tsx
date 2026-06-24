"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPasswordSchema } from "@/lib/validations/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ResetForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to send reset link");
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
          <h1 className="text-headline-sm font-bold">Check your email</h1>
          <p className="text-body-sm text-neutral-variant-on">
            If an account exists with that email, we've sent a password reset link.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" className="w-full">Back to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-headline-sm font-bold text-neutral-on">Reset password</h1>
        <p className="text-body-sm text-neutral-variant-on">
          Enter your email to receive a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-error bg-error-container rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            className={errors.email ? "border-error" : ""}
          />
          {errors.email && (
            <p className="text-label-sm text-error">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <Link href="/login" className="text-primary font-medium hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
