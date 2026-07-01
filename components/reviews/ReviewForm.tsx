"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createReviewSchema, CreateReviewFormValues } from "@/lib/validations/review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { MAX_REVIEW_TEXT_LENGTH } from "@/lib/constants";
import { useRouter } from "next/navigation";

type ReviewFormProps = {
  tradeId: string;
  onSuccess?: () => void;
};

export function ReviewForm({ tradeId, onSuccess }: ReviewFormProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<CreateReviewFormValues>({
    resolver: zodResolver(createReviewSchema) as any,
    defaultValues: {
      rating: 0,
      reviewText: "",
    },
  });

  const onSubmit = async (data: CreateReviewFormValues) => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, tradeId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit review");
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

  const watchReviewText = form.watch("reviewText") || "";
  const currentRating = form.watch("rating");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 bg-error-container text-error-on-container rounded-md text-label-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label>Rating</Label>
        <StarRating
          rating={currentRating}
          interactive={true}
          size="lg"
          onRatingChange={(rating) => {
            form.setValue("rating", rating);
            form.trigger("rating");
          }}
        />
        {form.formState.errors.rating && (
          <p className="text-error text-label-sm">{form.formState.errors.rating.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="reviewText">Review Comments (Optional)</Label>
          <span className={`text-label-sm ${watchReviewText.length > MAX_REVIEW_TEXT_LENGTH ? "text-error" : "text-neutral-variant-on"}`}>
            {watchReviewText.length} / {MAX_REVIEW_TEXT_LENGTH}
          </span>
        </div>
        <Textarea
          id="reviewText"
          {...form.register("reviewText")}
          placeholder="Share your experience working with this person..."
          className="resize-none h-32"
        />
        {form.formState.errors.reviewText && (
          <p className="text-error text-label-sm">{form.formState.errors.reviewText.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || currentRating === 0}
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
