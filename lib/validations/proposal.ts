import { z } from "zod";
import { MAX_DELIVERABLES_LENGTH, MAX_OPTIONAL_NOTE_LENGTH } from "../constants";

export const createProposalSchema = z.object({
  senderSkillId: z.string().uuid("Invalid skill ID"),
  receiverSkillId: z.string().uuid("Invalid skill ID"),
  senderDeliverables: z.string().min(10, "Must be at least 10 characters").max(MAX_DELIVERABLES_LENGTH, `Cannot exceed ${MAX_DELIVERABLES_LENGTH} characters`),
  receiverDeliverables: z.string().min(10, "Must be at least 10 characters").max(MAX_DELIVERABLES_LENGTH, `Cannot exceed ${MAX_DELIVERABLES_LENGTH} characters`),
  timelineDays: z.coerce.number().int().min(1, "Timeline must be at least 1 day").max(90, "Timeline cannot exceed 90 days"),
  acceptanceDeadline: z.coerce.date().min(new Date(), "Deadline must be in the future"),
  optionalNote: z.string().max(MAX_OPTIONAL_NOTE_LENGTH, `Cannot exceed ${MAX_OPTIONAL_NOTE_LENGTH} characters`).optional(),
});

export const respondToProposalSchema = z.object({
  action: z.enum(["accept", "decline"]),
  declineReason: z.string().max(300).optional(),
});
