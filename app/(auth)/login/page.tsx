"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (res?.error) {
        if (res.error === "CredentialsSignin") {
          toast.error("Invalid email or password.");
        } else {
          toast.error("Please verify your email before logging in.");
        }
      } else {
        toast.success("Logged in successfully!");
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      toast.error("OAuth sign in failed.");
      setOauthLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1 text-center">
        <h3 className="text-xl font-semibold text-white">Welcome back</h3>
        <p className="text-sm text-slate-400">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={loading || oauthLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-rose-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="border-slate-800 bg-slate-950/50 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-indigo-500"
            disabled={loading || oauthLoading}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-rose-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20"
          disabled={loading || oauthLoading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-800"></div>
        <span className="flex-shrink mx-4 text-xs text-slate-500 uppercase">Or continue with</span>
        <div className="flex-grow border-t border-slate-800"></div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700"
        disabled={loading || oauthLoading}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
        </svg>
        {oauthLoading ? "Connecting..." : "Google"}
      </Button>

      <p className="text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
          Create account
        </Link>
      </p>
    </div>
  );
}
