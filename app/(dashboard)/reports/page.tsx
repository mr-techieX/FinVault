"use client";

import React, { useState } from "react";
import { FileText, Download, Loader2, Calendar, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (res.ok) {
        const result = await res.json();
        setReportData(result);
        toast.success("Financial statements compiled successfully!");
      } else {
        toast.error("Failed to generate report.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!reportData) return;
    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.text("FinVault Financial Summary Report", 14, 22);

      doc.setFontSize(10);
      doc.text(`Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, 14, 30);
      doc.text(`Report Generated On: ${new Date().toLocaleString()}`, 14, 35);

      // Summary
      doc.setFontSize(12);
      doc.text("Executive Summary", 14, 45);
      
      const summaryData = [
        ["Total Logged Income", `${reportData.summary.totalIncome.toFixed(2)} INR`],
        ["Total Logged Expenses", `${reportData.summary.totalExpenses.toFixed(2)} INR`],
        ["Net Savings", `${reportData.summary.netSavings.toFixed(2)} INR`],
      ];

      autoTable(doc, {
        startY: 48,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "striped",
      });

      // Income Table
      doc.text("Income Streams Ledger", 14, (doc as any).lastAutoTable.finalY + 12);
      const incomeRows = reportData.details.incomes.map((inc: any) => [
        inc.source,
        new Date(inc.date).toLocaleDateString(),
        inc.frequency,
        `${Number(inc.amount).toFixed(2)} INR`,
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [["Source", "Date", "Frequency", "Amount"]],
        body: incomeRows,
        theme: "grid",
      });

      // Expense Table
      doc.text("Expense Items Ledger", 14, (doc as any).lastAutoTable.finalY + 12);
      const expenseRows = reportData.details.expenses.map((exp: any) => [
        exp.description,
        new Date(exp.date).toLocaleDateString(),
        exp.frequency,
        `${Number(exp.amount).toFixed(2)} INR`,
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [["Description", "Date", "Frequency", "Amount"]],
        body: expenseRows,
        theme: "grid",
      });

      doc.save(`finvault-statement-${startDate}-to-${endDate}.pdf`);
      toast.success("PDF statement downloaded successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to compile PDF.");
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;
    try {
      const allTransactions: any[] = [];

      reportData.details.incomes.forEach((inc: any) => {
        allTransactions.push({
          Type: "INCOME",
          Name: inc.source,
          Date: new Date(inc.date).toLocaleDateString(),
          Frequency: inc.frequency,
          Amount: Number(inc.amount),
        });
      });

      reportData.details.expenses.forEach((exp: any) => {
        allTransactions.push({
          Type: "EXPENSE",
          Name: exp.description,
          Date: new Date(exp.date).toLocaleDateString(),
          Frequency: exp.frequency,
          Amount: -Number(exp.amount),
        });
      });

      const csvString = Papa.unparse(allTransactions);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `finvault-ledger-${startDate}-to-${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV transaction ledger exported.");
    } catch (e) {
      toast.error("Failed to compile CSV.");
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Financial Statements</h2>
        <p className="text-sm text-slate-400">Generate statements, export transaction logs, and review balances</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Input Parameters */}
        <Card className="border-slate-800 bg-slate-900/40 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-indigo-400" /> Filter Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-slate-800 bg-slate-950/50 text-white"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300 text-xs">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-slate-800 bg-slate-950/50 text-white"
              />
            </div>
            <Button
              onClick={generateReport}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compiling...
                </>
              ) : (
                "Compile Report"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview and Downloads */}
        <Card className="border-slate-800 bg-slate-900/40 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
              <span>Preview Summary</span>
              {reportData && (
                <div className="flex space-x-2">
                  <Button size="sm" onClick={downloadPDF} className="bg-emerald-650 hover:bg-emerald-700 text-white text-xs h-8">
                    <Download className="mr-1 h-3.5 w-3.5" /> PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadCSV} className="border-slate-800 text-white hover:bg-slate-850 text-xs h-8">
                    <FileSpreadsheet className="mr-1 h-3.5 w-3.5" /> CSV
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!reportData ? (
              <div className="py-16 text-center text-xs text-slate-500">
                Choose date filters and click &quot;Compile Report&quot; to preview balances.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center border-b border-slate-850 pb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Gross Income</span>
                    <p className="text-base font-bold text-emerald-400 mt-1">
                      {formatCurrency(reportData.summary.totalIncome)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Gross Expenses</span>
                    <p className="text-base font-bold text-rose-400 mt-1">
                      {formatCurrency(reportData.summary.totalExpenses)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase">Net Savings</span>
                    <p className={`text-base font-bold mt-1 ${reportData.summary.netSavings >= 0 ? "text-indigo-400" : "text-rose-500"}`}>
                      {formatCurrency(reportData.summary.netSavings)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-semibold text-white">Accounts Balance Summary</p>
                  <div className="space-y-1 bg-slate-950/30 rounded-lg p-3 text-slate-350">
                    <div className="flex justify-between">
                      <span>Incomes Logged:</span>
                      <span className="text-white font-bold">{reportData.details.incomes.length} Entries</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expenses Logged:</span>
                      <span className="text-white font-bold">{reportData.details.expenses.length} Entries</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Assets:</span>
                      <span className="text-white font-bold">{reportData.details.assets.length} Assets</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Outstanding Mortgages:</span>
                      <span className="text-white font-bold">{reportData.details.loans.length} Loans</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
