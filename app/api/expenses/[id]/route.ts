import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import { updateExpenseSchema } from "@/lib/validations/expense";
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

    const expense = await db.expense.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!expense) return notFoundResponse("Expense");
    return NextResponse.json(expense);
  } catch (error) {
    return serverErrorResponse("GET_EXPENSE", error);
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

    const existing = await db.expense.findFirst({ where: { id, userId } });
    if (!existing) return notFoundResponse("Expense");

    const body = await req.json();
    const parsed = updateExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const updated = await db.expense.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
      },
      include: { category: true },
    });

    await writeAuditLog(db, userId, "UPDATE", "Expense", id);
    await calculateAndSaveNetWorth(userId);
    return NextResponse.json(updated);
  } catch (error) {
    return serverErrorResponse("PUT_EXPENSE", error);
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

    const existing = await db.expense.findFirst({ where: { id, userId } });
    if (!existing) return notFoundResponse("Expense");

    await db.expense.delete({ where: { id } });
    await writeAuditLog(db, userId, "DELETE", "Expense", id);
    await calculateAndSaveNetWorth(userId);
    return NextResponse.json({ message: "Expense deleted successfully." });
  } catch (error) {
    return serverErrorResponse("DELETE_EXPENSE", error);
  }
}
