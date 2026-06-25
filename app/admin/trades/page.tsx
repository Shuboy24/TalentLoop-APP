import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminTradesPage({ searchParams }: { searchParams: Promise<{ status?: string, page?: string }> }) {
  const session = await auth();

  if (!session?.user?.id || !session.user.isAdmin) {
    redirect("/dashboard");
  }

  const { status, page } = await searchParams;
  const currentPage = parseInt(page || "1");
  const limit = 20;
  const skip = (currentPage - 1) * limit;

  const where = status && status !== "All" ? { status } : {};

  const [trades, total] = await Promise.all([
    db.trade.findMany({
      where,
      include: {
        userA: { select: { name: true, avatarUrl: true } },
        userB: { select: { name: true, avatarUrl: true } },
        proposal: {
          include: {
            senderSkill: { select: { name: true } },
            receiverSkill: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    db.trade.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);
  const statuses = ["All", "Accepted", "In Progress", "Awaiting Confirmation", "Completed", "Disputed", "Cancelled"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-sm font-bold text-neutral-on">Trades</h1>
          <p className="text-body-md text-neutral-variant-on">Monitor all platform trades.</p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2">
        {statuses.map(s => (
          <Link key={s} href={`/admin/trades${s !== "All" ? `?status=${s}` : ""}`}>
            <Badge variant={status === s || (!status && s === "All") ? "default" : "outline"} className="cursor-pointer">
              {s}
            </Badge>
          </Link>
        ))}
      </div>

      {trades.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-lg border border-neutral-variant text-neutral-variant-on">
          No trades found.
        </div>
      ) : (
        <div className="grid gap-4">
          {trades.map(trade => {
            const isUserASender = trade.userAId === trade.proposal.senderId;
            const userASkill = isUserASender ? trade.proposal.senderSkill.name : trade.proposal.receiverSkill.name;
            const userBSkill = isUserASender ? trade.proposal.receiverSkill.name : trade.proposal.senderSkill.name;

            return (
              <Card key={trade.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-6 w-full md:w-auto">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={trade.userA.avatarUrl || ""} />
                      <AvatarFallback>{trade.userA.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-body-sm">
                      <p className="font-medium">{trade.userA.name}</p>
                      <p className="text-label-sm text-neutral-variant-on">{userASkill}</p>
                    </div>
                  </div>

                  <div className="text-neutral-variant text-body-sm font-bold">⇄</div>

                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={trade.userB.avatarUrl || ""} />
                      <AvatarFallback>{trade.userB.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-body-sm">
                      <p className="font-medium">{trade.userB.name}</p>
                      <p className="text-label-sm text-neutral-variant-on">{userBSkill}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                  <Badge variant="outline">{trade.status}</Badge>
                  <Link href={`/trades/${trade.id}`}>
                    <Button variant="outline" size="sm">View Trade</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          {currentPage > 1 && (
            <Link href={`/admin/trades?page=${currentPage - 1}${status ? `&status=${status}` : ''}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          <span className="text-label-sm text-neutral-variant-on">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={`/admin/trades?page=${currentPage + 1}${status ? `&status=${status}` : ''}`}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
