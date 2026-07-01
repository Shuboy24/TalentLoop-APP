"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit3, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Define the shape based on the API response
type Proposal = {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  timelineDays: number;
  acceptanceDeadline: Date | string;
  senderDeliverables: string;
  receiverDeliverables: string;
  optionalNote?: string | null;
  createdAt: Date | string;
  sender: { id: string; name: string; avatarUrl: string | null };
  receiver: { id: string; name: string; avatarUrl: string | null };
  senderSkill: { id: string; name: string; category: string };
  receiverSkill: { id: string; name: string; category: string };
};

export function ProposalCard({ proposal, currentUserId }: { proposal: Proposal; currentUserId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReceiver = currentUserId === proposal.receiverId;
  const isPending = proposal.status === "Proposed";
  
  const otherUser = isReceiver ? proposal.sender : proposal.receiver;
  const mySkill = isReceiver ? proposal.receiverSkill : proposal.senderSkill;
  const theirSkill = isReceiver ? proposal.senderSkill : proposal.receiverSkill;

  const handleResponse = async (action: "accept" | "decline") => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const result = await res.json();
        if (action === "accept" && result.data?.id) {
          router.push(`/trades/${result.data.id}`);
        } else {
          router.refresh();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 hover:shadow-tl-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={otherUser.avatarUrl || ""} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-title-sm font-semibold text-neutral-on">{otherUser.name}</h3>
            <p className="text-label-sm text-neutral-variant-on">
              {isReceiver ? "Sent you a proposal" : "You sent a proposal"}
            </p>
          </div>
        </div>
        <Badge variant={isPending ? "outline" : "default"}>
          {proposal.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral p-4 rounded-lg">
        <div>
          <p className="text-label-sm font-medium text-neutral-variant-on mb-1">They provide</p>
          <Badge className="bg-primary-container text-primary hover:bg-primary-container mb-2">
            {theirSkill.name}
          </Badge>
          <p className="text-body-sm text-neutral-on">{isReceiver ? proposal.senderDeliverables : proposal.receiverDeliverables}</p>
        </div>
        <div>
          <p className="text-label-sm font-medium text-neutral-variant-on mb-1">You provide</p>
          <Badge className="bg-secondary-container text-secondary hover:bg-secondary-container mb-2">
            {mySkill.name}
          </Badge>
          <p className="text-body-sm text-neutral-on">{isReceiver ? proposal.receiverDeliverables : proposal.senderDeliverables}</p>
        </div>
      </div>

      <div className="flex items-center space-x-6 text-label-sm text-neutral-variant-on">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          <span>Timeline: {proposal.timelineDays} days</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Expires: {new Date(proposal.acceptanceDeadline).toLocaleDateString()}</span>
        </div>
      </div>

      {proposal.optionalNote && (
        <div className="text-body-sm italic text-neutral-variant-on border-l-2 border-neutral-variant pl-4 py-1">
          "{proposal.optionalNote}"
        </div>
      )}

      {isReceiver && isPending && (
        <div className="flex flex-wrap gap-3 pt-2">
          <Button 
            className="bg-success text-success-on hover:bg-success/90" 
            onClick={() => handleResponse("accept")}
            disabled={isSubmitting}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accept Trade
          </Button>
          <Button 
            variant="outline" 
            className="border-error text-error hover:bg-error-container"
            onClick={() => handleResponse("decline")}
            disabled={isSubmitting}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Decline
          </Button>
          <Button 
            variant="ghost" 
            className="text-primary hover:bg-primary-container"
            disabled={isSubmitting}
            onClick={() => {
              // Usually opens a modal for counter proposal
              alert("Counter proposal to be implemented");
            }}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Counter Offer
          </Button>
        </div>
      )}
    </Card>
  );
}
