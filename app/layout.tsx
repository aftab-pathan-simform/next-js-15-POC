// Root layout - Server Component
// This is the main layout wrapper for the entire application

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IPL Auction Platform',
  description: 'Production-grade Next.js 15 IPL Auction Bidding Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {/* Navigation */}
          <nav className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
                  <Trophy className="h-6 w-6 text-primary" />
                  IPL Auction Platform
                </Link>
                
                <div className="flex gap-6">
                  <Link 
                    href="/dashboard" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/teams" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Teams
                  </Link>
                  <Link 
                    href="/players" 
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Players
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="min-h-screen">{children}</main>

          {/* Toast notifications for real-time updates */}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
