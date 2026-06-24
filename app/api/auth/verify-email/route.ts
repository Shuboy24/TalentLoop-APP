import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyEmailSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { token } = parsed.data;

    const verificationToken = await db.verificationToken.findUnique({ where: { token } });
    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 400 });
    }

    // Update user
    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: true }
    });

    // Delete token
    await db.verificationToken.delete({ where: { token } });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
