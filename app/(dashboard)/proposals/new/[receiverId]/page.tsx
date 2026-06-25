import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProposalForm } from "@/components/trades/ProposalForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function NewProposalPage({ params }: { params: Promise<{ receiverId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { receiverId } = await params;

  if (session.user.id === receiverId) {
    redirect("/dashboard"); // Can't propose to self
  }

  const [receiver, currentUserSkills, receiverSkills] = await Promise.all([
    db.user.findUnique({
      where: { id: receiverId },
      select: { id: true, name: true, avatarUrl: true }
    }),
    db.userSkill.findMany({
      where: { userId: session.user.id, type: "OFFERED" },
      include: { skill: true }
    }),
    db.userSkill.findMany({
      where: { userId: receiverId, type: "OFFERED" },
      include: { skill: true }
    })
  ]);

  if (!receiver) {
    return <div className="p-8 text-center">User not found</div>;
  }

  const myOfferedSkills = currentUserSkills.map(us => ({ id: us.skill.id, name: us.skill.name }));
  const theirOfferedSkills = receiverSkills.map(us => ({ id: us.skill.id, name: us.skill.name }));

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-display-sm font-bold mb-2">Propose a Trade</h1>
        <p className="text-body-md text-neutral-variant-on">Outline the terms of your skill exchange proposal.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-neutral-variant shadow-sm space-y-6">
        <div className="flex items-center space-x-4 border-b border-neutral-variant pb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={receiver.avatarUrl || ""} />
            <AvatarFallback>{receiver.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-title-md font-semibold">Proposal to {receiver.name}</h2>
            <p className="text-label-sm text-neutral-variant-on">They will have 7 days to respond by default.</p>
          </div>
        </div>

        <ProposalForm 
          receiverId={receiver.id}
          myOfferedSkills={myOfferedSkills}
          theirOfferedSkills={theirOfferedSkills}
        />
      </div>
    </div>
  );
}
