import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ tradeId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { tradeId } = await params;

    const trade = await db.trade.findUnique({
      where: { id: tradeId }
    });

    if (!trade) {
      return NextResponse.json({ success: false, error: "Trade not found" }, { status: 404 });
    }

    if (trade.userAId !== session.user.id && trade.userBId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const messages = await db.message.findMany({
      where: { tradeId: tradeId },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: "asc" } // Oldest to newest
    });

    // Mark unread messages sent by the OTHER user as read
    const unreadMessageIds = messages
      .filter(m => !m.isRead && m.senderId !== session.user.id)
      .map(m => m.id);

    if (unreadMessageIds.length > 0) {
      await db.message.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
