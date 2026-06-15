import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as argon2 from "argon2";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const resetToken = await db.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used) {
      return NextResponse.json(
        { error: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    if (resetToken.expires < new Date()) {
      await db.passwordReset.delete({ where: { token } });
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });

    await db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await db.passwordReset.update({
      where: { token },
      data: { used: true },
    });

    return NextResponse.json(
      { message: "Password reset successfully. You can now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
