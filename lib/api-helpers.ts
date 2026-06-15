import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Get the authenticated user's ID from the session.
 * Returns null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

/**
 * Standard unauthorized response.
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Standard not found response.
 */
export function notFoundResponse(entity = "Resource") {
  return NextResponse.json({ error: `${entity} not found.` }, { status: 404 });
}

/**
 * Standard validation error response.
 */
export function validationErrorResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Standard server error response.
 */
export function serverErrorResponse(context: string, error: unknown) {
  console.error(`[${context}]`, error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 }
  );
}

/**
 * Write an audit log entry.
 */
export async function writeAuditLog(
  db: import("@prisma/client").PrismaClient,
  userId: string,
  action: "CREATE" | "UPDATE" | "DELETE",
  entityType: string,
  entityId: string,
  changes?: Record<string, unknown>
) {
  await db.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      changes: changes ? (changes as import("@prisma/client").Prisma.InputJsonValue) : undefined,
    },
  });
}
