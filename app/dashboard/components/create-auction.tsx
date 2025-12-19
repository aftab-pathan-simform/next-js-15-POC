/**
 * Create Auction Client Component
 * Allows creating new auctions from the dashboard
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Player } from '@/lib/types';
import { Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CreateAuctionProps {
  unsoldPlayers: Player[];
}

export function CreateAuctionButton({ unsoldPlayers }: CreateAuctionProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handleCreateAuction = async () => {
    if (!selectedPlayer) {
      toast.error('Please select a player');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/auction/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: selectedPlayer }),
      });

      const result = await response.json();

      if (result.success && result.auctionId) {
        toast.success('Auction created successfully!');
        router.push(`/auction/${result.auctionId}`);
      } else {
        toast.error(result.error || 'Failed to create auction');
      }
    } catch (error) {
      toast.error('Failed to create auction');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  if (unsoldPlayers.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground text-center">
            No players available for auction
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Start New Auction
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showDialog ? (
          <Button onClick={() => setShowDialog(true)} className="w-full">
            Start Auction
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Player ({unsoldPlayers.length} available)
              </label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Choose a player...</option>
                {unsoldPlayers.slice(0, 20).map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} - {player.role} - ₹{player.basePrice}Cr
                  </option>
                ))}
              </select>
            </div>

            {selectedPlayer && (
              <div className="border rounded-lg p-3">
                {(() => {
                  const player = unsoldPlayers.find((p) => p.id === selectedPlayer);
                  if (!player) return null;
                  return (
                    <div className="flex items-center gap-3">
                      <img
                        src={player.avatar}
                        alt={player.name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{player.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{player.role}</Badge>
                          <Badge variant="secondary">₹{player.basePrice}Cr</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCreateAuction}
                disabled={isCreating || !selectedPlayer}
                className="flex-1"
              >
                {isCreating ? 'Creating...' : 'Create Auction'}
              </Button>
              <Button
                onClick={() => {
                  setShowDialog(false);
                  setSelectedPlayer('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
