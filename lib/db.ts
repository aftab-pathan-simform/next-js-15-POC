// Mock in-memory database for IPL Auction Platform
// This simulates a real database with CRUD operations and prevents race conditions

import type { Team, Player, Auction, Bid, Activity, PlayerStatus } from './types';

// Use globalThis to persist data across hot reloads in development
const globalForDb = globalThis as unknown as {
  teams: Map<string, Team>;
  players: Map<string, Player>;
  auctions: Map<string, Auction>;
  activities: Activity[];
  isDbInitialized: boolean;
};

// In-memory data stores - persist across hot reloads
const teams = globalForDb.teams || new Map<string, Team>();
const players = globalForDb.players || new Map<string, Player>();
const auctions = globalForDb.auctions || new Map<string, Auction>();
const activities = globalForDb.activities || [];

// Store in global
globalForDb.teams = teams;
globalForDb.players = players;
globalForDb.auctions = auctions;
globalForDb.activities = activities;

// Seed data - 10 IPL Teams
const seedTeams: Omit<Team, 'players'>[] = [
  {
    id: 'MI',
    name: 'Mumbai Indians',
    shortName: 'MI',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=MI',
    totalPurse: 100,
    remainingPurse: 100,
    maxPlayers: 25,
  },
  {
    id: 'CSK',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=CSK',
    totalPurse: 100,
    remainingPurse: 100,
    maxPlayers: 25,
  },
  {
    id: 'RCB',
    name: 'Royal Challengers Bangalore',
    shortName: 'RCB',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=RCB',
    totalPurse: 100,
    remainingPurse: 100,
    maxPlayers: 25,
  },
  {
    id: 'KKR',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=KKR',
    totalPurse: 100,
    remainingPurse: 100,
    maxPlayers: 25,
  },
  {
    id: 'DC',
    name: 'Delhi Capitals',
    shortName: 'DC',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=DC',
    totalPurse: 100,
    remainingPurse: 100,
    maxPlayers: 25,
  },
  {
    id: 'SRH',
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=SRH',
    totalPurse: 100,
    remainingPurse: 100,
    maxPlayers: 25,
  },
  {
    id: 'PBKS',
    name: 'Punjab Kings',
    shortName: 'PBKS',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=PBKS',
    totalPurse: 100,
    remainingPurse: 100,
    maxPlayers: 25,
  },
  {
    id: 'RR',
    name: 'Rajasthan Royals',
    shortName: 'RR',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=RR',
    totalPurse: 100,
    remainingPurse: 100,
    maxPlayers: 25,
  },
  {
    id: 'GT',
    name: 'Gujarat Titans',
    shortName: 'GT',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=GT',
    totalPurse: 100,
    remainingPurse: 100,
    maxPlayers: 25,
  },
  {
    id: 'LSG',
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=LSG',
    totalPurse: 100,
    remainingPurse: 100,
    maxPlayers: 25,
  },
];

// Seed data - 100 Players
const playerNames = [
  'Virat Kohli', 'Rohit Sharma', 'MS Dhoni', 'Jasprit Bumrah', 'Ravindra Jadeja',
  'KL Rahul', 'Hardik Pandya', 'Rishabh Pant', 'Shikhar Dhawan', 'Mohammed Shami',
  'Yuzvendra Chahal', 'Shreyas Iyer', 'Suryakumar Yadav', 'Ishan Kishan', 'Washington Sundar',
  'Axar Patel', 'Deepak Chahar', 'Shardul Thakur', 'Prithvi Shaw', 'Shubman Gill',
  'Ruturaj Gaikwad', 'Devdutt Padikkal', 'Mayank Agarwal', 'Sanju Samson', 'Jos Buttler',
  'David Warner', 'Glenn Maxwell', 'Rashid Khan', 'Kagiso Rabada', 'Trent Boult',
  'Mitchell Starc', 'Pat Cummins', 'Kane Williamson', 'Ben Stokes', 'Chris Gayle',
  'AB de Villiers', 'Quinton de Kock', 'Faf du Plessis', 'Andre Russell', 'Sunil Narine',
  'Moeen Ali', 'Sam Curran', 'Liam Livingstone', 'Jonny Bairstow', 'Jason Roy',
  'Marcus Stoinis', 'Glenn Phillips', 'Tim David', 'Wanindu Hasaranga', 'Maheesh Theekshana',
  'Ajinkya Rahane', 'Cheteshwar Pujara', 'Dinesh Karthik', 'Robin Uthappa', 'Ambati Rayudu',
  'Manish Pandey', 'Kedar Jadhav', 'Krunal Pandya', 'Ravichandran Ashwin', 'Kuldeep Yadav',
  'Mohammed Siraj', 'Umesh Yadav', 'Navdeep Saini', 'Khaleel Ahmed', 'T Natarajan',
  'Arshdeep Singh', 'Harshal Patel', 'Avesh Khan', 'Prasidh Krishna', 'Mukesh Choudhary',
  'Tushar Deshpande', 'Mohsin Khan', 'Umran Malik', 'Yash Dayal', 'Kartik Tyagi',
  'Rahul Tewatia', 'Rahul Tripathi', 'Nitish Rana', 'Venkatesh Iyer', 'Tilak Varma',
  'Abhishek Sharma', 'Yashasvi Jaiswal', 'Sarfaraz Khan', 'Rinku Singh', 'Ramandeep Singh',
  'Shahrukh Khan', 'Ravi Bishnoi', 'Arshad Khan', 'Harpreet Brar', 'Lalit Yadav',
  'Riyan Parag', 'Dhruv Jurel', 'Jitesh Sharma', 'Suyash Prabhudessai', 'Atharva Taide',
  'Nehal Wadhera', 'Vivrant Sharma', 'Kumar Kushagra', 'Shashank Singh', 'Anmolpreet Singh',
];

