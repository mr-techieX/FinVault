import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createGoalSchema } from "@/lib/validations";
import { calculateGoalProgress } from "@/lib/calculations/goals";
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

    const goals = await db.goal.findMany({
      where: { userId },
      include: {
        contributions: { orderBy: { date: "asc" } },
      },
      orderBy: [{ isCompleted: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
    });

    const enriched = goals.map((goal) =>
      calculateGoalProgress({
        ...goal,
        targetAmount: Number(goal.targetAmount),
        currentAmount: Number(goal.currentAmount),
        contributions: goal.contributions.map((c) => ({
          amount: Number(c.amount),
          date: c.date,
        })),
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    return serverErrorResponse("GET_GOALS", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createGoalSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const goal = await db.goal.create({
      data: {
        userId,
        ...parsed.data,
        ...(parsed.data.deadline
          ? { deadline: new Date(parsed.data.deadline) }
          : {}),
      },
    });

    await writeAuditLog(db, userId, "CREATE", "Goal", goal.id);
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return serverErrorResponse("POST_GOAL", error);
  }
}
