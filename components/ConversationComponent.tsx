'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Activity, PhoneOff, Mic, MicOff, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { setParameter } from 'agora-rtc-sdk-ng/esm';
import {
  useRTCClient,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  useRemoteAudioTracks,
  useClientEvent,
  useJoin,
  usePublish,
  RemoteUser,
  UID,
} from 'agora-rtc-react';
import {
  AgoraVoiceAI,
  AgoraVoiceAIEvents,
  AgentState,
  MessageSalStatus,
  TranscriptHelperMode,
  type TranscriptHelperItem,
  type UserTranscription,
  type AgentTranscription,
} from 'agora-agent-client-toolkit';
import { DEFAULT_AGENT_UID } from '@/lib/agora';
import {
  getCurrentInProgressMessage,
  getMessageList,
  normalizeTimestampMs,
  normalizeTranscript,
} from '@/lib/conversation';
import { MicrophoneSelector } from './MicrophoneSelector';
import { ConnectionStatusPanel } from './ConnectionStatusPanel';
import { AnalysisPanelSkeleton } from './AnalysisPanelSkeleton';
import { SessionConnectingOverlay, type ConnectStep } from './SessionConnectingOverlay';
import { TranscriptMessageSkeleton } from './TranscriptMessageSkeleton';
import { OnboardingTip } from './OnboardingTip';
import { useDocumentLang } from '@/hooks/useDocumentLang';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/useTheme';
import { hapticTap } from '@/lib/haptics';
import {
  ConversationErrorCard,
  getConversationIssueSeverity,
  type ConnectionIssue,
} from './ConversationErrorCard';
import { AnalysisPanel, type ProsodyData, type SentimentData, type VoiceSecurityData } from './AnalysisPanel';
import type { IntentData } from '@/types/conversation';
import type { ConversationComponentProps } from '@/types/conversation';

const MAX_CONNECTION_ISSUES = 6;


type RtmMessageErrorPayload = {
  object: 'message.error';
  module?: string;
  code?: number;
  message?: string;
  send_ts?: number;
};

type RtmSalStatusPayload = {
  object: 'message.sal_status';
  status?: string;
  timestamp?: number;
};

function isRtmMessageErrorPayload(value: unknown): value is RtmMessageErrorPayload {
  return !!value && typeof value === 'object' && (value as { object?: unknown }).object === 'message.error';
}

function isRtmSalStatusPayload(value: unknown): value is RtmSalStatusPayload {
  return !!value && typeof value === 'object' && (value as { object?: unknown }).object === 'message.sal_status';
}

const AGENT_STATE_LABEL: Record<string, string> = {
  listening: 'Listening',
  thinking:  'Thinking',
  speaking:  'Speaking',
  idle:      'Ready',
  silent:    'Ready',
};

