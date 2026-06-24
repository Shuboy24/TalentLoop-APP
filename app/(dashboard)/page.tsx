import { auth } from "@/lib/auth";
import { getMatches } from "@/lib/matching";
import { MatchCard } from "@/components/dashboard/MatchCard";

export default async function MatchFeedPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const matches = await getMatches(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-sm font-bold text-neutral-on">Match Feed</h1>
        <p className="text-body-sm text-neutral-variant-on">
          Find people offering the skills you need and looking for what you offer.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-card border border-neutral-variant rounded-xl p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary-container rounded-full flex items-center justify-center">
            {/* Empty state icon */}
            <span className="text-primary text-2xl">🔍</span>
          </div>
          <h2 className="text-title-lg font-bold text-neutral-on">No matches yet</h2>
          <p className="text-body-sm text-neutral-variant-on max-w-md mx-auto">
            We couldn't find anyone matching your exact needs right now. Try updating your profile or check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => (
            <MatchCard key={match.userId} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
