import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { notFound } from "next/navigation";

export default function OnboardingStepPage({ params }: { params: { step: string } }) {
  const step = parseInt(params.step, 10);
  
  if (isNaN(step) || step < 1 || step > 5) {
    notFound();
  }

  return <OnboardingWizard step={step} />;
}
