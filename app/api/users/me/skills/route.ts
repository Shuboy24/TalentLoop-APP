import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const addSkillSchema = z.object({
  skillId: z.string().uuid(),
  type: z.enum(["OFFERED", "NEEDED"]),
  experienceLevel: z.string().max(20).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addSkillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
    }

    // Check if the user already has this skill of this type
    const existing = await db.userSkill.findUnique({
      where: {
        userId_skillId_type: {
          userId: session.user.id,
          skillId: parsed.data.skillId,
          type: parsed.data.type,
        }
      }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Skill already added as this type" }, { status: 400 });
    }

    const newSkill = await db.userSkill.create({
      data: {
        userId: session.user.id,
        skillId: parsed.data.skillId,
        type: parsed.data.type,
        experienceLevel: parsed.data.experienceLevel || "Intermediate",
      },
      include: {
        skill: true
      }
    });

    return NextResponse.json({ success: true, data: newSkill });
  } catch (error) {
    console.error("Error adding skill:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userSkillId = searchParams.get("id");

    if (!userSkillId) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const userSkill = await db.userSkill.findUnique({
      where: { id: userSkillId }
    });

    if (!userSkill || userSkill.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Not found or forbidden" }, { status: 403 });
    }

    await db.userSkill.delete({
      where: { id: userSkillId }
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
