# Architecture Documentation

## Overview

This IPL Auction Platform is built using **Next.js 15** with the App Router, demonstrating production-grade patterns for modern web applications.

## Core Architecture Principles

### 1. Server-First Architecture

**Why**: Reduce JavaScript sent to client, improve performance, better SEO

**How**:
- Default to Server Components
- Only mark components `'use client'` when absolutely necessary
- Server Components can directly access database/APIs
- Automatic code splitting

**Examples**:
```typescript
// ✅ Server Component (default)
// app/dashboard/page.tsx
export default function DashboardPage() {
  const data = getDashboardMetrics(); // Direct server access
  return <div>{data.totalTeams}</div>;
}

// ✅ Client Component (only when needed)
// app/auction/[auctionId]/live-bids.tsx
'use client';
export function LiveBidComponent() {
  const [state, setState] = useState(); // Needs interactivity
  useEffect(() => { /* ... */ }, []); // Browser APIs
}
```

### 2. Data Fetching Patterns

#### Server Components (Recommended)

**Use for**: Initial data loading, SEO-critical content

```typescript
// Fetches on server, no client JavaScript needed
export default async function Page() {
  const data = await fetch('...').then(r => r.json());
  return <Display data={data} />;
}
```

#### Server Actions

**Use for**: Mutations, form submissions, database updates

```typescript
'use server';

export async function placeBidAction(auctionId: string, teamId: string, amount: number) {
  // Runs on server
  // Type-safe
  // Automatic revalidation
  const result = await placeBid(auctionId, teamId, amount);
  revalidatePath('/dashboard'); // Update cached pages
  return result;
}
```

**Client usage**:
```typescript
'use client';

function BidButton() {
  const handleClick = async () => {
    await placeBidAction('123', 'CSK', 10.5); // Direct call, no fetch needed
  };
}
```

#### TanStack Query (Client-side)

**Use for**: Real-time data, polling, client-side caching

```typescript
'use client';

const { data } = useQuery({
  queryKey: ['auction', auctionId],
  queryFn: async () => getAuctionAction(auctionId),
  refetchInterval: 2000, // Poll every 2s
});
```

### 3. Real-time Architecture

#### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌─────────────────┐                │
│  │  UI Component │◄─────┤ TanStack Query  │                │
│  └──────┬───────┘      └────────┬────────┘                │
│         │                       │                          │
│         │ Place Bid             │ Poll/SSE Update          │
│         │                       │                          │
└─────────┼───────────────────────┼──────────────────────────┘
          │                       │
          ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                         Server                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌─────────────────┐                │
│  │ Server Action│      │  SSE Route      │                │
│  │  (Mutation)  │      │  (Edge Runtime) │                │
│  └──────┬───────┘      └────────┬────────┘                │
│         │                       │                          │
│         │                       │ Stream Updates           │
│         ▼                       │                          │
│  ┌──────────────────────────────┴──────┐                  │
│  │         In-Memory Database          │                  │
│  │  - Atomic Locks (Race Prevention)   │                  │
│  │  - Bid History                      │                  │
│  │  - Activity Log                     │                  │
│  └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

#### Server-Sent Events (SSE)

**Why SSE over WebSocket**:
- Simpler implementation
- Automatic reconnection
- Works with HTTP/2
- Better for one-way server→client communication

**Implementation**:

```typescript
// app/api/auction/live/route.ts
export const runtime = 'edge'; // Low latency

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send updates
      setInterval(() => {
        const message = `data: ${JSON.stringify({ type: 'update' })}\n\n`;
        controller.enqueue(encoder.encode(message));
      }, 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Client consumption**:

```typescript
'use client';

useEffect(() => {
  const eventSource = new EventSource('/api/auction/live?id=123');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateUIWithData(data);
  };

  return () => eventSource.close();
}, []);
```

### 4. Streaming & Suspense

**Why**: Progressive rendering, better perceived performance

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      {/* Static header loads instantly */}
      <h1>Dashboard</h1>
      
      {/* Metrics stream in independently */}
      <Suspense fallback={<Skeleton />}>
        <MetricCard title="Teams" /> {/* May take 100ms */}
      </Suspense>
      
      <Suspense fallback={<Skeleton />}>
        <MetricCard title="Players" /> {/* May take 200ms */}
      </Suspense>
      
      {/* Each component loads as soon as ready */}
    </div>
  );
}
```

**Benefits**:
- Faster First Contentful Paint (FCP)
- No blocking waterfalls
- Each component loads independently
- Better UX with loading states

### 5. Partial Prerendering (PPR)

**Concept**: Mix static and dynamic content in same page

```typescript
// Enable PPR for route
export const experimental_ppr = true;

export default function Page() {
  return (
    <div>
      {/* Static: Prerendered at build time */}
      <Header />
      <Navigation />
      
      {/* Dynamic: Rendered on request */}
      <Suspense>
        <LiveData />
      </Suspense>
    </div>
  );
}
```

**What gets prerendered**:
- Static header
- Navigation
- Layout
- Empty states

**What streams dynamically**:
- Live auction data
- User-specific content
- Real-time metrics

### 6. Race Condition Prevention

**Problem**: Multiple users bidding simultaneously

**Solution**: Atomic locks

```typescript
const bidLocks = new Map<string, boolean>();

export async function placeBid(auctionId: string, teamId: string, amount: number) {
  // Acquire lock
  if (bidLocks.get(auctionId)) {
    return { success: false, error: 'Bid in progress' };
  }
  bidLocks.set(auctionId, true);

  try {
    // Critical section - only one bid at a time
    const auction = getAuction(auctionId);
    
    if (amount <= auction.currentBid) {
      return { success: false, error: 'Bid too low' };
    }
    
    // Update atomically
    auction.currentBid = amount;
    auction.currentBidder = teamId;
    
    return { success: true, auction };
  } finally {
    // Always release lock
    bidLocks.delete(auctionId);
  }
}
```

