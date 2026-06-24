"use client";

import { useEffect, useState } from "react";
import { MESSAGE_POLL_INTERVAL_MS } from "@/lib/constants";

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/notifications?unreadOnly=true");
        if (res.ok) {
          const result = await res.json();
          if (result.success && mounted) {
            setUnreadCount(result.data.length);
          }
        }
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
      }
    }

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000); // 30s interval for notifications

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { unreadCount };
}
