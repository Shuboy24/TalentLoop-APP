"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDisputeSchema, disputeReasonEnum } from "@/lib/validations/dispute";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAX_DISPUTE_DETAIL_LENGTH } from "@/lib/constants";
import { useRouter } from "next/navigation";

type DisputeFormProps = {
  tradeId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function DisputeForm({ tradeId, onSuccess, onCancel }: DisputeFormProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof createDisputeSchema>>({
    resolver: zodResolver(createDisputeSchema) as any,
    defaultValues: {
      tradeId,
      reasonDetail: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof createDisputeSchema>) => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to raise dispute");
      }

      form.reset();
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchDetail = form.watch("reasonDetail") || "";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-error-container/20 border border-error p-4 rounded-lg">
        <h4 className="text-error font-bold text-title-sm mb-2">Warning</h4>
        <p className="text-body-sm text-neutral-on">
          Raising a dispute freezes the trade. Only use this if you cannot resolve the issue directly with the other party. False disputes may negatively impact your Trust Score.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-error-container text-error-on-container rounded-md text-label-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label>Dispute Reason</Label>
        <Select
          onValueChange={(val) => form.setValue("reason", val as any)}
          defaultValue={form.getValues("reason")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {disputeReasonEnum.options.map((option) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.reason && (
          <p className="text-error text-label-sm">{form.formState.errors.reason.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="reasonDetail">More Details</Label>
          <span className={`text-label-sm ${watchDetail.length > MAX_DISPUTE_DETAIL_LENGTH ? "text-error" : "text-neutral-variant-on"}`}>
            {watchDetail.length} / {MAX_DISPUTE_DETAIL_LENGTH}
          </span>
        </div>
        <Textarea
          id="reasonDetail"
          {...form.register("reasonDetail")}
          placeholder="Explain what went wrong..."
          className="resize-none h-32"
        />
        {form.formState.errors.reasonDetail && (
          <p className="text-error text-label-sm">{form.formState.errors.reasonDetail.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-variant">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-error hover:bg-error/90 text-error-on-error"
        >
          {isSubmitting ? "Submitting..." : "Raise Dispute"}
        </Button>
      </div>
    </form>
  );
}
