import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { StarRating } from "./StarRating";
import Link from "next/link";

type ReviewCardProps = {
  review: {
    id: string;
    rating: number;
    reviewText: string | null;
    createdAt: Date;
    reviewer: {
      id: string;
      name: string;
      avatarUrl: string | null;
      trustScore: any;
    };
  };
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <Link href={`/profile/${review.reviewer.id}`}>
          <Avatar className="w-10 h-10 border border-neutral-variant">
            <AvatarImage src={review.reviewer.avatarUrl || undefined} />
            <AvatarFallback>{review.reviewer.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <Link href={`/profile/${review.reviewer.id}`} className="font-medium text-body-md hover:underline">
                {review.reviewer.name}
              </Link>
                {new Date(review.createdAt).toLocaleDateString()}
            </div>
            <StarRating rating={review.rating} size="sm" />
          </div>
          {review.reviewText && (
            <p className="text-body-sm text-neutral-on break-words whitespace-pre-wrap">
              {review.reviewText}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
