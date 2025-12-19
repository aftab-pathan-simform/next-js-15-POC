/**
 * Auction Page - Server Component wrapper
 * 
 * This page:
 * 1. Fetches initial auction data on the server
 * 2. Passes data to Client Component for interactivity
 * 3. Handles not found cases
 */

import { notFound } from 'next/navigation';
import { getAuctionById, getAllTeams } from '@/lib/db';
import { LiveBidComponent } from './live-bids';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AuctionPageProps {
  params: Promise<{
    auctionId: string;
  }>;
}

export default async function AuctionPage({ params }: AuctionPageProps) {
  // Next.js 15: await params before accessing properties
  const { auctionId } = await params;
  
  // Server Component - fetch data on the server
  const auction = getAuctionById(auctionId);
  
  if (!auction) {
    notFound();
  }

  const teams = getAllTeams();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Auction Status Banner */}
      {auction.status === 'completed' && (
        <Card className="mb-6 border-primary">
          <CardContent className="py-4">
            <p className="text-center font-semibold">
              This auction has ended.{' '}
              {auction.currentBidder
                ? `${auction.player.name} was sold to ${teams.find((t) => t.id === auction.currentBidder)?.name}`
                : `${auction.player.name} went unsold`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Live Bidding Component - Client Component */}
      <LiveBidComponent
        auctionId={auctionId}
        initialAuction={auction}
        teams={teams}
      />
    </div>
  );
}
