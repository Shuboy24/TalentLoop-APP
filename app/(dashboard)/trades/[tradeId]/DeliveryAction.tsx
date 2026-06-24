"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeliveryAction({ tradeId }: { tradeId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trades/${tradeId}/delivery`, {
        method: "POST"
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button 
      onClick={handleComplete} 
      disabled={isSubmitting}
      className="bg-primary text-primary-on hover:bg-primary/90 w-full sm:w-auto"
    >
      <CheckCircle2 className="w-4 h-4 mr-2" />
      {isSubmitting ? "Marking as complete..." : "Mark Delivery Complete"}
    </Button>
  );
}
