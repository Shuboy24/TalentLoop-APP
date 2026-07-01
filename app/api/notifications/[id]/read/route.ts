import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const notification = await db.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const updated = await db.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error marking notification read:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
