import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SettingsForm } from "./SettingsForm";
import { SkillsForm } from "./SkillsForm";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      userSkills: {
        include: { skill: true }
      }
    }
  });

  const allSkills = await db.skill.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  if (!user) {
    redirect("/login");
  }

  const userProps = {
    id: user.id,
    name: user.name,
    bio: user.bio,
    location: user.location,
    availability: user.availability,
    portfolioUrl1: user.portfolioUrl1,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-display-sm font-bold mb-2">Account Settings</h1>
        <p className="text-body-md text-neutral-variant-on">Manage your profile details and preferences.</p>
      </div>

      <SettingsForm user={userProps} />
      <SkillsForm userSkills={user.userSkills as any} allSkills={allSkills as any} />
    </div>
  );
}
