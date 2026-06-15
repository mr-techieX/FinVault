import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getAuthUserId,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const { startDate, endDate } = body;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Aggregate income
    const incomes = await db.income.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    // Aggregate expenses
    const expenses = await db.expense.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    // Get current bank accounts
    const bankAccounts = await db.bankAccount.findMany({
      where: { userId, isActive: true },
      orderBy: { balance: "desc" },
    });

    // Get current assets
    const assets = await db.asset.findMany({
      where: { userId, isActive: true },
      orderBy: { currentValue: "desc" },
    });

    // Get active loans
    const loans = await db.loan.findMany({
      where: { userId, isActive: true },
      orderBy: { outstandingAmount: "desc" },
    });

    // Get credit cards outstanding
    const creditCards = await db.creditCard.findMany({
      where: { userId, isActive: true },
      orderBy: { outstanding: "desc" },
    });

    // Get net worth history
    const netWorthHistory = await db.netWorthSnapshot.findMany({
      where: { userId, snapshotDate: { gte: start, lte: end } },
      orderBy: { snapshotDate: "asc" },
    });

    return NextResponse.json({
      startDate: start,
      endDate: end,
      summary: {
        totalIncome: incomes.reduce((sum, item) => sum + Number(item.amount), 0),
        totalExpenses: expenses.reduce((sum, item) => sum + Number(item.amount), 0),
        netSavings:
          incomes.reduce((sum, item) => sum + Number(item.amount), 0) -
          expenses.reduce((sum, item) => sum + Number(item.amount), 0),
      },
      details: {
        incomes,
        expenses,
        bankAccounts,
        assets,
        loans,
        creditCards,
        netWorthHistory,
      },
    });
  } catch (error) {
    return serverErrorResponse("GENERATE_REPORT", error);
  }
}
