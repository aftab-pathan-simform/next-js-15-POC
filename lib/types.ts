// Shared TypeScript types for the IPL Auction Platform

export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';

export type PlayerStatus = 'Unsold' | 'Live' | 'Sold';

export type AuctionStatus = 'upcoming' | 'live' | 'completed';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  totalPurse: number; // in crores
  remainingPurse: number; // in crores
  maxPlayers: number;
  players: Player[];
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  basePrice: number; // in crores
  status: PlayerStatus;
  soldPrice?: number; // in crores
  teamId?: string;
  nationality: string;
  age: number;
  avatar: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  playerId: string;
  teamId: string;
  teamName: string;
  amount: number; // in crores
  timestamp: number;
}

export interface Auction {
  id: string;
  playerId: string;
  player: Player;
  currentBid: number; // in crores
  currentBidder?: string; // team id
  bids: Bid[];
  status: AuctionStatus;
  startTime: number;
  endTime?: number;
  timerDuration: number; // in seconds
}

export interface DashboardMetrics {
  totalTeams: number;
  totalPlayers: number;
  liveAuctionsCount: number;
  highestBidToday: number;
  soldPlayersCount: number;
  unsoldPlayersCount: number;
}

export interface Activity {
  id: string;
  type: 'bid' | 'win' | 'auction_start' | 'auction_end';
  message: string;
  timestamp: number;
  teamId?: string;
  playerId?: string;
  amount?: number;
}

export interface TeamPurseInfo {
  teamId: string;
  teamName: string;
  remainingPurse: number;
  totalSpent: number;
  playersCount: number;
}

// Client-side real-time event types
export interface BidEvent {
  type: 'new_bid';
  auction: Auction;
  bid: Bid;
}

export interface AuctionEvent {
  type: 'auction_start' | 'auction_end' | 'auction_update';
  auction: Auction;
}

export type RealtimeEvent = BidEvent | AuctionEvent;
