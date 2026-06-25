import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(request: Request, { params }: { params: Promise<{ tradeId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { tradeId } = await params;
    const trade = await db.trade.findUnique({
      where: { id: tradeId },
      include: {
        userA: { select: { id: true, name: true, avatarUrl: true, email: true, trustScore: true, reputationLevel: true } },
        userB: { select: { id: true, name: true, avatarUrl: true, email: true, trustScore: true, reputationLevel: true } },
        proposal: {
          include: {
            senderSkill: true,
            receiverSkill: true,
          }
        }
      }
    });

    if (!trade) {
      return NextResponse.json({ success: false, error: "Trade not found" }, { status: 404 });
    }

    if (trade.userAId !== session.user.id && trade.userBId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: trade });
  } catch (error) {
    console.error("Error fetching trade:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

const updateStatusSchema = z.object({
  status: z.enum(["Cancelled"]) // For now, users can only voluntarily cancel. Delivery and disputes have their own endpoints.
});

export async function PATCH(request: Request, { params }: { params: Promise<{ tradeId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const { tradeId } = await params;
    const trade = await db.trade.findUnique({
      where: { id: tradeId }
    });

    if (!trade) {
      return NextResponse.json({ success: false, error: "Trade not found" }, { status: 404 });
    }

    if (trade.userAId !== session.user.id && trade.userBId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (parsed.data.status === "Cancelled") {
      if (trade.status !== "Accepted" && trade.status !== "In Progress") {
        return NextResponse.json({ success: false, error: "Can only cancel active trades" }, { status: 400 });
      }
      
      const updated = await db.trade.update({
        where: { id: trade.id },
        data: { status: "Cancelled" }
      });

      const otherUserId = trade.userAId === session.user.id ? trade.userBId : trade.userAId;
      await db.notification.create({
        data: {
          userId: otherUserId,
          type: "trade_cancelled",
          title: "Trade Cancelled",
          body: `${session.user.name || 'Your partner'} cancelled the trade.`,
          link: `/trades/${trade.id}`
        }
      });

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid status transition" }, { status: 400 });
  } catch (error) {
    console.error("Error updating trade:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
