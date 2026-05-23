'use client';

import { BarChart2, Waves, ShieldCheck, Lightbulb } from 'lucide-react';

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

const SENTIMENT_STYLE: Record<string, { badge: string; dot: string }> = {
  positive: { badge: 'text-green-400 border-green-400/40 bg-green-400/10',  dot: '#4ade80' },
  neutral:  { badge: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10', dot: '#facc15' },
  negative: { badge: 'text-red-400 border-red-400/40 bg-red-400/10',        dot: '#f87171' },
};

const LIVENESS_STYLE: Record<string, { badge: string; label: string }> = {
  verified: { badge: 'text-green-400 border-green-400/40 bg-green-400/10',   label: 'Verified Human' },
  scanning: { badge: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10', label: 'Scanning…' },
  failed:   { badge: 'text-red-400 border-red-400/40 bg-red-400/10',          label: 'Synthetic Suspect' },
};

function PanelShell({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        backgroundColor: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(122,86,170,0.22)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {title}
        </span>
        <span style={{ color: 'rgba(184,154,227,0.45)' }}>{icon}</span>
      </div>
      {children}
    </div>
  );
}

function MetricLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[9px] font-medium tracking-[0.18em] uppercase"
      style={{ color: 'rgba(255,255,255,0.38)' }}
    >
      {children}
    </span>
  );
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 flex-1">
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.round(value * 100)}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-semibold tabular-nums w-8 text-right"
        style={{ color: 'rgba(255,255,255,0.7)' }}
      >
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-16 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
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
  return (
    <div className="flex flex-col gap-3 w-full">

      {/* Sentiment */}
      <PanelShell title="Sentiment" icon={<BarChart2 className="w-4 h-4" />}>
        {isSentimentUnavailable ? (
          <EmptyState label="Credits required to enable" />
        ) : isSentimentLoading && !sentiment ? (
          <EmptyState label="Analyzing…" />
        ) : sentiment ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${SENTIMENT_STYLE[sentiment.sentiment]?.badge ?? ''}`}
              >
                {sentiment.sentiment}
              </span>
              <div className="flex flex-col">
                <MetricLabel>Confidence</MetricLabel>
                <span className="text-sm font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {Math.round(sentiment.confidence * 100)}%
                </span>
              </div>
            </div>
            {sentiment.reasoning && (
              <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {sentiment.reasoning}
              </p>
            )}
            {sentiment.emotions && sentiment.emotions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {sentiment.emotions.slice(0, 5).map((e) => (
                  <span
                    key={e}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'rgba(122,86,170,0.18)',
                      border: '1px solid rgba(122,86,170,0.3)',
                      color: 'rgba(184,154,227,0.8)',
                    }}
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

      {/* Prosody */}
      <PanelShell title="Prosody" icon={<Waves className="w-4 h-4" />}>
        {isProsodyUnavailable ? (
          <EmptyState label="Credits required to enable" />
        ) : isProsodyLoading && !prosody ? (
          <EmptyState label="Analyzing audio…" />
        ) : prosody ? (
          <div className="flex flex-col gap-2.5">
            {PROSODY_METRICS.map(({ key, color }) => (
              <div key={key} className="flex items-center gap-3">
                <MetricLabel>{key}</MetricLabel>
                <ScoreBar value={prosody[key]} color={color} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState label="Waiting for speech…" />
        )}
      </PanelShell>

      {/* Voice Security */}
      <PanelShell title="Voice Security" icon={<ShieldCheck className="w-4 h-4" />}>
        {isVoiceSecurityUnavailable ? (
          <EmptyState label="Credits required to enable" />
        ) : isVoiceSecurityLoading && !voiceSecurity ? (
          <EmptyState label="Analyzing audio…" />
        ) : voiceSecurity ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${LIVENESS_STYLE[voiceSecurity.liveness_status]?.badge ?? ''}`}
              >
                {LIVENESS_STYLE[voiceSecurity.liveness_status]?.label ?? voiceSecurity.liveness_status}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <MetricLabel>Synthetic</MetricLabel>
                <ScoreBar
                  value={voiceSecurity.synthetic_probability}
                  color={voiceSecurity.synthetic_probability > 0.7 ? '#ef4444' : voiceSecurity.synthetic_probability > 0.4 ? '#f97316' : '#4ade80'}
                />
              </div>
              <div className="flex items-center gap-3">
                <MetricLabel>Risk</MetricLabel>
                <ScoreBar
                  value={voiceSecurity.behavioral_risk}
                  color={voiceSecurity.behavioral_risk > 0.7 ? '#ef4444' : voiceSecurity.behavioral_risk > 0.4 ? '#f97316' : '#4ade80'}
                />
              </div>
            </div>
          </div>
        ) : (
          <EmptyState label="Waiting for audio…" />
        )}
      </PanelShell>

      {/* Intent */}
      <PanelShell title="Intent" icon={<Lightbulb className="w-4 h-4" />}>
        {isIntentUnavailable ? (
          <EmptyState label="LLM not configured" />
        ) : isIntentLoading && !intent ? (
          <EmptyState label="Classifying…" />
        ) : intent ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: 'rgba(122,86,170,0.25)',
                  border: '1px solid rgba(122,86,170,0.45)',
                  color: '#B89AE3',
                }}
              >
                {intent.intent.replace(/_/g, ' ')}
              </span>
              <div className="flex flex-col">
                <MetricLabel>Confidence</MetricLabel>
                <span className="text-sm font-semibold tabular-nums" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {Math.round(intent.confidence * 100)}%
                </span>
              </div>
            </div>
            {intent.entities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {intent.entities.map((e, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'rgba(34,211,238,0.1)',
                      border: '1px solid rgba(34,211,238,0.25)',
                      color: 'rgba(34,211,238,0.85)',
                    }}
                  >
                    {e.type}: {e.value}
                  </span>
                ))}
              </div>
            )}
            {intent.action_suggestion && (
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {intent.action_suggestion}
              </p>
            )}
            {intent.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {intent.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.28)',
                    }}
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
