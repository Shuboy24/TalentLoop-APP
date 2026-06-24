"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { type Message } from "@/hooks/use-messages";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  messages: Message[];
  currentUserId: string;
  isLoading: boolean;
};

export function MessageThread({ messages, currentUserId, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex space-x-3 w-full max-w-xl">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-16 w-3/4 rounded-lg" />
        </div>
        <div className="flex space-x-3 w-full max-w-xl ml-auto justify-end">
          <Skeleton className="h-12 w-1/2 rounded-lg" />
        </div>
        <div className="flex space-x-3 w-full max-w-xl">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-20 w-2/3 rounded-lg" />
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-variant-on">
        <p className="text-body-md font-medium mb-1">No messages yet</p>
        <p className="text-body-sm text-center">Send a message to start the conversation.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.map((msg) => (
        <MessageBubble 
          key={msg.id}
          content={msg.content}
          attachmentUrl={msg.attachmentUrl}
          attachmentName={msg.attachmentName}
          createdAt={msg.createdAt}
          isRead={msg.isRead}
          isOwn={msg.senderId === currentUserId}
          senderName={msg.sender.name}
          senderAvatar={msg.sender.avatarUrl}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
