import { z } from "zod";
import { MAX_DISPUTE_DETAIL_LENGTH } from "../constants";

export const disputeReasonEnum = z.enum([
  "Non-delivery",
  "Poor quality",
  "Unresponsive",
  "Other"
]);

export const createDisputeSchema = z.object({
  tradeId: z.string().uuid(),
  reason: disputeReasonEnum,
  reasonDetail: z.string().max(MAX_DISPUTE_DETAIL_LENGTH).optional(),
  evidenceUrls: z.array(z.string().url()).max(5).default([]),
});

export const resolveDisputeSchema = z.object({
  resolution: z.enum([
    "Complete Trade",
    "Reverse Points",
    "Warn",
    "Suspend",
    "Dismissed"
  ]),
  adminNotes: z.string().min(1),
});

export type CreateDisputeFormValues = z.infer<typeof createDisputeSchema>;
export type ResolveDisputeFormValues = z.infer<typeof resolveDisputeSchema>;
