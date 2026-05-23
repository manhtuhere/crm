export const LANGUAGE_OPTIONS = [
  { label: 'English', code: 'en' },
  { label: 'Vietnamese (Tiếng Việt)', code: 'vi' },
  { label: 'Indonesian (Bahasa Indonesia)', code: 'id' },
  { label: 'Malay (Bahasa Melayu)', code: 'ms' },
  { label: 'Thai (ภาษาไทย)', code: 'th' },
  { label: 'Filipino (Tagalog)', code: 'tl' },
  { label: 'Tamil (தமிழ்)', code: 'ta' },
  { label: 'Khmer (ភាសាខ្មែរ)', code: 'km' },
] as const;

export type UiLangCode = (typeof LANGUAGE_OPTIONS)[number]['code'];

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
    connecting: string;
    connected: string;
    queueHint: string;
    linkHint: string;
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

const EN: UiCopy = {
  landing: {
    eyebrow: 'Contact center · Voice',
    title: 'BPO Voice Call Demo',
    subtitle:
      'Built for offshore contact centers — Concentrix, TDCX, and similar operations. Live voice with accent-aware ASR and queue-language translation.',
    cardTitle: 'Voice call assistant',
    cardSubtitle: 'Inbound support · translation-ready',
    onboarding:
      'Start a voice call, allow your microphone, and speak in any supported language. The agent replies in your selected queue language.',
    langLabel: 'Call language & translation',
    langHint:
      'Agent responses and greetings match this queue language.',
    startCall: 'Start voice call',
    connectingCall: 'Connecting call…',
    footer: 'VALSEA — speech intelligence for multilingual contact-center voice queues.',
    startError: 'Failed to start conversation. Please try again.',
    themeToggle: 'Toggle theme',
  },
  callOverlay: {
    placing: 'Placing your call…',
    connecting: 'Connecting',
    connected: 'Call connected',
    queueHint: 'Contact center queue · please wait',
    linkHint: 'Establishing secure voice link',
    onLineHint: 'Agent on the line',
  },
  conversation: {
    title: 'Voice call',
    sessionSubtitle: 'Contact center session',
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
    subConnecting: 'Joining your contact-center queue and agent line…',
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
    connectingAgentDetail: 'Your call is live — waiting for the AI agent to join the line.',
    waitingRtc: 'Joining voice channel…',
    waitingRtcDetail: 'Securing encrypted audio for your contact-center session.',
    micBlocked: 'Microphone access needed',
    micBlockedDetail:
      'Allow microphone permission in your browser, then refresh or end and start a new call.',
    agentSlow: 'Agent is taking longer than usual',
    agentSlowDetail: 'Stay on the line — connection often completes within a few seconds.',
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

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function patch(base: UiCopy, partial: DeepPartial<UiCopy>): UiCopy {
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

const VI: UiCopy = patch(EN, {
  landing: {
    eyebrow: 'Contact center · Thoại',
    title: 'Demo cuộc gọi BPO',
    subtitle:
      'Dành cho trung tâm contact center offshore — Concentrix, TDCX và tương tự. Thoại trực tiếp với ASR nhận giọng và dịch theo ngôn ngữ hàng đợi.',
    cardTitle: 'Trợ lý cuộc gọi',
    cardSubtitle: 'Inbound · sẵn sàng dịch',
    onboarding:
      'Bắt đầu cuộc gọi, cho phép micro và nói bằng ngôn ngữ bạn chọn. Agent trả lời đúng ngôn ngữ hàng đợi.',
    langLabel: 'Ngôn ngữ cuộc gọi & dịch',
    langHint: 'Agent phản hồi và chào theo ngôn ngữ hàng đợi này.',
    startCall: 'Bắt đầu cuộc gọi',
    connectingCall: 'Đang kết nối…',
    footer: 'VALSEA — trí tuệ giọng nói cho hàng đợi đa ngôn ngữ.',
    startError: 'Không thể bắt đầu cuộc gọi. Vui lòng thử lại.',
    themeToggle: 'Đổi giao diện',
  },
  callOverlay: {
    placing: 'Đang quay số…',
    connecting: 'Đang kết nối',
    connected: 'Đã kết nối',
    queueHint: 'Hàng đợi contact center · vui lòng chờ',
    linkHint: 'Thiết lập kênh thoại bảo mật',
    onLineHint: 'Agent đã vào line',
  },
  conversation: {
    title: 'Cuộc gọi',
    sessionSubtitle: 'Phiên contact center',
    intelligence: 'Phân tích',
    analysisTitle: 'Phân tích thời gian thực',
    transcript: 'Hội thoại',
    transcriptTitle: 'Bản ghi',
    turn: 'lượt',
    turns: 'lượt',
    tabTranscript: 'Bản ghi',
    tabAnalysis: 'Phân tích',
    you: 'Bạn',
    agent: 'Valsea',
    endSession: 'Kết thúc',
    endConfirm: 'Kết thúc cuộc gọi này?',
    muteMic: 'Tắt micro',
    unmuteMic: 'Bật micro',
    connecting: 'Đang kết nối…',
    listening: 'Agent đang lắng nghe…',
    thinking: 'Agent đang xử lý…',
    speaking: 'Agent đang nói…',
    ready: 'Agent sẵn sàng',
    subConnecting: 'Đang vào hàng đợi và nối agent…',
    subListening: 'Nói tự nhiên — hệ thống nhận giọng theo thời gian thực.',
    subThinking: 'Đang phân tích ngữ cảnh…',
    subSpeaking: 'Âm thanh agent với độ trễ thấp.',
    subIdle: 'Đang chờ agent…',
    emptyTranscript: 'Nội dung hội thoại sẽ hiện ở đây khi bạn nói.',
    mobileOnboarding: 'Chuyển tab để xem bản ghi hoặc phân tích khi đang gọi.',
    agentLabels: {
      listening: 'Đang nghe',
      thinking: 'Đang xử lý',
      speaking: 'Đang nói',
      idle: 'Sẵn sàng',
      silent: 'Sẵn sàng',
    },
  },
  status: {
    connectingAgent: 'Đang kết nối agent…',
    connectingAgentDetail: 'Cuộc gọi đã mở — đang chờ AI agent vào line.',
    waitingRtc: 'Đang vào kênh thoại…',
    waitingRtcDetail: 'Mã hóa âm thanh cho phiên contact center.',
    micBlocked: 'Cần quyền micro',
    micBlockedDetail:
      'Cho phép micro trên trình duyệt, sau đó tải lại hoặc gọi lại.',
    agentSlow: 'Agent đang chậm hơn bình thường',
    agentSlowDetail: 'Vui lòng giữ máy — thường kết nối trong vài giây.',
    network: 'Đang kết nối lại mạng',
    networkDetail: 'Kiểm tra kết nối — âm thanh có thể tự phục hồi.',
    agentFailed: 'Agent có thể không sẵn sàng',
    agentFailedDetail: 'Phiên đã mở nhưng agent chưa vào. Hãy kết thúc và thử lại.',
  },
  common: {
    dismissTip: 'Đóng gợi ý',
    selectMic: 'Chọn micro',
    close: 'Đóng',
    clear: 'Xóa',
  },
  connection: {
    title: 'Kết nối',
    detailsTitle: 'Chi tiết kết nối',
    noErrors: 'Không có lỗi agent hoặc tín hiệu.',
    connected: 'Đã kết nối',
    connectedWithIssues: 'Đã kết nối (có cảnh báo)',
    connecting: 'Đang kết nối…',
    reconnecting: 'Đang kết nối lại…',
    disconnecting: 'Đang ngắt…',
    disconnected: 'Mất kết nối',
    live: 'Trực tuyến',
    offline: 'Ngoại tuyến',
    reconnectingShort: 'Kết nối lại',
    degraded: 'Suy giảm',
    oneIssue: '1 lỗi',
    manyIssues: '{n} lỗi',
    closeAria: 'Đóng chi tiết kết nối',
  },
  controls: {
    mute: 'Tắt tiếng',
    unmute: 'Bật tiếng',
    muteAgent: 'Tắt agent',
    unmuteAgent: 'Bật agent',
    muteAi: 'Tắt AI',
    unmuteAi: 'Bật AI',
    endConversation: 'Kết thúc hội thoại',
    agentErrors: 'Lỗi agent',
    enrichmentActive: 'Đang làm giàu dữ liệu',
  },
  analysis: {
    sentiment: 'Cảm xúc',
    prosody: 'Ngữ điệu',
    voiceSecurity: 'Bảo mật giọng',
    intent: 'Ý định',
    confidence: 'Độ tin cậy',
    creditsRequired: 'Cần credit để bật',
    analyzing: 'Đang phân tích…',
    analyzingAudio: 'Đang phân tích âm thanh…',
    waitingSpeech: 'Chờ giọng nói…',
    waitingAudio: 'Chờ âm thanh…',
    classifying: 'Đang phân loại…',
    llmNotConfigured: 'Chưa cấu hình LLM',
    livenessVerified: 'Người thật',
    livenessScanning: 'Đang quét…',
    livenessFailed: 'Nghi ngờ giả mạo',
    synthetic: 'Tổng hợp',
    risk: 'Rủi ro',
    sentimentPositive: 'tích cực',
    sentimentNeutral: 'trung lập',
    sentimentNegative: 'tiêu cực',
    prosodyMetrics: {
      frustration: 'Bực bội',
      stress: 'Căng thẳng',
      politeness: 'Lịch sự',
      hesitation: 'Do dự',
      urgency: 'Khẩn cấp',
    },
  },
});

const ID: UiCopy = patch(EN, {
  landing: {
    title: 'Demo Panggilan Suara BPO',
    subtitle:
      'Untuk pusat kontak offshore — Concentrix, TDCX, dan sejenisnya. Suara langsung dengan ASR dan terjemahan antrian.',
    startCall: 'Mulai panggilan suara',
    connectingCall: 'Menghubungkan…',
  },
  callOverlay: {
    placing: 'Memanggil…',
    connected: 'Terhubung',
    queueHint: 'Antrian contact center · harap tunggu',
  },
  conversation: {
    title: 'Panggilan suara',
    listening: 'Agen mendengarkan…',
    thinking: 'Agen memproses…',
    speaking: 'Agen berbicara…',
    emptyTranscript: 'Percakapan akan muncul di sini saat Anda berbicara.',
  },
  status: {
    connectingAgent: 'Menghubungkan ke agen…',
    micBlocked: 'Akses mikrofon diperlukan',
  },
});

const MS: UiCopy = patch(EN, {
  landing: {
    title: 'Demo Panggilan Suara BPO',
    startCall: 'Mula panggilan suara',
  },
  callOverlay: { placing: 'Memanggil…', connected: 'Disambung' },
  conversation: { title: 'Panggilan suara' },
});

const TH: UiCopy = patch(EN, {
  landing: {
    title: 'เดโมสายเสียง BPO',
    startCall: 'เริ่มสายเสียง',
    connectingCall: 'กำลังเชื่อมต่อ…',
  },
  callOverlay: {
    placing: 'กำลังโทร…',
    connected: 'เชื่อมต่อแล้ว',
    queueHint: 'คิวศูนย์บริการ · โปรดรอ',
  },
  conversation: {
    title: 'สายเสียง',
    listening: 'เอเจนต์กำลังฟัง…',
    thinking: 'เอเจนต์กำลังคิด…',
    speaking: 'เอเจนต์กำลังพูด…',
  },
  status: { connectingAgent: 'กำลังเชื่อมต่อเอเจนต์…' },
});

const TL: UiCopy = patch(EN, {
  landing: {
    title: 'Demo ng Voice Call na BPO',
    startCall: 'Simulan ang tawag',
  },
  callOverlay: { connected: 'Nakakonekta na' },
  conversation: { title: 'Voice call' },
});

const TA: UiCopy = patch(EN, {
  landing: {
    title: 'BPO குரல் அழைப்பு டெமோ',
    startCall: 'அழைப்பைத் தொடங்கு',
  },
  callOverlay: { connected: 'இணைக்கப்பட்டது' },
  conversation: { title: 'குரல் அழைப்பு' },
});

const KM: UiCopy = patch(EN, {
  landing: {
    title: 'ការបង្ហាញខ្សែជំនួយ BPO',
    startCall: 'ចាប់ផ្តើមការហៅ',
  },
  callOverlay: { connected: 'បានភ្ជាប់' },
  conversation: { title: 'ការហៅសំឡេង' },
});

const COPIES: Record<UiLangCode, UiCopy> = {
  en: EN,
  vi: VI,
  id: ID,
  ms: MS,
  th: TH,
  tl: TL,
  ta: TA,
  km: KM,
};

export function getUiCopy(lang: string): UiCopy {
  if (lang in COPIES) return COPIES[lang as UiLangCode];
  return EN;
}
