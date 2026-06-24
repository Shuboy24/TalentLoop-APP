import { db } from "./db";

export type MatchResult = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  trustScore: number;
  score: number; // 0-100
  offeredSkills: { id: string; name: string }[];
  neededSkills: { id: string; name: string }[];
};

export async function getMatches(currentUserId: string): Promise<MatchResult[]> {
  // 1. Fetch current user with their skills
  const currentUser = await db.user.findUnique({
    where: { id: currentUserId },
    include: {
      userSkills: {
        include: { skill: true }
      }
    }
  });

  if (!currentUser || !currentUser.onboardingComplete) {
    return [];
  }

  const currentUserOfferedIds = currentUser.userSkills.filter(s => s.type === "OFFERED").map(s => s.skillId);
  const currentUserNeededIds = currentUser.userSkills.filter(s => s.type === "NEEDED").map(s => s.skillId);

  // 2. Fetch all eligible users
  // Exclude: suspended, incomplete profiles, current user
  // Also need to exclude users with active trades or pending proposals with current user.
  // We'll fetch those exclusion IDs first.

  const activeTrades = await db.trade.findMany({
    where: {
      OR: [{ userAId: currentUserId }, { userBId: currentUserId }],
      status: { in: ["PROPOSED", "ACCEPTED", "IN_PROGRESS", "AWAITING_CONFIRMATION", "DISPUTED"] }
    }
  });

  const excludedUserIds = new Set<string>();
  excludedUserIds.add(currentUserId);
  activeTrades.forEach(trade => {
    excludedUserIds.add(trade.userAId);
    excludedUserIds.add(trade.userBId);
  });

  const eligibleUsers = await db.user.findMany({
    where: {
      isSuspended: false,
      onboardingComplete: true,
      id: { notIn: Array.from(excludedUserIds) }
    },
    include: {
      userSkills: {
        include: { skill: true }
      }
    }
  });

  const matches: MatchResult[] = [];

  for (const user of eligibleUsers) {
    const userOfferedIds = user.userSkills.filter(s => s.type === "OFFERED").map(s => s.skillId);
    const userNeededIds = user.userSkills.filter(s => s.type === "NEEDED").map(s => s.skillId);

    // Calculate Skill Compatibility (how much of what they offer matches what I need)
    const matchingNeededSkills = currentUserNeededIds.filter(id => userOfferedIds.includes(id));
    const skillCompatibility = currentUserNeededIds.length > 0 
      ? matchingNeededSkills.length / currentUserNeededIds.length 
      : 0;

    // Calculate Mutual Need (how much of what I offer matches what they need)
    const matchingOfferedSkills = currentUserOfferedIds.filter(id => userNeededIds.includes(id));
    const mutualNeed = userNeededIds.length > 0 
      ? matchingOfferedSkills.length / userNeededIds.length 
      : 0;

    // Reputation (trust score is 0-100, we normalize to 0-1)
    const reputation = user.trustScore / 100;

    // Availability (simplified for MVP: 1 if both provided availability, else 0.5)
    const availability = (currentUser.availability && user.availability) ? 1.0 : 0.5;

    // Formula: score = (skillCompatibility × 0.40) + (mutualNeed × 0.30) + (reputation × 0.20) + (availability × 0.10)
    const rawScore = (skillCompatibility * 0.40) + (mutualNeed * 0.30) + (reputation * 0.20) + (availability * 0.10);
    
    // Skip if 0 skill overlap (they don't offer anything I need and I don't offer anything they need)
    if (skillCompatibility === 0 && mutualNeed === 0) {
      continue;
    }

    matches.push({
      userId: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      location: user.location,
      trustScore: user.trustScore,
      score: Math.round(rawScore * 100),
      offeredSkills: user.skills.filter(s => s.type === "OFFERED").map(s => ({ id: s.skillId, name: s.skill.name })),
      neededSkills: user.skills.filter(s => s.type === "NEEDED").map(s => ({ id: s.skillId, name: s.skill.name })),
    });
  }

  // Sort by score descending and limit to 20
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 20);
}
