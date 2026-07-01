import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createDisputeSchema } from "@/lib/validations/dispute";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = createDisputeSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: "Invalid input", details: parseResult.error.issues }, { status: 400 });
    }

    const { tradeId, reason, reasonDetail, evidenceUrls } = parseResult.data;

    // Verify trade
    const trade = await db.trade.findUnique({
      where: { id: tradeId }
    });

    if (!trade) {
      return NextResponse.json({ success: false, error: "Trade not found" }, { status: 404 });
    }

    if (trade.userAId !== session.user.id && trade.userBId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (trade.status !== "In Progress" && trade.status !== "Awaiting Confirmation") {
      return NextResponse.json({ success: false, error: "Can only dispute active trades" }, { status: 400 });
    }

    // Rate limiting logic could be added here

    // Use Prisma transaction to ensure both operations succeed
    const newDispute = await db.$transaction(async (tx) => {
      // Create dispute
      const dispute = await tx.dispute.create({
        data: {
          tradeId,
          complainantId: session.user.id,
          reason,
          reasonDetail,
          evidenceUrls,
          status: "Open"
        }
      });

      // Update trade status to "Disputed"
      await tx.trade.update({
        where: { id: tradeId },
        data: { status: "Disputed" }
      });

      return dispute;
    });

    // TODO: Notify counterparty and admins (Notification system integration)

    return NextResponse.json({ success: true, data: newDispute });
  } catch (error) {
    console.error("Failed to create dispute:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
