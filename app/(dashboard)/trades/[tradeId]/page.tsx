import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TradePipelineStepper } from "@/components/trades/TradePipelineStepper";
import { AgreementForm } from "@/components/trades/AgreementForm";
import { AgreementSnapshot } from "@/components/trades/AgreementSnapshot";
import { TradeStatusBadge } from "@/components/trades/TradeStatusBadge";
import { MessageThread } from "@/components/messaging/MessageThread";
import { MessageInput } from "@/components/messaging/MessageInput";

// We need a client wrapper for the messaging part
import { TradeMessaging } from "./TradeMessaging";

export default async function TradeDetailsPage({ params }: { params: Promise<{ tradeId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { tradeId } = await params;

  // Validate UUID to prevent Prisma crash on invalid IDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(tradeId)) {
    return <div className="p-8 text-center text-error">Invalid Trade ID</div>;
  }

  const trade = await db.trade.findUnique({
    where: { id: tradeId },
    include: {
      userA: { select: { id: true, name: true, avatarUrl: true } },
      userB: { select: { id: true, name: true, avatarUrl: true } },
      proposal: {
        include: {
          senderSkill: { select: { name: true } },
          receiverSkill: { select: { name: true } }
        }
      }
    }
  });

  if (!trade) {
    return <div className="p-8 text-center">Trade not found</div>;
  }

  if (trade.userAId !== session.user.id && trade.userBId !== session.user.id && !session.user.isAdmin) {
    return <div className="p-8 text-center text-error">Forbidden</div>;
  }

  const isUserA = session.user.id === trade.userAId;
  const otherUser = isUserA ? trade.userB : trade.userA;
  const myDelivered = isUserA ? trade.userADeliveryConfirmed : trade.userBDeliveryConfirmed;

  // Render
  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      {/* Left Column: Details & Pipeline */}
      <div className="w-full md:w-1/2 lg:w-2/5 border-r border-neutral-variant overflow-y-auto p-6 space-y-8 bg-neutral/30">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-title-lg font-bold">Trade with {otherUser.name}</h1>
            <TradeStatusBadge status={trade.status} />
          </div>
          <TradePipelineStepper currentStatus={trade.status} />
        </div>

        {/* Agreement Section */}
        {trade.agreementSnapshot ? (
          <AgreementSnapshot snapshot={trade.agreementSnapshot as any} currentUserId={session.user.id} />
        ) : (
          <AgreementForm trade={trade as any} currentUserId={session.user.id} />
        )}

        {/* Actions based on status */}
        {trade.status === "In Progress" && !myDelivered && (
          <div className="p-4 bg-primary-container/20 rounded-lg border border-primary-container">
            <h3 className="text-title-sm font-semibold mb-2">Ready to deliver?</h3>
            <p className="text-body-sm text-neutral-variant-on mb-4">Mark your part as complete once you have delivered what was promised.</p>
            {/* We will implement a client component for this action button, or we can just use a server action. For MVP, let's use a simple button in a client component. */}
            <DeliveryAction tradeId={trade.id} />
          </div>
        )}
        
        {trade.status === "Awaiting Confirmation" && !myDelivered && (
          <div className="p-4 bg-warning-container/20 rounded-lg border border-warning-container">
            <h3 className="text-title-sm font-semibold mb-2">Partner has delivered!</h3>
            <p className="text-body-sm text-neutral-variant-on mb-4">Your partner marked their part as complete. Please deliver your part to complete the trade.</p>
            <DeliveryAction tradeId={trade.id} />
          </div>
        )}
      </div>

      {/* Right Column: Messaging */}
      <div className="w-full md:w-1/2 lg:w-3/5 h-full flex flex-col bg-white">
        <TradeMessaging tradeId={trade.id} currentUserId={session.user.id} status={trade.status} />
      </div>
    </div>
  );
}

// Simple client component for the delivery action
import { DeliveryAction } from "./DeliveryAction";
