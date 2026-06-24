import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  { id: "Proposed", label: "Proposed" },
  { id: "Accepted", label: "Agreement" },
  { id: "In Progress", label: "In Progress" },
  { id: "Completed", label: "Completed" },
];

export function TradePipelineStepper({ currentStatus }: { currentStatus: string }) {
  // Determine if it's disputed or cancelled to override styles
  const isDisputed = currentStatus === "Disputed";
  const isCancelled = currentStatus === "Cancelled";

  let currentIndex = 0;
  if (currentStatus === "Accepted") currentIndex = 1;
  if (currentStatus === "In Progress" || currentStatus === "Awaiting Confirmation") currentIndex = 2;
  if (currentStatus === "Completed") currentIndex = 3;
  if (isDisputed || isCancelled) {
    // If disputed, find where it was disrupted. Likely at "In Progress" or "Awaiting Confirmation"
    currentIndex = 2;
  }

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-variant z-0" />
        
        {/* Active connecting line */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500 ease-in-out" 
          style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
        />

        {STAGES.map((stage, index) => {
          const isActive = index === currentIndex && !isDisputed && !isCancelled;
          const isComplete = index < currentIndex || currentStatus === "Completed";
          const isCurrentDisputed = index === currentIndex && isDisputed;

          let circleClass = "bg-white border-2 border-neutral-variant text-neutral-variant-on";
          if (isComplete) circleClass = "bg-success border-2 border-success text-success-on";
          if (isActive) circleClass = "bg-primary border-2 border-primary text-primary-on ring-4 ring-primary-container";
          if (isCurrentDisputed) circleClass = "bg-error border-2 border-error text-error-on ring-4 ring-error-container";
          if (isCancelled && index === currentIndex) circleClass = "bg-neutral border-2 border-neutral-variant text-neutral-variant-on";

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300", circleClass)}>
                {isComplete ? <Check className="w-4 h-4" /> : isCurrentDisputed ? <AlertCircle className="w-4 h-4" /> : index + 1}
              </div>
              <div className={cn(
                "absolute top-10 text-label-sm font-medium whitespace-nowrap text-center transition-colors duration-300",
                isActive ? "text-primary" : isComplete ? "text-success" : isCurrentDisputed ? "text-error" : "text-neutral-variant-on"
              )}>
                {isCurrentDisputed ? "Disputed" : isCancelled && index === currentIndex ? "Cancelled" : stage.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
