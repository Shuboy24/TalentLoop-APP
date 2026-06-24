"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "./OnboardingProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Skill = { id: string; name: string; category: string };

export default function OnboardingWizard({ step }: { step: number }) {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(step === 2 || step === 3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for forms
  const [bio, setBio] = useState(data.bio || "");
  const [location, setLocation] = useState(data.location || "");
  const [availability, setAvailability] = useState(data.availability || "");

  useEffect(() => {
    if (step === 2 || step === 3) {
      fetch("/api/skills")
        .then(res => res.json())
        .then(json => {
          if (json.success) setSkills(json.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [step]);

  const handleNext = async () => {
    setError(null);
    if (step === 1) {
      if (bio.length < 10) { setError("Bio must be at least 10 characters."); return; }
      if (location.length < 2) { setError("Location must be at least 2 characters."); return; }
      updateData({ bio, location });
      router.push("/step/2");
    } else if (step === 2) {
      if ((data.offeredSkills?.length || 0) === 0) { setError("Select at least one skill to offer."); return; }
      router.push("/step/3");
    } else if (step === 3) {
      if ((data.neededSkills?.length || 0) === 0) { setError("Select at least one skill you need."); return; }
      router.push("/step/4");
    } else if (step === 4) {
      if (availability.length < 2) { setError("Availability is required."); return; }
      updateData({ availability });
      router.push("/step/5");
    } else if (step === 5) {
      // Submit
      setSubmitting(true);
      try {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          router.push("/");
          router.refresh();
        } else {
          setError(json.error || "Failed to complete onboarding");
        }
      } catch (e) {
        setError("An unexpected error occurred");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      router.push(`/step/${step - 1}`);
    }
  };

  const toggleSkill = (skillId: string, type: "offered" | "needed") => {
    const key = type === "offered" ? "offeredSkills" : "neededSkills";
    const current = data[key] || [];
    if (current.includes(skillId)) {
      updateData({ [key]: current.filter(id => id !== skillId) });
    } else {
      if (current.length >= 5) {
        setError(`You can only select up to 5 ${type} skills.`);
        return;
      }
      updateData({ [key]: [...current, skillId] });
      setError(null);
    }
  };

  return (
    <div className="bg-card border border-neutral-variant rounded-xl shadow-tl-sm p-6 sm:p-8 flex flex-col flex-1 max-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-title-lg font-bold">
          {step === 1 && "Basic Info"}
          {step === 2 && "What can you offer?"}
          {step === 3 && "What do you need?"}
          {step === 4 && "Availability"}
          {step === 5 && "Review & Complete"}
        </h1>
        <div className="text-sm font-medium text-neutral-variant-on">
          Step {step} of 5
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-neutral-variant rounded-full h-2 mb-8">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="flex-1 overflow-y-auto mb-8 pr-2">
        {error && (
          <div className="mb-4 p-3 text-sm text-error bg-error-container rounded-md">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Input
                id="bio"
                placeholder="I am a software engineer with 5 years of experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs text-neutral-variant-on text-right">{bio.length}/300</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="London, UK (or Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        )}

        {(step === 2 || step === 3) && (
          <div className="space-y-4">
            <p className="text-body-sm text-neutral-variant-on">
              Select up to 5 skills.
            </p>
            {loading ? (
              <p className="text-sm">Loading skills...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => {
                  const isSelected = step === 2 
                    ? data.offeredSkills?.includes(skill.id) 
                    : data.neededSkills?.includes(skill.id);
                  
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id, step === 2 ? "offered" : "needed")}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        isSelected 
                        ? "bg-primary-container text-primary border-primary" 
                        : "bg-neutral border-neutral-variant text-neutral-on hover:border-primary"
                      }`}
                    >
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="availability">When are you available to trade?</Label>
              <Input
                id="availability"
                placeholder="Evenings and weekends (approx. 5 hours/week)"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-neutral-on mb-1">Basic Info</h3>
              <p className="text-sm text-neutral-variant-on"><strong>Location:</strong> {data.location}</p>
              <p className="text-sm text-neutral-variant-on mt-1"><strong>Bio:</strong> {data.bio}</p>
            </div>
            <div>
              <h3 className="font-bold text-neutral-on mb-1">Offered Skills</h3>
              <p className="text-sm text-neutral-variant-on">
                {data.offeredSkills?.length} skill(s) selected
              </p>
            </div>
            <div>
              <h3 className="font-bold text-neutral-on mb-1">Needed Skills</h3>
              <p className="text-sm text-neutral-variant-on">
                {data.neededSkills?.length} skill(s) selected
              </p>
            </div>
            <div>
              <h3 className="font-bold text-neutral-on mb-1">Availability</h3>
              <p className="text-sm text-neutral-variant-on">{data.availability}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-neutral-variant mt-auto">
        {step > 1 ? (
          <Button variant="outline" onClick={handleBack} disabled={submitting}>
            Back
          </Button>
        ) : (
          <div></div>
        )}
        <Button onClick={handleNext} disabled={submitting}>
          {step === 5 ? (submitting ? "Completing..." : "Complete Setup") : "Next Step"}
        </Button>
      </div>
    </div>
  );
}
