import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { recalculateTrustScore } from "@/lib/trust-score";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // Support Vercel Cron header pattern or direct authorization header
    if (authHeader !== `Bearer ${cronSecret}` && req.headers.get("x-cron-secret") !== cronSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);

    // Find reviews that are unpublished and older than 72 hours
    const unpublishedReviews = await db.review.findMany({
      where: {
        isPublished: false,
        createdAt: {
          lte: seventyTwoHoursAgo
        }
      }
    });

    if (unpublishedReviews.length === 0) {
      return NextResponse.json({ success: true, publishedCount: 0 });
    }

    // Mark them as published
    const reviewIds = unpublishedReviews.map(r => r.id);
    await db.review.updateMany({
      where: { id: { in: reviewIds } },
      data: { isPublished: true }
    });

    // Recalculate trust scores for the affected users
    const userIdsToRecalculate = new Set<string>();
    for (const review of unpublishedReviews) {
      userIdsToRecalculate.add(review.reviewerId);
      userIdsToRecalculate.add(review.revieweeId);
    }

    for (const userId of userIdsToRecalculate) {
      await recalculateTrustScore(userId);
    }

    return NextResponse.json({ success: true, publishedCount: unpublishedReviews.length });
  } catch (error) {
    console.error("Failed to execute publish-reviews cron:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
