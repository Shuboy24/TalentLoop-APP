import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createProposalSchema } from "@/lib/validations/proposal";

export async function POST(request: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  try {
    const { proposalId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const parentProposal = await db.tradeProposal.findUnique({
      where: { id: proposalId }
    });

    if (!parentProposal) {
      return NextResponse.json({ success: false, error: "Parent proposal not found" }, { status: 404 });
    }

    if (parentProposal.receiverId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Only the receiver can counter-propose" }, { status: 403 });
    }

    if (parentProposal.status !== "Proposed") {
      return NextResponse.json({ success: false, error: "Can only counter-propose on an active proposal" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createProposalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = parsed.data;

    const [updatedParent, counterProposal] = await db.$transaction([
      db.tradeProposal.update({
        where: { id: parentProposal.id },
        data: { status: "Countered" }
      }),
      db.tradeProposal.create({
        data: {
          senderId: session.user.id,
          receiverId: parentProposal.senderId, // Reversing roles
          senderSkillId: data.senderSkillId,
          receiverSkillId: data.receiverSkillId,
          senderDeliverables: data.senderDeliverables,
          receiverDeliverables: data.receiverDeliverables,
          timelineDays: data.timelineDays,
          acceptanceDeadline: data.acceptanceDeadline,
          optionalNote: data.optionalNote,
          status: "Proposed",
          parentProposalId: parentProposal.id
        }
      })
    ]);

    await db.notification.create({
      data: {
        userId: parentProposal.senderId,
        type: "counter_proposal",
        title: "Counter Proposal Received",
        body: `${(session.user as any).name || 'The user'} sent a counter-proposal to your trade terms.`,
        link: `/trades`
      }
    });

    return NextResponse.json({ success: true, data: counterProposal });
  } catch (error) {
    console.error("Error creating counter proposal:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
