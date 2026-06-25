import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const disputes = await db.dispute.findMany({
      include: {
        complainant: { select: { name: true, email: true } },
        trade: {
          select: {
            userA: { select: { name: true } },
            userB: { select: { name: true } }
          }
        }
      },
      orderBy: [
        { status: "asc" }, // "Open" comes before "Resolved" alphabetically, so Open is first. Wait, "Open" vs "Resolved" -> "O" comes before "R". Perfect!
        { createdAt: "desc" }
      ]
    });

    return NextResponse.json({ success: true, data: disputes });
  } catch (error) {
    console.error("Admin disputes GET error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
