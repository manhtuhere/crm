'use client';

const BAR_HEIGHTS = [24, 38, 32, 44, 28, 40, 30, 42];

function SideColumnSkeleton({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className={`hidden lg:flex flex-col w-[400px] xl:w-[450px] shrink-0 border-vs-border ${
        side === 'left' ? 'border-r' : 'border-l'
      } bg-vs-overlay/20 p-4 gap-3`}
    >
      <div className="h-3 w-28 rounded vs-skeleton-block" />
      <div className="h-4 w-36 rounded vs-skeleton-block mb-2" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 border border-vs-border-md bg-vs-surface/60 space-y-3">
          <div className="h-4 w-24 rounded vs-skeleton-block" />
          <div className="h-16 rounded-xl vs-skeleton-block" />
        </div>
      ))}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="vs-page-shell h-[100dvh] flex flex-col bg-vs-page text-vs-fg">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 pt-safe border-b border-vs-border-hdr bg-vs-card/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl vs-skeleton-block" />
          <div className="space-y-2">
            <div className="h-3.5 w-20 rounded vs-skeleton-block" />
            <div className="h-2.5 w-28 rounded vs-skeleton-block" />
          </div>
        </div>
        <div className="h-9 w-20 rounded-full vs-skeleton-block" />
      </header>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row overflow-hidden">
        <SideColumnSkeleton side="left" />

        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6">
          <div className="w-36 h-36 md:w-48 md:h-48 rounded-full vs-skeleton-block" />
          <div className="flex items-end gap-1 h-12 px-5 rounded-2xl border border-vs-border-md bg-vs-surface/50">
            {BAR_HEIGHTS.map((h, i) => (
              <div key={i} className="w-1 rounded-full vs-skeleton-block" style={{ height: h }} />
            ))}
          </div>
          <div className="space-y-2 text-center w-full max-w-xs">
            <div className="h-5 w-3/4 mx-auto rounded-lg vs-skeleton-block" />
            <div className="h-3 w-full rounded vs-skeleton-block" />
          </div>
        </div>

        <SideColumnSkeleton side="right" />

        {/* Mobile: tab + single column placeholder */}
        <div className="lg:hidden flex flex-col flex-1 min-h-0 border-t border-vs-border-hdr">
          <div className="flex gap-1 p-1 shrink-0">
            <div className="flex-1 h-10 rounded-lg vs-skeleton-block" />
            <div className="flex-1 h-10 rounded-lg vs-skeleton-block opacity-60" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            <div className="h-4 w-24 rounded vs-skeleton-block" />
            <div className="h-20 rounded-2xl vs-skeleton-block" />
            <div className="h-14 rounded-2xl vs-skeleton-block ml-auto w-[75%]" />
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-safe pt-2 border-t border-vs-border-hdr">
        <div className="max-w-lg mx-auto flex justify-center gap-4 p-2.5 rounded-2xl border border-vs-border-md bg-vs-surface/80">
          <div className="w-12 h-12 rounded-full vs-skeleton-block" />
          <div className="h-11 w-32 rounded-full vs-skeleton-block" />
          <div className="w-12 h-12 rounded-full vs-skeleton-block" />
        </div>
      </div>
    </div>
  );
}
