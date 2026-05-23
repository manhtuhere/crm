'use client';

import { useEffect, useRef, useState } from 'react';
import { BarChart2, Waves, ShieldCheck, Lightbulb } from 'lucide-react';
import { AnimatedPercent } from './AnimatedPercent';
import { RevealBadge } from './RevealBadge';

export type ProsodyData = {
  frustration: number;
  stress: number;
  politeness: number;
  hesitation: number;
  urgency: number;
};

export type SentimentData = {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  reasoning?: string;
  emotions?: string[];
};

export type VoiceSecurityData = {
  synthetic_probability: number;
  behavioral_risk: number;
  liveness_status: 'verified' | 'scanning' | 'failed';
};

export type IntentData = {
  intent: string;
  confidence: number;
  entities: { type: string; value: string }[];
  action_suggestion: string;
  tags: string[];
};

interface AnalysisPanelProps {
  prosody: ProsodyData | null;
  sentiment: SentimentData | null;
  voiceSecurity: VoiceSecurityData | null;
  intent: IntentData | null;
  isProsodyLoading: boolean;
  isSentimentLoading: boolean;
  isVoiceSecurityLoading: boolean;
  isIntentLoading: boolean;
  isProsodyUnavailable?: boolean;
  isSentimentUnavailable?: boolean;
  isVoiceSecurityUnavailable?: boolean;
  isIntentUnavailable?: boolean;
}

const PROSODY_METRICS: { key: keyof ProsodyData; color: string }[] = [
  { key: 'frustration', color: '#ef4444' },
  { key: 'stress',      color: '#f97316' },
  { key: 'politeness',  color: '#4ade80' },
  { key: 'hesitation',  color: '#a78bfa' },
  { key: 'urgency',     color: '#22d3ee' },
];

const SENTIMENT_CLASS: Record<string, string> = {
  positive: 'vs-sentiment-positive',
  neutral: 'vs-sentiment-neutral',
  negative: 'vs-sentiment-negative',
};

const LIVENESS_STYLE: Record<string, { badge: string; label: string }> = {
  verified: { badge: 'vs-sentiment-positive', label: 'Verified Human' },
  scanning: { badge: 'vs-sentiment-neutral', label: 'Scanning…' },
  failed:   { badge: 'vs-sentiment-negative', label: 'Synthetic Suspect' },
};

function PanelShell({
  title,
  icon,
  children,
  revealIndex,
  insightPulse,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  revealIndex: number;
  insightPulse?: boolean;
}) {
  return (
    <div
      className={`group rounded-2xl p-4 flex flex-col gap-3 bg-vs-surface/90 border border-vs-border-md shadow-vs-sm transition-all duration-300 ease-vs-out hover:shadow-vs-md hover:border-vs-brand/25 vs-panel-reveal ${
        insightPulse ? 'vs-insight-pulse' : ''
      }`}
      style={{ animationDelay: `${revealIndex * 70}ms` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-sm font-semibold tracking-tight text-vs-fg">{title}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-vs-brand-acc text-vs-brand-text opacity-80 transition-opacity group-hover:opacity-100">
          {icon}
        </span>
      </div>
      {children}
    </div>
  );
}

function MetricLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="vs-label w-20 shrink-0 truncate normal-case tracking-normal text-[0.65rem]">
      {children}
    </span>
  );
}

function ScoreBar({
  value,
  color,
  pulseKey,
  staggerIndex = 0,
}: {
  value: number;
  color: string;
  pulseKey?: number;
  staggerIndex?: number;
}) {
  const pct = Math.round(value * 100);
  return (
    <div
      className="flex items-center gap-3 flex-1 min-w-0 vs-stagger-in"
      style={{ animationDelay: `${staggerIndex * 45}ms` }}
    >
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--vs-bar-track)]">
        <div
          key={pulseKey ?? pct}
          className="h-full rounded-full transition-all duration-700 ease-vs-out vs-score-pop"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}99, ${color})`,
          }}
        />
      </div>
      <AnimatedPercent
        value={value}
        className="text-xs font-semibold w-9 text-right text-vs-fg-muted"
      />
    </div>
  );
}

function EmptyState({ label, loading }: { label: string; loading?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center h-16 text-xs rounded-xl border border-dashed border-vs-border ${
        loading ? 'vs-panel-shimmer text-vs-fg-muted' : 'text-vs-fg-dim'
      }`}
    >
      {label}
    </div>
  );
}

