"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard as CardIcon,
  Percent,
  Target,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Dynamically import Recharts to avoid SSR hydration mismatches
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false }
);
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});
const BarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});

interface DashboardData {
  netWorth: {
    assets: number;
    liabilities: number;
    netWorth: number;
  };
  savingsRate: number;
  creditUtilization: {
    outstanding: number;
    limit: number;
    utilizationPercent: number;
    status: string;
  } | null;
  upcomingEMIs: any[];
  recentExpenses: any[];
  goals: any[];
  notifications: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/dashboard/summary");
        if (res.ok) {
          const summary = await res.json();
          setData(summary);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-400">Aggregating financial data...</p>
        </div>
      </div>
    );
  }

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Safe Fallback Numbers
  const totalAssets = data?.netWorth?.assets ?? 0;
  const totalLiabilities = data?.netWorth?.liabilities ?? 0;
  const netWorthVal = data?.netWorth?.netWorth ?? 0;
  const savingsRateVal =
    typeof data?.savingsRate === "object" && data.savingsRate !== null
      ? (data.savingsRate as { savingsRate: number }).savingsRate ?? 0
      : (data?.savingsRate ?? 0);
  const ccLimit = data?.creditUtilization?.limit ?? 0;
  const ccOutstanding = data?.creditUtilization?.outstanding ?? 0;
  const ccUtilization = data?.creditUtilization?.utilizationPercent ?? 0;

  // Mock charts data (Normally generated dynamically, we build structured trend placeholders here)
  const netWorthTrend = [
    { month: "Jan", NetWorth: netWorthVal * 0.9 },
    { month: "Feb", NetWorth: netWorthVal * 0.93 },
    { month: "Mar", NetWorth: netWorthVal * 0.95 },
    { month: "Apr", NetWorth: netWorthVal * 0.98 },
    { month: "May", NetWorth: netWorthVal * 0.99 },
    { month: "Jun", NetWorth: netWorthVal },
  ];

  const cashFlowTrend = [
    { month: "Jan", Income: 80000, Expense: 45000 },
    { month: "Feb", Income: 85000, Expense: 42000 },
    { month: "Mar", Income: 82000, Expense: 51000 },
    { month: "Apr", Income: 90000, Expense: 48000 },
    { month: "May", Income: 95000, Expense: 46000 },
    { month: "Jun", Income: 100000, Expense: 44000 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. executive KPI metrics overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Net Worth */}
        <Link href="/assets" className="block group">
          <Card className="border-border bg-card/45 backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/50 active:scale-[0.98] h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Net Worth</span>
                <Building2 className="h-5 w-5 text-indigo-400 transition-transform group-hover:scale-110" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(netWorthVal)}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Assets: <span className="text-emerald-500 font-medium">{formatCurrency(totalAssets)}</span> | Debt: <span className="text-rose-550 font-medium">{formatCurrency(totalLiabilities)}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Savings Rate */}
        <Link href="/budgets" className="block group">
          <Card className="border-border bg-card/45 backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/50 active:scale-[0.98] h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Savings Rate</span>
                <TrendingUp className="h-5 w-5 text-emerald-450 transition-transform group-hover:scale-110" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{savingsRateVal.toFixed(1)}%</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {savingsRateVal > 30
                    ? "Exceeding monthly goal!"
                    : "Target rate: 30.0%"}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Credit Card Utilization */}
        <Link href="/credit-cards" className="block group">
          <Card className="border-border bg-card/45 backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-rose-500/50 active:scale-[0.98] h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Card Debt</span>
                <CardIcon className="h-5 w-5 text-rose-450 transition-transform group-hover:scale-110" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{formatCurrency(ccOutstanding)}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Limit: {formatCurrency(ccLimit)} ({ccUtilization.toFixed(0)}% utilization)
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Dynamic Warning Alerts */}
        <Link href="/reports" className="block group">
          <Card className="border-border bg-card/45 backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/50 active:scale-[0.98] h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">System Status</span>
                <AlertCircle className="h-5 w-5 text-indigo-400 transition-transform group-hover:scale-110" />
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">
                  {data?.notifications.length || 0} Alerts
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Requires direct verification review
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 2. visual trend graphs */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Net Worth Area Graph */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground">Net Worth Trend</CardTitle>
            <span className="text-xs font-semibold text-indigo-500 flex items-center">
              Last 6 Months <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </span>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)" }} />
                <Area type="monotone" dataKey="NetWorth" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Income vs Expense Bar Graph */}
        <Card className="border-border bg-card p-6 shadow-sm">
          <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-foreground">Cash Flow Breakdown</CardTitle>
            <span className="text-xs font-semibold text-emerald-500 flex items-center">
              Monthly Growth <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </span>
          </CardHeader>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)" }} />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 3. listings & goal progressions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Goals Progress Card */}
        <Card className="border-border bg-card md:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">Active Goals Progress</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-550 hover:text-indigo-400"
                render={
                  <Link href="/goals" className="flex items-center">
                    View goals <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                }
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.goals.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No active financial goals. Go create one!</p>
            ) : (
              data?.goals.map((g) => (
                <div key={g.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">{g.name}</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}
                    </span>
                  </div>
                  <Progress value={g.progressPercent} className="h-2 bg-muted" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Upcoming EMIs Dues */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-foreground flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-rose-500" /> Upcoming EMIs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.upcomingEMIs.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No EMIs due in the next 7 days.</p>
            ) : (
              data?.upcomingEMIs.map((e) => (
                <div key={e.id} className="flex items-center justify-between border-b border-border/50 pb-2 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{e.loan.loanName}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(e.paymentDate).toLocaleDateString()}</p>
                  </div>
                  <span className="font-bold text-rose-500">{formatCurrency(e.emiAmount)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
