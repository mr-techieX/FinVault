"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema) as any,
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to trigger reset link.");
      } else {
        setSuccess(true);
        setEmailSent(data.email);
        toast.success("Password reset link sent!");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          <h3 className="text-xl font-bold text-white">Reset Link Sent</h3>
          <p className="text-sm text-slate-400">
            We sent a password reset link to <span className="font-semibold text-white">{emailSent}</span>.
            Please open the link to set a new password.
          </p>
          <Button render={<Link href="/login" />} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 mt-4">
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 text-center">
        <h3 className="text-xl font-semibold text-white">Forgot password?</h3>
        <p className="text-sm text-slate-400">Enter your email address to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={loading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-rose-500">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20"
          disabled={loading}
        >
          {loading ? "Sending link..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Sign In
        </Link>
      </p>
    </div>
  );
}
