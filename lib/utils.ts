// Utility functions for the application

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * Used by Shadcn/UI components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Crores
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}Cr`;
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Delay for async operations (useful for streaming demos)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random delay for simulating slow data fetching
 */
export function randomDelay(min: number = 100, max: number = 500): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}
