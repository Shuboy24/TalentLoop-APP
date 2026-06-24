"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

type Skill = {
  id: string;
  name: string;
  category: string;
};

type UserSkill = {
  id: string;
  skillId: string;
  type: string;
  skill: Skill;
};

export function SkillsForm({ 
  userSkills, 
  allSkills 
}: { 
  userSkills: UserSkill[]; 
  allSkills: Skill[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedType, setSelectedType] = useState("OFFERED");
  const [error, setError] = useState<string | null>(null);

  const offeredSkills = userSkills.filter(s => s.type === "OFFERED");
  const neededSkills = userSkills.filter(s => s.type === "NEEDED");

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/users/me/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId: selectedSkillId, type: selectedType })
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to add skill");
      } else {
        setSelectedSkillId("");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSkill = async (userSkillId: string) => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/users/me/skills?id=${userSkillId}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 bg-white p-6 rounded-xl border border-neutral-variant shadow-sm mt-6 max-w-xl">
      <div>
        <h2 className="text-title-lg font-bold text-neutral-on mb-4">My Skills</h2>
        {error && <div className="p-3 bg-error-container text-error rounded-md text-sm mb-4">{error}</div>}

        <div className="space-y-6">
          {/* Add Skill Form */}
          <form onSubmit={handleAddSkill} className="flex gap-3 items-end bg-neutral p-4 rounded-lg border border-neutral-variant">
            <div className="flex-1 space-y-2">
              <label className="text-label-sm font-medium">Skill</label>
              <select 
                value={selectedSkillId}
                onChange={e => setSelectedSkillId(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-neutral-variant rounded-md text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Select a skill...</option>
                {allSkills.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>
            <div className="w-32 space-y-2">
              <label className="text-label-sm font-medium">Type</label>
              <select 
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-neutral-variant rounded-md text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="OFFERED">I Offer</option>
                <option value="NEEDED">I Need</option>
              </select>
            </div>
            <Button type="submit" disabled={isSubmitting || !selectedSkillId}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </form>

          {/* Offered Skills */}
          <div>
            <h3 className="text-label-lg font-semibold text-neutral-on mb-2">Skills I Offer</h3>
            {offeredSkills.length === 0 ? (
              <p className="text-body-sm text-neutral-variant-on">None added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {offeredSkills.map(us => (
                  <div key={us.id} className="flex items-center bg-primary-container text-primary px-3 py-1 rounded-full text-label-md font-medium">
                    {us.skill.name}
                    <button 
                      onClick={() => handleRemoveSkill(us.id)}
                      disabled={isSubmitting}
                      className="ml-2 text-primary hover:text-error transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Needed Skills */}
          <div>
            <h3 className="text-label-lg font-semibold text-neutral-on mb-2">Skills I Need</h3>
            {neededSkills.length === 0 ? (
              <p className="text-body-sm text-neutral-variant-on">None added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {neededSkills.map(us => (
                  <div key={us.id} className="flex items-center bg-secondary-container text-secondary px-3 py-1 rounded-full text-label-md font-medium">
                    {us.skill.name}
                    <button 
                      onClick={() => handleRemoveSkill(us.id)}
                      disabled={isSubmitting}
                      className="ml-2 text-secondary hover:text-error transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
