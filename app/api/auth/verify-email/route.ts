import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/resend";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid verification token." },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { error: "Verification token has expired. Please register again." },
        { status: 400 }
      );
    }

    if (verificationToken.user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified." },
        { status: 200 }
      );
    }

    // Mark email as verified
    await db.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await db.verificationToken.delete({ where: { token } });

    // Send welcome email
    await sendWelcomeEmail(
      verificationToken.user.email!,
      verificationToken.user.name ?? "there"
    );

    return NextResponse.json(
      { message: "Email verified successfully! You can now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
