// Server-side in-memory rate limiter for all Valsea upstream calls.
// Shared across all route handlers in the same process.

// Global: minimum ms between any two Valsea upstream requests.
const GLOBAL_GAP_MS = 2500;
let lastGlobalMs = 0;

// Per-endpoint submission cooldowns (ms).
const submissionCooldownMs: Record<string, number> = {
  prosody:        14000,
  'voice-security': 22000,
  sentiment:       8000,
};
const lastSubmissionMs: Record<string, number> = {};

// Per-job poll rate limit: same jobId can only hit Valsea once per N ms.
const POLL_GAP_MS = 7000;
const lastPollMs: Record<string, number> = {};

// Completed job result cache — once resolved, never re-fetch.
const resultCache: Record<string, unknown> = {};

/** Call before submitting a new job. Returns false → respond 429 immediately. */
export function checkSubmitCooldown(endpoint: string): boolean {
  const now = Date.now();
  if (now - lastGlobalMs < GLOBAL_GAP_MS) return false;
  const cool = submissionCooldownMs[endpoint] ?? 10000;
  if (now - (lastSubmissionMs[endpoint] ?? 0) < cool) return false;
  lastGlobalMs = now;
  lastSubmissionMs[endpoint] = now;
  return true;
}

/** Call before polling a job. Returns false → respond 429 immediately. */
export function checkPollCooldown(jobId: string): boolean {
  const now = Date.now();
  if (now - lastGlobalMs < GLOBAL_GAP_MS) return false;
  if (now - (lastPollMs[jobId] ?? 0) < POLL_GAP_MS) return false;
  lastGlobalMs = now;
  lastPollMs[jobId] = now;
  return true;
}

/** Returns cached result for a completed job, or null if not cached yet. */
export function getCachedResult(jobId: string): unknown | null {
  return resultCache[jobId] ?? null;
}

/** Cache a completed job result so subsequent polls skip upstream. */
export function cacheResult(jobId: string, data: unknown): void {
  resultCache[jobId] = data;
}
