import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateGoalSchema } from "@/lib/validations";
import { calculateGoalProgress } from "@/lib/calculations/goals";
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

    const goal = await db.goal.findFirst({
      where: { id, userId },
      include: {
        contributions: { orderBy: { date: "asc" } },
      },
    });
    if (!goal) return notFoundResponse("Goal");

    const enriched = calculateGoalProgress({
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      contributions: goal.contributions.map((c) => ({
        amount: Number(c.amount),
        date: c.date,
      })),
    });

    return NextResponse.json(enriched);
  } catch (error) {
    return serverErrorResponse("GET_GOAL", error);
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

    const existing = await db.goal.findFirst({
      where: { id, userId },
    });
    if (!existing) return notFoundResponse("Goal");

    const body = await req.json();
    const parsed = updateGoalSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const { deadline, ...rest } = parsed.data;

    // Check if adding contribution directly
    const contributionAmount = body.contributionAmount ? Number(body.contributionAmount) : 0;
    const contributionNotes = body.contributionNotes ?? "";

    if (contributionAmount > 0) {
      await db.goalContribution.create({
        data: {
          goalId: id,
          amount: contributionAmount,
          date: new Date(),
          notes: contributionNotes,
        },
      });

      // Update currentAmount
      const newAmount = Number(existing.currentAmount) + contributionAmount;
      const isCompleted = newAmount >= Number(existing.targetAmount);

      const updated = await db.goal.update({
        where: { id },
        data: {
          currentAmount: newAmount,
          isCompleted,
          completedAt: isCompleted && !existing.isCompleted ? new Date() : existing.completedAt,
        },
        include: { contributions: true },
      });

      await writeAuditLog(db, userId, "UPDATE", "GoalContribution", id, { contributionAmount });
      return NextResponse.json(updated);
    }

    const updated = await db.goal.update({
      where: { id },
      data: {
        ...rest,
        ...(deadline ? { deadline: new Date(deadline) } : {}),
      },
      include: { contributions: true },
    });

    await writeAuditLog(db, userId, "UPDATE", "Goal", id);

    return NextResponse.json(updated);
  } catch (error) {
    return serverErrorResponse("PUT_GOAL", error);
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

    const existing = await db.goal.findFirst({
      where: { id, userId },
    });
    if (!existing) return notFoundResponse("Goal");

    await db.goal.delete({
      where: { id },
    });

    await writeAuditLog(db, userId, "DELETE", "Goal", id);

    return NextResponse.json({ message: "Goal deleted successfully." });
  } catch (error) {
    return serverErrorResponse("DELETE_GOAL", error);
  }
}
