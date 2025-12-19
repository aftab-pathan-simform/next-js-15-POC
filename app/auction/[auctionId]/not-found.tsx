import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Plus } from 'lucide-react';

export default function AuctionNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto border-yellow-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <CardTitle className="text-2xl">Auction Not Found</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-lg">
              The auction you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <p className="text-muted-foreground">
              This might happen because:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>The auction ID is incorrect</li>
              <li>The auction was created in development mode (in-memory database)</li>
              <li>The server restarted and cleared temporary data</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button size="lg" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create New Auction
              </Button>
            </Link>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note for Production:</strong> This demo uses an in-memory database. 
              For production, consider migrating to PostgreSQL or MongoDB for persistent storage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
