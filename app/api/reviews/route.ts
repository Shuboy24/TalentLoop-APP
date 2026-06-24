import { NextResponse } from "next/response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createReviewSchema } from "@/lib/validations/review";
import { recalculateTrustScore } from "@/lib/trust-score";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const tradeId = body.tradeId;

    if (!tradeId) {
      return NextResponse.json({ success: false, error: "Missing tradeId" }, { status: 400 });
    }

    const parseResult = createReviewSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: "Invalid input", details: parseResult.error.errors }, { status: 400 });
    }

    const { rating, reviewText } = parseResult.data;

    // Fetch the trade
    const trade = await db.trade.findUnique({
      where: { id: tradeId }
    });

    if (!trade) {
      return NextResponse.json({ success: false, error: "Trade not found" }, { status: 404 });
    }

    if (trade.status !== "Completed") {
      return NextResponse.json({ success: false, error: "Can only review completed trades" }, { status: 400 });
    }

    if (trade.userAId !== session.user.id && trade.userBId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const revieweeId = trade.userAId === session.user.id ? trade.userBId : trade.userAId;

    // Check if review already exists
    const existingReview = await db.review.findUnique({
      where: {
        tradeId_reviewerId: {
          tradeId: trade.id,
          reviewerId: session.user.id
        }
      }
    });

    if (existingReview) {
      return NextResponse.json({ success: false, error: "You have already reviewed this trade" }, { status: 400 });
    }

    // Create the review
    const newReview = await db.review.create({
      data: {
        tradeId: trade.id,
        reviewerId: session.user.id,
        revieweeId,
        rating,
        reviewText,
        isPublished: false // Will be published if counterpart also reviewed or after 72 hours
      }
    });

    // Check if the other party has reviewed
    const counterpartReview = await db.review.findUnique({
      where: {
        tradeId_reviewerId: {
          tradeId: trade.id,
          reviewerId: revieweeId
        }
      }
    });

    let reviewsPublished = false;

    if (counterpartReview) {
      // Both have reviewed, publish both
      await db.review.updateMany({
        where: { tradeId: trade.id },
        data: { isPublished: true }
      });
      reviewsPublished = true;

      // Recalculate trust scores for both users asynchronously
      await recalculateTrustScore(session.user.id);
      await recalculateTrustScore(revieweeId);
    }

    return NextResponse.json({ success: true, data: { review: newReview, published: reviewsPublished } });
  } catch (error) {
    console.error("Failed to submit review:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