### 7. Optimistic UI Updates

**Purpose**: Instant feedback while waiting for server

```typescript
const mutation = useMutation({
  mutationFn: placeBidAction,
  
  // 1. Immediately update UI (optimistic)
  onMutate: async ({ amount }) => {
    await queryClient.cancelQueries(['auction']);
    const previous = queryClient.getQueryData(['auction']);
    
    // Update cache optimistically
    queryClient.setQueryData(['auction'], {
      ...previous,
      currentBid: amount,
    });
    
    return { previous };
  },
  
  // 2. If server fails, rollback
  onError: (err, variables, context) => {
    queryClient.setQueryData(['auction'], context.previous);
    toast.error('Bid failed');
  },
  
  // 3. If server succeeds, confirm
  onSuccess: (data) => {
    queryClient.setQueryData(['auction'], data);
    toast.success('Bid placed!');
  },
});
```

## File Structure Explained

```
app/
├── api/                    # Route Handlers (REST-like endpoints)
│   └── auction/
│       ├── create/        # POST /api/auction/create
│       └── live/          # GET /api/auction/live (SSE)
│
├── auction/[auctionId]/   # Dynamic route
│   ├── actions.ts         # Server Actions (mutations)
│   ├── live-bids.tsx      # Client Component (UI)
│   └── page.tsx           # Server Component (data fetching)
│
├── dashboard/
│   ├── components/        # Dashboard-specific components
│   ├── loading.tsx        # Loading UI (shown during Suspense)
│   └── page.tsx           # Server Component with PPR
│
├── layout.tsx             # Root layout (Server Component)
├── providers.tsx          # Client Providers (TanStack Query)
└── globals.css            # Global styles

lib/
├── db.ts                  # Mock database (in-memory)
├── types.ts               # TypeScript types
├── validations.ts         # Zod schemas
└── utils.ts               # Helper functions

components/ui/             # Shadcn/UI components (reusable)
```

## Performance Optimizations

### 1. Edge Runtime

```typescript
// app/api/auction/live/route.ts
export const runtime = 'edge';
```

**Benefits**:
- Deployed globally (closer to users)
- Lower latency
- Better for real-time features

### 2. Code Splitting

- Automatic with Server Components
- Client Components are lazy-loaded
- Each route is a separate chunk

### 3. Streaming

- Server Components stream HTML chunks
- Client sees content faster
- No waiting for entire page

### 4. Caching

**Server Component Cache**:
```typescript
// Cached for 60 seconds
export const revalidate = 60;
```

**Server Action Revalidation**:
```typescript
'use server';

export async function action() {
  // Do something
  revalidatePath('/dashboard'); // Refresh cache
}
```

**Client Cache** (TanStack Query):
```typescript
useQuery({
  queryKey: ['auction', id],
  staleTime: 30 * 1000, // Fresh for 30s
});
```

## Security Considerations

### 1. Server Actions Validation

```typescript
import { z } from 'zod';

const schema = z.object({
  auctionId: z.string(),
  amount: z.number().positive(),
});

export async function placeBid(input: unknown) {
  const validated = schema.parse(input); // Throws if invalid
  // ... safe to use
}
```

### 2. Rate Limiting

```typescript
// Implement in middleware or edge function
const rateLimiter = new Map();

export async function middleware(request: NextRequest) {
  const ip = request.ip;
  const requests = rateLimiter.get(ip) || 0;
  
  if (requests > 100) {
    return new Response('Too many requests', { status: 429 });
  }
  
  rateLimiter.set(ip, requests + 1);
}
```

### 3. CSRF Protection

Next.js Server Actions have built-in CSRF protection:
- Uses `X-Action` header
- Verifies origin
- Requires POST method

## Testing Strategy

### Unit Tests

```typescript
// lib/db.test.ts
describe('placeBid', () => {
  it('should prevent race conditions', async () => {
    const promises = [
      placeBid('auction1', 'team1', 10),
      placeBid('auction1', 'team2', 11),
    ];
    
    const results = await Promise.all(promises);
    
    // Only one should succeed
    const successful = results.filter(r => r.success);
    expect(successful).toHaveLength(1);
  });
});
```

### Integration Tests

```typescript
// app/auction/[auctionId]/page.test.tsx
describe('Auction Page', () => {
  it('should display live updates', async () => {
    render(<AuctionPage params={{ auctionId: '123' }} />);
    
    // Simulate SSE event
    fireSSEEvent({ type: 'bid', amount: 15 });
    
    await waitFor(() => {
      expect(screen.getByText('₹15.00Cr')).toBeInTheDocument();
    });
  });
});
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Why Vercel**:
- Built for Next.js
- Edge Runtime support
- Automatic preview deployments
- Free SSL

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in performance metrics
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: APM

### Key Metrics

- **TTFB** (Time to First Byte): < 200ms
- **FCP** (First Contentful Paint): < 1s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1

## Future Enhancements

1. **Database**: Replace in-memory with PostgreSQL + Prisma
2. **Auth**: Add NextAuth.js for team login
3. **WebSockets**: Migrate SSE to WebSockets for bidirectional communication
4. **Redis**: Add Redis for pub/sub and caching
5. **Analytics**: Real-time charts with Recharts
6. **Mobile**: React Native app using same Server Actions
7. **Admin Panel**: Auction management dashboard
8. **Notifications**: Email/SMS alerts for won auctions

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [TanStack Query](https://tanstack.com/query)
- [Zod Documentation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)
