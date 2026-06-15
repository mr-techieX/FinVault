import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import { createIncomeSchema } from "@/lib/validations/income";
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
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const categoryId = searchParams.get("categoryId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: Record<string, unknown> = { userId };
    if (categoryId) where.categoryId = categoryId;
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.date = { gte: startDate, lte: endDate };
    }

    const [incomes, total] = await Promise.all([
      db.income.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.income.count({ where }),
    ]);

    return NextResponse.json({
      data: incomes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return serverErrorResponse("GET_INCOMES", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createIncomeSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const income = await db.income.create({
      data: {
        userId,
        ...parsed.data,
        date: new Date(parsed.data.date),
        amount: parsed.data.amount,
      },
      include: { category: true },
    });

    await writeAuditLog(db, userId, "CREATE", "Income", income.id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    return serverErrorResponse("POST_INCOME", error);
  }
}
