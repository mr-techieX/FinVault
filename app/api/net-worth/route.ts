import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  calculateAndSaveNetWorth,
  getLatestNetWorth,
  getNetWorthHistory,
} from "@/lib/calculations/networth";
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
    const months = parseInt(searchParams.get("months") ?? "12");
    const refresh = searchParams.get("refresh") === "true";

    let current;
    if (refresh) {
      current = await calculateAndSaveNetWorth(userId);
    } else {
      current = await getLatestNetWorth(userId);
      if (!current) {
        current = await calculateAndSaveNetWorth(userId);
      }
    }

    const history = await getNetWorthHistory(userId, months);

    return NextResponse.json({ current, history });
  } catch (error) {
    return serverErrorResponse("GET_NET_WORTH", error);
  }
}
