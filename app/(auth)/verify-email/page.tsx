"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "prompt">(
    token ? "loading" : "prompt"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Your email has been successfully verified!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification link is invalid or expired.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="text-center space-y-6">
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
          <h3 className="text-lg font-semibold text-white">Verifying your email...</h3>
          <p className="text-sm text-slate-400">Please wait while we confirm your credentials</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          <h3 className="text-xl font-bold text-white">Email Verified!</h3>
          <p className="text-sm text-slate-400">{message}</p>
          <Button render={<Link href="/login" />} className="w-full bg-indigo-600 text-white hover:bg-indigo-700 mt-4">
            Go to Login
          </Button>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <XCircle className="h-16 w-16 text-rose-500" />
          <h3 className="text-xl font-bold text-white">Verification Failed</h3>
          <p className="text-sm text-slate-400">{message}</p>
          <Button render={<Link href="/login" />} className="w-full bg-slate-800 text-white hover:bg-slate-700 mt-4">
            Back to Login
          </Button>
        </div>
      )}

      {status === "prompt" && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Mail className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Check your email</h3>
          <p className="text-sm text-slate-400">
            We sent a verification link to <span className="font-semibold text-white">{email || "your email address"}</span>.
            Please open the link to activate your account.
          </p>
          <Button render={<Link href="/login" />} variant="outline" className="w-full border-slate-800 text-white hover:bg-slate-900 mt-4">
            Return to Login
          </Button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-400">Loading page...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
