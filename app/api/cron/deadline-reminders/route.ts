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

    const now = new Date();
    const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Find trades in progress with deadline within 24 hours that haven't been completed
    const expiringTrades = await db.trade.findMany({
      where: {
        status: "In Progress",
        deadline: {
          gt: now,
          lte: twentyFourHoursFromNow
        }
      },
      include: {
        proposal: {
          include: {
            senderSkill: true,
            receiverSkill: true
          }
        }
      }
    });

    for (const trade of expiringTrades) {
      const message = `Your trade deadline is approaching in less than 24 hours.`;
      
      // Notify userA
      if (!trade.userADeliveryConfirmed) {
        await createNotification({
          userId: trade.userAId,
          type: "deadline_warning",
          title: "Approaching Deadline",
          body: message,
          link: `/trades/${trade.id}`,
        });
      }

      // Notify userB
      if (!trade.userBDeliveryConfirmed) {
        await createNotification({
          userId: trade.userBId,
          type: "deadline_warning",
          title: "Approaching Deadline",
          body: message,
          link: `/trades/${trade.id}`,
        });
      }
    }

    return NextResponse.json({ success: true, count: expiringTrades.length });
  } catch (error) {
    console.error("Failed to execute deadline-reminders cron:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
