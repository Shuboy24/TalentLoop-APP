import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";

const sendMessageSchema = z.object({
  tradeId: z.string().uuid(),
  content: z.string().max(MAX_MESSAGE_LENGTH).optional(),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().max(255).optional(),
}).refine(data => data.content || data.attachmentUrl, {
  message: "Message must have content or an attachment"
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

    const trade = await db.trade.findUnique({
      where: { id: data.tradeId }
    });

    if (!trade) {
      return NextResponse.json({ success: false, error: "Trade not found" }, { status: 404 });
    }

    if (trade.userAId !== session.user.id && trade.userBId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (trade.status === "Disputed") {
      return NextResponse.json({ success: false, error: "Cannot send messages while trade is disputed" }, { status: 400 });
    }

    const receiverId = trade.userAId === session.user.id ? trade.userBId : trade.userAId;

    const message = await db.message.create({
      data: {
        tradeId: trade.id,
        senderId: session.user.id,
        content: data.content,
        attachmentUrl: data.attachmentUrl,
        attachmentName: data.attachmentName,
        isRead: false
      }
    });

    // We can throttle notifications here, but for now we create one per message, 
    // or we could only create if there hasn't been one recently.
    // We'll create one.
    await db.notification.create({
      data: {
        userId: receiverId,
        type: "new_message",
        title: "New Message",
        body: `${session.user.name || 'Your partner'} sent a new message in your trade.`,
        link: `/trades/${trade.id}`
      }
    });

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
