import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { NotificationItem } from "./NotificationItem";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-display-sm font-bold mb-2">Notifications</h1>
        <p className="text-body-md text-neutral-variant-on">Stay updated on your trades, proposals, and messages.</p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center p-12 bg-neutral rounded-lg border border-neutral-variant">
            <p className="text-body-md text-neutral-variant-on">You have no notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n as any} />
          ))
        )}
      </div>
    </div>
  );
}
