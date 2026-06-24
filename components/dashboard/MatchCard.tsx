"use client";

import { MatchResult } from "@/lib/matching";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import Link from "next/link";

export function MatchCard({ match }: { match: MatchResult }) {
  return (
    <div className="bg-card border border-neutral-variant rounded-xl p-6 shadow-tl-sm hover:shadow-tl-md transition-shadow flex flex-col">
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-neutral overflow-hidden shrink-0">
          {match.avatarUrl ? (
            <img src={match.avatarUrl} alt={match.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-variant-on text-title-md font-medium">
              {match.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${match.userId}`} className="hover:underline">
            <h3 className="text-title-md font-bold text-neutral-on truncate">{match.name}</h3>
          </Link>
          <div className="flex items-center text-label-sm text-neutral-variant-on mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="truncate">{match.location || "Remote"}</span>
          </div>
          <div className="flex items-center text-label-sm text-tertiary font-medium mt-1">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {match.trustScore?.toString()} Trust Score
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end">
          <div className="text-title-lg font-bold text-primary">{match.score}%</div>
          <div className="text-label-small text-neutral-variant-on uppercase tracking-wider">Match</div>
        </div>
      </div>

      {/* Match Score Bar */}
      <div className="w-full bg-neutral-variant rounded-full h-1.5 mb-6 overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-1000 ease-out"
          style={{ width: `${match.score}%` }}
        />
      </div>

      <div className="flex-1 space-y-4">
        {match.bio && (
          <p className="text-body-sm text-neutral-on line-clamp-2">
            {match.bio}
          </p>
        )}

        <div>
          <h4 className="text-label-sm font-medium text-neutral-variant-on uppercase tracking-wider mb-2">They Offer</h4>
          <div className="flex flex-wrap gap-1.5">
            {match.offeredSkills.map(skill => (
              <span key={skill.id} className="bg-primary-container text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                {skill.name}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-label-sm font-medium text-neutral-variant-on uppercase tracking-wider mb-2">They Need</h4>
          <div className="flex flex-wrap gap-1.5">
            {match.neededSkills.map(skill => (
              <span key={skill.id} className="bg-secondary-container text-secondary px-2 py-0.5 rounded-full text-xs font-medium">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-variant">
        <Link href={`/trades/propose?user=${match.userId}`} className="w-full block">
          <Button className="w-full bg-tertiary text-tertiary-on hover:bg-tertiary/90">
            Propose Trade
          </Button>
        </Link>
      </div>
    </div>
  );
}
