import { db } from "./db";
import { sendEmail } from "./resend";
import * as React from "react";
import { NotificationEmail } from "@/emails/NotificationEmail";

type NotificationType =
  | "match_found"
  | "proposal_received"
  | "proposal_accepted"
  | "proposal_declined"
  | "counter_proposal"
  | "new_message"
  | "deadline_warning"
  | "trade_completed"
  | "review_reminder"
  | "dispute_raised"
  | "dispute_resolved"
  | "delivery_update";

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}) {
  try {
    // 1. Create in-app notification
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        link,
        isRead: false,
      },
    });

    // 2. Conditionally send email (skip for new_message for now, or based on user settings)
    if (type !== "new_message") {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        const fullUrl = link ? `${process.env.NEXTAUTH_URL}${link}` : undefined;

        await sendEmail({
          to: user.email,
          subject: `TalentLoop: ${title}`,
          react: React.createElement(NotificationEmail, {
            title,
            name: user.name,
            bodyText: body,
            url: fullUrl
          }),
        });
      }
    }

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
