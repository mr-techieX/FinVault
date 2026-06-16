import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendRepaymentReminderEmail } from "@/lib/resend";

export async function GET(request: Request) {
  try {
    // Basic authorization for the cron job to prevent public triggering
    const authHeader = request.headers.get("authorization");
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const now = new Date();
    // 5 days from now
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    // Find upcoming unpaid loan payments within the next 5 days
    // where we haven't sent a reminder yet.
    const upcomingPayments = await db.loanPayment.findMany({
      where: {
        isPaid: false,
        reminderSent: false,
        paymentDate: {
          gte: now,
          lte: fiveDaysFromNow,
        },
      },
      include: {
        loan: {
          include: {
            user: true,
          },
        },
      },
    });

    if (upcomingPayments.length === 0) {
      return NextResponse.json({ message: "No reminders to send." });
    }

    let emailsSent = 0;

    for (const payment of upcomingPayments) {
      const user = payment.loan.user;

      if (!user.email) continue;

      // Format amount and date
      const formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR", // Simplified for cron
      }).format(Number(payment.emiAmount));

      const formattedDate = new Date(payment.paymentDate).toLocaleDateString(
        "en-IN",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

      // Send email
      await sendRepaymentReminderEmail(
        user.email,
        user.name || "User",
        payment.loan.loanName,
        formattedAmount,
        formattedDate
      );

      // Create an in-app notification
      await db.notification.create({
        data: {
          userId: user.id,
          type: "LOAN_EMI_DUE",
          title: "Upcoming EMI Reminder",
          message: `Your EMI of ${formattedAmount} for ${payment.loan.loanName} is due on ${formattedDate}.`,
          link: "/loans",
        },
      });

      // Mark the payment as reminder sent
      await db.loanPayment.update({
        where: { id: payment.id },
        data: { reminderSent: true },
      });

      emailsSent++;
    }

    return NextResponse.json({
      message: `Successfully sent ${emailsSent} reminders.`,
      count: emailsSent,
    });
  } catch (error) {
    console.error("Failed to run repayment reminder cron:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
