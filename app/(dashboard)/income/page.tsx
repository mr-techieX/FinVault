"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  TrendingUp,
  Plus,
  Loader2,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  Search,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { createIncomeSchema } from "@/lib/validations/income";

type IncomeFormValues = z.infer<typeof createIncomeSchema>;

interface IncomeItem {
  id: string;
  source: string;
  amount: number;
  date: string;
  frequency: string;
  description?: string;
  taxable: boolean;
  category?: { name: string } | null;
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(createIncomeSchema) as any,
    defaultValues: {
      source: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      frequency: "ONE_TIME",
      taxable: true,
    },
  });

  const frequencyValue = watch("frequency");

  const fetchIncomes = async () => {
    try {
      const res = await fetch("/api/income");
      if (res.ok) {
        const data = await res.json();
        setIncomes(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch incomes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Income logged successfully!");
        setDialogOpen(false);
        reset();
        fetchIncomes();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to log income.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income entry?")) return;
    try {
      const res = await fetch(`/api/income/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Income entry deleted");
        fetchIncomes();
      } else {
        toast.error("Failed to delete entry");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredIncomes = incomes.filter((inc) =>
    inc.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMonthlyIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Incomes</h2>
          <p className="text-sm text-slate-400">Track and manage your incoming revenue channels</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Add Income
              </Button>
            }
          />
          <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Log Income</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="source" className="text-slate-300">Income Source</Label>
                <Input
                  id="source"
                  placeholder="Salary, Client Project, etc."
                  className="border-slate-800 bg-slate-950/50 text-white"
                  {...register("source")}
                />
                {errors.source && (
                  <p className="text-xs text-rose-500">{errors.source.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-300">Amount (INR)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="50000"
                  className="border-slate-800 bg-slate-950/50 text-white"
                  onChange={(e) => setValue("amount", Number(e.target.value))}
                />
                {errors.amount && (
                  <p className="text-xs text-rose-500">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-slate-300">Date</Label>
                <Input
                  id="date"
                  type="date"
                  className="border-slate-800 bg-slate-950/50 text-white"
                  {...register("date")}
                />
                {errors.date && (
                  <p className="text-xs text-rose-500">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency" className="text-slate-300">Frequency</Label>
                <Select
                  value={frequencyValue}
                  onValueChange={(val) => setValue("frequency", val as any)}
                >
                  <SelectTrigger className="border-slate-800 bg-slate-950/50 text-white">
                    <SelectValue placeholder="Select Frequency" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="ONE_TIME">One Time</SelectItem>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Notes, references, etc."
                  className="border-slate-800 bg-slate-950/50 text-white"
                  {...register("description")}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg mt-2"
                disabled={submitLoading}
              >
                {submitLoading ? "Logging..." : "Confirm & Save"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Card */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Logged Income</p>
              <h3 className="text-xl font-bold text-white mt-1">{formatCurrency(totalMonthlyIncome)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content table */}
      <Card className="border-slate-800/80 bg-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-bold text-white">Income Streams</CardTitle>
          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-slate-800 bg-slate-950/50 text-white text-xs h-9 w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-32 w-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : filteredIncomes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No income entries found.</div>
          ) : (
            <Table>
              <TableHeader className="border-slate-800/50 bg-slate-950/40">
                <TableRow className="border-slate-850 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-semibold">Source</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Frequency</TableHead>
                  <TableHead className="text-slate-400 font-semibold">Date</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-right">Amount</TableHead>
                  <TableHead className="text-slate-400 font-semibold text-center w-16">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomes.map((inc) => (
                  <TableRow key={inc.id} className="border-slate-800/50 hover:bg-slate-900/20">
                    <TableCell className="font-medium text-white">{inc.source}</TableCell>
                    <TableCell className="text-slate-300">
                      <Badge variant="outline" className="border-slate-800 bg-slate-900/60 text-slate-400 uppercase text-[9px]">
                        {inc.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{new Date(inc.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-400">{formatCurrency(inc.amount)}</TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleDelete(inc.id)}
                        className="rounded p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
