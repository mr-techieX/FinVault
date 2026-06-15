import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  generateAmortizationSchedule,
  simulatePrepayment,
} from "@/lib/calculations/amortization";
import {
  getAuthUserId,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();
    const { id } = await params;

    const loan = await db.loan.findFirst({ where: { id, userId } });
    if (!loan) return notFoundResponse("Loan");

    const { searchParams } = new URL(req.url);
    const prepayment = parseFloat(searchParams.get("prepayment") ?? "0");

    const schedule = generateAmortizationSchedule(
      Number(loan.outstandingAmount),
      Number(loan.interestRate),
      loan.tenureMonths,
      loan.firstEmiDate
    );

    let prepaymentSim = null;
    if (prepayment > 0) {
      prepaymentSim = simulatePrepayment(
        Number(loan.outstandingAmount),
        Number(loan.interestRate),
        loan.tenureMonths,
        prepayment,
        loan.firstEmiDate
      );
    }

    return NextResponse.json({ loan, schedule, prepaymentSimulation: prepaymentSim });
  } catch (error) {
    return serverErrorResponse("GET_AMORTIZATION", error);
  }
}
