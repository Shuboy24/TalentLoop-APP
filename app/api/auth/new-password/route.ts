import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newPasswordSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { BCRYPT_COST_FACTOR } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = newPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { token, password } = parsed.data;

    const verificationToken = await db.verificationToken.findUnique({ where: { token } });
    
    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST_FACTOR);

    await db.user.update({
      where: { email: verificationToken.identifier },
      data: { passwordHash }
    });

    await db.verificationToken.delete({ where: { token } });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("New password error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
