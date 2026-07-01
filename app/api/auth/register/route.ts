import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/nodemailer";
import { BCRYPT_COST_FACTOR } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: "Email is already in use" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

    // Normally we'd use a VerificationToken table if we use NextAuth's email provider, 
    // but since we're using Credentials provider and custom email verification, we will
    // use PrismaAdapter's verification tokens table or a custom token table.
    // Wait, the schema has no custom token table, NextAuth VerificationToken expects identifier and token.
    
    // Create the user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name,
        emailVerified: false,
      }
    });

    const token = crypto.randomBytes(32).toString("hex");
    
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60) // 1 hour
      }
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
    
    // Send verification email
    await sendEmail({
      to: email,
      subject: "Verify your TalentLoop account",
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
    });

    // Send welcome email
    const firstName = name.split(" ")[0] || "there";
    await sendEmail({
      to: email,
      subject: "Welcome to TalentLoop!",
      html: `
        <h2>Welcome to TalentLoop, ${firstName}!</h2>
        <p>We're thrilled to have you join our community.</p>
        <p>TalentLoop is all about exchanging skills and creating value together without money changing hands.</p>
        <p>Get started by completing your profile and proposing your first trade!</p>
        <br/>
        <p>Best regards,</p>
        <p>The TalentLoop Team</p>
      `
    });

    return NextResponse.json({ success: true, data: { userId: user.id } });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
