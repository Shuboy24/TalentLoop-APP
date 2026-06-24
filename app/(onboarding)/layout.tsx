import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { ReactNode } from "react";
import Link from "next/link";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.onboardingComplete) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-main">
      <header className="h-16 flex items-center justify-center border-b border-neutral-variant bg-card">
        <div className="text-primary font-heading font-bold text-title-lg">
          TalentLoop
        </div>
      </header>
      <main className="flex-1 flex flex-col p-4 sm:p-8">
        <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col">
          <OnboardingProvider>
            {children}
          </OnboardingProvider>
        </div>
      </main>
    </div>
  );
}
