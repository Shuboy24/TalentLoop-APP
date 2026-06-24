"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProposalSchema } from "@/lib/validations/proposal";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAX_DELIVERABLES_LENGTH, MAX_OPTIONAL_NOTE_LENGTH } from "@/lib/constants";

type ProposalFormValues = z.infer<typeof createProposalSchema>;

type SkillOption = {
  id: string; // The Skill ID
  name: string;
};

type Props = {
  receiverId: string;
  myOfferedSkills: SkillOption[];
  theirOfferedSkills: SkillOption[];
  onSuccess?: () => void;
};

export function ProposalForm({ receiverId, myOfferedSkills, theirOfferedSkills, onSuccess }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 7);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(createProposalSchema),
    defaultValues: {
      timelineDays: 7,
      acceptanceDeadline: defaultDeadline,
    }
  });

  const senderDeliverablesLength = watch("senderDeliverables", "")?.length || 0;
  const receiverDeliverablesLength = watch("receiverDeliverables", "")?.length || 0;
  const noteLength = watch("optionalNote", "")?.length || 0;

  const onSubmit = async (data: ProposalFormValues) => {
    setError(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to create proposal");
        return;
      }

      router.push("/trades");
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 text-label-sm text-error bg-error-container rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Skill you are offering</Label>
          <Select onValueChange={(val) => setValue("senderSkillId", val)}>
            <SelectTrigger className={errors.senderSkillId ? "border-error" : ""}>
              <SelectValue placeholder="Select one of your skills" />
            </SelectTrigger>
            <SelectContent>
              {myOfferedSkills.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.senderSkillId && <p className="text-label-sm text-error">{errors.senderSkillId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Skill you are requesting</Label>
          <Select onValueChange={(val) => setValue("receiverSkillId", val)}>
            <SelectTrigger className={errors.receiverSkillId ? "border-error" : ""}>
              <SelectValue placeholder="Select one of their skills" />
            </SelectTrigger>
            <SelectContent>
              {theirOfferedSkills.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.receiverSkillId && <p className="text-label-sm text-error">{errors.receiverSkillId.message}</p>}
        </div>

        <div className="space-y-2 relative">
          <Label>Your Deliverables</Label>
          <Textarea 
            {...register("senderDeliverables")} 
            placeholder="What will you provide?"
            className={errors.senderDeliverables ? "border-error" : ""}
          />
          <span className={`text-label-sm absolute bottom-2 right-2 ${senderDeliverablesLength > MAX_DELIVERABLES_LENGTH ? 'text-error' : 'text-neutral-variant-on'}`}>
            {senderDeliverablesLength}/{MAX_DELIVERABLES_LENGTH}
          </span>
          {errors.senderDeliverables && <p className="text-label-sm text-error">{errors.senderDeliverables.message}</p>}
        </div>

        <div className="space-y-2 relative">
          <Label>Their Deliverables</Label>
          <Textarea 
            {...register("receiverDeliverables")} 
            placeholder="What do you expect from them?"
            className={errors.receiverDeliverables ? "border-error" : ""}
          />
          <span className={`text-label-sm absolute bottom-2 right-2 ${receiverDeliverablesLength > MAX_DELIVERABLES_LENGTH ? 'text-error' : 'text-neutral-variant-on'}`}>
            {receiverDeliverablesLength}/{MAX_DELIVERABLES_LENGTH}
          </span>
          {errors.receiverDeliverables && <p className="text-label-sm text-error">{errors.receiverDeliverables.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Timeline (Days)</Label>
            <Input 
              type="number" 
              {...register("timelineDays")}
              className={errors.timelineDays ? "border-error" : ""}
            />
            {errors.timelineDays && <p className="text-label-sm text-error">{errors.timelineDays.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Acceptance Deadline</Label>
            <Input 
              type="date" 
              {...register("acceptanceDeadline")}
              className={errors.acceptanceDeadline ? "border-error" : ""}
            />
            {errors.acceptanceDeadline && <p className="text-label-sm text-error">{errors.acceptanceDeadline.message}</p>}
          </div>
        </div>

        <div className="space-y-2 relative">
          <Label>Optional Note</Label>
          <Textarea 
            {...register("optionalNote")} 
            placeholder="Any additional comments?"
            className={errors.optionalNote ? "border-error" : ""}
          />
          <span className={`text-label-sm absolute bottom-2 right-2 ${noteLength > MAX_OPTIONAL_NOTE_LENGTH ? 'text-error' : 'text-neutral-variant-on'}`}>
            {noteLength}/{MAX_OPTIONAL_NOTE_LENGTH}
          </span>
          {errors.optionalNote && <p className="text-label-sm text-error">{errors.optionalNote.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full bg-tertiary text-tertiary-on hover:bg-tertiary/90" disabled={isSubmitting}>
        {isSubmitting ? "Proposing..." : "Propose Trade"}
      </Button>
    </form>
  );
}
