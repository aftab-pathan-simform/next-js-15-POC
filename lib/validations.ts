// Zod validation schemas for runtime type checking and API validation
import { z } from 'zod';

// Player role validation
export const playerRoleSchema = z.enum(['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper']);

// Player status validation
export const playerStatusSchema = z.enum(['Unsold', 'Live', 'Sold']);

// Auction status validation
export const auctionStatusSchema = z.enum(['upcoming', 'live', 'completed']);

// Team schema
export const teamSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  shortName: z.string().min(1).max(5),
  logo: z.string().url(),
  totalPurse: z.number().positive(),
  remainingPurse: z.number().nonnegative(),
  maxPlayers: z.number().int().positive(),
  players: z.array(z.any()), // Will be Player[] at runtime
});

// Player schema
export const playerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: playerRoleSchema,
  basePrice: z.number().positive(),
  status: playerStatusSchema,
  soldPrice: z.number().positive().optional(),
  teamId: z.string().optional(),
  nationality: z.string().min(1),
  age: z.number().int().positive(),
  avatar: z.string().url(),
});

// Bid schema
export const bidSchema = z.object({
  id: z.string(),
  auctionId: z.string(),
  playerId: z.string(),
  teamId: z.string(),
  teamName: z.string(),
  amount: z.number().positive(),
  timestamp: z.number(),
});

// Auction schema
export const auctionSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  player: playerSchema,
  currentBid: z.number().nonnegative(),
  currentBidder: z.string().optional(),
  bids: z.array(bidSchema),
  status: auctionStatusSchema,
  startTime: z.number(),
  endTime: z.number().optional(),
  timerDuration: z.number().int().positive(),
});

// Server Action validation schemas

// Place bid input
export const placeBidSchema = z.object({
  auctionId: z.string(),
  teamId: z.string(),
  amount: z.number().positive(),
});

export type PlaceBidInput = z.infer<typeof placeBidSchema>;

// Start auction input
export const startAuctionSchema = z.object({
  playerId: z.string(),
  basePrice: z.number().positive(),
  timerDuration: z.number().int().positive().default(60),
});

export type StartAuctionInput = z.infer<typeof startAuctionSchema>;

// Filter players input
export const filterPlayersSchema = z.object({
  role: playerRoleSchema.optional(),
  status: playerStatusSchema.optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  search: z.string().optional(),
});

export type FilterPlayersInput = z.infer<typeof filterPlayersSchema>;

// Server Action Response wrapper
export const actionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};
