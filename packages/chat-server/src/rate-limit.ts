/** Classic token bucket: allows bursts of `capacity`, refilling `perSecond` tokens each second. */
export class TokenBucket {
  private readonly capacity: number;
  private readonly perSecond: number;
  private tokens: number;
  private updatedAt = Date.now();

  constructor(capacity: number, perSecond: number) {
    this.capacity = capacity;
    this.perSecond = perSecond;
    this.tokens = capacity;
  }

  take(now = Date.now()): boolean {
    const elapsed = (now - this.updatedAt) / 1000;
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsed * this.perSecond,
    );
    this.updatedAt = now;
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }
}
