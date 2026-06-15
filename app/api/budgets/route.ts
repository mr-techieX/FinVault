import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import { createBudgetSchema } from "@/lib/validations";
import { analyzeBudget } from "@/lib/calculations/budget";
import {
  getAuthUserId,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  writeAuditLog,
} from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));

    const analysis = await analyzeBudget(userId, month, year);
    const budget = await db.budget.findUnique({
      where: { userId_month_year: { userId, month, year } },
      include: { categories: true },
    });

    return NextResponse.json({ budget, analysis });
  } catch (error) {
    return serverErrorResponse("GET_BUDGETS", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createBudgetSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const { categories, ...budgetData } = parsed.data;

    const budget = await db.budget.upsert({
      where: {
        userId_month_year: {
          userId,
          month: budgetData.month,
          year: budgetData.year,
        },
      },
      update: {
        ...budgetData,
        categories: {
          deleteMany: {},
          create: categories,
        },
      },
      create: {
        userId,
        ...budgetData,
        categories: { create: categories },
      },
      include: { categories: true },
    });

    await writeAuditLog(db, userId, "CREATE", "Budget", budget.id);
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    return serverErrorResponse("POST_BUDGET", error);
  }
}
