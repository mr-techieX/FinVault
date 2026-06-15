import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indian Rupee currency */
export function formatCurrency(
  amount: number | string,
  currency = "INR",
  locale = "en-IN"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/** Format a number with Indian number system (lakh, crore) */
export function formatIndianNumber(num: number): string {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toFixed(0)}`;
}

/** Format a percentage */
export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

/** Format a date */
export function formatDate(
  date: Date | string,
  format: "short" | "long" | "month" = "short"
): string {
  const d = new Date(date);
  if (format === "short") {
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  if (format === "long") {
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

/** Get month name */
export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
  });
}

/** Calculate percentage change */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** Truncate a string */
export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str;
}

/** Generate a random color for categories */
export function getRandomColor(): string {
  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#84cc16",
    "#f97316",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/** Check if a credit card utilization is in a danger zone */
export function getCreditUtilizationStatus(
  outstanding: number,
  limit: number
): { status: "good" | "warning" | "danger"; percent: number } {
  const percent = (outstanding / limit) * 100;
  if (percent <= 30) return { status: "good", percent };
  if (percent <= 75) return { status: "warning", percent };
  return { status: "danger", percent };
}

/** Sleep helper */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
