// lib/timing.ts

/**
 * Calculates the exact delay in milliseconds from now until a scheduled date string.
 * @param scheduledAt ISO String or Date representation of target time
 * @param userTimezone Optional IANA timezone string (e.g. 'Asia/Dhaka')
 */
export function calculateDelayMs(scheduledAt: string | Date, userTimezone?: string): number {
  const targetDate = new Date(scheduledAt);
  const now = new Date();

  const delayMs = targetDate.getTime() - now.getTime();

  // If the target time is in the past or current second, return 0 for immediate execution
  return Math.max(0, delayMs);
}

/**
 * Validates whether a given timestamp is in the future.
 */
export function isFutureTime(scheduledAt: string | Date): boolean {
  return new Date(scheduledAt).getTime() > Date.now();
}