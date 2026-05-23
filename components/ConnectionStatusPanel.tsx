import React from 'react';
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

export function ConnectionStatusPanel({
  connectionState,
  connectionSeverity,
  connectionIssues,
  isOpen,
  onToggle,
}: ConnectionStatusPanelProps) {
  const dot = SEVERITY_DOT[connectionSeverity];
  const ping =
    connectionState !== 'DISCONNECTED' && connectionState !== 'DISCONNECTING';
  const label = getStatusLabel(connectionState, connectionSeverity, connectionIssues.length);

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        className="vs-touch flex items-center gap-1.5 min-h-9 px-2.5 sm:px-3 py-1.5 rounded-full vs-label border bg-vs-brand-acc/80 border-vs-border-md text-vs-brand-text shadow-vs-sm hover:border-vs-brand/50 transition-colors"
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

      <div
        id="connection-details-panel"
        className={`fixed top-[4.5rem] left-1/2 z-30 w-[min(92vw,22rem)] -translate-x-1/2 rounded-xl border border-vs-border-md bg-vs-card/95 p-3 space-y-2 backdrop-blur-xl shadow-vs-lg transition-all duration-200 ease-vs-out md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:translate-x-0 ${
          isOpen
            ? 'opacity-100 pointer-events-auto scale-100'
            : 'opacity-0 pointer-events-none scale-95'
        }`}
        role="status"
        aria-live="polite"
        aria-label="Connection details"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="vs-label text-[10px]">Connection</div>
          <div className="text-[11px] text-vs-fg-dim tabular-nums">
            RTC {connectionState.toLowerCase()}
          </div>
        </div>
        {connectionIssues.length === 0 ? (
          <div className="text-xs text-vs-fg-muted">No agent or signaling errors.</div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-auto vs-scroll-thin pr-1">
            {connectionIssues.map((issue) => (
              <ConversationErrorCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
