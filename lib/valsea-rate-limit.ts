// Server-side in-memory rate limiter for all Valsea upstream calls.
// Valsea allows 20 req/min — we cap at 18 to leave headroom for clock skew
// and any out-of-band calls. Sliding window auto-clears, so dev-mode page
// reloads don't inherit stale cooldowns.

const BUDGET_PER_MIN = 18;
const WINDOW_MS = 60_000;
const upstreamCalls: number[] = [];

function tryTakeToken(): boolean {
  const now = Date.now();
  while (upstreamCalls.length && upstreamCalls[0] <= now - WINDOW_MS) {
    upstreamCalls.shift();
  }
  if (upstreamCalls.length >= BUDGET_PER_MIN) return false;
  upstreamCalls.push(now);
  return true;
}

// Completed job result cache — once resolved, never re-fetch.
const resultCache: Record<string, unknown> = {};

/** Call before submitting a new job. Returns false → respond 429 immediately. */
export function checkSubmitCooldown(_endpoint: string): boolean {
  return tryTakeToken();
}

/** Call before polling a job. Returns false → respond 429 immediately. */
export function checkPollCooldown(_jobId: string): boolean {
  return tryTakeToken();
}

/** Returns cached result for a completed job, or null if not cached yet. */
export function getCachedResult(jobId: string): unknown | null {
  return resultCache[jobId] ?? null;
}

/** Cache a completed job result so subsequent polls skip upstream. */
export function cacheResult(jobId: string, data: unknown): void {
  resultCache[jobId] = data;
}
