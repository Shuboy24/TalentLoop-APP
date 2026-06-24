import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause: any = {
      OR: [
        { userAId: session.user.id },
        { userBId: session.user.id }
      ]
    };

    if (status && status !== "All") {
      if (status === "Active") {
        whereClause.status = { in: ["Accepted", "In Progress", "Awaiting Confirmation", "Disputed"] };
      } else {
        whereClause.status = status;
      }
    }

    const trades = await db.trade.findMany({
      where: whereClause,
      include: {
        userA: { select: { id: true, name: true, avatarUrl: true } },
        userB: { select: { id: true, name: true, avatarUrl: true } },
        proposal: {
          include: {
            senderSkill: { select: { name: true } },
            receiverSkill: { select: { name: true } }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ success: true, data: trades });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
