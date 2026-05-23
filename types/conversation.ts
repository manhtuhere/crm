import type { RTMClient } from 'agora-rtm';

export interface AgoraTokenData {
  token: string;
  uid: string;
  channel: string;
  agentId?: string;
}

export interface ClientStartRequest {
  requester_id: string;
  channel_name: string;
  languageCode?: string;
  ttsProvider?: string;
  allowLanguageSwitching?: boolean;
}

export interface StopConversationRequest {
  agent_id: string;
}

export interface AgentResponse {
  agent_id: string;
  create_ts: number;
  state: string;
}

export interface AgoraRenewalTokens {
  rtcToken: string;
  rtmToken: string;
}

export interface IntentData {
  intent: string;
  confidence: number;
  entities: { type: string; value: string }[];
  action_suggestion: string;
  tags: string[];
}

export interface ConversationComponentProps {
  agoraData: AgoraTokenData;
  rtmClient: RTMClient;
  onTokenWillExpire: (uid: string) => Promise<AgoraRenewalTokens>;
  onEndConversation: () => void;
  selectedLanguage?: string;
  ttsProvider?: string;
  allowLanguageSwitching?: boolean;
  onChangeLanguage?: (newLang: string) => Promise<void>;
  /** Set when invite-agent succeeded but agent may not join RTC */
  agentJoinWarning?: boolean;
}
