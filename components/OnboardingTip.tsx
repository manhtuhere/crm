'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'valsea-onboarding-dismissed';

type OnboardingTipProps = {
  message: string;
};

export function OnboardingTip({ message }: OnboardingTipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  if (!visible) return null;

  return (
    <div className="animate-fade-up w-full rounded-xl border border-vs-brand/25 bg-vs-brand-acc/80 px-3.5 py-3 flex gap-3 items-start shadow-vs-sm">
      <Sparkles className="w-4 h-4 text-vs-brand shrink-0 mt-0.5" aria-hidden />
      <p className="text-xs text-vs-fg-muted leading-relaxed flex-1">{message}</p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 p-1 rounded-md text-vs-fg-dim hover:text-vs-fg hover:bg-vs-surface transition-colors"
        aria-label="Dismiss tip"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
