/**
 * Dashboard Page - Next.js 15 Server Component with Streaming
 * 
 * This demonstrates:
 * 1. Server Components for data fetching
 * 2. Streaming with Suspense for progressive rendering
 * 3. Separation of static and dynamic content
 */

import { Suspense } from 'react';
import { getDashboardMetrics, getAllTeams, getPlayersByStatus } from '@/lib/db';
import { MetricCard } from './components/metric-card';
import { ActivityFeed } from './components/activity-feed';
import { LiveAuctionsList } from './components/live-auctions-list';
import { CreateAuctionButton } from './components/create-auction';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Users, TrendingUp, Trophy, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Skeleton for metric cards
function MetricSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

// Skeleton for activity feed
function ActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  // Server Component - data fetching happens on the server
  const metrics = getDashboardMetrics();
  const teams = getAllTeams();
  const unsoldPlayers = getPlayersByStatus('Unsold');
  
  const totalPurseRemaining = teams.reduce((sum, team) => sum + team.remainingPurse, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Static header - will be prerendered with PPR */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time IPL auction metrics and activity
        </p>
      </div>

      {/* Metrics Grid - Using Suspense for streaming */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Each metric can load independently with Suspense */}
        <Suspense fallback={<MetricSkeleton />}>
          <MetricCard
            title="Total Teams"
            value={metrics.totalTeams}
            description="Participating in auction"
            icon={Users}
            delay={100}
          />
        </Suspense>

        <Suspense fallback={<MetricSkeleton />}>
          <MetricCard
            title="Live Auctions"
            value={metrics.liveAuctionsCount}
            description="Currently active"
            icon={TrendingUp}
            delay={200}
          />
        </Suspense>

        <Suspense fallback={<MetricSkeleton />}>
          <MetricCard
            title="Highest Bid Today"
            value={formatCurrency(metrics.highestBidToday)}
            description="Current record"
            icon={Trophy}
            delay={300}
          />
        </Suspense>

        <Suspense fallback={<MetricSkeleton />}>
          <MetricCard
            title="Total Purse Remaining"
            value={formatCurrency(totalPurseRemaining)}
            description={`${metrics.soldPlayersCount} players sold`}
            icon={DollarSign}
            delay={400}
          />
        </Suspense>
      </div>

      {/* Three Column Layout for Create Auction, Live Auctions and Activity Feed */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Create Auction */}
        <CreateAuctionButton unsoldPlayers={unsoldPlayers} />

        {/* Live Auctions - Streams independently */}
        <Suspense fallback={<ActivitySkeleton />}>
          <LiveAuctionsList />
        </Suspense>

        {/* Activity Feed - Streams independently */}
        <Suspense fallback={<ActivitySkeleton />}>
          <ActivityFeed />
        </Suspense>
      </div>
    </div>
  );
}
