import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TradeCard } from "@/components/trades/TradeCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalCard } from "@/components/trades/ProposalCard";

export default async function TradesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [trades, proposals] = await Promise.all([
    db.trade.findMany({
      where: {
        OR: [{ userAId: session.user.id }, { userBId: session.user.id }]
      },
      include: {
        userA: { select: { id: true, name: true, avatarUrl: true } },
        userB: { select: { id: true, name: true, avatarUrl: true } },
        proposal: {
          include: {
            senderSkill: { select: { name: true } },
            receiverSkill: { select: { name: true } }
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    db.tradeProposal.findMany({
      where: {
        OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
        status: "Proposed"
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
        senderSkill: { select: { id: true, name: true, category: true } },
        receiverSkill: { select: { id: true, name: true, category: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const activeTrades = trades.filter(t => ["Accepted", "In Progress", "Awaiting Confirmation", "Disputed"].includes(t.status));
  const completedTrades = trades.filter(t => t.status === "Completed");
  const cancelledTrades = trades.filter(t => t.status === "Cancelled");

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8">
      <div>
        <h1 className="text-display-sm font-bold mb-2">Trade Tracker</h1>
        <p className="text-body-md text-neutral-variant-on">Manage your skill exchanges, proposals, and active trades.</p>
      </div>

      <Tabs defaultValue={resolvedSearchParams.tab || "active"} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeTrades.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4 mt-6">
          {proposals.length === 0 ? (
            <div className="text-center p-12 bg-neutral rounded-lg border border-neutral-variant">
              <p className="text-body-md text-neutral-variant-on">No pending proposals.</p>
            </div>
          ) : (
            proposals.map(p => (
              <ProposalCard key={p.id} proposal={p} currentUserId={session.user.id} />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeTrades.length === 0 ? (
            <div className="text-center p-12 bg-neutral rounded-lg border border-neutral-variant">
              <p className="text-body-md text-neutral-variant-on">No active trades.</p>
            </div>
          ) : (
            activeTrades.map(t => (
              <TradeCard key={t.id} trade={t} currentUserId={session.user.id} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedTrades.length === 0 ? (
            <div className="text-center p-12 bg-neutral rounded-lg border border-neutral-variant">
              <p className="text-body-md text-neutral-variant-on">No completed trades yet.</p>
            </div>
          ) : (
            completedTrades.map(t => (
              <TradeCard key={t.id} trade={t} currentUserId={session.user.id} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4 mt-6">
          {cancelledTrades.length === 0 ? (
            <div className="text-center p-12 bg-neutral rounded-lg border border-neutral-variant">
              <p className="text-body-md text-neutral-variant-on">No cancelled trades.</p>
            </div>
          ) : (
            cancelledTrades.map(t => (
              <TradeCard key={t.id} trade={t} currentUserId={session.user.id} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
