# Deployment Guide

This guide covers deploying the IPL Auction Platform to production.

## Vercel Deployment (Recommended)

### Prerequisites

- GitHub account
- Vercel account ([Sign up free](https://vercel.com/signup))

### Method 1: GitHub Integration (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/ipl-auction.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Click "Deploy"
   - Done! ✅

**Benefits**:
- Automatic deployments on push
- Preview deployments for PRs
- Free SSL certificate
- Global CDN

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

In Vercel dashboard, add:

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_ENABLE_REALTIME=true
```

## Docker Deployment

### Build Image

```bash
docker build -t ipl-auction .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  ipl-auction
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

## Manual Deployment (VPS/Cloud)

### Prerequisites

- Node.js 20+ installed
- PM2 for process management

### Setup

```bash
# Clone repository
git clone https://github.com/your-username/ipl-auction.git
cd ipl-auction

# Install dependencies
npm ci --production

# Build
npm run build

# Install PM2
npm i -g pm2

# Start with PM2
pm2 start npm --name "ipl-auction" -- start

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # For Server-Sent Events
        proxy_buffering off;
        proxy_read_timeout 24h;
    }
}
```

## Database Migration (Production)

### From In-Memory to PostgreSQL

1. **Install Prisma**
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2. **Initialize Prisma**
   ```bash
   npx prisma init
   ```

3. **Create Schema** (`prisma/schema.prisma`):
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   model Team {
     id              String   @id
     name            String
     shortName       String
     logo            String
     totalPurse      Float
     remainingPurse  Float
     maxPlayers      Int
     players         Player[]
     bids            Bid[]
   }

   model Player {
     id          String   @id
     name        String
     role        String
     basePrice   Float
     status      String
     soldPrice   Float?
     nationality String
     age         Int
     avatar      String
     team        Team?    @relation(fields: [teamId], references: [id])
     teamId      String?
     auctions    Auction[]
   }

   model Auction {
     id             String   @id
     playerId       String
     player         Player   @relation(fields: [playerId], references: [id])
     currentBid     Float
     currentBidder  String?
     status         String
     startTime      DateTime
     endTime        DateTime?
     timerDuration  Int
     bids           Bid[]
   }

   model Bid {
     id         String   @id
     auctionId  String
     auction    Auction  @relation(fields: [auctionId], references: [id])
     playerId   String
     teamId     String
     team       Team     @relation(fields: [teamId], references: [id])
     teamName   String
     amount     Float
     timestamp  DateTime
   }
   ```

4. **Migrate Database**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Update `lib/db.ts`** to use Prisma instead of in-memory

## Performance Optimization

### Enable Caching

In `next.config.ts`:

```typescript
const nextConfig = {
  experimental: {
    ppr: 'incremental',
  },
  
  // Cache headers for static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### Enable Compression

Vercel and most hosting platforms enable gzip/brotli automatically.

For manual deployment:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();
  
  response.headers.set('Content-Encoding', 'gzip');
  
  return response;
}
```

## Monitoring Setup

### Vercel Analytics

1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Web Analytics (free)
3. Automatically tracks Core Web Vitals

### Sentry Error Tracking

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

In `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

## Security Checklist

- [ ] Environment variables set in production
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Rate limiting configured
- [ ] CORS headers set appropriately
- [ ] CSP headers configured
- [ ] No sensitive data in client code
- [ ] API routes protected
- [ ] Input validation with Zod

## Rollback Strategy

### Vercel

Automatic rollback from dashboard:
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Manual Deployment

```bash
# Tag current version
git tag -a v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# Rollback to previous version
git checkout v0.9.0
npm run build
pm2 restart ipl-auction
```

## Scaling Considerations

### Horizontal Scaling

With Vercel, automatic scaling is included.

For manual deployment:
- Use load balancer (Nginx, HAProxy)
- Multiple app instances with PM2 cluster mode
- Shared session store (Redis)

### Database Scaling

- Connection pooling (Prisma)
- Read replicas for heavy reads
- Caching layer (Redis)

## Cost Estimation

### Vercel Free Tier

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Global CDN

Upgrade if you need:
- More bandwidth
- Team collaboration
- Advanced analytics

### Self-Hosted (1000 users)

- VPS: $5-10/month (DigitalOcean, Linode)
- Database: $15/month (Managed PostgreSQL)
- CDN: Optional, $5-20/month
- **Total**: ~$25-45/month

## Support & Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache
rm -rf .next
npm run build
```

**SSE Not Working**
- Check if hosting supports HTTP/2
- Ensure no buffering in proxy
- Test locally first

**Slow Response**
- Enable Vercel Analytics
- Check database query performance
- Add caching layer

### Getting Help

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)
- [GitHub Issues](https://github.com/vercel/next.js/issues)

---

**Ready to Deploy? Choose your platform above and follow the steps!**
