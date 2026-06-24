"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

type UserProps = {
  id: string;
  name: string;
  bio: string | null;
  location: string | null;
  availability: string | null;
  portfolioUrl1: string | null;
};

export function SettingsForm({ user }: { user: UserProps }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    availability: user.availability || "",
    portfolioUrl1: user.portfolioUrl1 || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to update profile");
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl bg-white p-6 rounded-xl border border-neutral-variant shadow-sm">
      {error && <div className="p-3 bg-error-container text-error rounded-md text-sm">{error}</div>}
      {success && <div className="p-3 bg-success-container text-success rounded-md text-sm">Profile updated successfully!</div>}

      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea 
          id="bio" 
          name="bio" 
          value={formData.bio} 
          onChange={handleChange} 
          placeholder="Tell others about yourself..."
          className="resize-none"
        />
        <div className="text-right text-xs text-neutral-variant-on">{formData.bio.length}/300</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. London, UK (Remote)" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Availability</Label>
        <Input id="availability" name="availability" value={formData.availability} onChange={handleChange} placeholder="e.g. Weekends, 10 hours/week" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolioUrl1">Portfolio URL</Label>
        <Input id="portfolioUrl1" name="portfolioUrl1" type="url" value={formData.portfolioUrl1} onChange={handleChange} placeholder="https://..." />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
