import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createSkillSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(2).max(50),
  description: z.string().optional()
});

const updateSkillSchema = createSkillSchema.extend({
  id: z.string().uuid(),
  isActive: z.boolean().optional()
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createSkillSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const existing = await db.skill.findUnique({
      where: { name: result.data.name }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Skill already exists" }, { status: 400 });
    }

    const newSkill = await db.skill.create({
      data: result.data
    });

    return NextResponse.json({ success: true, data: newSkill });
  } catch (error) {
    console.error("Admin skills POST error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateSkillSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const { id, ...data } = result.data;

    // Check name collision if name changed
    if (data.name) {
      const existing = await db.skill.findFirst({
        where: { name: data.name, id: { not: id } }
      });
      if (existing) {
        return NextResponse.json({ success: false, error: "Skill name already in use" }, { status: 400 });
      }
    }

    const updatedSkill = await db.skill.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, data: updatedSkill });
  } catch (error) {
    console.error("Admin skills PATCH error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    // Soft delete
    const deactivatedSkill = await db.skill.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true, data: deactivatedSkill });
  } catch (error) {
    console.error("Admin skills DELETE error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
