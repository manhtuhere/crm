/** Light haptic feedback on supported mobile browsers. */
export function hapticTap(pattern: number | number[] = 12): void {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}
