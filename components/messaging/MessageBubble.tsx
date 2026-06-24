import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  content: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
  isRead: boolean;
  isOwn: boolean;
  senderName: string;
  senderAvatar: string | null;
};

export function MessageBubble({ content, attachmentUrl, attachmentName, createdAt, isRead, isOwn, senderName, senderAvatar }: MessageBubbleProps) {
  const timeStr = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn("flex w-full mt-2 space-x-3 max-w-xl", isOwn ? "ml-auto justify-end" : "")}>
      {!isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
          <AvatarImage src={senderAvatar || ""} />
          <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col space-y-1 min-w-[120px]", isOwn ? "items-end" : "items-start")}>
        <div 
          className={cn(
            "p-3 rounded-lg text-body-sm relative break-words",
            isOwn 
              ? "bg-primary text-primary-on rounded-tr-none" 
              : "bg-neutral text-neutral-on border border-neutral-variant/50 rounded-tl-none"
          )}
        >
          {content && <p className="whitespace-pre-wrap mb-1">{content}</p>}
          
          {attachmentUrl && (
            <a 
              href={attachmentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "flex items-center space-x-2 p-2 rounded-md text-label-sm hover:opacity-80 transition-opacity mt-2",
                isOwn ? "bg-white/20 text-primary-on" : "bg-white text-primary border border-neutral-variant"
              )}
            >
              <Paperclip className="w-4 h-4 flex-shrink-0" />
              <span className="truncate max-w-[200px]">{attachmentName || "Attachment"}</span>
            </a>
          )}
          
          <div className={cn(
            "flex items-center justify-end space-x-1 text-[10px] mt-1 opacity-70",
            isOwn ? "text-primary-on" : "text-neutral-variant-on"
          )}>
            <span>{timeStr}</span>
            {isOwn && (
              <span className="ml-1">
                {isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
