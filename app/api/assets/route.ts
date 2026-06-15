import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateAndSaveNetWorth } from "@/lib/calculations/networth";
import { createAssetSchema } from "@/lib/validations";
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

    const assets = await db.asset.findMany({
      where: { userId, isActive: true },
      include: {
        valueHistory: {
          orderBy: { recordedAt: "desc" },
          take: 12,
        },
      },
      orderBy: { currentValue: "desc" },
    });

    return NextResponse.json(assets);
  } catch (error) {
    return serverErrorResponse("GET_ASSETS", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return unauthorizedResponse();

    const body = await req.json();
    const parsed = createAssetSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error.issues[0].message);
    }

    const asset = await db.asset.create({
      data: {
        userId,
        ...parsed.data,
        purchaseDate: new Date(parsed.data.purchaseDate),
      },
    });

    // Record initial value in history
    await db.assetValueHistory.create({
      data: {
        assetId: asset.id,
        value: asset.currentValue,
      },
    });

    await writeAuditLog(db, userId, "CREATE", "Asset", asset.id);
    await calculateAndSaveNetWorth(userId);

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    return serverErrorResponse("POST_ASSET", error);
  }
}
