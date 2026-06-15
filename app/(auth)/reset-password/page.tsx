"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema) as any,
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to reset password.");
      } else {
        setSuccess(true);
        toast.success("Password has been reset successfully.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-white">Invalid Reset Link</h3>
        <p className="text-sm text-slate-400">
          This password reset link is invalid or missing a token.
        </p>
        <Button render={<Link href="/forgot-password" />} variant="outline" className="w-full border-slate-800 text-white mt-4">
          Request New Link
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          <h3 className="text-xl font-bold text-white">Password Updated</h3>
          <p className="text-sm text-slate-400">
            Your password has been changed successfully. You can now log in with your new credentials.
          </p>
          <Button render={<Link href="/login" />} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 text-center">
        <h3 className="text-xl font-semibold text-white">Reset Password</h3>
        <p className="text-sm text-slate-400">Choose a new, secure password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={loading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-rose-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={loading}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-rose-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20"
          disabled={loading}
        >
          {loading ? "Resetting password..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Loading page...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
