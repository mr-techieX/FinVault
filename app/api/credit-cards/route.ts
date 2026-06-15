import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import { getCreditUtilizationStatus } from "@/lib/utils";
import { createCreditCardSchema } from "@/lib/validations";
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

    const cards = await db.creditCard.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with utilization status
    const enriched = cards.map((card) => ({
      ...card,
      utilization: getCreditUtilizationStatus(
        Number(card.outstanding),
        Number(card.creditLimit)
      ),
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    return serverErrorResponse("GET_CREDIT_CARDS", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createCreditCardSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const card = await db.creditCard.create({
      data: { userId, ...parsed.data },
    });

    await writeAuditLog(db, userId, "CREATE", "CreditCard", card.id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json(
      {
        ...card,
        utilization: getCreditUtilizationStatus(
          Number(card.outstanding),
          Number(card.creditLimit)
        ),
      },
      { status: 201 }
    );
  } catch (error) {
    return serverErrorResponse("POST_CREDIT_CARD", error);
  }
}
