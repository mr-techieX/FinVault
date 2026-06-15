import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateBudgetSchema } from "@/lib/validations";
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

    const budget = await db.budget.findFirst({
      where: { id, userId },
      include: { categories: true },
    });
    if (!budget) return notFoundResponse("Budget");

    return NextResponse.json(budget);
  } catch (error) {
    return serverErrorResponse("GET_BUDGET", error);
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

    const existing = await db.budget.findFirst({
      where: { id, userId },
    });
    if (!existing) return notFoundResponse("Budget");

    const body = await req.json();
    const parsed = updateBudgetSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const { categories, ...budgetData } = parsed.data;

    const updated = await db.budget.update({
      where: { id },
      data: {
        ...budgetData,
        ...(categories
          ? {
              categories: {
                deleteMany: {},
                create: categories,
              },
            }
          : {}),
      },
      include: { categories: true },
    });

    await writeAuditLog(db, userId, "UPDATE", "Budget", id);

    return NextResponse.json(updated);
  } catch (error) {
    return serverErrorResponse("PUT_BUDGET", error);
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

    const existing = await db.budget.findFirst({
      where: { id, userId },
    });
    if (!existing) return notFoundResponse("Budget");

    await db.budget.delete({
      where: { id },
    });

    await writeAuditLog(db, userId, "DELETE", "Budget", id);

    return NextResponse.json({ message: "Budget deleted successfully." });
  } catch (error) {
    return serverErrorResponse("DELETE_BUDGET", error);
  }
}
