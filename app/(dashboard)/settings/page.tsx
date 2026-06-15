"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Settings, User, ShieldAlert, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [currency, setCurrency] = useState("INR");
  const [locale, setLocale] = useState("en-IN");

  const handleSavePreferences = () => {
    toast.success("Preferences updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">System Settings</h2>
        <p className="text-sm text-slate-400">Configure your profile details, currency formats, and data retention</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center">
              <User className="mr-2 h-4 w-4 text-indigo-400" /> Account Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label className="text-slate-400">Full Name</Label>
              <p className="text-sm font-semibold text-white bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                {session?.user?.name || "User"}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-400">Email Address</Label>
              <p className="text-sm font-semibold text-white bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                {session?.user?.email || "user@example.com"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center">
              <Globe className="mr-2 h-4 w-4 text-indigo-400" /> Regional Formats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label className="text-slate-400">Base Currency</Label>
              <p className="text-sm font-semibold text-white bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                INR (₹) - Indian Rupee
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-400">Locale Format</Label>
              <p className="text-sm font-semibold text-white bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                en-IN (English - India)
              </p>
            </div>
            <Button onClick={handleSavePreferences} className="bg-indigo-600 text-white hover:bg-indigo-700 w-full">
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-rose-900/40 bg-rose-950/5">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-rose-400 flex items-center">
            <ShieldAlert className="mr-2 h-4 w-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Deactivating your account will permanently delete all records, loans, portfolios, statement structures, and transactions. This operation is not reversible.
          </p>
          <Button variant="destructive" size="sm" className="bg-rose-600/90 text-white hover:bg-rose-700 shadow-md">
            Delete My Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
