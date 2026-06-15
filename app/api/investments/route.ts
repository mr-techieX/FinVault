import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import { createInvestmentSchema } from "@/lib/validations";
import { calculateCAGR, calculateAbsoluteReturn, yearsBetween } from "@/lib/calculations/cagr";
import { calculateXIRR, buildXIRRCashFlows } from "@/lib/calculations/xirr";
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

    const investments = await db.investment.findMany({
      where: { userId, isActive: true },
      include: {
        transactions: { orderBy: { date: "asc" } },
      },
      orderBy: { currentValue: "desc" },
    });

    // Enrich with CAGR and XIRR
    const enriched = investments.map((inv) => {
      const years = yearsBetween(inv.createdAt);
      const cagr =
        years > 0
          ? calculateCAGR(
              Number(inv.investedAmount),
              Number(inv.currentValue),
              years
            )
          : 0;
      const absoluteReturn = calculateAbsoluteReturn(
        Number(inv.investedAmount),
        Number(inv.currentValue)
      );

      let xirr: number | null = null;
      if (inv.transactions.length > 0) {
        const cashFlows = buildXIRRCashFlows(
          inv.transactions.map((t) => ({
            date: t.date,
            amount: Number(t.amount),
            type: t.type,
          })),
          Number(inv.currentValue)
        );
        xirr = calculateXIRR(cashFlows);
      }

      return {
        ...inv,
        cagr: Math.round(cagr * 10000) / 100, // as percentage
        absoluteReturn: Math.round(absoluteReturn * 10) / 10,
        xirr: xirr !== null ? Math.round(xirr * 10000) / 100 : null,
        gain: Number(inv.currentValue) - Number(inv.investedAmount),
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    return serverErrorResponse("GET_INVESTMENTS", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createInvestmentSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const investment = await db.investment.create({
      data: {
        userId,
        ...parsed.data,
        ...(parsed.data.maturityDate
          ? { maturityDate: new Date(parsed.data.maturityDate) }
          : {}),
      },
    });

    // Record initial buy transaction
    await db.investmentTransaction.create({
      data: {
        investmentId: investment.id,
        type: "BUY",
        units: parsed.data.units ?? null,
        price: parsed.data.buyPrice ?? parsed.data.investedAmount,
        amount: parsed.data.investedAmount,
        date: new Date(),
      },
    });

    await writeAuditLog(db, userId, "CREATE", "Investment", investment.id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json(investment, { status: 201 });
  } catch (error) {
    return serverErrorResponse("POST_INVESTMENT", error);
  }
}
