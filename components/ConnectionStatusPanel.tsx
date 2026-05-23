'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { ConversationErrorCard, type ConnectionIssue } from './ConversationErrorCard';

type ConnectionStatusPanelProps = {
  connectionState: string;
  connectionSeverity: 'normal' | 'warning' | 'error';
  connectionIssues: ConnectionIssue[];
  isOpen: boolean;
  onToggle: () => void;
};

function getConnectionLabel(
  connectionState: string,
  connectionSeverity: 'normal' | 'warning' | 'error',
): string {
  if (connectionSeverity !== 'normal' && connectionState === 'CONNECTED') {
    return 'Connected (issues detected)';
  }
  if (connectionState === 'CONNECTED') return 'Connected';
  if (connectionState === 'CONNECTING') return 'Connecting...';
  if (connectionState === 'RECONNECTING') return 'Reconnecting...';
  if (connectionState === 'DISCONNECTING') return 'Disconnecting...';
  return 'Disconnected';
}

const SEVERITY_DOT: Record<ConnectionStatusPanelProps['connectionSeverity'], string> = {
  normal: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-red-500',
};

function getStatusLabel(
  connectionState: string,
  connectionSeverity: ConnectionStatusPanelProps['connectionSeverity'],
  issueCount: number,
): string {
  if (connectionSeverity === 'error' || connectionState === 'DISCONNECTED') {
    return connectionState === 'RECONNECTING' ? 'Reconnecting' : 'Offline';
  }
  if (connectionSeverity === 'warning' || issueCount > 0) {
    return issueCount > 0 ? `${issueCount} issue${issueCount === 1 ? '' : 's'}` : 'Degraded';
  }
  if (connectionState === 'CONNECTING' || connectionState === 'RECONNECTING') {
    return 'Connecting';
  }
  return 'Live';
}

function PanelBody({
  connectionState,
  connectionIssues,
  onClose,
}: {
  connectionState: string;
  connectionIssues: ConnectionIssue[];
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="vs-label">Connection</p>
          <p className="text-xs text-vs-fg-dim mt-0.5 tabular-nums">
            RTC {connectionState.toLowerCase()}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="vs-touch flex h-8 w-8 items-center justify-center rounded-lg border border-vs-border-md bg-vs-surface text-vs-fg-muted hover:text-vs-fg transition-colors"
          aria-label="Close connection details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {connectionIssues.length === 0 ? (
        <p className="text-sm text-vs-fg-muted leading-relaxed">
          No agent or signaling errors reported.
        </p>
      ) : (
        <div className="space-y-2 max-h-[min(50vh,16rem)] overflow-auto vs-scroll-thin pr-1">
          {connectionIssues.map((issue) => (
            <ConversationErrorCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </>
  );
}

export function ConnectionStatusPanel({
  connectionState,
  connectionSeverity,
  connectionIssues,
  isOpen,
  onToggle,
}: ConnectionStatusPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const dot = SEVERITY_DOT[connectionSeverity];
  const ping =
    connectionState !== 'DISCONNECTED' && connectionState !== 'DISCONNECTING';
  const label = getStatusLabel(connectionState, connectionSeverity, connectionIssues.length);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle();
    };
    document.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onToggle]);

  const overlay =
    mounted && isOpen
      ? createPortal(
          <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[max(5rem,env(safe-area-inset-top)+4rem)] sm:items-start sm:justify-end sm:pt-[max(4.5rem,env(safe-area-inset-top)+3.5rem)] sm:pr-4 sm:pl-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              aria-label="Close connection details"
              onClick={onToggle}
            />
            <div
              id="connection-details-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="connection-details-title"
              className="relative z-[81] w-full max-w-sm rounded-2xl border border-vs-border-md bg-vs-page p-4 shadow-vs-lg animate-fade-up"
              onClick={(e) => e.stopPropagation()}
            >
              <span id="connection-details-title" className="sr-only">
                Connection details
              </span>
              <PanelBody
                connectionState={connectionState}
                connectionIssues={connectionIssues}
                onClose={onToggle}
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative flex-shrink-0">
      <button
        type="button"
        className={`vs-touch flex items-center gap-1.5 min-h-9 px-2.5 sm:px-3 py-1.5 rounded-full vs-label border shadow-vs-sm transition-colors ${
          isOpen
            ? 'bg-vs-brand-acc border-vs-brand text-vs-brand-text'
            : 'bg-vs-brand-acc/80 border-vs-border-md text-vs-brand-text hover:border-vs-brand/50'
        }`}
        aria-label={getConnectionLabel(connectionState, connectionSeverity)}
        aria-expanded={isOpen}
        aria-controls="connection-details-panel"
        onClick={onToggle}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          {ping && connectionSeverity === 'normal' && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${dot}`}
            />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
        </span>
        {label}
      </button>
      {overlay}
    </div>
  );
}