const roles: Array<'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper'> = [
  'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper',
];

const nationalities = ['India', 'Australia', 'England', 'South Africa', 'New Zealand', 'West Indies', 'Sri Lanka'];

function generatePlayers(): Player[] {
  return playerNames.map((name, index) => ({
    id: `P${(index + 1).toString().padStart(3, '0')}`,
    name,
    role: roles[index % roles.length],
    basePrice: Math.max(0.5, Math.round((Math.random() * 15 + 0.5) * 10) / 10),
    status: 'Unsold' as PlayerStatus,
    nationality: nationalities[index % nationalities.length],
    age: Math.floor(Math.random() * 15) + 20,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
  }));
}

// Initialize database
export function initializeDatabase() {
  if (globalForDb.isDbInitialized) {
    console.log('Database already initialized - skipping. Current state:', {
      teams: teams.size,
      players: players.size,
      auctions: auctions.size,
    });
    return; // Already initialized, skip
  }

  // Clear existing data
  teams.clear();
  players.clear();
  auctions.clear();
  activities.length = 0;

  // Seed teams
  seedTeams.forEach((team) => {
    teams.set(team.id, { ...team, players: [] });
  });

  // Seed players
  const generatedPlayers = generatePlayers();
  generatedPlayers.forEach((player) => {
    players.set(player.id, player);
  });

  globalForDb.isDbInitialized = true;
  console.log('Database initialized with', teams.size, 'teams and', players.size, 'players');
}

// Team operations
export function getAllTeams(): Team[] {
  return Array.from(teams.values());
}

export function getTeamById(id: string): Team | undefined {
  return teams.get(id);
}

export function updateTeamPurse(teamId: string, newPurse: number): void {
  const team = teams.get(teamId);
  if (team) {
    team.remainingPurse = newPurse;
  }
}

export function addPlayerToTeam(teamId: string, player: Player): void {
  const team = teams.get(teamId);
  if (team) {
    team.players.push(player);
  }
}

// Player operations
export function getAllPlayers(): Player[] {
  return Array.from(players.values());
}

export function getPlayerById(id: string): Player | undefined {
  return players.get(id);
}

export function updatePlayerStatus(playerId: string, status: PlayerStatus, teamId?: string, soldPrice?: number): void {
  const player = players.get(playerId);
  if (player) {
    player.status = status;
    player.teamId = teamId;
    player.soldPrice = soldPrice;
  }
}

export function getPlayersByStatus(status: PlayerStatus): Player[] {
  return Array.from(players.values()).filter((p) => p.status === status);
}

// Auction operations
export function createAuction(playerId: string, timerDuration: number = 60): Auction | null {
  const player = players.get(playerId);
  if (!player || player.status !== 'Unsold') {
    return null;
  }

  const auctionId = `AUC-${Date.now()}`;
  const auction: Auction = {
    id: auctionId,
    playerId,
    player,
    currentBid: player.basePrice,
    currentBidder: undefined,
    bids: [],
    status: 'live',
    startTime: Date.now(),
    timerDuration,
  };

  auctions.set(auctionId, auction);
  updatePlayerStatus(playerId, 'Live');

  // Add activity
  addActivity({
    id: `ACT-${Date.now()}`,
    type: 'auction_start',
    message: `Auction started for ${player.name}`,
    timestamp: Date.now(),
    playerId,
  });

  return auction;
}

