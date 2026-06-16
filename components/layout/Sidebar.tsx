"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  Percent,
  Briefcase,
  LineChart,
  PieChart,
  Target,
  FileText,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Income", href: "/income", icon: TrendingUp },
  { label: "Expenses", href: "/expenses", icon: TrendingDown },
  { label: "Bank Accounts", href: "/bank-accounts", icon: Building2 },
  { label: "Credit Cards", href: "/credit-cards", icon: CreditCard },
  { label: "Loans", href: "/loans", icon: Percent },
  { label: "Assets", href: "/assets", icon: Briefcase },
  { label: "Investments", href: "/investments", icon: LineChart },
  { label: "Budgets", href: "/budgets", icon: PieChart },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "U";

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.png" alt="FinVault" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-bold text-foreground font-orbitron tracking-wide">FinVault</span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive ? "bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-400" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between rounded-lg bg-sidebar-accent/40 p-3">
          <div className="flex items-center space-x-3 min-w-0">
            <Avatar className="h-9 w-9 border border-indigo-500/20">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-gradient-to-tr from-indigo-500/20 to-emerald-500/20 text-indigo-400 font-semibold text-xs">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold text-foreground">
                {session?.user?.name || "User"}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {session?.user?.email || ""}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded p-1 hover:bg-sidebar-accent hover:text-rose-400 transition-colors"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
