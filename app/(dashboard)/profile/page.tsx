import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { MapPin, Star, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MyProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      userSkills: {
        include: { skill: true }
      }
    }
  });

  if (!user) return null;

  const offeredSkills = user.userSkills.filter(s => s.type === "OFFERED");
  const neededSkills = user.userSkills.filter(s => s.type === "NEEDED");

  return (
    <div className="space-y-6">
      <div className="bg-card border border-neutral-variant rounded-xl p-8 shadow-tl-sm relative">
        <Link href="/settings" className="absolute top-6 right-6">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          <div className="w-32 h-32 rounded-full bg-neutral overflow-hidden shrink-0 mb-4 md:mb-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-variant-on text-display-md font-medium">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-headline-md font-bold text-neutral-on">{user.name}</h1>
            <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-4 mt-2 text-neutral-variant-on">
              <div className="flex items-center text-body-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {user.location || "Location not specified"}
              </div>
              <div className="flex items-center text-tertiary font-medium text-body-sm mt-1 md:mt-0">
                <Star className="w-4 h-4 mr-1 fill-current" />
                {user.trustScore?.toString()} Trust Score
              </div>
            </div>
            
            <p className="mt-4 text-body-md text-neutral-on max-w-2xl">
              {user.bio || "No bio provided."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-neutral-variant rounded-xl p-6 shadow-tl-sm">
          <h2 className="text-title-lg font-bold text-neutral-on mb-4">Skills I Offer</h2>
          <div className="flex flex-wrap gap-2">
            {offeredSkills.map(s => (
              <span key={s.skillId} className="bg-primary-container text-primary px-3 py-1 rounded-full text-label-md font-medium">
                {s.skill.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card border border-neutral-variant rounded-xl p-6 shadow-tl-sm">
          <h2 className="text-title-lg font-bold text-neutral-on mb-4">Skills I Need</h2>
          {neededSkills.length === 0 ? (
            <p className="text-body-sm text-neutral-variant-on">No skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {neededSkills.map((us) => (
                <span key={us.skillId} className="bg-secondary-container text-secondary px-3 py-1 rounded-full text-label-md font-medium">
                  {us.skill.name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:col-span-2 bg-card border border-neutral-variant rounded-xl p-6 shadow-tl-sm">
          <h2 className="text-title-lg font-bold text-neutral-on mb-4">Availability</h2>
          <p className="text-body-md text-neutral-on">
            {user.availability || "Not specified"}
          </p>
        </div>
      </div>
    </div>
  );
}
