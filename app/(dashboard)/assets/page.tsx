"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Briefcase, Plus, Loader2, Trash2 } from "lucide-react";
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
import { createAssetSchema } from "@/lib/validations";

type AssetFormValues = z.infer<typeof createAssetSchema>;

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
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
  } = useForm<AssetFormValues>({
    resolver: zodResolver(createAssetSchema) as any,
    defaultValues: {
      assetName: "",
      assetType: "REAL_ESTATE",
      purchaseValue: 0,
      currentValue: 0,
      purchaseDate: "",
      description: "",
      location: "",
      area: 0,
      registrationNo: "",
      notes: "",
    },
  });

  const assetTypeValue = watch("assetType");

  const fetchAssets = async () => {
    try {
      const res = await fetch("/api/assets");
      if (res.ok) {
        const result = await res.json();
        setAssets(result || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const onSubmit = async (data: any) => {
    setSubmitLoading(true);
    try {
      // Remove empty area or parse properly
      const formattedData = {
        ...data,
        area: data.area ? Number(data.area) : undefined,
      };

      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (res.ok) {
        toast.success("Asset added successfully!");
        setDialogOpen(false);
        reset();
        fetchAssets();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add asset.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this asset?")) return;
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Asset deleted");
        fetchAssets();
      } else {
        toast.error("Failed to delete asset");
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
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Assets Portfolio</h2>
          <p className="text-sm text-muted-foreground">Track current valuation, purchase price, and location of holdings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md">
                <Plus className="mr-2 h-4 w-4" /> Add Asset
              </Button>
            }
          />
          <DialogContent className="border-border bg-popover text-popover-foreground max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Holding Asset</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Asset Name</Label>
                <Input
                  placeholder="e.g. Ancestral Property, BMW 3 Series"
                  className="border-border bg-background text-foreground"
                  {...register("assetName")}
                />
                {errors.assetName && (
                  <p className="text-xs text-rose-500">{errors.assetName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Asset Type</Label>
                  <Select
                    value={assetTypeValue}
                    onValueChange={(val) => setValue("assetType", val as any)}
                  >
                    <SelectTrigger className="border-border bg-background text-foreground">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover text-popover-foreground">
                      <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                      <SelectItem value="VEHICLE">Vehicle</SelectItem>
                      <SelectItem value="GOLD_JEWELRY">Gold & Jewelry</SelectItem>
                      <SelectItem value="ART_COLLECTIBLES">Art & Collectibles</SelectItem>
                      <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                      <SelectItem value="FURNITURE">Furniture</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Purchase Date</Label>
                  <Input
                    type="date"
                    className="border-border bg-background text-foreground"
                    {...register("purchaseDate")}
                  />
                  {errors.purchaseDate && (
                    <p className="text-xs text-rose-500">{errors.purchaseDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Purchase Value (INR)</Label>
                  <Input
                    type="number"
                    placeholder="2500000"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("purchaseValue", Number(e.target.value))}
                  />
                  {errors.purchaseValue && (
                    <p className="text-xs text-rose-500">{errors.purchaseValue.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Current Value (INR)</Label>
                  <Input
                    type="number"
                    placeholder="3000000"
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
                  <Label className="text-muted-foreground">Location (Optional)</Label>
                  <Input
                    placeholder="e.g. Bangalore"
                    className="border-border bg-background text-foreground"
                    {...register("location")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Area (Sq Ft, Optional)</Label>
                  <Input
                    type="number"
                    placeholder="1200"
                    className="border-border bg-background text-foreground"
                    onChange={(e) => setValue("area", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Registration/License No (Optional)</Label>
                <Input
                  placeholder="e.g. KA-01-MJ-1234"
                  className="border-border bg-background text-foreground"
                  {...register("registrationNo")}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Description (Optional)</Label>
                <Textarea
                  placeholder="Details about the holding..."
                  className="border-border bg-background text-foreground min-h-[60px]"
                  {...register("description")}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg mt-2"
                disabled={submitLoading}
              >
                {submitLoading ? "Adding..." : "Add Holding Asset"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex h-32 w-full items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      ) : assets.length === 0 ? (
        <div className="py-12 text-center text-xs text-muted-foreground border border-border border-dashed rounded-xl bg-card/10">
          No assets logged. Click &quot;Add Asset&quot; to begin.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => {
            const purchaseValue = Number(a.purchaseValue);
            const currentValue = Number(a.currentValue);
            const appreciation = currentValue - purchaseValue;
            const appPct = purchaseValue > 0 ? (appreciation / purchaseValue) * 100 : 0;
            return (
              <Card key={a.id} className="border-border bg-card/45 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-5 w-5 text-indigo-400" />
                      <h4 className="text-sm font-bold text-foreground truncate max-w-[140px]">{a.assetName}</h4>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-muted-foreground uppercase font-semibold">
                      {a.assetType}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase">Current Value</span>
                    <span className="text-xl font-bold text-foreground">{formatCurrency(currentValue)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Purchase Value: <span className="text-foreground">{formatCurrency(purchaseValue)}</span></p>
                    <p>Purchase Date: <span className="text-foreground">{new Date(a.purchaseDate).toLocaleDateString()}</span></p>
                    <p>Appreciation:{" "}
                      <span className={`font-bold ${appreciation >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                        {formatCurrency(appreciation)} ({appPct.toFixed(1)}%)
                      </span>
                    </p>
                    {a.location && <p>Location: <span className="text-foreground">{a.location}</span></p>}
                    {a.registrationNo && <p>Reg No: <span className="text-foreground">{a.registrationNo}</span></p>}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-xs text-muted-foreground hover:text-rose-500 font-medium flex items-center transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Asset
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
