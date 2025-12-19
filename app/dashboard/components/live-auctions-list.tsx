// Live Auctions List - Server Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLiveAuctions } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export async function LiveAuctionsList() {
  const liveAuctions = getLiveAuctions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Live Auctions
          {liveAuctions.length > 0 && (
            <Badge variant="destructive" className="animate-pulse-slow">
              {liveAuctions.length} Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {liveAuctions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No live auctions at the moment</p>
        ) : (
          <div className="space-y-4">
            {liveAuctions.map((auction) => (
              <div
                key={auction.id}
                className="flex items-center justify-between border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={auction.player.avatar}
                    alt={auction.player.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{auction.player.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{auction.player.role}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Current: {formatCurrency(auction.currentBid)}
                      </span>
                    </div>
                  </div>
                </div>
                <Link href={`/auction/${auction.id}`}>
                  <Button size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
