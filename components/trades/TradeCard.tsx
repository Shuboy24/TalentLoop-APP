import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock } from "lucide-react";
import { TradeStatusBadge } from "./TradeStatusBadge";
import Link from "next/link";

type TradeCardProps = {
  trade: any;
  currentUserId: string;
};

export function TradeCard({ trade, currentUserId }: TradeCardProps) {
  const isUserA = currentUserId === trade.userAId;
  const otherUser = isUserA ? trade.userB : trade.userA;
  
  // Need to get skills from the agreement snapshot or proposal
  const mySkill = isUserA ? trade.proposal.senderSkill.name : trade.proposal.receiverSkill.name;
  const theirSkill = isUserA ? trade.proposal.receiverSkill.name : trade.proposal.senderSkill.name;

  return (
    <Link href={`/trades/${trade.id}`} className="block">
      <Card className="p-5 hover:shadow-tl-md transition-shadow cursor-pointer space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.avatarUrl || ""} />
              <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-title-sm font-semibold text-neutral-on">{otherUser.name}</h3>
              <p className="text-label-sm text-neutral-variant-on">Trading with you</p>
            </div>
          </div>
          <TradeStatusBadge status={trade.status} />
        </div>

        <div className="flex items-center justify-between bg-neutral p-3 rounded-md text-body-sm">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-neutral-variant-on">You provide:</span>
            <span className="text-primary font-medium">{mySkill}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-neutral-variant-on">They provide:</span>
            <span className="text-secondary font-medium">{theirSkill}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-label-sm text-neutral-variant-on pt-2">
          {trade.deadline && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-neutral-variant-on" />
              <span>Due: {new Date(trade.deadline).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-neutral-variant-on" />
            <span>Updated: {new Date(trade.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
