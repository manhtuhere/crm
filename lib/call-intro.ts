const CALL_INTRO_KEY = 'valsea-call-intro-at';

/** Set after landing 3-2-1 sequence so in-call UI does not repeat it. */
export function markCallIntroCompleted(): void {
  try {
    sessionStorage.setItem(CALL_INTRO_KEY, String(Date.now()));
  } catch {
    /* private mode / blocked storage */
  }
}

export function wasCallIntroRecentlyCompleted(maxAgeMs = 90_000): boolean {
  try {
    const raw = sessionStorage.getItem(CALL_INTRO_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < maxAgeMs;
  } catch {
    return false;
  }
}
