import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // PPR is disabled - requires Next.js canary version
  // For stable Next.js 15, we use standard Server Components and Suspense
  // experimental: {
  //   ppr: 'incremental',
  // },
  
  // Strict React mode for better error detection
  reactStrictMode: true,
  
  // TypeScript strict mode configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint during builds
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
