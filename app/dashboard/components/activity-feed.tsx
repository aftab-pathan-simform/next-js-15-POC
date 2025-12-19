// Activity Feed - Server Component with streaming
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRecentActivities } from '@/lib/db';
import { formatRelativeTime, formatCurrency } from '@/lib/utils';
import type { Activity } from '@/lib/types';
import { TrendingUp, Trophy, Play, XCircle } from 'lucide-react';

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'bid':
      return TrendingUp;
    case 'win':
      return Trophy;
    case 'auction_start':
      return Play;
    case 'auction_end':
      return XCircle;
    default:
      return TrendingUp;
  }
}

function getActivityBadge(type: Activity['type']) {
  switch (type) {
    case 'bid':
      return <Badge variant="default">Bid</Badge>;
    case 'win':
      return <Badge variant="secondary">Won</Badge>;
    case 'auction_start':
      return <Badge variant="outline">Started</Badge>;
    case 'auction_end':
      return <Badge variant="destructive">Ended</Badge>;
    default:
      return null;
  }
}

export async function ActivityFeed() {
  // Server Component - fetches data on the server
  const activities = getRecentActivities(10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getActivityBadge(activity.type)}
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</span>
                    </div>
                    <p className="text-sm">{activity.message}</p>
                    {activity.amount && (
                      <p className="text-sm font-semibold text-primary">{formatCurrency(activity.amount)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
