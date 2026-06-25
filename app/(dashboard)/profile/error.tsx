"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="bg-error-container text-error p-4 rounded-full">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-title-lg font-semibold">Something went wrong!</h2>
      <p className="text-body-md text-neutral-variant-on">We encountered an unexpected error.</p>
      <Button onClick={() => reset()} className="mt-4">
        Try again
      </Button>
    </div>
  );
}
