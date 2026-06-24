import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

type DisputeCardProps = {
  dispute: {
    id: string;
    reason: string;
    reasonDetail: string | null;
    status: string;
    resolution: string | null;
    createdAt: Date;
    resolvedAt: Date | null;
  };
};

export function DisputeCard({ dispute }: DisputeCardProps) {
  const isResolved = dispute.status === "Resolved";

  return (
    <Card className="p-4 sm:p-6 border-error-container bg-error-container/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2 text-error">
          {isResolved ? <CheckCircle className="w-5 h-5 text-success" /> : <AlertCircle className="w-5 h-5" />}
          <h3 className="font-bold text-title-sm">Dispute: {dispute.reason}</h3>
        </div>
        <Badge variant={isResolved ? "default" : "destructive"}>
          {dispute.status}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-label-sm text-neutral-variant-on mb-1">Details</p>
          <p className="text-body-sm text-neutral-on break-words whitespace-pre-wrap">
            {dispute.reasonDetail || "No details provided."}
          </p>
        </div>

        {isResolved && dispute.resolution && (
          <div className="bg-success-container/10 border border-success-container p-3 rounded-md">
            <p className="text-label-sm text-neutral-variant-on mb-1">Resolution</p>
            <p className="text-body-sm text-success-on-container font-medium">
              {dispute.resolution}
            </p>
          </div>
        )}

        <div className="text-label-sm text-neutral-variant-on">
          Opened {formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })}
          {isResolved && dispute.resolvedAt && (
            <> • Resolved {formatDistanceToNow(new Date(dispute.resolvedAt), { addSuffix: true })}</>
          )}
        </div>
      </div>
    </Card>
  );
}
