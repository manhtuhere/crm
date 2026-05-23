'use client';

import { useCountUp } from '@/hooks/useCountUp';

type AnimatedPercentProps = {
  value: number;
  className?: string;
};

/** Renders a 0–100 integer % with count-up when value changes. */
export function AnimatedPercent({ value, className = '' }: AnimatedPercentProps) {
  const pct = Math.round(Math.min(100, Math.max(0, value * 100)));
  const display = useCountUp(pct);

  return (
    <span className={`tabular-nums ${className}`}>
      {display}%
    </span>
  );
}
