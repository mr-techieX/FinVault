"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || "Failed to create account.");
      } else {
        toast.success("Account created! Verification email sent.");
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 text-center">
        <h3 className="text-xl font-semibold text-white">Create an account</h3>
        <p className="text-sm text-slate-400">Get started by entering your information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">Full Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={loading}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-rose-500">{errors.name.message}</p>
          )}
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300">Password</Label>
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
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Sign In
        </Link>
      </p>
    </div>
  );
}
