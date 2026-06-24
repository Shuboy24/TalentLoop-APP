import { NextResponse } from "next/response";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (authHeader !== `Bearer ${cronSecret}` && req.headers.get("x-cron-secret") !== cronSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find completed trades older than 24 hours
    const completedTrades = await db.trade.findMany({
      where: {
        status: "Completed",
        completedAt: {
          lte: twentyFourHoursAgo
        }
      },
      include: {
        reviews: true
      }
    });

    let remindersSent = 0;

    for (const trade of completedTrades) {
      const userAHasReviewed = trade.reviews.some(r => r.reviewerId === trade.userAId);
      const userBHasReviewed = trade.reviews.some(r => r.reviewerId === trade.userBId);

      const message = `Please leave a review for your recently completed trade.`;

      if (!userAHasReviewed) {
        await createNotification({
          userId: trade.userAId,
          type: "review_reminder",
          title: "Leave a Review",
          body: message,
          link: `/profile/${trade.userBId}`, // Or a specific review page
        });
        remindersSent++;
      }

      if (!userBHasReviewed) {
        await createNotification({
          userId: trade.userBId,
          type: "review_reminder",
          title: "Leave a Review",
          body: message,
          link: `/profile/${trade.userAId}`, // Or a specific review page
        });
        remindersSent++;
      }
    }

    return NextResponse.json({ success: true, count: remindersSent });
  } catch (error) {
    console.error("Failed to execute review-reminders cron:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
