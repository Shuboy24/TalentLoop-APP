"use client";

import { CheckCircle2, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export function NotificationItem({ notification }: { notification: Notification }) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(notification.isRead);

  const getIcon = () => {
    switch (notification.type) {
      case "trade_completed":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "trade_cancelled":
      case "dispute_opened":
        return <AlertCircle className="w-5 h-5 text-error" />;
      case "proposal_received":
      case "new_message":
      case "delivery_update":
        return <MessageSquare className="w-5 h-5 text-primary" />;
      default:
        return <RefreshCw className="w-5 h-5 text-neutral-variant-on" />;
    }
  };

  const handleRead = async () => {
    if (isRead) return;
    try {
      await fetch(`/api/notifications/${notification.id}/read`, { method: "POST" });
      setIsRead(true);
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div 
      onClick={handleRead}
      className={cn(
        "flex p-4 border rounded-xl space-x-4 transition-colors cursor-pointer",
        isRead ? "bg-white border-neutral-variant" : "bg-primary-container/10 border-primary shadow-sm hover:bg-primary-container/20"
      )}
    >
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1">
        <h4 className={cn("text-title-sm", isRead ? "text-neutral-on font-medium" : "text-primary font-bold")}>
          {notification.title}
        </h4>
        <p className="text-body-sm text-neutral-variant-on mt-1">{notification.body}</p>
        <div className="flex items-center mt-3 justify-between">
          <span className="text-label-sm text-neutral-variant-on">
            {new Date(notification.createdAt).toLocaleString()}
          </span>
          {notification.link && (
            <Link href={notification.link} className="text-primary text-label-sm font-medium hover:underline">
              View details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
