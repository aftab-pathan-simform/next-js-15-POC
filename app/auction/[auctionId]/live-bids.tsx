/**
 * Live Bid Component - Client Component for real-time bidding
 * 
 * Demonstrates:
 * 1. Client Component with 'use client' directive
 * 2. Server Actions for bid submission
 * 3. Optimistic UI updates
 * 4. Real-time updates via Server-Sent Events (SSE)
 * 5. TanStack Query for client-side state management
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { placeBidAction, getAuctionAction, completeAuctionAction } from './actions';
import { formatCurrency } from '@/lib/utils';
import type { Auction, Team } from '@/lib/types';
import { toast } from 'sonner';
import { TrendingUp, Clock, Users } from 'lucide-react';

interface LiveBidComponentProps {
  auctionId: string;
  initialAuction: Auction;
  teams: Team[];
}

export function LiveBidComponent({ auctionId, initialAuction, teams }: LiveBidComponentProps) {
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<number>(initialAuction.currentBid + 0.5);
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    // Calculate initial time remaining based on auction start time
    const elapsed = Math.floor((Date.now() - initialAuction.startTime) / 1000);
    return Math.max(0, initialAuction.timerDuration - elapsed);
  });

  // TanStack Query for auction state
  const { data: auction } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      const result = await getAuctionAction(auctionId);
      return result.data || initialAuction;
    },
    initialData: initialAuction,
    refetchInterval: 2000, // Poll every 2 seconds as fallback
  });

  // Server-Sent Events for real-time updates
  useEffect(() => {
    if (auction.status !== 'live') return;

    const eventSource = new EventSource(`/api/auction/live?auctionId=${auctionId}`);
    let sseConnected = false;

    eventSource.onmessage = (event) => {
      try {
        sseConnected = true;
        const data = JSON.parse(event.data);
        
        if (data.type === 'auction_update' && data.auction) {
          // Update auction state via TanStack Query
          queryClient.setQueryData(['auction', auctionId], data.auction);
          
          // Show toast notification for new bid
          if (data.auction.currentBid > auction.currentBid) {
            toast.info(`New bid: ${formatCurrency(data.auction.currentBid)}`);
          }
        }

        if (data.type === 'timer_update') {
          setTimeRemaining(data.timeRemaining);
        }

        if (data.type === 'auction_end') {
          // Update with final auction state
          if (data.auction) {
            queryClient.setQueryData(['auction', auctionId], data.auction);
            
            // Show appropriate message based on outcome
            if (data.auction.currentBidder) {
              const winningTeam = teams.find(t => t.id === data.auction.currentBidder);
              toast.success(`Sold! ${data.auction.player.name} goes to ${winningTeam?.shortName} for ${formatCurrency(data.auction.currentBid)}`);
            } else {
              toast.info(`${data.auction.player.name} went unsold - no bids received`);
            }
          } else {
            toast.success('Auction completed!');
          }
          
          queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
          eventSource.close();
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };

    // Fallback client-side timer if SSE fails
    const fallbackTimer = setInterval(() => {
      if (!sseConnected && auction.status === 'live') {
        const elapsed = Math.floor((Date.now() - auction.startTime) / 1000);
        const remaining = Math.max(0, auction.timerDuration - elapsed);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(fallbackTimer);
        }
      }
    }, 1000);

    return () => {
      eventSource.close();
      clearInterval(fallbackTimer);
    };
  }, [auctionId, auction.currentBid, auction.status, auction.startTime, auction.timerDuration, queryClient]);

  // Bid mutation with optimistic updates
  const bidMutation = useMutation({
    mutationFn: async ({ teamId, amount }: { teamId: string; amount: number }) => {
      return placeBidAction(auctionId, teamId, amount);
    },
    onMutate: async ({ teamId, amount }: { teamId: string; amount: number }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['auction', auctionId] });

      // Snapshot previous value
      const previousAuction = queryClient.getQueryData<Auction>(['auction', auctionId]);

      // Optimistically update auction state
      if (previousAuction) {
        const optimisticAuction: Auction = {
          ...previousAuction,
          currentBid: amount,
          currentBidder: teamId,
        };
        queryClient.setQueryData(['auction', auctionId], optimisticAuction);
        return { previousAuction };
      }

      return { previousAuction: previousAuction! };
    },
    onError: (
      error: Error,
      _variables: { teamId: string; amount: number },
      context?: { previousAuction: Auction }
    ) => {
      // Rollback on error
      if (context?.previousAuction) {
        queryClient.setQueryData(['auction', auctionId], context.previousAuction);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to place bid');
    },
    onSuccess: (result: { success: boolean; data?: Auction; message?: string; error?: string }) => {
      if (result.success && result.data) {
        queryClient.setQueryData(['auction', auctionId], result.data);
        toast.success(result.message || 'Bid placed successfully!');
        setBidAmount(result.data.currentBid + 0.5);
      } else {
        toast.error(result.error || 'Failed to place bid');
      }
    },
  });

  const handlePlaceBid = useCallback(() => {
    if (!selectedTeam) {
      toast.error('Please select a team');
      return;
    }

    if (bidAmount <= auction.currentBid) {
      toast.error('Bid must be higher than current bid');
      return;
    }

    bidMutation.mutate({ teamId: selectedTeam, amount: bidAmount });
  }, [selectedTeam, bidAmount, auction.currentBid, bidMutation]);

  const handleCompleteAuction = useCallback(async () => {
    const result = await completeAuctionAction(auctionId);
    if (result.success) {
      toast.success(result.message || 'Auction completed!');
      queryClient.invalidateQueries({ queryKey: ['auction', auctionId] });
    } else {
      toast.error(result.error || 'Failed to complete auction');
    }
  }, [auctionId, queryClient]);

  const selectedTeamData = teams.find((t) => t.id === selectedTeam);
  const canBid = selectedTeamData && selectedTeamData.remainingPurse >= bidAmount;

  return (
    <div className="space-y-6">
      {/* Auction Completed Banner */}
      {auction.status === 'completed' && (
        <Card className={auction.currentBidder ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"}>
          <CardContent className="py-6">
            {auction.currentBidder ? (
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                  🎉 SOLD!
                </p>
                <p className="text-lg">
                  <span className="font-semibold">{auction.player.name}</span> sold to{' '}
                  <span className="font-bold text-primary">
                    {teams.find(t => t.id === auction.currentBidder)?.name}
                  </span>
                  {' '}for{' '}
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(auction.currentBid)}
                  </span>
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-2">
                  UNSOLD
                </p>
                <p className="text-lg">
                  <span className="font-semibold">{auction.player.name}</span> did not receive any bids
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Player Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={auction.player.avatar}
                alt={auction.player.name}
                className="h-20 w-20 rounded-full border-4 border-primary"
              />
              <div>
                <CardTitle className="text-3xl">{auction.player.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{auction.player.role}</Badge>
                  <Badge variant="secondary">{auction.player.nationality}</Badge>
                  <span className="text-sm text-muted-foreground">{auction.player.age} years</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Base Price</p>
              <p className="text-2xl font-bold">{formatCurrency(auction.player.basePrice)}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Bid & Timer */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Current Bid</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{formatCurrency(auction.currentBid)}</p>
            {auction.currentBidder && (
              <p className="text-sm text-muted-foreground mt-2">
                Current bidder: {teams.find((t) => t.id === auction.currentBidder)?.shortName}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Time Remaining</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{timeRemaining}s</p>
            <div className="w-full bg-secondary rounded-full h-2 mt-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timeRemaining / auction.timerDuration) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auction Controls */}
      {auction.status === 'live' && (
        <div className="flex gap-3">
          <Button
            variant="default"
            size="lg"
            onClick={handleCompleteAuction}
            disabled={!auction.currentBidder}
            className="flex-1"
          >
            Sold to {auction.currentBidder ? teams.find(t => t.id === auction.currentBidder)?.shortName : 'Highest Bidder'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleCompleteAuction}
            className="flex-1"
          >
            Mark as Unsold
          </Button>
        </div>
      )}

      {/* Bidding Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Place Your Bid</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Team Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Team</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team.id)}
                    className={`p-3 border rounded-lg transition-all ${
                      selectedTeam === team.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <img src={team.logo} alt={team.name} className="h-8 w-8 rounded-full" />
                      <span className="text-xs font-semibold">{team.shortName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(team.remainingPurse)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bid Amount */}
            <div>
              <label className="text-sm font-medium mb-2 block">Bid Amount (in Crores)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(parseFloat(e.target.value))}
                  step="0.5"
                  min={auction.currentBid + 0.5}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  variant="outline"
                  onClick={() => setBidAmount(auction.currentBid + 0.5)}
                >
                  Min +0.5
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setBidAmount(auction.currentBid + 1)}
                >
                  +1
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setBidAmount(auction.currentBid + 2)}
                >
                  +2
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handlePlaceBid}
              disabled={!canBid || bidMutation.isPending || auction.status !== 'live'}
              className="w-full"
              size="lg"
            >
              {bidMutation.isPending ? 'Placing Bid...' : 'Place Bid'}
            </Button>

            {selectedTeamData && !canBid && bidAmount > selectedTeamData.remainingPurse && (
              <p className="text-sm text-destructive">
                Insufficient purse. Team has {formatCurrency(selectedTeamData.remainingPurse)} remaining.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bid History */}
      <Card>
        <CardHeader>
          <CardTitle>Bid History</CardTitle>
        </CardHeader>
        <CardContent>
          {auction.bids.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bids yet</p>
          ) : (
            <div className="space-y-2">
              {auction.bids.slice().reverse().map((bid) => (
                <div
                  key={bid.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={teams.find((t) => t.id === bid.teamId)?.logo}
                      alt={bid.teamName}
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{bid.teamName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bid.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-primary">{formatCurrency(bid.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
