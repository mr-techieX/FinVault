import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import {
  getAuthUserId,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
  writeAuditLog,
} from "@/lib/api-helpers";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();
    const { id } = await params;

    const existing = await db.creditCard.findFirst({
      where: { id, userId, isActive: true },
    });
    if (!existing) return notFoundResponse("Credit card");

    // Soft delete
    await db.creditCard.update({
      where: { id },
      data: { isActive: false },
    });

    await writeAuditLog(db, userId, "DELETE", "CreditCard", id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json({ message: "Credit card deleted successfully." });
  } catch (error) {
    return serverErrorResponse("DELETE_CREDIT_CARD", error);
  }
}