export default function ConversationComponent({
  agoraData,
  rtmClient,
  onTokenWillExpire,
  onEndConversation,
  selectedLanguage = 'vi',
  allowLanguageSwitching = false,
  onChangeLanguage,
}: ConversationComponentProps) {
  const client      = useRTCClient();
  const remoteUsers = useRemoteUsers();
  const agentUID  = process.env.NEXT_PUBLIC_AGENT_UID ?? String(DEFAULT_AGENT_UID);
  const agentUser = remoteUsers.find((u) => u.uid.toString() === agentUID);
  const { audioTracks: agentAudioTracks } = useRemoteAudioTracks(agentUser ? [agentUser] : []);
  const [isEnabled, setIsEnabled]               = useState(true);
  const [isAgentMuted, setIsAgentMuted]         = useState(false);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [connectionState, setConnectionState]   = useState<string>('CONNECTING');
  const [joinedUID, setJoinedUID] = useState<UID>(0);

  const [rawTranscript, setRawTranscript] = useState<
    TranscriptHelperItem<Partial<UserTranscription | AgentTranscription>>[]
  >([]);
  const [agentState, setAgentState]             = useState<AgentState | null>(null);
  const [connectionIssues, setConnectionIssues] = useState<ConnectionIssue[]>([]);

  // Valsea analysis state
  const [prosody, setProsody]                             = useState<ProsodyData | null>(null);
  const [sentiment, setSentiment]                         = useState<SentimentData | null>(null);
  const [voiceSecurity, setVoiceSecurity]                 = useState<VoiceSecurityData | null>(null);
  const [intent, setIntent]                               = useState<IntentData | null>(null);
  const [isProsodyLoading, setIsProsodyLoading]           = useState(false);
  const [isSentimentLoading, setIsSentimentLoading]       = useState(false);
  const [isVoiceSecurityLoading, setIsVoiceSecurityLoading] = useState(false);
  const [isIntentLoading, setIsIntentLoading]             = useState(false);
  const [isProsodyUnavailable, setIsProsodyUnavailable]   = useState(false);
  const [isSentimentUnavailable, setIsSentimentUnavailable] = useState(false);
  const [isVoiceSecurityUnavailable, setIsVoiceSecurityUnavailable] = useState(false);
  const [isIntentUnavailable, setIsIntentUnavailable]     = useState(false);
  const [mobileTab, setMobileTab] = useState<'transcript' | 'analysis'>('transcript');
  const [connectionPanelOpen, setConnectionPanelOpen] = useState(false);
  const [messageTimestamps, setMessageTimestamps] = useState<Record<string, number>>({});
  const [sessionOverlayDismissed, setSessionOverlayDismissed] = useState(false);
  const { isDark, toggle: toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  useDocumentLang(selectedLanguage);
  const prevUserMsgCountRef = useRef(0);
  const prevIntentMsgCountRef = useRef(0);
  const transcriptEndRef     = useRef<HTMLDivElement>(null);
  const sentimentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTranscriptRef  = useRef<string>('');
  const prosodyInFlightRef        = useRef(false);
  const voiceSecurityInFlightRef  = useRef(false);
  const voiceSecurityDoneRef      = useRef(false);
  const recorderStartRef          = useRef<(() => void) | null>(null);
  const recorderStopRef           = useRef<(() => void) | null>(null);
  const prevAgentStateRef         = useRef<AgentState | null>(null);

  const addConnectionIssue = useCallback((issue: ConnectionIssue) => {
    setConnectionIssues((prev) => {
      const isDuplicate = prev.some(
        (x) =>
          x.agentUserId === issue.agentUserId &&
          x.code === issue.code &&
          x.message === issue.message &&
          Math.abs(x.timestamp - issue.timestamp) < 1500,
      );
      if (isDuplicate) return prev;
      return [issue, ...prev].slice(0, MAX_CONNECTION_ISSUES);
    });
  }, []);

  // StrictMode guard
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => { if (!cancelled) setIsReady(true); }, 0);
    return () => { cancelled = true; clearTimeout(id); setIsReady(false); };
  }, []);

  const { isConnected: joinSuccess } = useJoin(
    {
      appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
      channel: agoraData.channel,
      token: agoraData.token,
      uid: parseInt(agoraData.uid, 10) || 0,
    },
    isReady,
  );

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isReady);

  useEffect(() => {
    if (!client) return;
    try { setParameter('ENABLE_AUDIO_PTS', true); } catch {}
  }, [client]);

  useEffect(() => {
    if (joinSuccess && client) {
      const uid = client.uid;
      if (uid !== null && uid !== undefined) setJoinedUID(uid);
    }
  }, [joinSuccess, client]);

  // AgoraVoiceAI init
  useEffect(() => {
    if (!isReady || !joinSuccess) return;
    let cancelled = false;
    (async () => {
      try {
        const ai = await AgoraVoiceAI.init({
          rtcEngine: client,
          rtmConfig: { rtmEngine: rtmClient },
          renderMode: TranscriptHelperMode.TEXT,
          enableLog: true,
        });
        if (cancelled) {
          try { if (AgoraVoiceAI.getInstance() === ai) { ai.unsubscribe(); ai.destroy(); } } catch {}
          return;
        }
        ai.on(AgoraVoiceAIEvents.TRANSCRIPT_UPDATED, (t) => setRawTranscript([...t]));
        ai.on(AgoraVoiceAIEvents.AGENT_STATE_CHANGED, (_, event) => setAgentState(event.state));
        ai.on(AgoraVoiceAIEvents.MESSAGE_ERROR, (agentUserId, error) => {
          addConnectionIssue({
            id: `${Date.now()}-${agentUserId}-message-error-${error.code}`,
            source: 'rtm', agentUserId, code: error.code, message: error.message,
            timestamp: normalizeTimestampMs(error.timestamp),
          });
        });
        ai.on(AgoraVoiceAIEvents.MESSAGE_SAL_STATUS, (agentUserId, salStatus) => {
          if (salStatus.status === MessageSalStatus.VP_REGISTER_FAIL || salStatus.status === MessageSalStatus.VP_REGISTER_DUPLICATE) {
            addConnectionIssue({
              id: `${Date.now()}-${agentUserId}-sal-${salStatus.status}`,
              source: 'rtm', agentUserId, code: salStatus.status,
              message: `SAL status: ${salStatus.status}`,
              timestamp: normalizeTimestampMs(salStatus.timestamp),
            });
          }
        });
        ai.on(AgoraVoiceAIEvents.AGENT_ERROR, (agentUserId, error) => {
          addConnectionIssue({
            id: `${Date.now()}-${agentUserId}-agent-error-${error.code}`,
            source: 'agent', agentUserId, code: error.code,
            message: `${error.type}: ${error.message}`,
            timestamp: normalizeTimestampMs(error.timestamp),
          });
        });
        ai.subscribeMessage(agoraData.channel);
      } catch (error) {
        if (!cancelled) console.error('[AgoraVoiceAI] init failed:', error);
      }
    })();
    return () => {
      cancelled = true;
      try { const ai = AgoraVoiceAI.getInstance(); if (ai) { ai.unsubscribe(); ai.destroy(); } } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, joinSuccess]);

  // RTM raw message fallback
  useEffect(() => {
    const handleRtmMessage = (event: { message: string | Uint8Array; publisher: string }) => {
      const payloadText = typeof event.message === 'string' ? event.message : new TextDecoder().decode(event.message);
      let parsed: unknown;
      try { parsed = JSON.parse(payloadText); } catch { return; }
      if (isRtmMessageErrorPayload(parsed)) {
        const p = parsed;
        addConnectionIssue({
          id: `${Date.now()}-${event.publisher}-rtm-msg-error-${p.code ?? 'unknown'}`,
          source: 'rtm-signaling', agentUserId: event.publisher, code: p.code ?? 'unknown',
          message: `${p.module ?? 'unknown'}: ${p.message ?? 'Unknown signaling error'}`,
          timestamp: normalizeTimestampMs(p.send_ts ?? Date.now()),
        });
        return;
      }
      if (isRtmSalStatusPayload(parsed)) {
        const p = parsed;
        if (p.status === 'VP_REGISTER_FAIL' || p.status === 'VP_REGISTER_DUPLICATE') {
          addConnectionIssue({
            id: `${Date.now()}-${event.publisher}-rtm-sal-${p.status}`,
            source: 'rtm-signaling', agentUserId: event.publisher, code: p.status,
            message: `SAL status: ${p.status}`,
            timestamp: normalizeTimestampMs(p.timestamp ?? Date.now()),
          });
        }
      }
    };
    rtmClient.addEventListener('message', handleRtmMessage);
    return () => { rtmClient.removeEventListener('message', handleRtmMessage); };
  }, [rtmClient, addConnectionIssue]);

  const transcript = useMemo(
    () => normalizeTranscript(rawTranscript, client?.uid != null ? String(client.uid) : ''),
    [rawTranscript, client?.uid],
  );
  const messageList              = useMemo(() => getMessageList(transcript), [transcript]);
  const currentInProgressMessage = useMemo(() => getCurrentInProgressMessage(transcript), [transcript]);

  useEffect(() => {
    setMessageTimestamps((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const msg of messageList) {
        const key = `${String(msg.uid)}-${msg.turn_id}`;
        if (!next[key]) {
          next[key] = Date.now();
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [messageList]);

  const sessionReady = joinSuccess && isAgentConnected;
  const showSessionOverlay = isReady && !sessionReady && !sessionOverlayDismissed;

  useEffect(() => {
    if (sessionReady) setSessionOverlayDismissed(false);
  }, [sessionReady]);

  useEffect(() => {
    if (sessionReady || !isReady) return;
    const t = setTimeout(() => setSessionOverlayDismissed(true), 20_000);
    return () => clearTimeout(t);
  }, [sessionReady, isReady]);

  const sessionConnectSteps = useMemo<ConnectStep[]>(
    () => [
      {
        id: 'rtc',
        label: 'Joining voice channel',
        status: joinSuccess ? 'done' : isReady ? 'active' : 'pending',
      },
      {
        id: 'agent',
        label: 'Connecting AI agent',
        status: isAgentConnected ? 'done' : joinSuccess ? 'active' : 'pending',
      },
    ],
    [joinSuccess, isAgentConnected, isReady],
  );

  const connectionSeverity = useMemo<'normal' | 'warning' | 'error'>(() => {
    if (connectionState !== 'CONNECTED') return 'error';
    if (connectionIssues.some((i) => getConversationIssueSeverity(i) === 'error')) {
      return 'error';
    }
    if (connectionIssues.length > 0) return 'warning';
    return 'normal';
  }, [connectionState, connectionIssues]);

  const analysisBootstrapping =
    !prosody &&
    !sentiment &&
    !voiceSecurity &&
    !intent &&
    (isProsodyLoading ||
      isSentimentLoading ||
      isVoiceSecurityLoading ||
      isIntentLoading);

  const hideCenterOnMobile = isMobile && mobileTab === 'analysis';
  const compactCenterOnMobile = isMobile && mobileTab === 'transcript';

  const agentOrbClass =
    agentState === 'listening'
      ? 'vs-agent-orb--listening'
      : agentState === 'thinking'
        ? 'vs-agent-orb--thinking'
        : agentState === 'speaking'
          ? 'vs-agent-orb--speaking'
          : 'vs-agent-orb--idle';

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList, currentInProgressMessage]);

  // ─── Prosody: start/stop recorder on each user speech turn ───────────────
  useEffect(() => {
    if (!localMicrophoneTrack || !isReady || !joinSuccess) return;
    let active = true;
    let currentRecorder: MediaRecorder | null = null;
    const msTrack = localMicrophoneTrack.getMediaStreamTrack();
    const stream  = new MediaStream([msTrack]);
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    // Polls a Valsea async job with exponential backoff. Returns the result data or null.
    // The [jobId] route auto-fetches the result when completed, so we receive either:
    //   • { status: '<non-completed>' } → still in progress, keep polling
    //   • result payload (no status, or status === 'completed') → done
    const pollJob = async (url: string, initialDelay = 6000): Promise<Record<string, unknown> | null> => {
      let delay = initialDelay;
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, delay));
        if (!active) return null;
        const res = await fetch(url);
        if (res.status === 429) {
          delay = Math.min(delay * 2, 30000);
          continue;
        }
        if (!res.ok) return null;
        const data = await res.json() as Record<string, unknown>;
        const status = data.status as string | undefined;
        if (status === 'failed') return null;
        // Any status other than 'completed' (queued, processing, pending, running…) means not ready
        if (status && status !== 'completed') {
          delay = Math.min(delay * 1.5, 15000);
          continue;
        }
        return data;
      }
      return null;
    };

    const submitProsody = async (blob: Blob) => {
      if (prosodyInFlightRef.current) return;
      prosodyInFlightRef.current = true;
      setIsProsodyLoading(true);
      try {
        const form = new FormData();
        form.append('file', blob, 'audio.webm');
        const submitRes = await fetch('/api/valsea/prosody', { method: 'POST', body: form });
        if (!submitRes.ok) {
          if (submitRes.status === 402) setIsProsodyUnavailable(true);
          return;
        }
        const { job_id } = await submitRes.json() as { job_id?: string };
        if (!job_id) return;
        const data = await pollJob(`/api/valsea/prosody/${job_id}`);
        if (!data) return;
        const emotions: ProsodyData | null = (data.emotions as ProsodyData) ?? ('frustration' in data ? data as unknown as ProsodyData : null);
        if (emotions) setProsody(emotions);
      } catch (err) {
        console.error('[Prosody]', err);
      } finally {
        prosodyInFlightRef.current = false;
        if (active) setIsProsodyLoading(false);
      }
    };

    const submitVoiceSecurity = async (blob: Blob) => {
      if (voiceSecurityInFlightRef.current) return;
      // Stagger 3 s behind prosody to avoid simultaneous rate-limit hits
      await new Promise((r) => setTimeout(r, 3000));
      if (!active) return;
      voiceSecurityInFlightRef.current = true;
      setIsVoiceSecurityLoading(true);
      try {
        const form = new FormData();
        form.append('file', blob, 'audio.webm');
        const submitRes = await fetch('/api/valsea/voice-security', { method: 'POST', body: form });
        if (!submitRes.ok) {
          if (submitRes.status === 402) setIsVoiceSecurityUnavailable(true);
          return;
        }
        const { job_id } = await submitRes.json() as { job_id?: string };
        if (!job_id) return;
        const data = await pollJob(`/api/valsea/voice-security/${job_id}`, 6000);
        if (!data || !('synthetic_probability' in data)) return;
        voiceSecurityDoneRef.current = true;
        setVoiceSecurity({
          synthetic_probability: (data.synthetic_probability as number) ?? 0,
          behavioral_risk: (data.behavioral_risk as number) ?? 0,
          liveness_status: (data.liveness_status as VoiceSecurityData['liveness_status']) ?? 'scanning',
        });
      } catch (err) {
        console.error('[VoiceSecurity]', err);
      } finally {
        voiceSecurityInFlightRef.current = false;
        if (active) setIsVoiceSecurityLoading(false);
      }
    };

    recorderStartRef.current = () => {
      if (!active || currentRecorder?.state === 'recording') return;
      const chunks: Blob[] = [];
      let rec: MediaRecorder;
      try { rec = new MediaRecorder(stream, { mimeType }); } catch { return; }
      currentRecorder = rec;
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        currentRecorder = null;
        if (!active || chunks.length === 0) return;
        const blob = new Blob(chunks, { type: mimeType });
        if (blob.size < 1000) return;
        void (async () => {
          await submitProsody(blob);
          // voice-security is a one-time liveness check — skip once we have a result
          if (!voiceSecurityDoneRef.current) await submitVoiceSecurity(blob);
        })();
      };
      rec.start();
    };

    recorderStopRef.current = () => {
      if (currentRecorder?.state === 'recording') currentRecorder.stop();
    };

    return () => {
      active = false;
      recorderStartRef.current = null;
      recorderStopRef.current = null;
      if (currentRecorder?.state !== 'inactive') currentRecorder?.stop();
    };
  }, [localMicrophoneTrack, isReady, joinSuccess]);

  // Trigger recorder start/stop based on agent state transitions
  useEffect(() => {
    const prev = prevAgentStateRef.current;
    prevAgentStateRef.current = agentState;
    if (agentState === 'listening') {
      recorderStartRef.current?.();
    } else if (prev === 'listening') {
      recorderStopRef.current?.();
    }
  }, [agentState]);

  // ─── Sentiment: debounced 5 s after last new user message ────────────────
  useEffect(() => {
    const userMessages = messageList.filter((m) => String(m.uid) !== agentUID && m.text);
    if (userMessages.length <= prevUserMsgCountRef.current) return;
    prevUserMsgCountRef.current = userMessages.length;
    const fullTranscript = userMessages.map((m) => m.text).join(' ').trim();
    if (!fullTranscript) return;

    latestTranscriptRef.current = fullTranscript;
    if (sentimentDebounceRef.current) clearTimeout(sentimentDebounceRef.current);
    sentimentDebounceRef.current = setTimeout(() => {
      const transcript = latestTranscriptRef.current;
      if (!transcript) return;
      setIsSentimentLoading(true);
      fetch('/api/valsea/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })
        .then((r) => { if (r.status === 402) { setIsSentimentUnavailable(true); return null; } if (r.status === 429) return null; return r.ok ? r.json() : null; })
        .then((data) => { if (data?.sentiment) setSentiment(data as SentimentData); })
        .catch((err) => console.error('[Sentiment]', err))
        .finally(() => setIsSentimentLoading(false));
    }, 5000);
  }, [messageList, agentUID]);

  // ─── Intent: classify each new completed user turn ───────────────────────
  useEffect(() => {
    const userMessages = messageList.filter((m) => String(m.uid) !== agentUID && m.text);
    if (userMessages.length <= prevIntentMsgCountRef.current) return;
    prevIntentMsgCountRef.current = userMessages.length;
    const latestMsg = userMessages[userMessages.length - 1];
    if (!latestMsg?.text) return;

    setIsIntentLoading(true);
    fetch('/api/valsea/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: latestMsg.text }),
    })
      .then((r) => { if (r.status === 402) { setIsIntentUnavailable(true); return null; } return r.ok ? r.json() : null; })
      .then((data: IntentData | null) => { if (data?.intent) setIntent(data); })
      .catch((err) => console.error('[Intent]', err))
      .finally(() => setIsIntentLoading(false));
  }, [messageList, agentUID]);

  usePublish([localMicrophoneTrack]);

  useClientEvent(client, 'user-joined', (user) => {
    if (user.uid.toString() === agentUID) setIsAgentConnected(true);
  });
  useClientEvent(client, 'user-left', (user) => {
    if (user.uid.toString() === agentUID) setIsAgentConnected(false);
  });
  useEffect(() => {
    setIsAgentConnected(remoteUsers.some((u) => u.uid.toString() === agentUID));
  }, [remoteUsers, agentUID]);
  useClientEvent(client, 'connection-state-change', (s) => setConnectionState(s));

  const clearConnectionIssues = useCallback(() => setConnectionIssues([]), []);

  const handleEndSession = useCallback(() => {
    hapticTap([8, 40, 24]);
    onEndConversation();
  }, [onEndConversation]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.repeat) return;
      if (window.confirm('End this voice session?')) handleEndSession();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleEndSession]);

  const handleMicToggle = useCallback(async () => {
    const next = !isEnabled;
    if (!localMicrophoneTrack) { setIsEnabled(next); return; }
    try { await localMicrophoneTrack.setEnabled(next); setIsEnabled(next); }
    catch (error) { console.error('Failed to toggle microphone:', error); }
  }, [isEnabled, localMicrophoneTrack]);

  const handleAgentMuteToggle = useCallback(() => {
    const next = !isAgentMuted;
    agentAudioTracks.forEach((track) => track.setVolume(next ? 0 : 100));
    setIsAgentMuted(next);
  }, [isAgentMuted, agentAudioTracks]);

  const handleTokenWillExpire = useCallback(async () => {
    if (!onTokenWillExpire || !joinedUID) return;
    try {
      const { rtcToken, rtmToken } = await onTokenWillExpire(joinedUID.toString());
      await client?.renewToken(rtcToken);
      await rtmClient.renewToken(rtmToken);
    } catch (error) { console.error('Failed to renew Agora token:', error); }
  }, [client, onTokenWillExpire, joinedUID, rtmClient]);

  useClientEvent(client, 'token-privilege-will-expire', handleTokenWillExpire);


  // Audio bar configs for center visualizer
  const AUDIO_BARS = [
    { h: 20, d: 0,   dur: 900 },
    { h: 34, d: 120, dur: 750 },
    { h: 46, d: 240, dur: 850 },
    { h: 28, d: 360, dur: 700 },
    { h: 42, d: 180, dur: 950 },
    { h: 24, d: 300, dur: 800 },
    { h: 38, d: 60,  dur: 720 },
  ];

  const centerStateText =
    agentState === 'listening' ? 'Valsea is listening...' :
    agentState === 'thinking'  ? 'Valsea is thinking...'  :
    agentState === 'speaking'  ? 'Valsea is speaking...'  :
    agentState                 ? 'Valsea is ready'        :
                                 'Connecting...';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="vs-page-shell h-[100dvh] flex flex-col overflow-hidden bg-vs-page text-vs-fg">
      <SessionConnectingOverlay
        visible={showSessionOverlay}
        title="Connecting to Valsea"
        steps={sessionConnectSteps}
      />
      {remoteUsers.map((user) => (
        <div key={user.uid} className="hidden"><RemoteUser user={user} /></div>
      ))}

      <header className="relative z-20 flex items-center justify-between px-4 md:px-6 py-3 pt-safe shrink-0 border-b border-vs-border-hdr bg-vs-card/60 backdrop-blur-xl overflow-visible">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/valsea-logo.png"
            alt="Valsea"
            width={36}
            height={36}
            className="rounded-xl shrink-0 ring-1 ring-vs-border-md shadow-vs-sm"
            priority
          />
          <div className="min-w-0">
            <p className="vs-heading text-sm font-semibold leading-none">Coke CX</p>
            <p className="vs-caption mt-1 truncate lg:hidden">{centerStateText}</p>
            <p className="vs-caption mt-1 truncate hidden lg:block">Voice agent session</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ConnectionStatusPanel
            connectionState={connectionState}
            connectionSeverity={connectionSeverity}
            connectionIssues={connectionIssues}
            isOpen={connectionPanelOpen}
            onToggle={() => setConnectionPanelOpen((o) => !o)}
          />
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-vs-out border bg-vs-ctrl-bg border-vs-ctrl-border text-vs-ctrl-icon hover:border-vs-brand/40 hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* ── Three-column main ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0 flex-col lg:flex-row">

        <div
          className={`order-4 lg:order-1 ${mobileTab === 'analysis' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 lg:flex-none lg:w-[400px] xl:w-[450px] shrink-0 overflow-y-auto overflow-hidden lg:border-r border-vs-border bg-vs-overlay/30 vs-scroll-thin`}
        >
          <div className="px-4 pt-4 pb-2 shrink-0 hidden lg:block">
            <p className="vs-label">Intelligence</p>
            <p className="vs-heading text-sm font-semibold mt-1">Real-time analysis</p>
          </div>
          <div className="p-4 pt-2 lg:pt-0 flex flex-col gap-3 flex-1">
            <div className="lg:hidden">
              <OnboardingTip message="Switch tabs to view live transcript or intelligence panels while you speak." />
            </div>
            {analysisBootstrapping ? (
              <AnalysisPanelSkeleton />
            ) : (
            <AnalysisPanel
              prosody={prosody}
              sentiment={sentiment}
              voiceSecurity={voiceSecurity}
              intent={intent}
              isProsodyLoading={isProsodyLoading}
              isSentimentLoading={isSentimentLoading}
              isVoiceSecurityLoading={isVoiceSecurityLoading}
              isIntentLoading={isIntentLoading}
              isProsodyUnavailable={isProsodyUnavailable}
              isSentimentUnavailable={isSentimentUnavailable}
              isVoiceSecurityUnavailable={isVoiceSecurityUnavailable}
              isIntentUnavailable={isIntentUnavailable}
            />
            )}
          </div>

          {/* Language + Microphone selectors — mid-call switching disabled */}
        </div>

        <div
          className={`order-3 lg:order-2 shrink-0 lg:flex-1 flex-col items-center justify-center relative overflow-hidden ${
            hideCenterOnMobile ? 'hidden lg:flex' : 'flex'
          } ${compactCenterOnMobile ? 'gap-3 py-3 px-4' : 'gap-5 lg:gap-7 p-5 lg:p-10'}`}
        >
          <div className="vs-mesh-bg opacity-50" aria-hidden="true" />

          <div className={`relative z-10 ${compactCenterOnMobile ? '' : 'animate-vs-float'}`}>
            <div
              className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl vs-agent-orb ${agentOrbClass} ${
                compactCenterOnMobile ? 'h-24 w-24 opacity-35' : 'h-48 w-48 lg:h-64 lg:w-64 opacity-40 animate-vs-glow-pulse'
              }`}
              aria-hidden="true"
            />
            <div
              className={`relative vs-robot-mask ${
                compactCenterOnMobile
                  ? 'w-20 h-20'
                  : 'w-[150px] h-[150px] lg:w-[230px] lg:h-[230px]'
              }`}
            >
              <Image
                src="/valsea-robot2.png"
                alt="Valsea AI mascot"
                fill
                className="vs-robot-img object-contain"
                priority
              />
            </div>
          </div>

          <div
            className={`z-10 flex items-end justify-center gap-[5px] px-3 py-2 transition-shadow duration-500 ease-vs-out ${
              compactCenterOnMobile
                ? 'h-9'
                : 'h-[52px] rounded-2xl bg-vs-surface/80 border border-vs-border-md backdrop-blur-sm px-4'
            } ${agentState === 'listening' ? 'vs-viz-listening' : ''}`}
          >
            {AUDIO_BARS.map((bar, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-gradient-to-t from-[#3B0B94] to-[#7A56AA]"
                style={{
                  height: `${bar.h}px`,
                  transformOrigin: 'bottom',
                  animation: agentState
                    ? `audioBar ${bar.dur}ms ease-in-out ${bar.d}ms infinite`
                    : 'none',
                  opacity: agentState === 'listening' ? 1 : agentState ? 0.55 : 0.25,
                  transform: agentState ? undefined : 'scaleY(0.35)',
                  transition: 'opacity 400ms var(--vs-ease-out)',
                }}
              />
            ))}
          </div>

          <div className={`z-10 text-center max-w-sm px-2 vs-status-text ${compactCenterOnMobile ? 'hidden sm:block' : ''}`}>
            <p className="vs-heading text-lg lg:text-2xl font-semibold vs-state-enter" key={centerStateText}>
              {centerStateText}
            </p>
            <p
              className="text-sm mt-2 text-vs-fg-muted leading-relaxed max-w-prose vs-state-enter"
              key={`${centerStateText}-sub`}
              style={{ animationDelay: '60ms' }}
            >
              {agentState === 'listening'
                ? 'Speak naturally — Valsea adapts to your accent in real time.'
                : agentState === 'thinking'
                  ? 'Analyzing context before responding…'
                  : agentState === 'speaking'
                    ? 'Agent audio streams with sub-second latency.'
                    : 'Establishing secure voice channel…'}
            </p>
          </div>
        </div>

        <div className="order-1 lg:hidden flex shrink-0 border-b border-vs-border-hdr bg-vs-card/40 backdrop-blur-md p-1 gap-1">
          {(['transcript', 'analysis'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={`vs-touch flex-1 min-h-11 py-2.5 rounded-lg text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-200 ease-vs-out ${
                mobileTab === tab
                  ? 'bg-vs-brand-acc text-vs-brand-text shadow-vs-sm'
                  : 'text-vs-fg-dim hover:text-vs-fg-muted'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className={`order-2 lg:order-3 ${mobileTab === 'transcript' ? 'flex' : 'hidden'} lg:flex flex-1 lg:flex-none lg:w-[400px] xl:w-[450px] flex-col shrink-0 overflow-hidden conversation-right-panel bg-vs-overlay/20`}>
          <div className="flex items-center justify-between px-4 py-3.5 shrink-0 border-b border-vs-border">
            <div>
              <p className="vs-label">Conversation</p>
              <p className="vs-heading text-sm font-semibold mt-0.5">Transcript</p>
            </div>
            <span className="vs-caption tabular-nums shrink-0">
              {messageList.length} {messageList.length === 1 ? 'turn' : 'turns'}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto min-h-0 vs-scroll-thin">
            <div className="flex flex-col p-4 gap-4 min-h-full">
              <div className="flex-1" />

              {!sessionReady && messageList.length === 0 && (
                <TranscriptMessageSkeleton count={3} align="start" />
              )}

              {sessionReady &&
                messageList.length === 0 &&
                !currentInProgressMessage &&
                (agentState === 'thinking' || agentState === 'speaking') && (
                  <TranscriptMessageSkeleton count={2} align="start" />
                )}

              {sessionReady &&
                messageList.length === 0 &&
                !currentInProgressMessage &&
                agentState !== 'thinking' &&
                agentState !== 'speaking' && (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 rounded-full border border-vs-border-md bg-vs-surface flex items-center justify-center text-vs-brand-text opacity-60">
                    <Activity className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-center text-vs-fg-dim max-w-[200px] leading-relaxed">
                    Your conversation will appear here as you speak.
                  </p>
                </div>
              )}

              {messageList.map((msg) => {
                const isAgent = String(msg.uid) === agentUID;
                const msgKey  = `${String(msg.uid)}-${msg.turn_id}`;
                const ts = messageTimestamps[msgKey] ?? 0;
                const timeStr = ts
                  ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';
                return (
                  <div
                    key={msgKey}
                    className={`vs-msg-enter flex flex-col gap-1.5 ${isAgent ? 'items-start' : 'items-end'}`}
                  >
                    <div className={`flex items-center gap-2 ${isAgent ? '' : 'flex-row-reverse'}`}>
                      {isAgent ? (
                        <span className="vs-label px-2 py-0.5 rounded-md bg-gradient-to-r from-[#3B0B94] to-[#7A56AA] text-white shadow-vs-sm normal-case tracking-wide">
                          Valsea
                        </span>
                      ) : (
                        <span className="vs-label normal-case tracking-wide">You</span>
                      )}
                      <span className="vs-caption tabular-nums">{timeStr}</span>
                    </div>
                    <div
                      className={`max-w-[92%] px-3.5 py-2.5 text-sm leading-relaxed shadow-vs-sm ${
                        isAgent
                          ? 'bg-vs-msg-agent-bg border border-vs-msg-agent-border text-vs-msg-agent-text rounded-2xl rounded-tl-md'
                          : 'bg-gradient-to-br from-[#3B0B94] to-[#7A56AA] text-white rounded-2xl rounded-tr-md'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {currentInProgressMessage && (
                <div className="vs-msg-enter flex flex-col items-start gap-1.5">
                  <span className="vs-label px-2 py-0.5 rounded-md bg-vs-brand/80 text-white normal-case tracking-wide">
                    Valsea
                  </span>
                  <div className="px-4 py-3 bg-vs-msg-agent-bg border border-vs-msg-agent-border rounded-2xl rounded-tl-md shadow-vs-sm">
                    <div className="flex gap-1 items-center h-2">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="w-1.5 h-1.5 rounded-full animate-bounce bg-vs-brand"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Connection error cards */}
          {connectionIssues.length > 0 && (
            <div className="p-3 flex flex-col gap-2 shrink-0 border-t border-vs-border">
              <div className="flex items-center justify-between">
                <span className="vs-label">Agent errors</span>
                <button
                  type="button"
                  onClick={clearConnectionIssues}
                  className="vs-caption hover:text-vs-fg-muted transition-colors vs-touch"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto vs-scroll-thin">
                {connectionIssues.map((issue) => (
                  <ConversationErrorCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-3 shrink-0 flex items-center gap-2.5 border-t border-vs-border bg-gradient-to-r from-vs-overlay via-vs-brand-acc/30 to-vs-overlay">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vs-brand opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-vs-brand" />
            </span>
            <span className="vs-label text-vs-brand-text">
              Enrichment active
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 pb-safe pt-2 md:px-6 md:pt-3 border-t border-vs-border-hdr bg-vs-card/50 backdrop-blur-xl">
        <div className="flex items-center justify-center gap-3 md:gap-6 max-w-lg mx-auto p-2 md:p-2.5 rounded-2xl border border-vs-border-md bg-vs-surface/90 shadow-vs-md backdrop-blur-md">
          <button
            onClick={handleMicToggle}
            className="flex flex-col items-center gap-1.5 transition-transform duration-200 ease-vs-out hover:scale-[1.02] active:scale-[0.98]"
            aria-label={isEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-vs-out border shadow-vs-sm ${
                isEnabled
                  ? 'bg-vs-ctrl-bg border-vs-ctrl-border'
                  : 'bg-vs-ctrl-active-bg border-vs-ctrl-active-border ring-2 ring-vs-brand/25'
              }`}
            >
              {isEnabled
                ? <Mic className="w-5 h-5 text-vs-ctrl-icon" />
                : <MicOff className="w-5 h-5 text-vs-brand-text" />
              }
            </div>
            <span className="vs-label">{isEnabled ? 'Mute' : 'Unmute'}</span>
          </button>

          <button
            onClick={handleAgentMuteToggle}
            className="flex flex-col items-center gap-1.5 transition-transform duration-200 ease-vs-out hover:scale-[1.02] active:scale-[0.98]"
            aria-label={isAgentMuted ? 'Unmute agent' : 'Mute agent'}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-vs-out border shadow-vs-sm ${
                isAgentMuted
                  ? 'bg-vs-ctrl-active-bg border-vs-ctrl-active-border ring-2 ring-vs-brand/25'
                  : 'bg-vs-ctrl-bg border-vs-ctrl-border'
              }`}
            >
              {isAgentMuted
                ? <VolumeX className="w-5 h-5 text-vs-brand-text" />
                : <Volume2 className="w-5 h-5 text-vs-ctrl-icon" />
              }
            </div>
            <span className="vs-label">{isAgentMuted ? 'Unmute AI' : 'Mute AI'}</span>
          </button>

          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 px-5 md:px-7 py-2.5 md:py-3 rounded-full text-white font-semibold text-sm transition-all duration-200 ease-vs-out bg-red-600 hover:bg-red-500 shadow-[0_4px_14px_rgba(220,38,38,0.35)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            aria-label="End conversation"
            title="End session (Esc)"
          >
            <PhoneOff className="w-4 h-4" />
            End session
          </button>

          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-vs-ctrl-bg border border-vs-ctrl-border shadow-vs-sm">
              <MicrophoneSelector localMicrophoneTrack={localMicrophoneTrack} />
            </div>
            <span className="vs-label">Input</span>
          </div>
        </div>
      </div>
    </div>
  );
}
