import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased">
      {/* Decorative background glow spheres */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md p-4">
        {/* Logo and Brand Header */}
        <div className="mb-8 flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 p-2 shadow-lg shadow-indigo-500/30">
            <span className="text-2xl font-bold tracking-wider text-white">FV</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-orbitron">FinVault</h2>
          <p className="text-sm text-slate-400">Personal Finance & Net Worth Platform</p>
        </div>

        {/* Auth form card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
