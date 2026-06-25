import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { StatCard } from "@/components/admin/StatCard";
import { Users, Briefcase, Star, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.id || !session.user.isAdmin) {
    redirect("/dashboard");
  }

  // Fetch stats directly since this is a server component
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    activeUsers30d,
    totalTrades,
    completedTrades,
    totalProposals,
    acceptedProposals,
    reviewsAgg,
    openDisputes,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { updatedAt: { gte: thirtyDaysAgo } } }),
    db.trade.count(),
    db.trade.count({ where: { status: "Completed" } }),
    db.tradeProposal.count(),
    db.tradeProposal.count({ where: { status: "Accepted" } }),
    db.review.aggregate({
      _avg: { rating: true },
      _count: { id: true }
    }),
    db.dispute.count({ where: { status: "Open" } })
  ]);

  const tradeCompletionRate = totalTrades > 0 ? (completedTrades / totalTrades) * 100 : 0;
  const proposalAcceptanceRate = totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;
  const averageRating = reviewsAgg._avg.rating ? Number(reviewsAgg._avg.rating.toFixed(1)) : 0;
  const retentionRate = totalUsers > 0 ? (activeUsers30d / totalUsers) * 100 : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display-sm font-bold text-neutral-on mb-2">Platform Overview</h1>
        <p className="text-body-md text-neutral-variant-on">At-a-glance metrics for TalentLoop.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={totalUsers} 
          icon={Users} 
          trend={{ value: Math.round(retentionRate), label: "active this month", positive: retentionRate > 20 }}
        />
        <StatCard 
          title="Active Trades" 
          value={totalTrades - completedTrades} 
          icon={Briefcase} 
          trend={{ value: Math.round(tradeCompletionRate), label: "completion rate", positive: tradeCompletionRate > 50 }}
        />
        <StatCard 
          title="Avg. Rating" 
          value={averageRating} 
          icon={Star} 
          trend={{ value: reviewsAgg._count.id, label: "total reviews", positive: true }}
        />
        <StatCard 
          title="Open Disputes" 
          value={openDisputes} 
          icon={AlertTriangle} 
          className={openDisputes > 0 ? "border-error" : ""}
          trend={openDisputes > 0 ? { value: openDisputes, label: "action required", positive: false } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Conversion Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-body-sm font-medium">Proposal Acceptance Rate</span>
                <span className="text-body-sm font-bold">{Math.round(proposalAcceptanceRate)}%</span>
              </div>
              <div className="w-full bg-neutral rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${proposalAcceptanceRate}%` }}
                ></div>
              </div>
              <p className="text-label-sm text-neutral-variant-on mt-2">
                {acceptedProposals} of {totalProposals} proposals accepted.
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-body-sm font-medium">Trade Completion Rate</span>
                <span className="text-body-sm font-bold">{Math.round(tradeCompletionRate)}%</span>
              </div>
              <div className="w-full bg-success-container rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full" 
                  style={{ width: `${tradeCompletionRate}%` }}
                ></div>
              </div>
              <p className="text-label-sm text-neutral-variant-on mt-2">
                {completedTrades} of {totalTrades} trades completed successfully.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-primary" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success-container/20 rounded-lg border border-success-container">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="font-medium">Database Connection</span>
                </div>
                <span className="text-label-sm text-success font-bold">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-success-container/20 rounded-lg border border-success-container">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="font-medium">Matching Engine</span>
                </div>
                <span className="text-label-sm text-success font-bold">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral/50 rounded-lg border border-neutral-variant">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-neutral-variant-on"></div>
                  <span className="font-medium">Background Jobs</span>
                </div>
                <span className="text-label-sm text-neutral-variant-on font-bold">Waiting</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
