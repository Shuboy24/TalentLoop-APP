import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { notFound } from "next/navigation";

export default async function OnboardingStepPage({ params }: { params: Promise<{ step: string }> }) {
  const resolvedParams = await params;
  const step = parseInt(resolvedParams.step, 10);
  
  if (isNaN(step) || step < 1 || step > 5) {
    notFound();
  }

  return <OnboardingWizard step={step} />;
}
