import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { bio, location, offeredSkills, neededSkills, availability } = parsed.data;

    // Use a transaction to ensure all skills are updated safely
    await db.$transaction(async (tx) => {
      // 1. Update user profile
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          bio,
          location,
          availability,
          onboardingComplete: true,
        }
      });

      // 2. Delete existing skills if any (for idempotency)
      await tx.userSkill.deleteMany({
        where: { userId: session.user.id }
      });

      // 3. Insert offered skills
      if (offeredSkills.length > 0) {
        await tx.userSkill.createMany({
          data: offeredSkills.map(skillId => ({
            userId: session.user.id,
            skillId,
            type: "OFFERED"
          }))
        });
      }

      // 4. Insert needed skills
      if (neededSkills.length > 0) {
        await tx.userSkill.createMany({
          data: neededSkills.map(skillId => ({
            userId: session.user.id,
            skillId,
            type: "NEEDED"
          }))
        });
      }
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
