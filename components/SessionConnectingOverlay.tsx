'use client';

import Image from 'next/image';
import { Phone, PhoneCall } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type CallPhase = 'idle' | 'ringing' | 'countdown' | 'connected';

type SessionConnectingOverlayProps = {
  visible: boolean;
  /** When true, plays 3 → 2 → 1 → Call connected, then calls onFinished */
  signalReady?: boolean;
  onFinished?: () => void;
};

const COUNTDOWN_MS = 720;
const CONNECTED_MS = 900;
const MIN_RING_MS = 550;

export function SessionConnectingOverlay({
  visible,
  signalReady = false,
  onFinished,
}: SessionConnectingOverlayProps) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<CallPhase>('idle');
  const [count, setCount] = useState(3);
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
      setCount(3);
      finishedRef.current = false;
      return;
    }
    finishedRef.current = false;
    setPhase('ringing');
    setCount(3);
  }, [visible]);

  useEffect(() => {
    if (!visible || !signalReady || phase === 'idle') return;

    if (reduced) {
      setPhase('connected');
      const t = setTimeout(finishSequence, CONNECTED_MS * 0.5);
      return () => clearTimeout(t);
    }

    if (phase !== 'ringing') return;

    const ringDelay = window.setTimeout(() => {
      setPhase('countdown');
      setCount(3);
    }, MIN_RING_MS);

    return () => clearTimeout(ringDelay);
  }, [visible, signalReady, phase, reduced, finishSequence]);

  useEffect(() => {
    if (phase !== 'countdown') return;

    if (count > 1) {
      const t = window.setTimeout(() => setCount((c) => c - 1), COUNTDOWN_MS);
      return () => clearTimeout(t);
    }

    const t = window.setTimeout(() => setPhase('connected'), COUNTDOWN_MS);
    return () => clearTimeout(t);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== 'connected') return;
    const t = window.setTimeout(finishSequence, CONNECTED_MS);
    return () => clearTimeout(t);
  }, [phase, finishSequence]);

  if (!visible || phase === 'idle') return null;

  const statusLabel =
    phase === 'ringing'
      ? 'Placing your call…'
      : phase === 'countdown'
        ? 'Connecting'
        : 'Call connected';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl animate-fade-up"
      role="alert"
      aria-busy={phase !== 'connected'}
      aria-live="polite"
    >
      <div className="relative mx-6 flex w-full max-w-xs flex-col items-center gap-8 text-center">
        {/* Ringing pulses */}
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

        {/* Countdown or status copy */}
        <div className="space-y-2 min-h-[5.5rem] flex flex-col items-center justify-center">
          {phase === 'countdown' ? (
            <p
              key={count}
              className="vs-call-count font-display text-7xl font-bold tabular-nums text-white vs-call-count-pop"
              aria-live="assertive"
            >
              {count}
            </p>
          ) : phase === 'connected' ? (
            <p className="vs-heading text-2xl font-semibold text-emerald-300 vs-call-count-pop">
              Call connected
            </p>
          ) : (
            <p className="vs-heading text-xl font-semibold text-white">
              {statusLabel}
            </p>
          )}

          <p className="text-sm text-white/55 flex items-center justify-center gap-2">
            {phase === 'ringing' && (
              <Phone className="h-3.5 w-3.5 animate-pulse opacity-70" aria-hidden />
            )}
            <span>
              {phase === 'ringing'
                ? 'Contact center queue · please wait'
                : phase === 'countdown'
                  ? 'Establishing secure voice link'
                  : 'Agent on the line'}
            </span>
          </p>
        </div>

        {/* Subtle audio-wave bars while ringing / countdown */}
        {(phase === 'ringing' || phase === 'countdown') && (
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
