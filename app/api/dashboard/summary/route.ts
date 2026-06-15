import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getLatestNetWorth } from "@/lib/calculations/networth";
import { calculateSavingsRate } from "@/lib/calculations/budget";
import { getCreditUtilizationStatus } from "@/lib/utils";
import {
  getAuthUserId,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Fetch all data in parallel
    const [
      netWorth,
      savingsRate,
      creditCards,
      upcomingEMIs,
      recentExpenses,
      goals,
      notifications,
    ] = await Promise.all([
      getLatestNetWorth(userId),
      calculateSavingsRate(userId, currentMonth, currentYear),
      db.creditCard.findMany({ where: { userId, isActive: true } }),
      db.loanPayment.findMany({
        where: {
          loan: { userId },
          isPaid: false,
          paymentDate: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        include: { loan: { select: { loanName: true, loanType: true } } },
        orderBy: { paymentDate: "asc" },
        take: 5,
      }),
      db.expense.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
      db.goal.findMany({
        where: { userId, isCompleted: false },
        include: { contributions: { select: { amount: true } } },
        orderBy: { priority: "asc" },
        take: 4,
      }),
      db.notification.findMany({
        where: { userId, isRead: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Calculate total credit utilization
    const totalLimit = creditCards.reduce(
      (sum, c) => sum + Number(c.creditLimit),
      0
    );
    const totalOutstanding = creditCards.reduce(
      (sum, c) => sum + Number(c.outstanding),
      0
    );
    const overallUtilization =
      totalLimit > 0
        ? getCreditUtilizationStatus(totalOutstanding, totalLimit)
        : null;

    // Monthly income/expense trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [monthlyIncomes, monthlyExpenses] = await Promise.all([
      db.income.groupBy({
        by: ["date"],
        where: { userId, date: { gte: sixMonthsAgo } },
        _sum: { amount: true },
      }),
      db.expense.groupBy({
        by: ["date"],
        where: { userId, date: { gte: sixMonthsAgo } },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      netWorth,
      savingsRate: savingsRate.savingsRate,
      creditUtilization: overallUtilization,
      upcomingEMIs,
      recentExpenses,
      goals: goals.map((g) => ({
        ...g,
        currentAmount: g.contributions.reduce(
          (sum, c) => sum + Number(c.amount),
          0
        ),
        progressPercent:
          (g.contributions.reduce((sum, c) => sum + Number(c.amount), 0) /
            Number(g.targetAmount)) *
          100,
      })),
      notifications,
    });
  } catch (error) {
    return serverErrorResponse("GET_DASHBOARD", error);
  }
}
