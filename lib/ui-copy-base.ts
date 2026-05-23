import type { LanguageCode } from './languages';

export type UiLangCode = LanguageCode;

export type UiCopy = {
  landing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cardTitle: string;
    cardSubtitle: string;
    onboarding: string;
    langLabel: string;
    langHint: string;
    startCall: string;
    connectingCall: string;
    footer: string;
    startError: string;
    themeToggle: string;
  };
  callOverlay: {
    placing: string;
    connected: string;
    queueHint: string;
    onLineHint: string;
  };
  conversation: {
    title: string;
    sessionSubtitle: string;
    intelligence: string;
    analysisTitle: string;
    transcript: string;
    transcriptTitle: string;
    turn: string;
    turns: string;
    tabTranscript: string;
    tabAnalysis: string;
    you: string;
    agent: string;
    endSession: string;
    endConfirm: string;
    muteMic: string;
    unmuteMic: string;
    connecting: string;
    listening: string;
    thinking: string;
    speaking: string;
    ready: string;
    subConnecting: string;
    subListening: string;
    subThinking: string;
    subSpeaking: string;
    subIdle: string;
    emptyTranscript: string;
    mobileOnboarding: string;
    agentLabels: Record<string, string>;
  };
  status: {
    connectingAgent: string;
    connectingAgentDetail: string;
    waitingRtc: string;
    waitingRtcDetail: string;
    micBlocked: string;
    micBlockedDetail: string;
    agentSlow: string;
    agentSlowDetail: string;
    network: string;
    networkDetail: string;
    agentFailed: string;
    agentFailedDetail: string;
  };
  common: {
    dismissTip: string;
    selectMic: string;
    close: string;
    clear: string;
  };
  connection: {
    title: string;
    detailsTitle: string;
    rtcPrefix: string;
    noErrors: string;
    connected: string;
    connectedWithIssues: string;
    connecting: string;
    reconnecting: string;
    disconnecting: string;
    disconnected: string;
    live: string;
    offline: string;
    reconnectingShort: string;
    degraded: string;
    oneIssue: string;
    manyIssues: string;
    closeAria: string;
  };
  controls: {
    mute: string;
    unmute: string;
    muteAgent: string;
    unmuteAgent: string;
    muteAi: string;
    unmuteAi: string;
    endConversation: string;
    agentErrors: string;
    enrichmentActive: string;
  };
  analysis: {
    sentiment: string;
    prosody: string;
    voiceSecurity: string;
    intent: string;
    confidence: string;
    creditsRequired: string;
    analyzing: string;
    analyzingAudio: string;
    waitingSpeech: string;
    waitingAudio: string;
    classifying: string;
    llmNotConfigured: string;
    livenessVerified: string;
    livenessScanning: string;
    livenessFailed: string;
    synthetic: string;
    risk: string;
    sentimentPositive: string;
    sentimentNeutral: string;
    sentimentNegative: string;
    prosodyMetrics: {
      frustration: string;
      stress: string;
      politeness: string;
      hesitation: string;
      urgency: string;
    };
  };
};

