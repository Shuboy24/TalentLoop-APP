"use client";

import { useState, useEffect, useCallback } from "react";
import { MESSAGE_POLL_INTERVAL_MS } from "@/lib/constants";

export type Message = {
  id: string;
  tradeId: string;
  senderId: string;
  content: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; name: string; avatarUrl: string | null };
};

export function useMessages(tradeId: string, isActiveTrade: boolean) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${tradeId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      const json = await res.json();
      if (json.success) {
        setMessages(json.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    fetchMessages();

    // Only poll if the trade is active
    if (!isActiveTrade) return;

    const intervalId = setInterval(fetchMessages, MESSAGE_POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchMessages, isActiveTrade]);

  const sendMessage = async (content: string, attachmentUrl?: string, attachmentName?: string) => {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tradeId,
        content: content || undefined,
        attachmentUrl,
        attachmentName
      })
    });
    
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to send message");
    }
    
    // Fetch immediately after successful send
    await fetchMessages();
    return json.data;
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages: fetchMessages
  };
}
