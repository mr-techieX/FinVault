import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import { updateBankAccountSchema } from "@/lib/validations";
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

    const account = await db.bankAccount.findFirst({
      where: { id, userId, isActive: true },
      include: {
        transactions: { orderBy: { date: "desc" }, take: 20 },
      },
    });
    if (!account) return notFoundResponse("Bank account");

    return NextResponse.json(account);
  } catch (error) {
    return serverErrorResponse("GET_BANK_ACCOUNT", error);
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

    const existing = await db.bankAccount.findFirst({
      where: { id, userId, isActive: true },
    });
    if (!existing) return notFoundResponse("Bank account");

    const body = await req.json();
    const parsed = updateBankAccountSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const updated = await db.bankAccount.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.maturityDate
          ? { maturityDate: new Date(parsed.data.maturityDate) }
          : {}),
      },
    });

    await writeAuditLog(db, userId, "UPDATE", "BankAccount", id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json(updated);
  } catch (error) {
    return serverErrorResponse("PUT_BANK_ACCOUNT", error);
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

    const existing = await db.bankAccount.findFirst({
      where: { id, userId, isActive: true },
    });
    if (!existing) return notFoundResponse("Bank account");

    // Soft delete bank account
    await db.bankAccount.update({
      where: { id },
      data: { isActive: false },
    });

    await writeAuditLog(db, userId, "DELETE", "BankAccount", id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json({ message: "Bank account deleted successfully." });
  } catch (error) {
    return serverErrorResponse("DELETE_BANK_ACCOUNT", error);
  }
}