export const EN: UiCopy = {
  landing: {
    eyebrow: 'Voice',
    title: 'Voice Call',
    subtitle:
      'Live voice conversation with accent-aware speech intelligence and queue-language translation.',
    cardTitle: 'Voice call',
    cardSubtitle: 'Support · translation-ready',
    onboarding:
      'Start a voice call, allow your microphone, and speak in any supported language. The agent replies in your selected queue language.',
    langLabel: 'Call language & translation',
    langHint:
      '21 queue languages. Agent replies in your selection; Valsea analysis is strongest on Southeast Asian languages.',
    startCall: 'Start voice call',
    connectingCall: 'Connecting call…',
    footer: 'VALSEA — speech intelligence for multilingual voice.',
    startError: 'Failed to start conversation. Please try again.',
    themeToggle: 'Toggle theme',
  },
  callOverlay: {
    placing: 'Connecting your call…',
    connected: 'Call connected',
    queueHint: 'Please wait',
    onLineHint: 'You are connected',
  },
  conversation: {
    title: 'Voice call',
    sessionSubtitle: 'Live session',
    intelligence: 'Intelligence',
    analysisTitle: 'Real-time analysis',
    transcript: 'Conversation',
    transcriptTitle: 'Transcript',
    turn: 'turn',
    turns: 'turns',
    tabTranscript: 'Transcript',
    tabAnalysis: 'Analysis',
    you: 'You',
    agent: 'Valsea',
    endSession: 'End session',
    endConfirm: 'End this voice session?',
    muteMic: 'Mute microphone',
    unmuteMic: 'Unmute microphone',
    connecting: 'Connecting…',
    listening: 'Agent is listening…',
    thinking: 'Agent is thinking…',
    speaking: 'Agent is speaking…',
    ready: 'Agent is ready',
    subConnecting: 'Joining voice channel and agent…',
    subListening: 'Speak naturally — accent-aware capture is active.',
    subThinking: 'Analyzing context before responding…',
    subSpeaking: 'Agent audio with low-latency streaming.',
    subIdle: 'Waiting for agent audio…',
    emptyTranscript: 'Your conversation will appear here as you speak.',
    mobileOnboarding:
      'Switch tabs to view live transcript or intelligence panels while you speak.',
    agentLabels: {
      listening: 'Listening',
      thinking: 'Thinking',
      speaking: 'Speaking',
      idle: 'Ready',
      silent: 'Ready',
    },
  },
  status: {
    connectingAgent: 'Connecting to agent…',
    connectingAgentDetail:
      'Your call is live — waiting for the AI agent to join the line.',
    waitingRtc: 'Joining voice channel…',
    waitingRtcDetail: 'Securing encrypted audio for your voice session.',
    micBlocked: 'Microphone access needed',
    micBlockedDetail:
      'Allow microphone permission in your browser, then refresh or end and start a new call.',
    agentSlow: 'Agent is taking longer than usual',
    agentSlowDetail:
      'Stay on the line — connection often completes within a few seconds.',
    network: 'Voice network reconnecting',
    networkDetail: 'Check your connection. Audio may resume automatically.',
    agentFailed: 'Agent may not be available',
    agentFailedDetail:
      'The session started but the agent did not join. End the call and try again.',
  },
  common: {
    dismissTip: 'Dismiss tip',
    selectMic: 'Select microphone',
    close: 'Close',
    clear: 'Clear',
  },
  connection: {
    title: 'Connection',
    detailsTitle: 'Connection details',
    rtcPrefix: 'RTC',
    noErrors: 'No agent or signaling errors reported.',
    connected: 'Connected',
    connectedWithIssues: 'Connected (issues detected)',
    connecting: 'Connecting…',
    reconnecting: 'Reconnecting…',
    disconnecting: 'Disconnecting…',
    disconnected: 'Disconnected',
    live: 'Live',
    offline: 'Offline',
    reconnectingShort: 'Reconnecting',
    degraded: 'Degraded',
    oneIssue: '1 issue',
    manyIssues: '{n} issues',
    closeAria: 'Close connection details',
  },
  controls: {
    mute: 'Mute',
    unmute: 'Unmute',
    muteAgent: 'Mute agent',
    unmuteAgent: 'Unmute agent',
    muteAi: 'Mute AI',
    unmuteAi: 'Unmute AI',
    endConversation: 'End conversation',
    agentErrors: 'Agent errors',
    enrichmentActive: 'Enrichment active',
  },
  analysis: {
    sentiment: 'Sentiment',
    prosody: 'Prosody',
    voiceSecurity: 'Voice Security',
    intent: 'Intent',
    confidence: 'Confidence',
    creditsRequired: 'Credits required to enable',
    analyzing: 'Analyzing…',
    analyzingAudio: 'Analyzing audio…',
    waitingSpeech: 'Waiting for speech…',
    waitingAudio: 'Waiting for audio…',
    classifying: 'Classifying…',
    llmNotConfigured: 'LLM not configured',
    livenessVerified: 'Verified Human',
    livenessScanning: 'Scanning…',
    livenessFailed: 'Synthetic Suspect',
    synthetic: 'Synthetic',
    risk: 'Risk',
    sentimentPositive: 'positive',
    sentimentNeutral: 'neutral',
    sentimentNegative: 'negative',
    prosodyMetrics: {
      frustration: 'Frustration',
      stress: 'Stress',
      politeness: 'Politeness',
      hesitation: 'Hesitation',
      urgency: 'Urgency',
    },
  },
};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function patch(base: UiCopy, partial: DeepPartial<UiCopy>): UiCopy {
  return {
    landing: { ...base.landing, ...partial.landing },
    callOverlay: { ...base.callOverlay, ...partial.callOverlay },
    conversation: {
      ...base.conversation,
      ...partial.conversation,
      agentLabels: {
        ...base.conversation.agentLabels,
        ...(partial.conversation?.agentLabels ?? {}),
      } as UiCopy['conversation']['agentLabels'],
    },
    status: { ...base.status, ...partial.status },
    common: { ...base.common, ...partial.common },
    connection: { ...base.connection, ...partial.connection },
    controls: { ...base.controls, ...partial.controls },
    analysis: {
      ...base.analysis,
      ...partial.analysis,
      prosodyMetrics: {
        ...base.analysis.prosodyMetrics,
        ...(partial.analysis?.prosodyMetrics ?? {}),
      },
    },
  };
}

export function formatIssueCount(
  count: number,
  copy: UiCopy['connection'],
): string {
  return count === 1
    ? copy.oneIssue
    : copy.manyIssues.replace('{n}', String(count));
}
