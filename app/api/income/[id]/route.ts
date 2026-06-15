import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import { updateIncomeSchema } from "@/lib/validations/income";
import {
  getAuthUserId,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
  writeAuditLog,
} from "@/lib/api-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();
    const { id } = await params;

    const income = await db.income.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!income) return notFoundResponse("Income");

    return NextResponse.json(income);
  } catch (error) {
    return serverErrorResponse("GET_INCOME", error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();
    const { id } = await params;

    const existing = await db.income.findFirst({ where: { id, userId } });
    if (!existing) return notFoundResponse("Income");

    const body = await req.json();
    const parsed = updateIncomeSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const updated = await db.income.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
      },
      include: { category: true },
    });

    await writeAuditLog(db, userId, "UPDATE", "Income", id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json(updated);
  } catch (error) {
    return serverErrorResponse("PUT_INCOME", error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();
    const { id } = await params;

    const existing = await db.income.findFirst({ where: { id, userId } });
    if (!existing) return notFoundResponse("Income");

    await db.income.delete({ where: { id } });
    await writeAuditLog(db, userId, "DELETE", "Income", id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json({ message: "Income deleted successfully." });
  } catch (error) {
    return serverErrorResponse("DELETE_INCOME", error);
  }
}
