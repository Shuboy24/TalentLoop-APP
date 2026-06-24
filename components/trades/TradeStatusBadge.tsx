import { Badge } from "@/components/ui/badge";

export const TradeStatus = {
  Proposed: "Proposed",
  Accepted: "Accepted",
  InProgress: "In Progress",
  AwaitingConfirmation: "Awaiting Confirmation",
  Completed: "Completed",
  Disputed: "Disputed",
  Cancelled: "Cancelled",
} as const;

export type TradeStatusType = (typeof TradeStatus)[keyof typeof TradeStatus];

export function TradeStatusBadge({ status }: { status: TradeStatusType | string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let className = "";

  switch (status) {
    case "Proposed":
      variant = "outline";
      className = "text-primary border-primary bg-primary-container/20";
      break;
    case "Accepted":
      variant = "secondary";
      className = "bg-primary-container text-primary";
      break;
    case "In Progress":
      className = "bg-tertiary text-tertiary-on hover:bg-tertiary/90";
      break;
    case "Awaiting Confirmation":
      className = "bg-warning-container text-warning-on hover:bg-warning-container/90";
      break;
    case "Completed":
      className = "bg-success text-success-on hover:bg-success/90";
      break;
    case "Disputed":
      variant = "destructive";
      className = "bg-error text-error-on hover:bg-error/90";
      break;
    case "Cancelled":
    case "Declined":
      variant = "secondary";
      className = "bg-neutral text-neutral-variant-on border border-neutral-variant";
      break;
    default:
      variant = "default";
  }

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}
