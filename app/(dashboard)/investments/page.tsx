"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LineChart, Plus, Loader2, Trash2 } from "lucide-react";
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
import { createInvestmentSchema } from "@/lib/validations";

type InvestmentFormValues = z.infer<typeof createInvestmentSchema>;

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<any[]>([]);
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
  } = useForm<InvestmentFormValues>({
    resolver: zodResolver(createInvestmentSchema) as any,
    defaultValues: {
      investmentName: "",
      investmentType: "STOCKS",
      platform: "",
      units: undefined,
      buyPrice: undefined,
      currentNAV: undefined,
      investedAmount: 0,
      currentValue: 0,
      maturityDate: "",
      interestRate: undefined,
      folioNumber: "",
      isin: "",
      notes: "",
    },
  });

  const investmentTypeValue = watch("investmentType");

  const fetchInvestments = async () => {
    try {
      const res = await fetch("/api/investments");
      if (res.ok) {
        const result = await res.json();
        setInvestments(result || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      // Format optional fields
      const formattedData = {
        ...data,
        units: data.units ? Number(data.units) : undefined,
        buyPrice: data.buyPrice ? Number(data.buyPrice) : undefined,
        currentNAV: data.currentNAV ? Number(data.currentNAV) : undefined,
        interestRate: data.interestRate ? Number(data.interestRate) : undefined,
        maturityDate: data.maturityDate || undefined,
        folioNumber: data.folioNumber || undefined,
        isin: data.isin || undefined,
        platform: data.platform || undefined,
        notes: data.notes || undefined,
      };

      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (res.ok) {
        toast.success("Investment logged successfully!");
        setDialogOpen(false);
        reset();
        fetchInvestments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to log investment.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this investment holding?")) return;
    try {
      const res = await fetch(`/api/investments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Investment record deleted");
        fetchInvestments();
      } else {
        toast.error("Failed to delete investment");
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Investments Portfolio</h2>
          <p className="text-sm text-muted-foreground">Manage Stocks, Mutual Funds, Fixed Deposits, and PPF allocations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Add Investment
              </Button>
            }
          />
          <DialogContent className="border-border bg-popover text-popover-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Log Investment Asset</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Investment Name</Label>
                <Input
                  placeholder="e.g. Parag Parikh Flexi Cap, Reliance Stock"
                  className="border-border bg-background text-foreground"
                  {...register("investmentName")}
                />
                {errors.investmentName && (
                  <p className="text-xs text-rose-500">{errors.investmentName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Investment Type</Label>
                  <Select
                    value={investmentTypeValue}
                    onValueChange={(val) => setValue("investmentType", val as any)}
                  >
                    <SelectTrigger className="border-border bg-background text-foreground">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover text-popover-foreground">
                      <SelectItem value="STOCKS">Equity Stocks</SelectItem>
                      <SelectItem value="MUTUAL_FUND">Mutual Fund</SelectItem>
                      <SelectItem value="ETF">ETF</SelectItem>
                      <SelectItem value="FIXED_DEPOSIT">Fixed Deposit</SelectItem>
                      <SelectItem value="PPF">PPF</SelectItem>
                      <SelectItem value="EPF">EPF</SelectItem>
                      <SelectItem value="NPS">NPS</SelectItem>
                      <SelectItem value="BONDS">Bonds</SelectItem>
                      <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                      <SelectItem value="US_STOCKS">US Stocks</SelectItem>
                      <SelectItem value="REITS">REITs</SelectItem>
                      <SelectItem value="SGBs">Sovereign Gold Bonds</SelectItem>
                      <SelectItem value="OTHER">Other Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Platform / Broker</Label>
                  <Input
                    placeholder="e.g. Zerodha, Groww, Kuvera"
                    className="border-border bg-background text-foreground"
                    {...register("platform")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Invested Amount (INR)</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("investedAmount", Number(e.target.value))}
                  />
                  {errors.investedAmount && (
                    <p className="text-xs text-rose-500">{errors.investedAmount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Current Value (INR)</Label>
                  <Input
                    type="number"
                    placeholder="55000"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("currentValue", Number(e.target.value))}
                  />
                  {errors.currentValue && (
                    <p className="text-xs text-rose-500">{errors.currentValue.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Units (Optional)</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="124.52"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("units", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Buy Price / NAV (Optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="401.50"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("buyPrice", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Current NAV (Optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="441.70"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("currentNAV", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Interest Rate (%, Optional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="7.10"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("interestRate", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Maturity Date (Optional)</Label>
                  <Input
                    type="date"
                    className="border-border bg-background text-foreground"
                    {...register("maturityDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Folio Number (Optional)</Label>
                  <Input
                    placeholder="e.g. 12938491/2"
                    className="border-border bg-background text-foreground"
                    {...register("folioNumber")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">ISIN Code (Optional)</Label>
                <Input
                  placeholder="e.g. INF200K01234"
                  className="border-border bg-background text-foreground"
                  {...register("isin")}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Notes</Label>
                <Textarea
                  placeholder="Memo or additional details..."
                  className="border-border bg-background text-foreground min-h-[60px]"
                  {...register("notes")}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg mt-2"
                disabled={submitLoading}
              >
                {submitLoading ? "Adding..." : "Log Investment"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex h-32 w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : investments.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground border border-border border-dashed rounded-xl bg-card/10">
          No investments logged. Click &quot;Add Investment&quot; to begin.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {investments.map((inv) => {
            const invested = Number(inv.investedAmount);
            const current = Number(inv.currentValue);
            const profit = current - invested;
            const returnsPct = invested > 0 ? (profit / invested) * 105 : 0; // wait, let's keep exact returnsPct formula
            const returnsPctActual = invested > 0 ? (profit / invested) * 100 : 0;
            return (
              <Card key={inv.id} className="border-border bg-card/45 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <LineChart className="h-5 w-5 text-indigo-400" />
                      <h4 className="text-sm font-bold text-foreground truncate max-w-[140px]">{inv.investmentName}</h4>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-muted-foreground uppercase font-semibold">
                      {inv.investmentType}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Current Value</span>
                    <span className="text-xl font-bold text-foreground">{formatCurrency(current)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Invested Capital: <span className="text-foreground">{formatCurrency(invested)}</span></p>
                    <p>Returns:{" "}
                      <span className={`font-bold ${profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {formatCurrency(profit)} ({returnsPctActual.toFixed(1)}%)
                      </span>
                    </p>
                    {inv.cagr !== undefined && inv.cagr !== 0 && (
                      <p>CAGR: <span className="text-indigo-500 font-bold">{inv.cagr.toFixed(1)}%</span></p>
                    )}
                    {inv.xirr !== undefined && inv.xirr !== null && (
                      <p>XIRR: <span className="text-emerald-500 font-bold">{inv.xirr.toFixed(1)}%</span></p>
                    )}
                    {inv.platform && <p>Platform: <span className="text-foreground">{inv.platform}</span></p>}
                    {inv.interestRate && <p>Interest Rate: <span className="text-foreground">{Number(inv.interestRate).toFixed(2)}%</span></p>}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="text-xs text-muted-foreground hover:text-rose-500 font-medium flex items-center transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Investment
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
