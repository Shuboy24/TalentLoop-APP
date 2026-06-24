import { z } from "zod";
import { MAX_REVIEW_TEXT_LENGTH } from "../constants";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().max(MAX_REVIEW_TEXT_LENGTH).optional(),
});

export type CreateReviewFormValues = z.infer<typeof createReviewSchema>;
