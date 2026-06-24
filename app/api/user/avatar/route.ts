import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const avatarSchema = z.object({
  avatarUrl: z.string().url().nullable(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = avatarSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: parsed.data.avatarUrl }
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Avatar update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
