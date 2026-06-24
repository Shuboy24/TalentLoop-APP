"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";

type Props = {
  onSendMessage: (content: string, attachmentUrl?: string, attachmentName?: string) => Promise<void>;
  disabled?: boolean;
};

export function MessageInput({ onSendMessage, disabled }: Props) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // MVP mock attachment handling
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if ((!content.trim() && !attachmentName) || disabled || isSending) return;
    
    setIsSending(true);
    try {
      // Mock attachment URL for MVP
      const attachmentUrl = attachmentName ? `https://mock.url/${encodeURIComponent(attachmentName)}` : undefined;
      
      await onSendMessage(content.trim(), attachmentUrl, attachmentName || undefined);
      
      setContent("");
      setAttachmentName(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
    }
    // Reset the input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-t border-neutral-variant p-4 bg-white space-y-3">
      {attachmentName && (
        <div className="flex items-center space-x-2 bg-neutral p-2 rounded-md w-fit border border-neutral-variant/50">
          <Paperclip className="w-4 h-4 text-neutral-variant-on" />
          <span className="text-label-sm truncate max-w-[200px]">{attachmentName}</span>
          <button 
            onClick={() => setAttachmentName(null)}
            className="text-error hover:text-error/80 p-1 rounded-full hover:bg-error-container"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        <div className="relative flex-1">
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            placeholder={disabled ? "Messaging is disabled" : "Type a message..."}
            className="min-h-[80px] max-h-[200px] resize-none pr-12 pb-6"
          />
          <span className={`absolute bottom-2 right-3 text-[10px] ${content.length > MAX_MESSAGE_LENGTH ? 'text-error' : 'text-neutral-variant-on'}`}>
            {content.length}/{MAX_MESSAGE_LENGTH}
          </span>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={disabled || isSending}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled || isSending}
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-2 right-2 h-8 w-8 text-neutral-variant-on hover:text-primary hover:bg-primary-container"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          onClick={handleSend}
          disabled={(!content.trim() && !attachmentName) || disabled || isSending || content.length > MAX_MESSAGE_LENGTH}
          className="h-12 w-12 rounded-full p-0 flex-shrink-0"
        >
          <Send className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
