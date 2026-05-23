'use client';

import Image from 'next/image';
import { Check, Loader2 } from 'lucide-react';

export type ConnectStep = {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done';
};

type SessionConnectingOverlayProps = {
  visible: boolean;
  title?: string;
  steps: ConnectStep[];
};

export function SessionConnectingOverlay({
  visible,
  title = 'Preparing your session',
  steps,
}: SessionConnectingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-vs-page/85 backdrop-blur-md animate-fade-up"
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="vs-glass-card relative mx-6 w-full max-w-sm rounded-2xl p-6 flex flex-col items-center gap-6 shadow-vs-lg">
        <div className="relative">
          <div
            className="absolute -inset-4 rounded-full opacity-60 animate-vs-glow-pulse"
            style={{
              background:
                'radial-gradient(circle, rgba(122,86,170,0.4) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />
          <Image
            src="/valsea-logo.png"
            alt=""
            width={56}
            height={56}
            className="relative rounded-xl ring-1 ring-vs-border-md"
          />
        </div>

        <div className="text-center space-y-1">
          <p className="vs-heading text-lg font-semibold">{title}</p>
          <p className="text-xs text-vs-fg-muted">This usually takes a few seconds</p>
        </div>

        <ol className="w-full space-y-2.5">
          {steps.map((step) => (
            <li
              key={step.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ease-vs-out border ${
                step.status === 'active'
                  ? 'border-vs-brand/40 bg-vs-brand-acc'
                  : step.status === 'done'
                    ? 'border-vs-border-md bg-vs-surface/60'
                    : 'border-transparent bg-transparent text-vs-fg-dim'
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                {step.status === 'done' ? (
                  <Check className="h-4 w-4 text-emerald-500" aria-hidden />
                ) : step.status === 'active' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-vs-brand" aria-hidden />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-vs-border-md" aria-hidden />
                )}
              </span>
              <span
                className={
                  step.status === 'active'
                    ? 'font-medium text-vs-fg'
                    : step.status === 'done'
                      ? 'text-vs-fg-muted'
                      : 'text-vs-fg-dim'
                }
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
