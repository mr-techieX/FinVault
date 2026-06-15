import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your FinVault account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 8px;">FinVault</h1>
        <p style="color: #94a3b8; margin-bottom: 32px;">Personal Finance & Net Worth Platform</p>
        
        <h2 style="font-size: 20px; margin-bottom: 16px;">Welcome, ${name}! 👋</h2>
        <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 24px;">
          Thank you for creating your FinVault account. Please verify your email address to get started tracking your finances.
        </p>
        
        <a href="${verificationUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
          Verify Email Address
        </a>
        
        <p style="color: #64748b; font-size: 14px;">
          This link expires in 24 hours. If you didn't create a FinVault account, you can safely ignore this email.
        </p>
        
        <hr style="border: 1px solid #1e293b; margin: 32px 0;" />
        <p style="color: #475569; font-size: 12px;">
          If the button doesn't work, copy and paste this URL:<br/>
          <a href="${verificationUrl}" style="color: #6366f1;">${verificationUrl}</a>
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your FinVault password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 8px;">FinVault</h1>
        <p style="color: #94a3b8; margin-bottom: 32px;">Personal Finance & Net Worth Platform</p>
        
        <h2 style="font-size: 20px; margin-bottom: 16px;">Reset Your Password</h2>
        <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 24px;">
          Hi ${name}, we received a request to reset your password. Click the button below to create a new password.
        </p>
        
        <a href="${resetUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
          Reset Password
        </a>
        
        <p style="color: #64748b; font-size: 14px;">
          This link expires in 1 hour. If you didn't request a password reset, please ignore this email — your password won't be changed.
        </p>
        
        <hr style="border: 1px solid #1e293b; margin: 32px 0;" />
        <p style="color: #475569; font-size: 12px;">
          If the button doesn't work, copy and paste this URL:<br/>
          <a href="${resetUrl}" style="color: #6366f1;">${resetUrl}</a>
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to FinVault — Your financial journey starts now!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 8px;">FinVault</h1>
        <p style="color: #94a3b8; margin-bottom: 32px;">Personal Finance & Net Worth Platform</p>
        
        <h2 style="font-size: 20px; margin-bottom: 16px;">You're all set, ${name}! 🎉</h2>
        <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 24px;">
          Your account has been verified. Welcome to FinVault — where you take control of your financial future.
        </p>
        
        <div style="background: #1e293b; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h3 style="color: #6366f1; margin-bottom: 16px;">Get started in 3 steps:</h3>
          <p style="margin: 8px 0;">📊 <strong>1. Add your accounts</strong> — Bank accounts, credit cards, loans</p>
          <p style="margin: 8px 0;">💰 <strong>2. Track your income & expenses</strong> — See where your money goes</p>
          <p style="margin: 8px 0;">🎯 <strong>3. Set financial goals</strong> — Watch your net worth grow</p>
        </div>
        
        <a href="${BASE_URL}/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Go to Dashboard
        </a>
      </div>
    `,
  });
}
