"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { OnboardingData } from "@/lib/validations/onboarding";

type OnboardingContextType = {
  data: Partial<OnboardingData>;
  updateData: (newData: Partial<OnboardingData>) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Partial<OnboardingData>>({
    bio: "",
    location: "",
    offeredSkills: [],
    neededSkills: [],
    availability: "",
  });

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within a OnboardingProvider");
  }
  return context;
}
