'use client';

import Image from 'next/image';
import { Phone, PhoneCall } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { getUiCopy } from '@/lib/ui-copy';

type CallPhase = 'idle' | 'ringing' | 'connected';

type SessionConnectingOverlayProps = {
  visible: boolean;
  /** When true, shows call connected then calls onFinished */
  signalReady?: boolean;
  onFinished?: () => void;
  lang?: string;
};

const CONNECTED_MS = 800;
const MIN_RING_MS = 400;

export function SessionConnectingOverlay({
  visible,
  signalReady = false,
  onFinished,
  lang = 'en',
}: SessionConnectingOverlayProps) {
  const reduced = usePrefersReducedMotion();
  const c = getUiCopy(lang).callOverlay;
  const [phase, setPhase] = useState<CallPhase>('idle');
  const finishedRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const finishSequence = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinishedRef.current?.();
  }, []);

  useEffect(() => {
    if (!visible) {
      setPhase('idle');
      finishedRef.current = false;
      return;
    }
    finishedRef.current = false;
    setPhase('ringing');
  }, [visible]);

  useEffect(() => {
    if (!visible || !signalReady || phase === 'idle') return;

    if (reduced) {
      setPhase('connected');
      const t = setTimeout(finishSequence, CONNECTED_MS * 0.5);
      return () => clearTimeout(t);
    }

    if (phase !== 'ringing') return;

    const t = window.setTimeout(() => setPhase('connected'), MIN_RING_MS);
    return () => clearTimeout(t);
  }, [visible, signalReady, phase, reduced, finishSequence]);

  useEffect(() => {
    if (phase !== 'connected') return;
    const t = window.setTimeout(finishSequence, CONNECTED_MS);
    return () => clearTimeout(t);
  }, [phase, finishSequence]);

  if (!visible || phase === 'idle') return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl animate-fade-up"
      role="alert"
      aria-busy={phase !== 'connected'}
      aria-live="polite"
    >
      <div className="relative mx-6 flex w-full max-w-xs flex-col items-center gap-8 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          {phase === 'ringing' && (
            <>
              <span className="vs-call-ring vs-call-ring--1" aria-hidden />
              <span className="vs-call-ring vs-call-ring--2" aria-hidden />
              <span className="vs-call-ring vs-call-ring--3" aria-hidden />
            </>
          )}
          {phase === 'connected' && (
            <span
              className="absolute inset-0 rounded-full bg-emerald-500/20 animate-vs-call-connected-pulse"
              aria-hidden
            />
          )}

          <div
            className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-vs-lg transition-all duration-500 ease-vs-out ${
              phase === 'connected'
                ? 'border-emerald-400/60 bg-emerald-500/15 scale-105'
                : 'border-vs-brand/50 bg-vs-card'
            }`}
          >
            {phase === 'connected' ? (
              <PhoneCall className="h-9 w-9 text-emerald-400" aria-hidden />
            ) : (
              <Image
                src="/valsea-logo.png"
                alt=""
                width={48}
                height={48}
                className="rounded-xl"
              />
            )}
          </div>
        </div>

        <div className="space-y-2 min-h-[4rem] flex flex-col items-center justify-center">
          {phase === 'connected' ? (
            <p className="vs-heading text-2xl font-semibold text-emerald-300 vs-call-count-pop">
              {c.connected}
            </p>
          ) : (
            <p className="vs-heading text-xl font-semibold text-white">{c.placing}</p>
          )}

          <p className="text-sm text-white/55 flex items-center justify-center gap-2">
            {phase === 'ringing' && (
              <Phone className="h-3.5 w-3.5 animate-pulse opacity-70" aria-hidden />
            )}
            <span>{phase === 'ringing' ? c.queueHint : c.onLineHint}</span>
          </p>
        </div>

        {phase === 'ringing' && (
          <div
            className="flex items-end justify-center gap-1 h-8"
            aria-hidden
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-vs-brand/70 vs-call-bar"
                style={{ animationDelay: `${i * 90}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
