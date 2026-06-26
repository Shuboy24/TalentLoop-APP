import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createProposalSchema } from "@/lib/validations/proposal";
import { PROPOSAL_EXPIRY_DAYS } from "@/lib/constants";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createProposalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

    // Validate sender is not receiver
    if (session.user.id === data.receiverSkillId) {
      return NextResponse.json({ success: false, error: "Cannot send a proposal to yourself" }, { status: 400 });
    }

    // Determine receiverId by looking up receiverSkillId
    const receiverSkill = await db.userSkill.findFirst({
      where: { skillId: data.receiverSkillId, type: "OFFERED" }
    });

    if (!receiverSkill) {
      return NextResponse.json({ success: false, error: "Receiver skill not found" }, { status: 404 });
    }

    const receiverId = receiverSkill.userId;

    if (session.user.id === receiverId) {
      return NextResponse.json({ success: false, error: "Cannot send a proposal to yourself" }, { status: 400 });
    }

    // Check if active trade exists
    const activeTrade = await db.trade.findFirst({
      where: {
        OR: [
          { userAId: session.user.id, userBId: receiverId },
          { userAId: receiverId, userBId: session.user.id }
        ],
        status: { in: ["Proposed", "Accepted", "In Progress", "Awaiting Confirmation", "Disputed"] }
      }
    });

    if (activeTrade) {
      return NextResponse.json({ success: false, error: "An active trade already exists with this user" }, { status: 400 });
    }

    // Check if pending proposal exists
    const pendingProposal = await db.tradeProposal.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: receiverId },
          { senderId: receiverId, receiverId: session.user.id }
        ],
        status: "Proposed"
      }
    });

    if (pendingProposal) {
      return NextResponse.json({ success: false, error: "A pending proposal already exists with this user" }, { status: 400 });
    }

    const proposal = await db.tradeProposal.create({
      data: {
        senderId: session.user.id,
        receiverId,
        senderSkillId: data.senderSkillId,
        receiverSkillId: data.receiverSkillId,
        senderDeliverables: data.senderDeliverables,
        receiverDeliverables: data.receiverDeliverables,
        timelineDays: data.timelineDays,
        acceptanceDeadline: data.acceptanceDeadline,
        optionalNote: data.optionalNote,
        status: "Proposed"
      }
    });

    // Send notification and email
    await createNotification({
      userId: receiverId,
      type: "proposal_received",
      title: "New Trade Proposal",
      body: `${session.user.name || 'Someone'} proposed a new trade!`,
      link: `/trades`
    });

    return NextResponse.json({ success: true, data: proposal });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

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
        { senderId: session.user.id },
        { receiverId: session.user.id }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    const proposals = await db.tradeProposal.findMany({
      where: whereClause,
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
        senderSkill: { select: { id: true, name: true, category: true } },
        receiverSkill: { select: { id: true, name: true, category: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: proposals });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

