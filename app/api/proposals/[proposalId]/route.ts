import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { respondToProposalSchema } from "@/lib/validations/proposal";

export async function GET(request: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { proposalId } = await params;

    const proposal = await db.tradeProposal.findUnique({
      where: { id: proposalId },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true, trustScore: true, reputationLevel: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true, trustScore: true, reputationLevel: true } },
        senderSkill: { select: { id: true, name: true, category: true } },
        receiverSkill: { select: { id: true, name: true, category: true } }
      }
    });

    if (!proposal) {
      return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.senderId !== session.user.id && proposal.receiverId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: proposal });
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { proposalId } = await params;

    const body = await request.json();
    const parsed = respondToProposalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { action, declineReason } = parsed.data;

    const proposal = await db.tradeProposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.receiverId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Only the receiver can respond to a proposal" }, { status: 403 });
    }

    if (proposal.status !== "Proposed") {
      return NextResponse.json({ success: false, error: `Proposal cannot be ${action}ed because it is already ${proposal.status}` }, { status: 400 });
    }

    if (action === "decline") {
      const updated = await db.tradeProposal.update({
        where: { id: proposal.id },
        data: { status: "Declined" } // Might need a note or reason field later
      });

      await db.notification.create({
        data: {
          userId: proposal.senderId,
          type: "proposal_declined",
          title: "Proposal Declined",
          body: `${(session.user as any).name || 'The user'} declined your trade proposal.`,
          link: `/trades`
        }
      });

      return NextResponse.json({ success: true, data: updated });
    } else if (action === "accept") {
      // Create Trade in transaction
      const [updatedProposal, newTrade] = await db.$transaction([
        db.tradeProposal.update({
          where: { id: proposal.id },
          data: { status: "Accepted" }
        }),
        db.trade.create({
          data: {
            proposalId: proposal.id,
            userAId: proposal.senderId,
            userBId: proposal.receiverId,
            status: "Accepted"
          }
        })
      ]);

      await db.notification.create({
        data: {
          userId: proposal.senderId,
          type: "proposal_accepted",
          title: "Proposal Accepted!",
          body: `${(session.user as any).name || 'The user'} accepted your trade proposal. Action required!`,
          link: `/trades/${newTrade.id}`
        }
      });

      return NextResponse.json({ success: true, data: newTrade });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
