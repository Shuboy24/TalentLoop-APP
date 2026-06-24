import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: { tradeId: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const trade = await db.trade.findUnique({
      where: { id: params.tradeId }
    });

    if (!trade) {
      return NextResponse.json({ success: false, error: "Trade not found" }, { status: 404 });
    }

    if (trade.userAId !== session.user.id && trade.userBId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (trade.status !== "In Progress" && trade.status !== "Awaiting Confirmation") {
      return NextResponse.json({ success: false, error: "Cannot mark delivery on a trade that is not in progress" }, { status: 400 });
    }

    const isUserA = trade.userAId === session.user.id;
    const isUserB = trade.userBId === session.user.id;

    // Check if they already marked it delivered
    if ((isUserA && trade.userADelivered) || (isUserB && trade.userBDelivered)) {
      return NextResponse.json({ success: false, error: "You already marked your part as delivered" }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (isUserA) dataToUpdate.userADelivered = true;
    if (isUserB) dataToUpdate.userBDelivered = true;

    const willBeFullyComplete = (isUserA || trade.userADelivered) && (isUserB || trade.userBDelivered);

    if (willBeFullyComplete) {
      dataToUpdate.status = "Completed";
    } else {
      dataToUpdate.status = "Awaiting Confirmation";
    }

    const [updatedTrade] = await db.$transaction(async (tx) => {
      const updated = await tx.trade.update({
        where: { id: trade.id },
        data: dataToUpdate
      });

      const otherUserId = trade.userAId === session.user.id ? trade.userBId : trade.userAId;
      
      if (willBeFullyComplete) {
        // Award 10 points to both users
        await tx.talentPointTransaction.create({
          data: { userId: trade.userAId, amount: 10, reason: "Trade completed", tradeId: trade.id }
        });
        await tx.user.update({ where: { id: trade.userAId }, data: { talentPoints: { increment: 10 } } });

        await tx.talentPointTransaction.create({
          data: { userId: trade.userBId, amount: 10, reason: "Trade completed", tradeId: trade.id }
        });
        await tx.user.update({ where: { id: trade.userBId }, data: { talentPoints: { increment: 10 } } });

        // Notify both parties
        await tx.notification.create({
          data: {
            userId: trade.userAId,
            type: "trade_completed",
            title: "Trade Completed!",
            body: "Your trade has been completed! 10 Talent Points awarded.",
            link: `/trades/${trade.id}`
          }
        });
        await tx.notification.create({
          data: {
            userId: trade.userBId,
            type: "trade_completed",
            title: "Trade Completed!",
            body: "Your trade has been completed! 10 Talent Points awarded.",
            link: `/trades/${trade.id}`
          }
        });
      } else {
        // Notify other user that partner delivered
        await tx.notification.create({
          data: {
            userId: otherUserId,
            type: "delivery_update",
            title: "Partner Delivered",
            body: `${session.user.name || 'Your partner'} marked their part as completed. Please confirm yours.`,
            link: `/trades/${trade.id}`
          }
        });
      }

      return [updated];
    });

    return NextResponse.json({ success: true, data: updatedTrade });
  } catch (error) {
    console.error("Error marking delivery:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
