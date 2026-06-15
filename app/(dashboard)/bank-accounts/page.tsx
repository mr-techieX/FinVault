"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Building2,
  Plus,
  Loader2,
  Trash2,
  Wallet,
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
import { Badge } from "@/components/ui/badge";
import { createBankAccountSchema } from "@/lib/validations";

type BankAccountFormValues = z.infer<typeof createBankAccountSchema>;

interface AccountItem {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber?: string | null;
  accountType: string;
  balance: number;
  interestRate?: number | null;
  maturityDate?: string | null;
}

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BankAccountFormValues>({
    resolver: zodResolver(createBankAccountSchema) as any,
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      accountType: "SAVINGS",
      balance: 0,
    },
  });

  const accountTypeValue = watch("accountType");

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/bank-accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/bank-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Account created successfully!");
        setDialogOpen(false);
        reset();
        fetchAccounts();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create account.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to close/delete this bank account?")) return;
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Account closed");
        fetchAccounts();
      } else {
        toast.error("Failed to delete account");
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

  const totalBankBalance = accounts.reduce((sum, item) => sum + Number(item.balance), 0);

  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Bank Accounts</h2>
          <p className="text-sm text-slate-400">Manage your deposits, checking accounts, and savings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Add Account
              </Button>
            }
          />
          <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add Bank Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-slate-300">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="HDFC Bank, ICICI Bank, SBI, etc."
                  className="border-slate-800 bg-slate-950/50 text-white"
                  {...register("bankName")}
                />
                {errors.bankName && (
                  <p className="text-xs text-rose-500">{errors.bankName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName" className="text-slate-300">Account Name / Nickname</Label>
                <Input
                  id="accountName"
                  placeholder="Primary Savings, FD Account"
                  className="border-slate-800 bg-slate-950/50 text-white"
                  {...register("accountName")}
                />
                {errors.accountName && (
                  <p className="text-xs text-rose-500">{errors.accountName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-slate-300">Last 4 Digits (Optional)</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234"
                  maxLength={4}
                  className="border-slate-800 bg-slate-950/50 text-white"
                  {...register("accountNumber")}
                />
                {errors.accountNumber && (
                  <p className="text-xs text-rose-500">{errors.accountNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType" className="text-slate-300">Account Type</Label>
                <Select
                  value={accountTypeValue}
                  onValueChange={(val) => setValue("accountType", val as any)}
                >
                  <SelectTrigger className="border-slate-800 bg-slate-950/50 text-white">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="CURRENT">Current</SelectItem>
                    <SelectItem value="FIXED_DEPOSIT">Fixed Deposit</SelectItem>
                    <SelectItem value="RECURRING_DEPOSIT">Recurring Deposit</SelectItem>
                    <SelectItem value="SALARY">Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance" className="text-slate-300">Starting Balance (INR)</Label>
                <Input
                  id="balance"
                  type="number"
                  placeholder="50000"
                  className="border-slate-800 bg-slate-950/50 text-white"
                  onChange={(e) => setValue("balance", Number(e.target.value))}
                />
                {errors.balance && (
                  <p className="text-xs text-rose-500">{errors.balance.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg mt-2"
                disabled={submitLoading}
              >
                {submitLoading ? "Creating..." : "Add Account"}
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
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Total Liquid Balance</p>
              <h3 className="text-xl font-bold text-white mt-1">{formatCurrency(totalBankBalance)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List Grid */}
      {loading ? (
        <div className="flex h-32 w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 border border-slate-800 border-dashed rounded-xl">
          No bank accounts logged. Click &quot;Add Account&quot; to begin.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => (
            <Card key={acc.id} className="border-slate-800 bg-slate-900/40 relative overflow-hidden group hover:border-slate-700/80 transition-colors">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-slate-800 text-slate-400 group-hover:text-white transition-colors">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white truncate max-w-[140px]">{acc.accountName}</h4>
                      <p className="text-[10px] text-slate-500">{acc.bankName} {acc.accountNumber ? `(•• ${acc.accountNumber})` : ""}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-slate-800 bg-slate-900 text-[9px] text-slate-400 font-semibold uppercase">
                    {acc.accountType}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Current Balance</p>
                  <p className="text-xl font-bold text-white mt-0.5">{formatCurrency(acc.balance)}</p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="text-xs text-slate-600 hover:text-rose-400 font-medium flex items-center transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Close Account
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
