import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/resend";
import { authRatelimit } from "@/lib/redis";
import * as argon2 from "argon2";
import { z } from "zod";
import { randomBytes } from "crypto";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await authRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password with Argon2id
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64MB
      timeCost: 3,
      parallelism: 1,
    });

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profile: {
          create: {},
        },
      },
    });

    // Create email verification token (24h expiry)
    const token = randomBytes(32).toString("hex");
    await db.verificationToken.create({
      data: {
        token,
        userId: user.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    // Send verification email
    await sendVerificationEmail(email, name, token);

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
