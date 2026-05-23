'use client';

type TranscriptMessageSkeletonProps = {
  count?: number;
  align?: 'start' | 'end';
};

export function TranscriptMessageSkeleton({
  count = 2,
  align = 'start',
}: TranscriptMessageSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);
  const isEnd = align === 'end';

  return (
    <div className="flex flex-col gap-4 w-full" aria-hidden>
      {items.map((i) => (
        <div
          key={i}
          className={`flex flex-col gap-2 ${isEnd ? 'items-end' : 'items-start'}`}
          style={{ opacity: 1 - i * 0.2 }}
        >
          <div className={`h-3 w-14 rounded vs-skeleton-block ${isEnd ? 'ml-auto' : ''}`} />
          <div
            className={`rounded-2xl vs-skeleton-block ${
              isEnd ? 'rounded-tr-md' : 'rounded-tl-md'
            }`}
            style={{
              width: `${68 - i * 12}%`,
              maxWidth: '16rem',
              height: i === 0 ? '3.25rem' : '2.5rem',
            }}
          />
        </div>
      ))}
    </div>
  );
}
