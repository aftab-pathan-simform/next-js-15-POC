# Installation & Setup

Complete installation guide for the IPL Auction Bid Platform.

## System Requirements

### Minimum Requirements
- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher (comes with Node.js)
- **RAM**: 4GB minimum
- **Disk Space**: 500MB for dependencies
- **OS**: Windows, macOS, or Linux

### Recommended
- **Node.js**: 20.11.0+ (LTS)
- **npm**: 10.2.0+
- **RAM**: 8GB+
- **Modern browser**: Chrome, Firefox, Safari, Edge (latest)

### Check Your Version

```bash
node --version  # Should show v20.0.0 or higher
npm --version   # Should show 10.0.0 or higher
```

If you need to install or update Node.js:
- Download from [nodejs.org](https://nodejs.org)
- Or use [nvm](https://github.com/nvm-sh/nvm) (recommended)

## Installation Methods

### Method 1: Fresh Install (Recommended)

```bash
# Navigate to project directory
cd /home/aftab/Desktop/nextjs-demo

# Install all dependencies
npm install

# This will install:
# - Next.js 15
# - React 19
# - TypeScript
# - TanStack Query
# - Zod
# - Tailwind CSS
# - Shadcn/UI components
# - And all other dependencies
```

**Expected output:**
```
added 345 packages in 45s
```

### Method 2: Clean Install

If you encounter issues:

```bash
# Remove existing modules and lock file
rm -rf node_modules package-lock.json

# Clean npm cache
npm cache clean --force

# Reinstall
npm install
```

### Method 3: Using Yarn

Prefer Yarn? Use this instead:

```bash
# Install Yarn if not present
npm install -g yarn

# Install dependencies
yarn install
```

## Post-Installation Setup

### 1. Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local  # or use your preferred editor
```

**Minimum required**:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_REALTIME=true
```

### 2. Verify Installation

```bash
# Check if Next.js is installed correctly
npx next --version

# Expected: 15.0.0 or higher
```

### 3. TypeScript Setup

TypeScript configuration is already included. Verify:

```bash
# Check TypeScript version
npx tsc --version

# Expected: 5.6.0 or higher
```

## Running the Application

### Development Mode

```bash
npm run dev
```

**What happens:**
- Development server starts on port 3000
- Hot reload enabled
- Source maps enabled for debugging
- Detailed error messages
- React DevTools compatible

**Access at:** http://localhost:3000

**You should see:**
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.5s
```

### Production Build

```bash
# Build for production
npm run build

# Expected output:
#   Route (app)                Size
#   ┌ ○ /                      ...
#   ├ ○ /dashboard             ...
#   └ ○ /teams                 ...

# Start production server
npm start
```

### Port Configuration

Using a different port:

```bash
# Development
npm run dev -- -p 3001

# Production
PORT=3001 npm start
```

## Verification Checklist

After installation, verify:

### ✅ Basic Functionality
- [ ] Navigate to http://localhost:3000
- [ ] See "IPL Auction Platform" header
- [ ] No console errors
- [ ] Page loads in < 3 seconds

### ✅ Dashboard
- [ ] Navigate to /dashboard
- [ ] See metrics cards
- [ ] See "Start New Auction" button
- [ ] Activity feed loads

### ✅ Create Auction
- [ ] Click "Start Auction"
- [ ] Select a player
- [ ] Click "Create Auction"
- [ ] Redirected to auction page

### ✅ Live Auction
- [ ] See player profile
- [ ] See current bid
- [ ] See timer counting down
- [ ] Select a team
- [ ] Place a bid (amount higher than current)
- [ ] See toast notification
- [ ] Bid appears in history

### ✅ Real-time Updates
- [ ] Open auction in two tabs
- [ ] Place bid in tab 1
- [ ] See update in tab 2 automatically
- [ ] Timer syncs between tabs

### ✅ Teams & Players
- [ ] Navigate to /teams
- [ ] See 10 teams
- [ ] See purse information
- [ ] Navigate to /players
- [ ] See 100 players
- [ ] Filter by status works

## Troubleshooting

### Issue: `npm install` fails

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Use legacy peer deps
npm install --legacy-peer-deps
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
npm run dev -- -p 3001
```

### Issue: TypeScript errors on first run

**Solution:**
These are expected before `npm install`. Run:
```bash
npm install
```

All TypeScript errors should disappear.

### Issue: Module not found errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Hot reload not working

**Solution:**
```bash
# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

### Issue: Build fails

**Solution:**
```bash
# Clean build cache
rm -rf .next

# Try again
npm run build
```

### Issue: SSE (real-time) not working

**Checklist:**
- [ ] Dev server running?
- [ ] Browser DevTools → Network → See "live" request?
- [ ] Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- [ ] Try different browser
- [ ] Check console for errors

**Still not working?**
```bash
# Restart server completely
# Stop with Ctrl+C
# Start again
npm run dev
```

## Development Tools Setup

### VS Code Extensions (Recommended)

Install these for better DX:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Performance Optimization

### Development

```bash
# Faster installs with pnpm (optional)
npm install -g pnpm
pnpm install

# Use SWC instead of Babel (already configured)
# Next.js 15 uses SWC by default
```

### Production

```bash
# Analyze bundle size
npm run build

# Look for route sizes in output
# Optimize large routes
```

## Database Setup (Optional)

The app uses in-memory database by default. To migrate to PostgreSQL:

### 1. Install Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

### 2. Initialize

```bash
npx prisma init
```

### 3. Configure

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ipl_auction"
```

### 4. Migrate

```bash
npx prisma migrate dev --name init
npx prisma generate
```

See [DEPLOYMENT.md](DEPLOYMENT.md#database-migration) for complete guide.

## Docker Setup (Optional)

### Build Image

```bash
docker build -t ipl-auction .
```

### Run Container

```bash
docker run -p 3000:3000 ipl-auction
```

### Docker Compose

```bash
docker-compose up -d
```

## Next Steps

After successful installation:

1. **Explore the app**: [QUICKSTART.md](QUICKSTART.md)
2. **Understand architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Deploy**: [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Contribute**: [CONTRIBUTING.md](CONTRIBUTING.md)

## Scripts Reference

All available npm scripts:

```json
{
  "dev": "next dev",              // Start development server
  "build": "next build",          // Build for production
  "start": "next start",          // Start production server
  "lint": "next lint",            // Run ESLint
  "format": "prettier --write"    // Format code with Prettier
}
```

## Support

Need help?

- **Documentation**: See [INDEX.md](INDEX.md) for all guides
- **Issues**: Check error messages carefully
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Community**: [GitHub Discussions](https://github.com/vercel/next.js/discussions)

---

**✅ Installation Complete!**

Run `npm run dev` and navigate to http://localhost:3000 to start exploring.
