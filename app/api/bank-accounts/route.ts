import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import { createBankAccountSchema } from "@/lib/validations";
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

    const accounts = await db.bankAccount.findMany({
      where: { userId, isActive: true },
      include: {
        transactions: { orderBy: { date: "desc" }, take: 5 },
      },
      orderBy: { balance: "desc" },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    return serverErrorResponse("GET_BANK_ACCOUNTS", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createBankAccountSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const account = await db.bankAccount.create({
      data: {
        userId,
        ...parsed.data,
        ...(parsed.data.maturityDate
          ? { maturityDate: new Date(parsed.data.maturityDate) }
          : {}),
      },
    });

    await writeAuditLog(db, userId, "CREATE", "BankAccount", account.id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return serverErrorResponse("POST_BANK_ACCOUNT", error);
  }
}
