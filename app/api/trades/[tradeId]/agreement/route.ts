import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ tradeId: string }> }) {
  try {
    const { tradeId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const trade = await db.trade.findUnique({
      where: { id: tradeId },
      include: {
        proposal: {
          include: {
            senderSkill: true,
            receiverSkill: true,
            sender: { select: { name: true, avatarUrl: true } },
            receiver: { select: { name: true, avatarUrl: true } },
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
    console.error("Error fetching agreement:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ tradeId: string }> }) {
  try {
    const { tradeId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const trade = await db.trade.findUnique({
      where: { id: tradeId },
      include: {
        proposal: {
          include: {
            senderSkill: true,
            receiverSkill: true,
            sender: { select: { id: true, name: true, email: true } },
            receiver: { select: { id: true, name: true, email: true } },
          }
        }
      }
    });

    if (!trade) {
      return NextResponse.json({ success: false, error: "Trade not found" }, { status: 404 });
    }

    if (trade.userAId !== session.user.id && trade.userBId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (trade.status !== "Accepted" && trade.status !== "Awaiting Confirmation") {
      // If it's already in progress, nothing to do
      if (trade.status === "In Progress") {
        return NextResponse.json({ success: false, error: "Agreement already confirmed by both parties" }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: "Trade is not in a confirmable state" }, { status: 400 });
    }

    // Determine which user is confirming
    const isUserA = trade.userAId === session.user.id;
    const isUserB = trade.userBId === session.user.id;

    const dataToUpdate: any = {};
    if (isUserA) dataToUpdate.userAAgreementConfirmed = true;
    if (isUserB) dataToUpdate.userBAgreementConfirmed = true;

    // Check if both are now confirmed
    const willBeFullyConfirmed = (isUserA || trade.userAAgreementConfirmed) && (isUserB || trade.userBAgreementConfirmed);

    if (willBeFullyConfirmed) {
      dataToUpdate.status = "In Progress";
      
      // Calculate deadline
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + trade.proposal.timelineDays);
      dataToUpdate.deadline = deadline;

      // Create snapshot
      dataToUpdate.agreementSnapshot = {
        timelineDays: trade.proposal.timelineDays,
        senderDeliverables: trade.proposal.senderDeliverables,
        receiverDeliverables: trade.proposal.receiverDeliverables,
        senderSkill: trade.proposal.senderSkill.name,
        receiverSkill: trade.proposal.receiverSkill.name,
        userAId: trade.proposal.senderId,
        userBId: trade.proposal.receiverId,
        userAName: trade.proposal.sender.name,
        userBName: trade.proposal.receiver.name,
        confirmedAt: new Date().toISOString()
      };
    } else {
      // It will just be partially confirmed, maybe we need to update status to "Awaiting Confirmation"
      // Wait, "Awaiting Confirmation" is actually used for delivery in the plan.
      // Actually, the plan says: "Confirm agreement. Each party confirms independently. When both confirmed, snapshot the agreement as immutable JSONB. Status -> "In Progress". Set trade deadline."
      // I'll leave the status as "Accepted" until both confirm.
    }

    const updatedTrade = await db.trade.update({
      where: { id: trade.id },
      data: dataToUpdate
    });

    return NextResponse.json({ success: true, data: updatedTrade });
  } catch (error) {
    console.error("Error confirming agreement:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
