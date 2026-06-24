import { NextResponse } from "next/response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveDisputeSchema } from "@/lib/validations/dispute";

export async function GET(req: Request, { params }: { params: { disputeId: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { disputeId } = await params;

    const dispute = await db.dispute.findUnique({
      where: { id: disputeId },
      include: {
        trade: true,
        complainant: {
          select: { id: true, name: true, avatarUrl: true }
        },
        resolver: {
          select: { id: true, name: true }
        }
      }
    });

    if (!dispute) {
      return NextResponse.json({ success: false, error: "Dispute not found" }, { status: 404 });
    }

    const isParty = dispute.trade.userAId === session.user.id || dispute.trade.userBId === session.user.id;
    if (!isParty && !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: dispute });
  } catch (error) {
    console.error("Failed to fetch dispute:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { disputeId: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized or not admin" }, { status: 403 });
    }

    const { disputeId } = await params;
    const body = await req.json();
    const parseResult = resolveDisputeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: "Invalid input", details: parseResult.error.errors }, { status: 400 });
    }

    const { resolution, adminNotes } = parseResult.data;

    const dispute = await db.dispute.findUnique({
      where: { id: disputeId },
      include: { trade: true }
    });

    if (!dispute) {
      return NextResponse.json({ success: false, error: "Dispute not found" }, { status: 404 });
    }

    if (dispute.status !== "Open") {
      return NextResponse.json({ success: false, error: "Dispute is already resolved" }, { status: 400 });
    }

    // Determine new trade status based on resolution
    let newTradeStatus = "Disputed"; // Default
    if (resolution === "Complete Trade") {
      newTradeStatus = "Completed";
      // Additional logic for completing trade
    } else if (resolution === "Dismissed") {
      newTradeStatus = "In Progress"; // or "Awaiting Confirmation"
    } else if (resolution === "Suspend") {
      newTradeStatus = "Cancelled";
    } else if (resolution === "Reverse Points" || resolution === "Warn") {
      newTradeStatus = "Completed"; // Example
    }

    const updatedDispute = await db.$transaction(async (tx) => {
      // Resolve dispute
      const resDispute = await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status: "Resolved",
          resolution,
          adminNotes,
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        }
      });

      // Update trade status
      await tx.trade.update({
        where: { id: dispute.tradeId },
        data: { status: newTradeStatus }
      });

      // Optional: Handle suspensions, point reversals
      if (resolution === "Suspend") {
        const otherUserId = dispute.complainantId === dispute.trade.userAId ? dispute.trade.userBId : dispute.trade.userAId;
        await tx.user.update({
          where: { id: otherUserId }, // Assuming the complaint is valid
          data: { isSuspended: true }
        });
      }

      return resDispute;
    });

    // TODO: Send notifications

    return NextResponse.json({ success: true, data: updatedDispute });
  } catch (error) {
    console.error("Failed to resolve dispute:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
