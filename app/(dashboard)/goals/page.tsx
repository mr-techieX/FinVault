"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Target,
  Plus,
  Loader2,
  Trash2,
  Calendar,
  Sparkles,
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
import { Badge } from "@/components/ui/badge";
import { createGoalSchema } from "@/lib/validations";

type GoalFormValues = z.infer<typeof createGoalSchema>;

interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  priority: string;
  progressPercent: number;
  requiredMonthlySavings?: number | null;
  isCompleted: boolean;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Contribution Modal states
  const [contrDialogOpen, setContrDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(createGoalSchema) as any,
    defaultValues: {
      name: "",
      targetAmount: 0,
      deadline: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split("T")[0],
      priority: "MEDIUM",
    },
  });

  const priorityValue = watch("priority");

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const result = await res.json();
        setGoals(result || []);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Financial goal created successfully!");
        setDialogOpen(false);
        reset();
        fetchGoals();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create goal.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddContribution = async () => {
    if (!selectedGoalId || contributionAmount <= 0) return;
    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/goals/${selectedGoalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contributionAmount,
          contributionNotes: "Goal contribution logged via Goals page.",
        }),
      });

      if (res.ok) {
        toast.success("Contribution added successfully!");
        setContrDialogOpen(false);
        setContributionAmount(0);
        fetchGoals();
      } else {
        toast.error("Failed to add contribution.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Goal deleted");
        fetchGoals();
      } else {
        toast.error("Failed to delete goal");
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
      {/* Header and add button */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Financial Goals</h2>
          <p className="text-sm text-slate-400">Establish target limits and map out investments for life milestones</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Create Goal
              </Button>
            }
          />
          <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">New Financial Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Goal Title</Label>
                <Input
                  id="name"
                  placeholder="Buy Home downpayment, Car, Vacation"
                  className="border-slate-800 bg-slate-950/50 text-white"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="text-slate-300">Target Amount (INR)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  placeholder="500000"
                  className="border-slate-800 bg-slate-950/50 text-white"
                  onChange={(e) => setValue("targetAmount", Number(e.target.value))}
                />
                {errors.targetAmount && (
                  <p className="text-xs text-rose-500">{errors.targetAmount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-slate-300">Target Date / Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  className="border-slate-800 bg-slate-950/50 text-white"
                  {...register("deadline")}
                />
                {errors.deadline && (
                  <p className="text-xs text-rose-500">{errors.deadline.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-slate-300">Priority Level</Label>
                <Select
                  value={priorityValue}
                  onValueChange={(val) => setValue("priority", val as any)}
                >
                  <SelectTrigger className="border-slate-800 bg-slate-950/50 text-white">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg mt-2"
                disabled={submitLoading}
              >
                {submitLoading ? "Creating..." : "Save Goal"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals listing Grid */}
      {loading ? (
        <div className="flex h-32 w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : goals.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 border border-slate-800 border-dashed rounded-xl">
          No goals established yet. Establish one to begin mapping contributions.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <Card key={g.id} className="border-slate-800 bg-slate-900/40 relative overflow-hidden group hover:border-slate-700/80 transition-all">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white truncate max-w-[140px]">{g.name}</h4>
                  </div>
                  <Badge variant="outline" className="border-slate-800 bg-slate-900 text-[9px] text-slate-400 font-semibold uppercase">
                    {g.priority}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Target Progress</span>
                    <span>{g.progressPercent.toFixed(0)}%</span>
                  </div>
                  <Progress value={g.progressPercent} className="h-2.5 bg-slate-850" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Collected</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(g.currentAmount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Target Limit</span>
                    <span className="font-bold text-white">{formatCurrency(g.targetAmount)}</span>
                  </div>
                </div>

                {g.requiredMonthlySavings && g.requiredMonthlySavings > 0 && !g.isCompleted && (
                  <div className="rounded-lg bg-indigo-950/20 border border-indigo-900/30 p-2.5 flex items-center space-x-2 text-[10px] text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Save {formatCurrency(g.requiredMonthlySavings)}/month to hit target.</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="text-slate-600 hover:text-rose-450 p-1 transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  {!g.isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedGoalId(g.id);
                        setContrDialogOpen(true);
                      }}
                      className="bg-indigo-600 text-white hover:bg-indigo-700 text-xs py-1 h-8"
                    >
                      Log Saving
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Contribution Dialog */}
      <Dialog open={contrDialogOpen} onOpenChange={setContrDialogOpen}>
        <DialogContent className="border-slate-800 bg-slate-900 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Log Contribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Amount to contribute (INR)</Label>
              <Input
                type="number"
                placeholder="5000"
                className="border-slate-800 bg-slate-950/50 text-white"
                onChange={(e) => setContributionAmount(Number(e.target.value))}
              />
            </div>
            <Button
              onClick={handleAddContribution}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={submitLoading || contributionAmount <= 0}
            >
              {submitLoading ? "Saving..." : "Confirm Contribution"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
