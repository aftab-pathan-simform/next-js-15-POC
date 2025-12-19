/**
 * Create Auction API Route
 * Route Handler for creating new auctions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuction } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json(
        { success: false, error: 'Player ID is required' },
        { status: 400 }
      );
    }

    const auction = createAuction(playerId, 60); // 60 second timer

    if (!auction) {
      return NextResponse.json(
        { success: false, error: 'Failed to create auction. Player may already be in auction.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      auctionId: auction.id,
      message: 'Auction created successfully',
    });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
