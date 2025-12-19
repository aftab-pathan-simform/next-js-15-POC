/**
 * Live Auction SSE (Server-Sent Events) Route Handler
 * 
 * This demonstrates:
 * 1. Edge Runtime for low latency
 * 2. Server-Sent Events for real-time updates
 * 3. Streaming responses
 * 4. Real-time bid notifications
 */

import { NextRequest } from 'next/server';
import { getAuctionById, completeAuction } from '@/lib/db';

// Use Edge Runtime for better performance and lower latency
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const auctionId = searchParams.get('auctionId');

  if (!auctionId) {
    return new Response('Missing auctionId parameter', { status: 400 });
  }

  const auction = getAuctionById(auctionId);

  if (!auction) {
    return new Response('Auction not found', { status: 404 });
  }

  // Create a ReadableStream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial auction state
      const sendUpdate = (data: unknown) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Send initial auction data
      sendUpdate({
        type: 'auction_update',
        auction,
      });

      // Simulated timer countdown
      let timeRemaining = auction.timerDuration;
      
      const timerInterval = setInterval(() => {
        timeRemaining -= 1;

        sendUpdate({
          type: 'timer_update',
          timeRemaining,
        });

        // End auction when timer reaches 0
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          clearInterval(pollInterval);
          
          // Auto-complete the auction
          const completedAuction = completeAuction(auctionId);
          
          sendUpdate({
            type: 'auction_end',
            auction: completedAuction || auction,
          });

          controller.close();
        }
      }, 1000);

      // Poll for auction updates every second
      const pollInterval = setInterval(() => {
        const updatedAuction = getAuctionById(auctionId);
        
        if (updatedAuction) {
          sendUpdate({
            type: 'auction_update',
            auction: updatedAuction,
          });

          // If auction completed externally, close connection
          if (updatedAuction.status === 'completed') {
            clearInterval(timerInterval);
            clearInterval(pollInterval);
            
            sendUpdate({
              type: 'auction_end',
              auction: updatedAuction,
            });

            controller.close();
          }
        }
      }, 1000);

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(timerInterval);
        clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  // Return SSE response with appropriate headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
