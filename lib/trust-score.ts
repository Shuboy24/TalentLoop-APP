import { db } from "./db";

/**
 * Calculates and updates the trust score for a user.
 * @param userId - The ID of the user
 * @returns The new trust score (0-100)
 */
export async function recalculateTrustScore(userId: string): Promise<number> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      userSkills: true,
      tradesAsUserA: { where: { status: "Completed" } },
      tradesAsUserB: { where: { status: "Completed" } },
      reviewsReceived: { where: { isPublished: true } },
    }
  });

  if (!user) return 0;

  // Profile completeness (Max 100)
  let profileCompleteness = 0;
  if (user.name) profileCompleteness += 10;
  if (user.avatarUrl) profileCompleteness += 15;
  if (user.bio) profileCompleteness += 15;
  if (user.location) profileCompleteness += 10;
  if (user.availability) profileCompleteness += 10;
  if (user.portfolioUrl1 || user.portfolioUrl2 || user.portfolioUrl3) profileCompleteness += 10;
  
  const hasOfferedSkill = user.userSkills.some(sk => sk.type === "OFFERED");
  const hasNeededSkill = user.userSkills.some(sk => sk.type === "NEEDED");
  if (hasOfferedSkill) profileCompleteness += 15;
  if (hasNeededSkill) profileCompleteness += 15;

  const profileScore = profileCompleteness / 100;

  // Completed trades (Max 20)
  const completedTradesCount = user.tradesAsUserA.length + user.tradesAsUserB.length;
  const completedScore = Math.min(completedTradesCount / 20, 1.0);

  // Average Rating (0-5)
  let averageRating = 0;
  if (user.reviewsReceived.length > 0) {
    const totalRating = user.reviewsReceived.reduce((acc, review) => acc + review.rating, 0);
    averageRating = totalRating / user.reviewsReceived.length;
  }
  
  // If user has no reviews, assume 5 to avoid penalizing new users
  const effectiveRating = user.reviewsReceived.length > 0 ? averageRating : 5;
  const ratingScore = effectiveRating / 5;

  // Trust score formula
  // trustScore = (completedScore * 0.50) + (ratingScore * 0.30) + (profileScore * 0.20)
  const trustScore = (completedScore * 0.50) + (ratingScore * 0.30) + (profileScore * 0.20);
  const trustScorePercentage = trustScore * 100;
  const finalTrustScore = Math.round(trustScorePercentage * 100) / 100; // 2 decimal places

  // Reputation Level
  let reputationLevel = "Beginner";
  if (finalTrustScore >= 80) reputationLevel = "Expert";
  else if (finalTrustScore >= 60) reputationLevel = "Gold";
  else if (finalTrustScore >= 40) reputationLevel = "Silver";
  else if (finalTrustScore >= 20) reputationLevel = "Bronze";

  // Update in DB
  await db.user.update({
    where: { id: userId },
    data: {
      trustScore: finalTrustScore,
      reputationLevel
    }
  });

  return finalTrustScore;
}
