import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      activeUsers30d,
      totalTrades,
      completedTrades,
      totalProposals,
      acceptedProposals,
      reviewsAgg,
      openDisputes,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { updatedAt: { gte: thirtyDaysAgo } } }),
      db.trade.count(),
      db.trade.count({ where: { status: "Completed" } }),
      db.tradeProposal.count(),
      db.tradeProposal.count({ where: { status: "Accepted" } }),
      db.review.aggregate({
        _avg: { rating: true },
        _count: { id: true }
      }),
      db.dispute.count({ where: { status: "Open" } })
    ]);

    const tradeCompletionRate = totalTrades > 0 ? (completedTrades / totalTrades) * 100 : 0;
    const proposalAcceptanceRate = totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers30d,
        totalTrades,
        tradeCompletionRate: Math.round(tradeCompletionRate),
        proposalAcceptanceRate: Math.round(proposalAcceptanceRate),
        averageRating: reviewsAgg._avg.rating ? Number(reviewsAgg._avg.rating.toFixed(1)) : 0,
        totalReviews: reviewsAgg._count.id,
        openDisputes
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