export function getAuctionById(id: string): Auction | undefined {
  return auctions.get(id);
}

export function getAllAuctions(): Auction[] {
  return Array.from(auctions.values());
}

export function getLiveAuctions(): Auction[] {
  return Array.from(auctions.values()).filter((a) => a.status === 'live');
}

// Bid operations with atomic updates to prevent race conditions
const bidLocks = new Map<string, boolean>();

export async function placeBid(
  auctionId: string,
  teamId: string,
  amount: number
): Promise<{ success: boolean; error?: string; auction?: Auction }> {
  // Acquire lock for this auction
  if (bidLocks.get(auctionId)) {
    return { success: false, error: 'Another bid is being processed. Please try again.' };
  }

  bidLocks.set(auctionId, true);

  try {
    console.log('Placing bid - Auction ID:', auctionId, 'Total auctions:', auctions.size);
    const auction = auctions.get(auctionId);
    const team = teams.get(teamId);

    if (!auction) {
      console.log('Available auctions:', Array.from(auctions.keys()));
      return { success: false, error: 'Auction not found' };
    }

    if (auction.status !== 'live') {
      return { success: false, error: 'Auction is not active' };
    }

    if (!team) {
      return { success: false, error: 'Team not found' };
    }

    // Validate bid amount
    if (amount <= auction.currentBid) {
      return { success: false, error: 'Bid must be higher than current bid' };
    }

    // Validate team has enough purse
    if (amount > team.remainingPurse) {
      return { success: false, error: 'Insufficient purse remaining' };
    }

    // Create bid
    const bid: Bid = {
      id: `BID-${Date.now()}`,
      auctionId,
      playerId: auction.playerId,
      teamId,
      teamName: team.name,
      amount,
      timestamp: Date.now(),
    };

    // Update auction atomically
    auction.bids.push(bid);
    auction.currentBid = amount;
    auction.currentBidder = teamId;

    // Add activity
    addActivity({
      id: `ACT-${Date.now()}`,
      type: 'bid',
      message: `${team.shortName} bid ₹${amount}Cr for ${auction.player.name}`,
      timestamp: Date.now(),
      teamId,
      playerId: auction.playerId,
      amount,
    });

    return { success: true, auction };
  } finally {
    // Release lock
    bidLocks.delete(auctionId);
  }
}

export function completeAuction(auctionId: string): Auction | null {
  const auction = auctions.get(auctionId);
  if (!auction || auction.status !== 'live') {
    return null;
  }

  auction.status = 'completed';
  auction.endTime = Date.now();

  if (auction.currentBidder) {
    // Player sold
    updatePlayerStatus(auction.playerId, 'Sold', auction.currentBidder, auction.currentBid);
    
    const team = teams.get(auction.currentBidder);
    if (team) {
      updateTeamPurse(auction.currentBidder, team.remainingPurse - auction.currentBid);
      addPlayerToTeam(auction.currentBidder, auction.player);

      addActivity({
        id: `ACT-${Date.now()}`,
        type: 'win',
        message: `${team.shortName} won ${auction.player.name} for ₹${auction.currentBid}Cr`,
        timestamp: Date.now(),
        teamId: auction.currentBidder,
        playerId: auction.playerId,
        amount: auction.currentBid,
      });
    }
  } else {
    // Player unsold
    updatePlayerStatus(auction.playerId, 'Unsold');
    
    addActivity({
      id: `ACT-${Date.now()}`,
      type: 'auction_end',
      message: `${auction.player.name} went unsold`,
      timestamp: Date.now(),
      playerId: auction.playerId,
    });
  }

  return auction;
}

// Activity operations
export function addActivity(activity: Activity): void {
  activities.unshift(activity);
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.pop();
  }
}

export function getRecentActivities(limit: number = 20): Activity[] {
  return activities.slice(0, limit);
}

// Dashboard metrics
export function getDashboardMetrics() {
  const allPlayers = getAllPlayers();
  const liveAuctions = getLiveAuctions();
  
  let highestBidToday = 0;
  auctions.forEach((auction) => {
    if (auction.currentBid > highestBidToday) {
      highestBidToday = auction.currentBid;
    }
  });

  return {
    totalTeams: teams.size,
    totalPlayers: allPlayers.length,
    liveAuctionsCount: liveAuctions.length,
    highestBidToday,
    soldPlayersCount: allPlayers.filter((p) => p.status === 'Sold').length,
    unsoldPlayersCount: allPlayers.filter((p) => p.status === 'Unsold').length,
  };
}

// Initialize on module load
initializeDatabase();
