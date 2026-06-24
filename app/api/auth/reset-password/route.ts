import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validations/auth";
import crypto from "crypto";
import { sendEmail } from "@/lib/nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    
    // We return success even if user doesn't exist to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true, data: null });
    }

    // Reuse the verification token table for password resets
    const token = crypto.randomBytes(32).toString("hex");
    
    // Delete any existing reset token for this email to prevent spam
    await db.verificationToken.deleteMany({
      where: { identifier: email }
    });

    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60) // 1 hour
      }
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: "Reset your TalentLoop password",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