export function AnalysisPanel({
  prosody,
  sentiment,
  voiceSecurity,
  intent,
  isProsodyLoading,
  isSentimentLoading,
  isVoiceSecurityLoading,
  isIntentLoading,
  isProsodyUnavailable,
  isSentimentUnavailable,
  isVoiceSecurityUnavailable,
  isIntentUnavailable,
}: AnalysisPanelProps) {
  const sentimentPulseRef = useRef(false);
  const intentPulseRef = useRef(false);
  const prosodyPulseRef = useRef(false);
  const securityPulseRef = useRef(false);

  const [sentimentPulse, setSentimentPulse] = useState(false);
  const [intentPulse, setIntentPulse] = useState(false);
  const [prosodyPulse, setProsodyPulse] = useState(false);
  const [securityPulse, setSecurityPulse] = useState(false);

  useEffect(() => {
    if (sentiment && !sentimentPulseRef.current) {
      sentimentPulseRef.current = true;
      setSentimentPulse(true);
      const t = setTimeout(() => setSentimentPulse(false), 900);
      return () => clearTimeout(t);
    }
  }, [sentiment]);

  useEffect(() => {
    if (intent && !intentPulseRef.current) {
      intentPulseRef.current = true;
      setIntentPulse(true);
      const t = setTimeout(() => setIntentPulse(false), 900);
      return () => clearTimeout(t);
    }
  }, [intent]);

  useEffect(() => {
    if (prosody && !prosodyPulseRef.current) {
      prosodyPulseRef.current = true;
      setProsodyPulse(true);
      const t = setTimeout(() => setProsodyPulse(false), 900);
      return () => clearTimeout(t);
    }
  }, [prosody]);

  useEffect(() => {
    if (voiceSecurity && !securityPulseRef.current) {
      securityPulseRef.current = true;
      setSecurityPulse(true);
      const t = setTimeout(() => setSecurityPulse(false), 900);
      return () => clearTimeout(t);
    }
  }, [voiceSecurity]);

  return (
    <div className="flex flex-col gap-3 w-full">
      <PanelShell
        title="Sentiment"
        icon={<BarChart2 className="w-4 h-4" />}
        revealIndex={0}
        insightPulse={sentimentPulse}
      >
        {isSentimentUnavailable ? (
          <EmptyState label="Credits required to enable" />
        ) : isSentimentLoading && !sentiment ? (
          <EmptyState label="Analyzing…" loading />
        ) : sentiment ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <RevealBadge
                revealKey={sentiment.sentiment}
                className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${SENTIMENT_CLASS[sentiment.sentiment] ?? ''}`}
              >
                {sentiment.sentiment}
              </RevealBadge>
              <div className="flex flex-col">
                <MetricLabel>Confidence</MetricLabel>
                <AnimatedPercent
                  value={sentiment.confidence}
                  className="text-sm font-semibold text-vs-fg"
                />
              </div>
            </div>
            {sentiment.reasoning && (
              <p className="text-xs leading-relaxed line-clamp-3 text-vs-fg-muted vs-stagger-in" style={{ animationDelay: '120ms' }}>
                {sentiment.reasoning}
              </p>
            )}
            {sentiment.emotions && sentiment.emotions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sentiment.emotions.slice(0, 5).map((e, i) => (
                  <span
                    key={e}
                    className="vs-emotion-pill text-[10px] px-2 py-0.5 rounded-full bg-vs-pill-bg border border-vs-pill-border text-vs-pill-text"
                    style={{ animationDelay: `${180 + i * 50}ms` }}
                  >
                    {e}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState label="Waiting for speech…" />
        )}
      </PanelShell>

      <PanelShell
        title="Prosody"
        icon={<Waves className="w-4 h-4" />}
        revealIndex={1}
        insightPulse={prosodyPulse}
      >
        {isProsodyUnavailable ? (
          <EmptyState label="Credits required to enable" />
        ) : isProsodyLoading && !prosody ? (
          <EmptyState label="Analyzing audio…" loading />
        ) : prosody ? (
          <div className="flex flex-col gap-2.5">
            {PROSODY_METRICS.map(({ key, color }, i) => (
              <div key={key} className="flex items-center gap-3">
                <MetricLabel>{key}</MetricLabel>
                <ScoreBar
                  value={prosody[key]}
                  color={color}
                  pulseKey={Math.round(prosody[key] * 100)}
                  staggerIndex={i}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState label="Waiting for speech…" />
        )}
      </PanelShell>

      <PanelShell
        title="Voice Security"
        icon={<ShieldCheck className="w-4 h-4" />}
        revealIndex={2}
        insightPulse={securityPulse}
      >
        {isVoiceSecurityUnavailable ? (
          <EmptyState label="Credits required to enable" />
        ) : isVoiceSecurityLoading && !voiceSecurity ? (
          <EmptyState label="Analyzing audio…" loading />
        ) : voiceSecurity ? (
          <div className="flex flex-col gap-3">
            <RevealBadge
              revealKey={voiceSecurity.liveness_status}
              className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${LIVENESS_STYLE[voiceSecurity.liveness_status]?.badge ?? ''}`}
            >
              {LIVENESS_STYLE[voiceSecurity.liveness_status]?.label ?? voiceSecurity.liveness_status}
            </RevealBadge>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <MetricLabel>Synthetic</MetricLabel>
                <ScoreBar
                  value={voiceSecurity.synthetic_probability}
                  color={
                    voiceSecurity.synthetic_probability > 0.7
                      ? '#b83d4a'
                      : voiceSecurity.synthetic_probability > 0.4
                        ? '#c47a2e'
                        : '#3d8b5a'
                  }
                  pulseKey={Math.round(voiceSecurity.synthetic_probability * 100)}
                />
              </div>
              <div className="flex items-center gap-3">
                <MetricLabel>Risk</MetricLabel>
                <ScoreBar
                  value={voiceSecurity.behavioral_risk}
                  color={
                    voiceSecurity.behavioral_risk > 0.7
                      ? '#b83d4a'
                      : voiceSecurity.behavioral_risk > 0.4
                        ? '#c47a2e'
                        : '#3d8b5a'
                  }
                  pulseKey={Math.round(voiceSecurity.behavioral_risk * 100)}
                  staggerIndex={1}
                />
              </div>
            </div>
          </div>
        ) : (
          <EmptyState label="Waiting for audio…" />
        )}
      </PanelShell>

      <PanelShell
        title="Intent"
        icon={<Lightbulb className="w-4 h-4" />}
        revealIndex={3}
        insightPulse={intentPulse}
      >
        {isIntentUnavailable ? (
          <EmptyState label="LLM not configured" />
        ) : isIntentLoading && !intent ? (
          <EmptyState label="Classifying…" loading />
        ) : intent ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <RevealBadge
                revealKey={intent.intent}
                className="text-xs font-bold px-3 py-1 rounded-full bg-vs-pill-bg border border-vs-pill-border text-vs-pill-text capitalize"
              >
                {intent.intent.replace(/_/g, ' ')}
              </RevealBadge>
              <div className="flex flex-col">
                <MetricLabel>Confidence</MetricLabel>
                <AnimatedPercent
                  value={intent.confidence}
                  className="text-sm font-semibold text-vs-fg"
                />
              </div>
            </div>
            {intent.entities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {intent.entities.map((e, i) => (
                  <span
                    key={`${e.type}-${e.value}-${i}`}
                    className="vs-emotion-pill text-[10px] px-2 py-0.5 rounded-full bg-vs-pill-bg border border-vs-pill-border text-vs-pill-text"
                    style={{ animationDelay: `${100 + i * 40}ms` }}
                  >
                    {e.type}: {e.value}
                  </span>
                ))}
              </div>
            )}
            {intent.action_suggestion && (
              <p className="text-xs leading-relaxed text-vs-fg-muted vs-stagger-in" style={{ animationDelay: '160ms' }}>
                {intent.action_suggestion}
              </p>
            )}
            {intent.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {intent.tags.slice(0, 6).map((tag, i) => (
                  <span
                    key={tag}
                    className="vs-caption vs-emotion-pill px-1.5 py-0.5 rounded bg-vs-tag-bg text-vs-tag-text"
                    style={{ animationDelay: `${200 + i * 35}ms` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState label="Waiting for speech…" />
        )}
      </PanelShell>
    </div>
  );
}
