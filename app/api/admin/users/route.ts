import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateUserSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(["suspend", "unsuspend"])
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          trustScore: true,
          reputationLevel: true,
          isSuspended: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      db.user.count({ where })
    ]);

    // Prisma returns Decimal for trustScore, we must serialize to number for JSON
    const serializedUsers = users.map(u => ({
      ...u,
      trustScore: Number(u.trustScore)
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: serializedUsers,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    const { userId, action } = result.data;

    // Don't let admins suspend themselves
    if (userId === session.user.id) {
      return NextResponse.json({ success: false, error: "Cannot suspend your own account" }, { status: 403 });
    }

    const isSuspended = action === "suspend";

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isSuspended },
      select: {
        id: true,
        name: true,
        isSuspended: true
      }
    });

    // If suspending, we should ideally cancel all active proposals/trades.
    // For MVP, we will just update the user status, which blocks them from logging in.

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
