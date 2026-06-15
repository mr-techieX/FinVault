import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/resend";
import { authRatelimit } from "@/lib/redis";
import { z } from "zod";
import { randomBytes } from "crypto";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await authRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, we've sent a password reset link.",
        },
        { status: 200 }
      );
    }

    // Invalidate old tokens
    await db.passwordReset.deleteMany({ where: { userId: user.id } });

    // Create new reset token (1h expiry)
    const token = randomBytes(32).toString("hex");
    await db.passwordReset.create({
      data: {
        token,
        userId: user.id,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await sendPasswordResetEmail(email, user.name ?? "there", token);

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, we've sent a password reset link.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[FORGOT_PASSWORD]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
