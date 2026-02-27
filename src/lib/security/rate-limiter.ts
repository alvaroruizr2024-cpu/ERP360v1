interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();

  isAllowed(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = this.store.get(ip);

    if (!entry || now > entry.resetTime) {
      this.store.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }

    entry.count++;

    if (entry.count > limit) {
      return false;
    }

    return true;
  }

  getRemaining(ip: string, limit: number = 100): number {
    const entry = this.store.get(ip);
    if (!entry || Date.now() > entry.resetTime) return limit;
    return Math.max(0, limit - entry.count);
  }

  getResetTime(ip: string): number {
    const entry = this.store.get(ip);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }

  reset(ip: string): void {
    this.store.delete(ip);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

export const globalRateLimiter = new RateLimiter();
