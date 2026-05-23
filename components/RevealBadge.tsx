'use client';

type RevealBadgeProps = {
  children: React.ReactNode;
  className?: string;
  revealKey: string;
};

/** Badge that flips in when `revealKey` changes (sentiment, intent, etc.). */
export function RevealBadge({ children, className = '', revealKey }: RevealBadgeProps) {
  return (
    <span key={revealKey} className={`vs-badge-reveal inline-block ${className}`}>
      {children}
    </span>
  );
}
