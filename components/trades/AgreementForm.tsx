"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Simplified type based on what we need from Trade
type Trade = {
  id: string;
  status: string;
  userAAgreementConfirmed: boolean;
  userBAgreementConfirmed: boolean;
  userAId: string;
  proposal: {
    senderId: string;
    timelineDays: number;
    senderDeliverables: string;
    receiverDeliverables: string;
    senderSkill: { name: string };
    receiverSkill: { name: string };
  };
};

export function AgreementForm({ trade, currentUserId }: { trade: Trade; currentUserId: string }) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  const isUserA = currentUserId === trade.userAId;
  const myConfirmed = isUserA ? trade.userAAgreementConfirmed : trade.userBAgreementConfirmed;
  const theirConfirmed = isUserA ? trade.userBAgreementConfirmed : trade.userAAgreementConfirmed;

  const isSender = currentUserId === trade.proposal.senderId;
  const myDeliverables = isSender ? trade.proposal.senderDeliverables : trade.proposal.receiverDeliverables;
  const theirDeliverables = isSender ? trade.proposal.receiverDeliverables : trade.proposal.senderDeliverables;
  const mySkill = isSender ? trade.proposal.senderSkill.name : trade.proposal.receiverSkill.name;
  const theirSkill = isSender ? trade.proposal.receiverSkill.name : trade.proposal.senderSkill.name;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const res = await fetch(`/api/trades/${trade.id}/agreement`, {
        method: "POST"
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConfirming(false);
    }
  };

  if (trade.status !== "Accepted" && trade.status !== "Awaiting Confirmation") {
    // Should render Snapshot instead
    return null; 
  }

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center space-x-2 pb-4 border-b border-neutral-variant">
        <FileText className="text-primary w-6 h-6" />
        <h2 className="text-title-md font-semibold">Proposed Agreement</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-label-sm font-medium text-neutral-variant-on uppercase tracking-wider mb-2">You Provide</h3>
          <Badge className="mb-2">{mySkill}</Badge>
          <p className="text-body-sm bg-neutral p-4 rounded-md">{myDeliverables}</p>
        </div>

        <div>
          <h3 className="text-label-sm font-medium text-neutral-variant-on uppercase tracking-wider mb-2">They Provide</h3>
          <Badge className="mb-2" variant="outline">{theirSkill}</Badge>
          <p className="text-body-sm bg-neutral p-4 rounded-md">{theirDeliverables}</p>
        </div>

        <div className="bg-primary-container/20 p-4 rounded-md flex items-center justify-between">
          <span className="text-label-sm font-medium">Timeline</span>
          <span className="text-body-sm font-semibold">{trade.proposal.timelineDays} days after both confirm</span>
        </div>
      </div>

      <div className="pt-4 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
        <div className="text-sm text-neutral-variant-on">
          {myConfirmed && !theirConfirmed && "Waiting for the other party to confirm..."}
          {!myConfirmed && theirConfirmed && "The other party has already confirmed!"}
        </div>
        
        <Button 
          className="bg-tertiary text-tertiary-on hover:bg-tertiary/90" 
          onClick={handleConfirm}
          disabled={myConfirmed || isConfirming}
        >
          {myConfirmed ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmed
            </>
          ) : isConfirming ? "Confirming..." : "Confirm Agreement"}
        </Button>
      </div>
    </Card>
  );
}
