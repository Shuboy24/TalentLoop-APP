import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const cronSecret = headersList.get("authorization")?.split(" ")[1];
    
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    const expiredProposals = await db.tradeProposal.findMany({
      where: {
        status: { in: ["Proposed", "Countered"] },
        acceptanceDeadline: { lt: now }
      }
    });

    for (const proposal of expiredProposals) {
      await db.$transaction(async (tx) => {
        await tx.tradeProposal.update({
          where: { id: proposal.id },
          data: { status: "Expired" }
        });

        // Notify sender that their proposal expired
        await tx.notification.create({
          data: {
            userId: proposal.senderId,
            type: "proposal_expired",
            title: "Proposal Expired",
            body: "Your trade proposal has expired.",
            link: "/trades"
          }
        });
      });
    }

    return NextResponse.json({ success: true, count: expiredProposals.length });
  } catch (error) {
    console.error("Cron expire proposals error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
