"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  PieChart,
  Plus,
  Loader2,
  Trash2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { createBudgetSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

type BudgetFormValues = z.infer<typeof createBudgetSchema>;

interface BudgetAnalysisItem {
  category: string;
  budgeted: number;
  actual: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
}

interface BudgetData {
  id: string;
  month: number;
  year: number;
  totalLimit?: number | null;
  categories: any[];
}

export default function BudgetsPage() {
  const [data, setData] = useState<{ budget: BudgetData | null; analysis: BudgetAnalysisItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(createBudgetSchema) as any,
    defaultValues: {
      name: "Monthly Budget",
      month: selectedMonth,
      year: selectedYear,
      rollover: false,
      categories: [
        { categoryName: "Housing", limit: 0 },
        { categoryName: "Groceries", limit: 0 },
        { categoryName: "Utilities", limit: 0 },
        { categoryName: "Entertainment", limit: 0 },
        { categoryName: "Others", limit: 0 },
      ],
    },
  });

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
    setValue("month", selectedMonth);
    setValue("year", selectedYear);
  }, [selectedMonth, selectedYear]);

  const onSubmit = async (formData: any) => {
    setSubmitLoading(true);
    try {
      // Filter out categories with zero limits
      const activeCategories = formData.categories.filter((cat: any) => cat.limit > 0);
      if (activeCategories.length === 0) {
        toast.error("Please set a limit for at least one category.");
        setSubmitLoading(false);
        return;
      }

      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          categories: activeCategories,
        }),
      });

      if (res.ok) {
        toast.success("Budget updated successfully!");
        setDialogOpen(false);
        reset();
        fetchBudget();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save budget.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalBudgeted = data?.analysis?.reduce((sum, item) => sum + item.budgeted, 0) || 0;
  const totalActual = data?.analysis?.reduce((sum, item) => sum + item.actual, 0) || 0;
  const overallPercent = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header and selector */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Budgets</h2>
          <p className="text-sm text-slate-400">Establish and monitor financial spending limits</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <Select
              value={String(selectedMonth)}
              onValueChange={(val) => setSelectedMonth(Number(val))}
            >
              <SelectTrigger className="border-0 bg-transparent text-white w-24 focus:ring-0">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {new Date(0, i).toLocaleString("en-US", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <Select
              value={String(selectedYear)}
              onValueChange={(val) => setSelectedYear(Number(val))}
            >
              <SelectTrigger className="border-0 bg-transparent text-white w-20 focus:ring-0">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                {[2024, 2025, 2026, 2027].map((yr) => (
                  <SelectItem key={yr} value={String(yr)}>
                    {yr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md">
                  <Plus className="mr-2 h-4 w-4" /> Setup Budget
                </Button>
              }
            />
            <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Configure Budget Limits</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <p className="text-xs text-slate-400">Set limits for categories. Zero limits will be ignored.</p>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {["Housing", "Groceries", "Utilities", "Entertainment", "Others"].map((catName, index) => (
                    <div key={catName} className="space-y-1">
                      <Label className="text-xs text-slate-400">{catName} Limit (INR)</Label>
                      <Input
                        type="hidden"
                        value={catName}
                        {...register(`categories.${index}.categoryName`)}
                      />
                      <Input
                        type="number"
                        placeholder="10000"
                        className="border-slate-800 bg-slate-950/50 text-white text-xs h-9"
                        onChange={(e) => setValue(`categories.${index}.limit`, Number(e.target.value))}
                      />
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg mt-2"
                  disabled={submitLoading}
                >
                  {submitLoading ? "Saving..." : "Save Budget"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      {loading ? (
        <div className="flex h-32 w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : !data?.budget ? (
        <div className="py-12 text-center text-xs text-slate-500 border border-slate-800 border-dashed rounded-xl">
          No budget configured for this month. Click &quot;Setup Budget&quot; to define limits.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {/* Total Limit */}
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-6">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Budgeted limit</span>
                <h3 className="text-xl font-bold text-white mt-1">{formatCurrency(totalBudgeted)}</h3>
              </CardContent>
            </Card>

            {/* Spent */}
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-6">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Actual expenses</span>
                <h3 className="text-xl font-bold text-white mt-1">{formatCurrency(totalActual)}</h3>
              </CardContent>
            </Card>

            {/* Remaining */}
            <Card className="border-slate-800 bg-slate-900/40">
              <CardContent className="p-6">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Remaining balance</span>
                <h3 className={`text-xl font-bold mt-1 ${totalBudgeted - totalActual >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(totalBudgeted - totalActual)}
                </h3>
              </CardContent>
            </Card>
          </div>

          {/* Budget Categories Progression List */}
          <Card className="border-slate-800 bg-slate-900/30">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-white">Categories Utilization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.analysis.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{cat.category}</span>
                    <span className="text-slate-400">
                      <span className="font-bold text-white">{formatCurrency(cat.actual)}</span> / {formatCurrency(cat.budgeted)}
                    </span>
                  </div>
                  <Progress
                    value={cat.percentUsed}
                    className={cn(
                      "h-2.5 bg-slate-800",
                      cat.isOverBudget
                        ? "[&_[data-slot=progress-indicator]]:bg-rose-500"
                        : "[&_[data-slot=progress-indicator]]:bg-indigo-500"
                    )}
                  />
                  {cat.isOverBudget && (
                    <p className="text-[10px] text-rose-400 font-semibold">Overspend Alert: Limit exceeded by {formatCurrency(cat.actual - cat.budgeted)}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
