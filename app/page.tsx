// Home page - Landing page with demo auction link
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, Users, Zap } from 'lucide-react';
import { getLiveAuctions } from '@/lib/db';

export default function HomePage() {
  const liveAuctions = getLiveAuctions();
  const demoAuction = liveAuctions[0]; // Get the auto-created demo auction

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Trophy className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">
            IPL Auction Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A Next.js 15 demonstration featuring Server Components, Server Actions, 
            Real-time SSE, and modern React patterns
          </p>
        </div>

        {/* Demo Auction Card */}
        {demoAuction && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Live Demo Auction
              </CardTitle>
              <CardDescription>
                Jump into a live auction featuring {demoAuction.player.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Player</p>
                  <p className="text-lg font-semibold">{demoAuction.player.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current Bid: ₹{demoAuction.currentBid} Cr
                  </p>
                </div>
                <Link href={`/auction/${demoAuction.id}`}>
                  <Button size="lg">
                    Join Live Auction
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Real-Time Bidding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Experience live updates using Server-Sent Events (SSE) with automatic synchronization across all viewers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">10 IPL Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage team purses, track player acquisitions, and compete in auctions with ₹100 Cr budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">100 Players</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Browse comprehensive player database with roles, base prices, and live auction status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/dashboard">
            <Button size="lg" variant="default">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/teams">
            <Button size="lg" variant="outline">
              View Teams
            </Button>
          </Link>
          <Link href="/players">
            <Button size="lg" variant="outline">
              View Players
            </Button>
          </Link>
        </div>

        {/* Tech Stack Note */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-center text-muted-foreground">
              Built with <strong>Next.js 15</strong>, <strong>React 19</strong>, 
              <strong> Server Components</strong>, <strong>Server Actions</strong>, 
              and <strong>Edge Runtime</strong> • View on{' '}
              <a href="https://github.com" className="text-primary hover:underline">
                GitHub
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

