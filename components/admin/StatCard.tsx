import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
};

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label-sm font-medium text-neutral-variant-on mb-1">{title}</p>
          <h3 className="text-display-sm font-bold text-neutral-on">{value}</h3>
          
          {trend && (
            <div className="mt-2 flex items-center text-label-sm">
              <span className={cn(
                "font-medium", 
                trend.positive ? "text-success" : "text-error"
              )}>
                {trend.positive ? "+" : ""}{trend.value}%
              </span>
              <span className="ml-1 text-neutral-variant-on">{trend.label}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary-container/30 rounded-lg text-primary">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
