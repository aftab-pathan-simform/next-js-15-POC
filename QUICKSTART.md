# Quick Start Guide

Get the IPL Auction Platform up and running in **5 minutes**.

## Prerequisites

- **Node.js 20+** ([Download](https://nodejs.org))
- **npm** or **yarn**
- A code editor (VS Code recommended)

## Step 1: Install Dependencies

```bash
cd nextjs-demo
npm install
```

This installs all required packages including Next.js 15, React 19, TypeScript, and more.

## Step 2: Start Development Server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000)

## Step 3: Explore the Application

### Dashboard
Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

**What you'll see**:
- Total teams (10)
- Live auctions count
- Highest bid today
- Real-time activity feed
- "Start New Auction" button

### Create Your First Auction

1. Click **"Start Auction"** button on dashboard
2. Select a player from dropdown (e.g., "Virat Kohli")
3. Click **"Create Auction"**
4. You'll be redirected to the live auction page

### Place Bids

On the auction page:

1. **Select a team** (click on a team logo)
   - Example: Click on "MI" (Mumbai Indians)
   
2. **Enter bid amount**
   - Must be higher than current bid
   - Use quick buttons (+0.5, +1, +2)
   
3. **Click "Place Bid"**
   - See optimistic update instantly
   - Toast notification confirms success

4. **Watch real-time updates**
   - Open auction in two browser tabs
   - Place bid in one tab
   - See update in other tab automatically!

### Explore Teams

Navigate to [http://localhost:3000/teams](http://localhost:3000/teams)

**Features**:
- View all 10 IPL teams
- See remaining purse for each team
- Visual purse utilization chart
- Squad details with bought players

### Browse Players

Navigate to [http://localhost:3000/players](http://localhost:3000/players)

**Features**:
- 100 players total
- Filter by status (Unsold/Live/Sold)
- Role badges (Batsman, Bowler, etc.)
- Base price and sold price

## Testing Real-time Features

### Two-Tab Test

1. **Open Dashboard** in Tab 1: `http://localhost:3000/dashboard`
2. **Create an Auction** and copy the URL
3. **Open same Auction** in Tab 2
4. **Place a bid** in Tab 1
5. **Watch Tab 2 update** automatically via Server-Sent Events!

### Multi-User Simulation

```bash
# Terminal 1: Normal session
npm run dev

# Open multiple browser windows to simulate different teams bidding
```

## Understanding the Code

### Server Component Example

Open [app/dashboard/page.tsx](app/dashboard/page.tsx):

```typescript
// This is a Server Component (runs on server)
export default function DashboardPage() {
  const metrics = getDashboardMetrics(); // Direct DB access
  return <div>{metrics.totalTeams}</div>;
}
```

**Key points**:
- No `'use client'` directive
- Can access database directly
- Zero JavaScript to client
- Fast initial load

### Client Component Example

Open [app/auction/[auctionId]/live-bids.tsx](app/auction/[auctionId]/live-bids.tsx):

```typescript
'use client'; // Required for interactivity

export function LiveBidComponent() {
  const [bidAmount, setBidAmount] = useState(0); // Client state
  useEffect(() => { /* Real-time updates */ }, []);
  return <button onClick={handleBid}>Place Bid</button>;
}
```

**Key points**:
- Has `'use client'` directive
- Uses hooks (useState, useEffect)
- Handles user interactions
- Receives initial data from Server Component

### Server Action Example

Open [app/auction/[auctionId]/actions.ts](app/auction/[auctionId]/actions.ts):

```typescript
'use server'; // Server-only code

export async function placeBidAction(
  auctionId: string,
  teamId: string,
  amount: number
) {
  // Runs on server
  const result = await placeBid(auctionId, teamId, amount);
  revalidatePath('/dashboard'); // Update cache
  return result;
}
```

**Key points**:
- Has `'use server'` directive
- Type-safe (TypeScript)
- No API route needed
- Automatic revalidation

## Common Tasks

### Add a New Player

Edit [lib/db.ts](lib/db.ts):

```typescript
const playerNames = [
  'Virat Kohli',
  'MS Dhoni',
  'Your New Player', // Add here
  // ...
];
```

Restart the server to see changes.

### Change Auction Timer

When creating auction:

```typescript
const auction = createAuction('P001', 120); // 120 seconds instead of 60
```

### Modify Team Purse

Edit [lib/db.ts](lib/db.ts):

```typescript
const seedTeams = [
  {
    id: 'MI',
    name: 'Mumbai Indians',
    totalPurse: 150, // Change from 100 to 150
    remainingPurse: 150,
    // ...
  },
];
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript Errors

The errors you see are because dependencies aren't installed yet. Run:

```bash
npm install
```

All TypeScript errors will disappear once packages are installed.

### SSE Not Working

- Check browser console for errors
- Ensure dev server is running
- Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

## Development Tips

### Hot Reload

Next.js automatically reloads when you save files:
- **Server Components**: Full page reload
- **Client Components**: Fast refresh (preserves state)
- **Server Actions**: Requires page reload

### Viewing Database State

Add console logs in [lib/db.ts](lib/db.ts):

```typescript
export function getAllTeams(): Team[] {
  console.log('Teams in DB:', teams.size);
  return Array.from(teams.values());
}
```

Check terminal output to see logs.

### Debugging SSE

Open browser DevTools → Network → Filter "live" → See SSE messages:

```
data: {"type":"auction_update","auction":{...}}

data: {"type":"timer_update","timeRemaining":45}
```

## Production Build

### Build

```bash
npm run build
```

This creates optimized production build in `.next/` folder.

### Test Production Build Locally

```bash
npm run build
npm start
```

Production build is faster and more optimized than dev mode.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Follow prompts to deploy. Your app will be live at `https://your-app.vercel.app`

## Next Steps

1. **Read [ARCHITECTURE.md](ARCHITECTURE.md)** - Deep dive into design decisions
2. **Read [README.md](README.md)** - Comprehensive feature documentation
3. **Experiment** - Try modifying components and see changes
4. **Deploy** - Get your app live on Vercel

## Getting Help

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **React Docs**: [react.dev](https://react.dev)
- **Tailwind Docs**: [tailwindcss.com](https://tailwindcss.com)

## What's Next?

### Beginner
- ✅ Run the app
- ✅ Create an auction
- ✅ Place some bids
- ⬜ Modify a component
- ⬜ Add a new feature

### Intermediate
- ⬜ Add authentication
- ⬜ Connect real database (PostgreSQL)
- ⬜ Add unit tests
- ⬜ Implement WebSockets

### Advanced
- ⬜ Add Redis caching
- ⬜ Implement rate limiting
- ⬜ Add monitoring (Sentry)
- ⬜ Build mobile app

---

**Happy Coding! 🚀**
