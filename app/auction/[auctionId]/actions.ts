/**
 * Server Actions for Auction - Next.js 15 Server Actions
 * 
 * These functions run on the server and can be called directly from Client Components
 * They replace traditional API routes for mutations
 */

'use server';

import { revalidatePath } from 'next/cache';
import { placeBidSchema, type ActionResponse } from '@/lib/validations';
import { placeBid, getAuctionById, completeAuction } from '@/lib/db';
import type { Auction } from '@/lib/types';

/**
 * Place a bid in an auction
 * Server Action - ensures atomic updates and prevents race conditions
 */
export async function placeBidAction(
  auctionId: string,
  teamId: string,
  amount: number
): Promise<ActionResponse<Auction>> {
  try {
    // Validate input using Zod schema
    const validatedInput = placeBidSchema.parse({
      auctionId,
      teamId,
      amount,
    });

    // Place bid with atomic lock to prevent race conditions
    const result = await placeBid(
      validatedInput.auctionId,
      validatedInput.teamId,
      validatedInput.amount
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to place bid',
      };
    }

    // Revalidate related pages to update Server Component data
    revalidatePath('/dashboard');
    revalidatePath(`/auction/${auctionId}`);
    revalidatePath('/teams');

    return {
      success: true,
      message: 'Bid placed successfully',
      data: result.auction,
    };
  } catch (error) {
    console.error('Error placing bid:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid bid data',
    };
  }
}

/**
 * Complete an auction
 * Server Action to finalize auction and update player status
 */
export async function completeAuctionAction(auctionId: string): Promise<ActionResponse<Auction>> {
  try {
    const auction = completeAuction(auctionId);

    if (!auction) {
      return {
        success: false,
        error: 'Auction not found or already completed',
      };
    }

    // Revalidate all related pages
    revalidatePath('/dashboard');
    revalidatePath(`/auction/${auctionId}`);
    revalidatePath('/teams');
    revalidatePath('/players');

    return {
      success: true,
      message: auction.currentBidder
        ? 'Player sold successfully'
        : 'Player marked as unsold',
      data: auction,
    };
  } catch (error) {
    console.error('Error completing auction:', error);
    return {
      success: false,
      error: 'Failed to complete auction',
    };
  }
}

/**
 * Get current auction state
 * Server Action to fetch fresh auction data
 */
export async function getAuctionAction(auctionId: string): Promise<ActionResponse<Auction>> {
  try {
    const auction = getAuctionById(auctionId);

    if (!auction) {
      return {
        success: false,
        error: 'Auction not found',
      };
    }

    return {
      success: true,
      data: auction,
    };
  } catch (error) {
    console.error('Error fetching auction:', error);
    return {
      success: false,
      error: 'Failed to fetch auction',
    };
  }
}
