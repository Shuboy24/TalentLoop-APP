"use client";

import { useMessages } from "@/hooks/use-messages";
import { MessageThread } from "@/components/messaging/MessageThread";
import { MessageInput } from "@/components/messaging/MessageInput";

type Props = {
  tradeId: string;
  currentUserId: string;
  status: string;
};

export function TradeMessaging({ tradeId, currentUserId, status }: Props) {
  const isActiveTrade = !["Cancelled", "Disputed"].includes(status);
  const { messages, isLoading, sendMessage } = useMessages(tradeId, isActiveTrade);

  const disabled = !isActiveTrade;

  return (
    <>
      <div className="flex items-center p-4 border-b border-neutral-variant bg-neutral/10">
        <h2 className="text-title-sm font-semibold">Messages</h2>
        {!isActiveTrade && (
          <span className="ml-auto text-label-sm text-error font-medium">
            Messaging disabled ({status})
          </span>
        )}
      </div>
      
      <MessageThread 
        messages={messages} 
        currentUserId={currentUserId} 
        isLoading={isLoading} 
      />
      
      <MessageInput 
        onSendMessage={sendMessage} 
        disabled={disabled} 
      />
    </>
  );
}
