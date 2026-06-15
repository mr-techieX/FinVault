"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Percent, Plus, Loader2, Trash2, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createLoanSchema } from "@/lib/validations/loan";

type LoanFormValues = z.infer<typeof createLoanSchema>;

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
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
  } = useForm<LoanFormValues>({
    resolver: zodResolver(createLoanSchema) as any,
    defaultValues: {
      loanName: "",
      lenderName: "",
      loanType: "PERSONAL",
      principalAmount: 0,
      outstandingAmount: 0,
      interestRate: 0,
      tenureMonths: 12,
      emiAmount: 0,
      disbursedDate: "",
      firstEmiDate: "",
      loanAccountNumber: "",
      processingFee: 0,
      prepaymentPenalty: 0,
      notes: "",
    },
  });

  const loanTypeValue = watch("loanType");

  const fetchLoans = async () => {
    try {
      const res = await fetch("/api/loans");
      if (res.ok) {
        const result = await res.json();
        setLoans(result || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Loan added successfully!");
        setDialogOpen(false);
        reset();
        fetchLoans();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add loan.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this loan? This will delete the payment schedule too.")) return;
    try {
      const res = await fetch(`/api/loans/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Loan record deleted");
        fetchLoans();
      } else {
        toast.error("Failed to delete loan");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Active Loans</h2>
          <p className="text-sm text-muted-foreground">Track mortgage principal balances, interest rates, and EMIs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Add Loan
              </Button>
            }
          />
          <DialogContent className="border-border bg-popover text-popover-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Active Loan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Loan Nickname</Label>
                <Input
                  placeholder="e.g. HDFC Home Loan, SBI Car Loan"
                  className="border-border bg-background text-foreground"
                  {...register("loanName")}
                />
                {errors.loanName && (
                  <p className="text-xs text-rose-500">{errors.loanName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Lender Name</Label>
                <Input
                  placeholder="e.g. HDFC Bank, SBI, ICICI"
                  className="border-border bg-background text-foreground"
                  {...register("lenderName")}
                />
                {errors.lenderName && (
                  <p className="text-xs text-rose-500">{errors.lenderName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Loan Account Number</Label>
                  <Input
                    placeholder="e.g. 100293849182"
                    className="border-border bg-background text-foreground"
                    {...register("loanAccountNumber")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Loan Type</Label>
                  <Select
                    value={loanTypeValue}
                    onValueChange={(val) => setValue("loanType", val as any)}
                  >
                    <SelectTrigger className="border-border bg-background text-foreground">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover text-popover-foreground">
                      <SelectItem value="HOME">Home Loan</SelectItem>
                      <SelectItem value="CAR">Car Loan</SelectItem>
                      <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                      <SelectItem value="EDUCATION">Education Loan</SelectItem>
                      <SelectItem value="GOLD">Gold Loan</SelectItem>
                      <SelectItem value="BUSINESS">Business Loan</SelectItem>
                      <SelectItem value="CREDIT_CARD_LOAN">Card Balance Loan</SelectItem>
                      <SelectItem value="OTHER">Other Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Principal Amount (INR)</Label>
                  <Input
                    type="number"
                    placeholder="1500000"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("principalAmount", Number(e.target.value))}
                  />
                  {errors.principalAmount && (
                    <p className="text-xs text-rose-500">{errors.principalAmount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Outstanding Amount</Label>
                  <Input
                    type="number"
                    placeholder="1450000"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("outstandingAmount", Number(e.target.value))}
                  />
                  {errors.outstandingAmount && (
                    <p className="text-xs text-rose-500">{errors.outstandingAmount.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Interest Rate (% p.a.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="8.50"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("interestRate", Number(e.target.value))}
                  />
                  {errors.interestRate && (
                    <p className="text-xs text-rose-500">{errors.interestRate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Tenure (Months)</Label>
                  <Input
                    type="number"
                    placeholder="120"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("tenureMonths", Number(e.target.value))}
                  />
                  {errors.tenureMonths && (
                    <p className="text-xs text-rose-500">{errors.tenureMonths.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">EMI Amount (INR)</Label>
                  <Input
                    type="number"
                    placeholder="18500"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("emiAmount", Number(e.target.value))}
                  />
                  {errors.emiAmount && (
                    <p className="text-xs text-rose-500">{errors.emiAmount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Disbursed Date</Label>
                  <Input
                    type="date"
                    className="border-border bg-background text-foreground"
                    {...register("disbursedDate")}
                  />
                  {errors.disbursedDate && (
                    <p className="text-xs text-rose-500">{errors.disbursedDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">First EMI Date</Label>
                  <Input
                    type="date"
                    className="border-border bg-background text-foreground"
                    {...register("firstEmiDate")}
                  />
                  {errors.firstEmiDate && (
                    <p className="text-xs text-rose-500">{errors.firstEmiDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Prepayment Penalty (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="2.0"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("prepaymentPenalty", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Processing Fee (INR)</Label>
                <Input
                  type="number"
                  placeholder="5000"
                  className="border-border bg-background text-foreground"
                  onChange={(e) => setValue("processingFee", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Notes</Label>
                <Textarea
                  placeholder="Additional terms or features of the loan..."
                  className="border-border bg-background text-foreground min-h-[60px]"
                  {...register("notes")}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg mt-2"
                disabled={submitLoading}
              >
                {submitLoading ? "Adding..." : "Add Active Loan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex h-32 w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : loans.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground border border-border border-dashed rounded-xl bg-card/10">
          No active loans logged. Click &quot;Add Loan&quot; to begin.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loans.map((l) => {
            const outstanding = Number(l.outstandingAmount);
            const principal = Number(l.principalAmount);
            const emi = Number(l.emiAmount);
            const rate = Number(l.interestRate);
            return (
              <Card key={l.id} className="border-border bg-card/45 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Percent className="h-5 w-5 text-indigo-400" />
                      <h4 className="text-sm font-bold text-foreground truncate max-w-[140px]">{l.loanName}</h4>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-muted-foreground uppercase font-semibold">
                      {l.loanType}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Outstanding Principal</span>
                    <span className="text-xl font-bold text-foreground">{formatCurrency(outstanding)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Lender: <span className="text-foreground">{l.lenderName}</span></p>
                    <p>Total Loan: <span className="text-foreground">{formatCurrency(principal)}</span></p>
                    <p>Interest Rate: <span className="text-indigo-500 font-bold">{rate.toFixed(2)}%</span></p>
                    <p>EMI Amount: <span className="text-rose-500 font-bold">{formatCurrency(emi)}</span></p>
                    <p>Tenure: <span className="text-foreground">{l.tenureMonths} Months</span></p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="text-xs text-muted-foreground hover:text-rose-500 font-medium flex items-center transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Loan
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
