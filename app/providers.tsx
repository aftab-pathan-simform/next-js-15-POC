// Providers for client-side state management
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  // Create QueryClient inside component to ensure one instance per request
  // This is important for Next.js 15 Server Components architecture
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for better UX in auction scenarios
            refetchOnWindowFocus: false,
            // Keep data fresh for 30 seconds
            staleTime: 30 * 1000,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
