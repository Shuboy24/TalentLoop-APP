import { NextResponse } from "next/response";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { tradeId: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { tradeId } = await params;

    // Fetch published reviews, or own unpublished review to self
    const reviews = await db.review.findMany({
      where: {
        tradeId,
        OR: [
          { isPublished: true },
          { reviewerId: session.user.id }
        ]
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true, trustScore: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
