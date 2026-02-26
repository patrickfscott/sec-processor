/**
 * Token-bucket rate limiter for SEC EDGAR API compliance.
 * Max 10 requests per second as per SEC fair access policy.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per ms
  private queue: Array<{ resolve: () => void }> = [];
  private draining = false;

  constructor(maxRequestsPerSecond: number = 10) {
    this.maxTokens = maxRequestsPerSecond;
    this.tokens = maxRequestsPerSecond;
    this.refillRate = maxRequestsPerSecond / 1000;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  private async drainQueue(): Promise<void> {
    if (this.draining) return;
    this.draining = true;

    while (this.queue.length > 0) {
      this.refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        const next = this.queue.shift();
        next?.resolve();
      } else {
        // Wait until we have at least one token
        const waitMs = Math.ceil((1 - this.tokens) / this.refillRate);
        await new Promise<void>((r) => setTimeout(r, waitMs));
      }
    }

    this.draining = false;
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push({ resolve });
      this.drainQueue();
    });
  }
}

/** Singleton rate limiter for all SEC API calls */
export const secRateLimiter = new RateLimiter(10);
