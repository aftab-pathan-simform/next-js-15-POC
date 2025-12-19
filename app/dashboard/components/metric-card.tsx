// Dashboard Metric Card - Server Component
// Demonstrates Server Components for data fetching
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { randomDelay } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  delay?: number;
}

export async function MetricCard({ title, value, description, icon: Icon, delay = 0 }: MetricCardProps) {
  // Simulate slow data fetching to demonstrate Streaming
  // In production, this would be a real database call
  if (delay > 0) {
    await randomDelay(delay, delay + 200);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}
