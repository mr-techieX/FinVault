"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreditCard, Plus, Loader2, Trash2, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { createCreditCardSchema } from "@/lib/validations";

type CreditCardFormValues = z.infer<typeof createCreditCardSchema>;

export default function CreditCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
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
  } = useForm<CreditCardFormValues>({
    resolver: zodResolver(createCreditCardSchema) as any,
    defaultValues: {
      cardName: "",
      bankName: "",
      lastFourDigits: "",
      creditLimit: 0,
      outstanding: 0,
      minimumDue: 0,
      dueDate: 1,
      billingCycle: 25,
      interestRate: 0,
      annualFee: 0,
      cardType: "VISA",
      notes: "",
    },
  });

  const cardTypeValue = watch("cardType");

  const fetchCards = async () => {
    try {
      const res = await fetch("/api/credit-cards");
      if (res.ok) {
        const result = await res.json();
        setCards(result || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/credit-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Credit card added successfully!");
        setDialogOpen(false);
        reset();
        fetchCards();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add card.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this credit card?")) return;
    try {
      const res = await fetch(`/api/credit-cards/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Credit card deleted");
        fetchCards();
      } else {
        toast.error("Failed to delete card");
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
          <h2 className="text-2xl font-bold tracking-tight text-white">Credit Cards</h2>
          <p className="text-sm text-slate-400">Track utilization limits, statement balances, and billing cycles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Add Card
              </Button>
            }
          />
          <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Add Credit Card</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label className="text-slate-300">Card Nickname</Label>
                <Input
                  placeholder="e.g. HDFC Regalia, ICICI Amazon"
                  className="border-slate-800 bg-slate-950/50 text-white"
                  {...register("cardName")}
                />
                {errors.cardName && (
                  <p className="text-xs text-rose-500">{errors.cardName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Bank Name</Label>
                <Input
                  placeholder="e.g. HDFC, ICICI, SBI"
                  className="border-slate-800 bg-slate-950/50 text-white"
                  {...register("bankName")}
                />
                {errors.bankName && (
                  <p className="text-xs text-rose-500">{errors.bankName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Last 4 Digits</Label>
                  <Input
                    placeholder="1234"
                    maxLength={4}
                    className="border-slate-800 bg-slate-950/50 text-white"
                    {...register("lastFourDigits")}
                  />
                  {errors.lastFourDigits && (
                    <p className="text-xs text-rose-500">{errors.lastFourDigits.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Card Network</Label>
                  <Select
                    value={cardTypeValue}
                    onValueChange={(val) => setValue("cardType", val as any)}
                  >
                    <SelectTrigger className="border-slate-800 bg-slate-950/50 text-white">
                      <SelectValue placeholder="Select Network" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                      <SelectItem value="VISA">Visa</SelectItem>
                      <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                      <SelectItem value="RUPAY">Rupay</SelectItem>
                      <SelectItem value="AMEX">Amex</SelectItem>
                      <SelectItem value="DINERS">Diners</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Credit Limit (INR)</Label>
                  <Input
                    type="number"
                    placeholder="150000"
                    className="border-slate-800 bg-slate-950/50 text-white"
                    onChange={(e) => setValue("creditLimit", Number(e.target.value))}
                  />
                  {errors.creditLimit && (
                    <p className="text-xs text-rose-500">{errors.creditLimit.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Outstanding Balance</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    className="border-slate-800 bg-slate-950/50 text-white"
                    onChange={(e) => setValue("outstanding", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Due Date (Day of Month)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    className="border-slate-800 bg-slate-950/50 text-white"
                    onChange={(e) => setValue("dueDate", Number(e.target.value))}
                  />
                  {errors.dueDate && (
                    <p className="text-xs text-rose-500">{errors.dueDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Interest Rate (% p.a.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="42.0"
                    className="border-slate-800 bg-slate-950/50 text-white"
                    onChange={(e) => setValue("interestRate", Number(e.target.value))}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg mt-2"
                disabled={submitLoading}
              >
                {submitLoading ? "Adding..." : "Add Credit Card"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex h-32 w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : cards.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 border border-slate-800 border-dashed rounded-xl">
          No credit cards logged. Click &quot;Add Card&quot; to begin.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => {
            const limit = Number(c.creditLimit);
            const outstanding = Number(c.outstanding);
            const util = limit > 0 ? (outstanding / limit) * 100 : 0;
            return (
              <Card key={c.id} className="border-slate-850 bg-slate-900/40 relative overflow-hidden group hover:border-slate-800/80 transition-colors">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-indigo-400" />
                      <h4 className="text-sm font-bold text-white truncate max-w-[140px]">{c.cardName}</h4>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-slate-400 uppercase font-semibold">
                      {c.cardType}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Outstanding balance</span>
                    <span className="text-xl font-bold text-white">{formatCurrency(outstanding)}</span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Bank: <span className="text-white">{c.bankName}</span> {c.lastFourDigits ? `(•• ${c.lastFourDigits})` : ""}</p>
                    <p>Total Limit: <span className="text-white">{formatCurrency(limit)}</span></p>
                    <p>Utilization: <span className={util > 30 ? "text-rose-400 font-bold" : "text-emerald-400"}>{util.toFixed(0)}%</span></p>
                    <p>Due Date: <span className="text-white">Day {c.dueDate} of the month</span></p>
                  </div>
                  {util > 30 && (
                    <div className="rounded-lg bg-rose-950/20 border border-rose-900/30 p-2.5 flex items-center space-x-2 text-[10px] text-rose-450 leading-relaxed">
                      <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                      <span>High utilization alert: keeping utilization below 30% improves credit score.</span>
                    </div>
                  )}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-slate-600 hover:text-rose-400 font-medium flex items-center transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Card
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
