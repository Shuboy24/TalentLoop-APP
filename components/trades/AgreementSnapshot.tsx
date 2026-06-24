"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Calendar } from "lucide-react";

type SnapshotData = {
  timelineDays: number;
  senderDeliverables: string;
  receiverDeliverables: string;
  senderSkill: string;
  receiverSkill: string;
  userAId: string;
  userBId: string;
  userAName: string;
  userBName: string;
  confirmedAt: string;
};

export function AgreementSnapshot({ snapshot, currentUserId }: { snapshot: any; currentUserId: string }) {
  if (!snapshot) return null;
  
  const data = snapshot as SnapshotData;
  const isUserA = currentUserId === data.userAId;
  
  const myDeliverables = isUserA ? data.senderDeliverables : data.receiverDeliverables;
  const theirDeliverables = isUserA ? data.receiverDeliverables : data.senderDeliverables;
  const mySkill = isUserA ? data.senderSkill : data.receiverSkill;
  const theirSkill = isUserA ? data.receiverSkill : data.senderSkill;
  const otherName = isUserA ? data.userBName : data.userAName;

  return (
    <Card className="p-6 space-y-6 border-success/30 bg-success-container/10">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-variant">
        <div className="flex items-center space-x-2 text-success">
          <Lock className="w-5 h-5" />
          <h2 className="text-title-sm font-semibold">Active Agreement</h2>
        </div>
        <div className="text-label-sm text-neutral-variant-on flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(data.confirmedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-label-sm font-medium text-neutral-variant-on uppercase tracking-wider mb-2">You provide</h3>
          <Badge className="mb-2 bg-secondary-container text-secondary hover:bg-secondary-container">{mySkill}</Badge>
          <div className="text-body-sm text-neutral-on bg-white/50 p-3 rounded border border-neutral-variant/50">
            {myDeliverables}
          </div>
        </div>

        <div>
          <h3 className="text-label-sm font-medium text-neutral-variant-on uppercase tracking-wider mb-2">{otherName} provides</h3>
          <Badge className="mb-2 bg-primary-container text-primary hover:bg-primary-container">{theirSkill}</Badge>
          <div className="text-body-sm text-neutral-on bg-white/50 p-3 rounded border border-neutral-variant/50">
            {theirDeliverables}
          </div>
        </div>
      </div>

      <div className="bg-white/60 p-3 rounded text-center text-label-sm font-medium text-neutral-on border border-neutral-variant">
        Deadline: {data.timelineDays} days from confirmation
      </div>
    </Card>
  );
}
