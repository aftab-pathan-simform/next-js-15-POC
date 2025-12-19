// Utility script to create a test auction
// Run with: node --loader ts-node/esm scripts/create-auction.ts

import { createAuction, getAllPlayers, getPlayersByStatus } from '../lib/db';

// Create a test auction
function createTestAuction() {
  const unsoldPlayers = getPlayersByStatus('Unsold');
  
  if (unsoldPlayers.length === 0) {
    console.log('No unsold players available');
    return;
  }

  // Pick first unsold player
  const player = unsoldPlayers[0];
  
  const auction = createAuction(player.id, 60);
  
  if (auction) {
    console.log('\n✅ Auction Created Successfully!');
    console.log('==================================');
    console.log(`Auction ID: ${auction.id}`);
    console.log(`Player: ${player.name}`);
    console.log(`Base Price: ₹${player.basePrice}Cr`);
    console.log(`Timer Duration: ${auction.timerDuration}s`);
    console.log('\nAccess the auction at:');
    console.log(`http://localhost:3000/auction/${auction.id}`);
    console.log('==================================\n');
  } else {
    console.log('Failed to create auction');
  }
}

createTestAuction();
