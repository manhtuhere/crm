'use client';

const PANELS = ['Sentiment', 'Prosody', 'Voice Security', 'Intent'] as const;

function PanelSkeleton() {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 bg-vs-surface/90 border border-vs-border-md">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded-md vs-skeleton-block" />
        <div className="h-8 w-8 rounded-lg vs-skeleton-block" />
      </div>
      <div className="h-7 w-28 rounded-full vs-skeleton-block" />
      <div className="space-y-2.5">
        {[72, 88, 64, 80, 56].map((w) => (
          <div key={w} className="flex items-center gap-3">
            <div className="h-3 w-16 rounded vs-skeleton-block shrink-0" />
            <div className="flex-1 h-2 rounded-full vs-skeleton-block" style={{ maxWidth: `${w}%` }} />
            <div className="h-3 w-8 rounded vs-skeleton-block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalysisPanelSkeleton() {
  return (
    <div className="flex flex-col gap-3 w-full" aria-hidden>
      {PANELS.map((name) => (
        <div key={name}>
          <PanelSkeleton />
        </div>
      ))}
    </div>
  );
}
