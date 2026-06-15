import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getAuthUserId,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await db.notification.findMany({
      where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await db.notification.count({
      where: { userId, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return serverErrorResponse("GET_NOTIFICATIONS", error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else if (id) {
      await db.notification.updateMany({
        where: { id, userId },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ message: "Notifications updated." });
  } catch (error) {
    return serverErrorResponse("PUT_NOTIFICATIONS", error);
  }
}
