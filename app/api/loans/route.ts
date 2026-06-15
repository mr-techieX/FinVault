import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import { createLoanSchema } from "@/lib/validations/loan";
import { generateAmortizationSchedule } from "@/lib/calculations/amortization";
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

    const loans = await db.loan.findMany({
      where: { userId, isActive: true },
      include: { payments: { orderBy: { paymentDate: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(loans);
  } catch (error) {
    return serverErrorResponse("GET_LOANS", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createLoanSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const data = parsed.data;
    const loan = await db.loan.create({
      data: {
        userId,
        ...data,
        disbursedDate: new Date(data.disbursedDate),
        firstEmiDate: new Date(data.firstEmiDate),
      },
    });

    // Auto-generate amortization schedule
    const schedule = generateAmortizationSchedule(
      data.outstandingAmount,
      data.interestRate,
      data.tenureMonths,
      new Date(data.firstEmiDate)
    );

    // Save payment schedule to DB
    await db.loanPayment.createMany({
      data: schedule.schedule.map((row) => ({
        loanId: loan.id,
        paymentDate: new Date(row.date),
        emiAmount: row.emi,
        principalPaid: row.principal,
        interestPaid: row.interest,
        balanceAfter: row.balance,
        prepayment: 0,
      })),
    });

    await writeAuditLog(db, userId, "CREATE", "Loan", loan.id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    return serverErrorResponse("POST_LOAN", error);
  }
}
