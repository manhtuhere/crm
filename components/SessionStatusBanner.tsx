'use client';

import { AlertTriangle, Loader2, MicOff, Phone, WifiOff } from 'lucide-react';

export type SessionStatusVariant =
  | 'connecting-agent'
  | 'waiting-rtc'
  | 'mic-blocked'
  | 'agent-slow'
  | 'network'
  | 'agent-failed';

type SessionStatusBannerProps = {
  variant: SessionStatusVariant;
  title: string;
  detail: string;
};

const ICONS: Record<SessionStatusVariant, typeof Phone> = {
  'connecting-agent': Phone,
  'waiting-rtc': Loader2,
  'mic-blocked': MicOff,
  'agent-slow': Loader2,
  network: WifiOff,
  'agent-failed': AlertTriangle,
};

export function SessionStatusBanner({
  variant,
  title,
  detail,
}: SessionStatusBannerProps) {
  const Icon = ICONS[variant];
  const spin = variant === 'connecting-agent' || variant === 'waiting-rtc' || variant === 'agent-slow';

  return (
    <div
      role="status"
      className="relative z-30 mx-4 mt-2 shrink-0 rounded-xl border border-vs-brand/25 bg-vs-brand-acc/90 px-4 py-3 shadow-vs-sm backdrop-blur-md animate-fade-up flex gap-3 items-start"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-vs-card border border-vs-border-md text-vs-brand-text">
        <Icon className={`h-4 w-4 ${spin ? 'animate-spin' : ''}`} aria-hidden />
      </span>
      <div className="min-w-0 text-left">
        <p className="text-sm font-semibold text-vs-fg leading-snug">{title}</p>
        <p className="text-xs text-vs-fg-muted mt-0.5 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
