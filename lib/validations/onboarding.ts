import { z } from "zod";

export const onboardingSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters").max(300, "Bio cannot exceed 300 characters"),
  location: z.string().min(2, "Location must be at least 2 characters").max(100, "Location cannot exceed 100 characters"),
  offeredSkills: z.array(z.string().uuid("Invalid skill ID")).min(1, "Please select at least one skill to offer").max(5, "You can offer up to 5 skills"),
  neededSkills: z.array(z.string().uuid("Invalid skill ID")).min(1, "Please select at least one skill you need").max(5, "You can request up to 5 skills"),
  availability: z.string().min(2, "Availability is required").max(100, "Availability description too long"),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
