import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, TrendingUp, Cpu, PieChart } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Glow backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[130px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[130px]" />

      {/* Header bar */}
      <header className="relative z-10 mx-auto max-w-7xl w-full px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="FinVault" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-bold text-white font-orbitron tracking-wide">FinVault</span>
        </Link>
        <div className="flex items-center space-x-4">
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/settings" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                Settings
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all">
                Open Vault
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition-all">
                Access Vault
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-5xl mx-auto px-6 py-12 text-center">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            Automated Net Worth Tracking
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Complete Wealth Intelligence <br className="hidden sm:inline" />
            In One Secure Vault
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed">
            Monitor real-time net worth fluctuations, dynamic loan amortization, CAGR/XIRR growth, category budget limits, and financial goals. Completely manual logging with zero account linkage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {session?.user ? (
              <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-all">
                  Initialize Free Account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 px-6 py-3 text-base font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all">
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-20 text-left">
          <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-6 space-y-3">
            <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Strict Row Security</h4>
            <p className="text-xs text-slate-400">All data records are securely encrypted and filtered at request limits.</p>
          </div>

          <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-6 space-y-3">
            <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Investment CAGR/XIRR</h4>
            <p className="text-xs text-slate-400">Statically calculate annualized return metrics for multi-platform deposits.</p>
          </div>

          <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-6 space-y-3">
            <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Amortization Engine</h4>
            <p className="text-xs text-slate-400">Dynamically simulate prepayments and tenure reductions for loans.</p>
          </div>

          <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-6 space-y-3">
            <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400">
              <PieChart className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Budget Guardrails</h4>
            <p className="text-xs text-slate-400">Set budget thresholds with custom alert feeds to monitor spending.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-950 mx-auto max-w-7xl w-full px-6 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} FinVault. Personal manual wealth tracking. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
