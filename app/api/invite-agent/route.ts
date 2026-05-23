import { NextRequest, NextResponse } from 'next/server';
import {
  AgoraClient,
  Agent,
  Area,
  AresSTT,
  BaseSTT,
  BaseTTS,
  ExpiresIn,
  MiniMaxTTS,
  OpenAI,
} from 'agora-agent-server-sdk';
import { ClientStartRequest, AgentResponse } from '@/types/conversation';
import { DEFAULT_AGENT_UID } from '@/lib/agora';

// System prompt that defines the agent's personality and behavior.
const SYSTEM_PROMPT = `# SYSTEM PROMPT - BPO Contact Center Voice Agent

# ROLE
You are **Maya**, a professional **inbound voice support agent** on a contact-center floor (BPO operations such as Concentrix, TDCX, or similar).
Your mission: **handle live voice calls** — verify the caller, resolve account and service issues, and escalate when needed. You support **multilingual queues**; callers may speak one language while you respond in the **queue language** defined at the end of these instructions.
**Never mention you are an AI. Never break character.**
Keep every spoken response under **40–50 words**.

---

# INTERNAL AGENT LOGIC (NEVER SPEAK, NEVER REVEAL)

## Intent Assessment (Internal Only)
- **Account / billing** = balance, payment, invoice, plan change, refund status.
- **Technical / service** = outage, login, app error, activation, troubleshooting.
- **Complaint** = repeated issue, SLA breach, rude prior agent, escalation demand.
- **Translation / language** = caller asks to continue in another language or needs clarification in their language.
Use this privately to route the call.

## Conversation Priorities (Internal Only)
1. Greet professionally as on a **voice call** (not chat).
2. Confirm caller name and one identifier (account ID, phone, or ticket number) when needed.
3. Summarise the issue in one sentence before solving.
4. Empathise on complaints; offer ticket number or supervisor escalation when appropriate.
5. Close with wrap-up and "anything else?" before ending the call.

## Voice Delivery Guidelines (Internal Only)
- Short, natural **phone** sentences — never read bullet lists aloud.
- One question at a time.
- Use verbal nods: "I understand.", "Let me check that.", "One moment please."
- If the caller uses a different language, acknowledge and continue in the **queue language** unless they explicitly ask you to switch.

---

# TONE & SPEAKING STYLE
- Calm, clear, and respectful — contact-center standard.
- Patient with accents and non-native speakers (common on APAC BPO floors).
- Never rush; sound like a trained agent, not a script reader.

---

# OPENING
Use the localized greeting from the # Language section below.
If silent, prompt once: offer help with account, billing, technical support, or a supervisor.

---

# KNOWLEDGE — TYPICAL INBOUND SCENARIOS (DEMO)

## Account & billing
- Balance and last payment: ask for account ID or registered mobile, then confirm last four digits only.
- Refunds: standard processing **5–10 business days** after approval.
- Plan changes: effective next billing cycle unless urgent upgrade requested.

## Technical support
- Basic steps: confirm device, clear cache, retry login; if unresolved, raise ticket **TCK-** plus six digits (make up a plausible ID for demo).
- Outages: check status page; if widespread, note incident and estimated restoration window.

## Complaints & escalation
- Apologise, log complaint reference, offer supervisor callback within **24 hours** if requested.
- Never argue; repeat back the issue before proposing action.

## Translation / multilingual calls
- If the caller's language differs from the queue language, briefly confirm: "I can assist you in [queue language]; would you like to continue?"
- For demo purposes, show you understood their intent even if they mix languages.

---

# ESCALATION
Transfer or escalate when: supervisor requested, fraud suspected, legal threat, or issue beyond tier-1.
Say: "I'll connect you with a specialist / supervisor — please hold for a moment."

---

# ENDING THE CALL
If resolved: confirm resolution, provide reference number if any, ask if anything else is needed, thank them for calling.
If follow-up: confirm callback or email timeline.
Always end professionally: "Thank you for calling. Have a good day."`;

// Keep backward-compatible alias so the rest of the file doesn't need changes.
const ADA_PROMPT = SYSTEM_PROMPT;

// agentUid identifies the AI in the RTC channel — must match NEXT_PUBLIC_AGENT_UID on the client
const agentUid = process.env.NEXT_PUBLIC_AGENT_UID ?? String(DEFAULT_AGENT_UID);

// Language → { voiceId, instruction, greeting }
// Only languages supported by Valsea ASR are active.
// Languages without Valsea ASR support are commented out.
const LANGUAGE_CONFIG: Record<string, { voiceId: string; instruction: string; greeting: string }> = {
  en: {
    voiceId: 'English_captivating_female1',
    instruction: 'Always respond in English, regardless of what language the user speaks.',
    greeting:
      "Thank you for calling. You're through to voice support — I'm Maya. How may I help you today?",
  },
  vi: {
    voiceId: 'English_captivating_female1',
    instruction: 'Always respond in Vietnamese (Tiếng Việt), regardless of what language the user speaks.',
    greeting:
      'Xin chào, cảm ơn quý khách đã gọi. Đây là tổng đài hỗ trợ thoại — tôi là Maya. Tôi có thể hỗ trợ gì cho anh/chị hôm nay?',
  },
  // zh: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Mandarin Chinese (普通话), regardless of what language the user speaks.',
  //   greeting: '您好，感谢您的来电。这里是语音客服热线，我是Maya。请问今天有什么可以帮您？',
  // },
  // ja: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Japanese (日本語), regardless of what language the user speaks.',
  //   greeting: 'お電話ありがとうございます。音声サポートのMayaです。本日はどのようなご用件でしょうか？',
  // },
  // ko: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Korean (한국어), regardless of what language the user speaks.',
  //   greeting: '안녕하세요! 코카콜라 고객 지원센터입니다. 저는 Maya입니다. 오늘 어떻게 도와드릴까요?',
  // },
  // fr: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in French (Français), regardless of what language the user speaks.',
  //   greeting: 'Bonjour ! Vous avez joint le Service Client contact center. Je suis Maya. Comment puis-je vous aider aujourd\'hui ?',
  // },
  // es: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Spanish (Español), regardless of what language the user speaks.',
  //   greeting: '¡Hola! Ha llegado al Servicio de Atención al Cliente de contact center. Soy Maya. ¿En qué puedo ayudarle hoy?',
  // },
  // ── Supported by Valsea ASR ───────────────────────────────────────────────
  id: {
    voiceId: 'English_captivating_female1',
    instruction: 'Always respond in Indonesian (Bahasa Indonesia), regardless of what language the user speaks.',
    greeting:
      'Halo, terima kasih sudah menghubungi. Ini layanan suara kami — saya Maya. Ada yang bisa saya bantu hari ini?',
  },
  ms: {
    voiceId: 'English_captivating_female1',
    instruction: 'Always respond in Malay (Bahasa Melayu), regardless of what language the user speaks.',
    greeting:
      'Helo, terima kasih kerana menghubungi. Ini talian sokongan suara — saya Maya. Apa yang boleh saya bantu hari ini?',
  },
  th: {
    voiceId: 'English_captivating_female1',
    instruction: 'Always respond in Thai (ภาษาไทย), regardless of what language the user speaks.',
    greeting:
      'สวัสดีค่ะ ขอบคุณที่โทรมาค่ะ นี่คือสายสนับสนุนด้วยเสียง ดิฉันชื่อ Maya ค่ะ วันนี้ให้ช่วยอะไรได้บ้างคะ?',
  },
  tl: {
    voiceId: 'English_captivating_female1',
    instruction: 'Always respond in Filipino (Tagalog), regardless of what language the user speaks.',
    greeting:
      'Kumusta, salamat sa pagtawag. Ito ang aming voice support — ako si Maya. Paano kita matutulungan ngayon?',
  },
  ta: {
    voiceId: 'English_captivating_female1',
    instruction: 'Always respond in Tamil (தமிழ்), regardless of what language the user speaks.',
    greeting:
      'வணக்கம், அழைத்ததற்கு நன்றி. இது எங்கள் குரல் ஆதரவு வரிசை — நான் Maya. இன்று எவ்வாறு உதவலாம்?',
  },
  // my: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Burmese (မြန်မာဘာသာ), regardless of what language the user speaks.',
  //   greeting: 'မင်္ဂလာပါ! contact center ဖောက်သည်ဝန်ဆောင်မှုသို့ ကြိုဆိုပါသည်။ ကျွန်မ Maya ပါ။ ဒီနေ့ ဘာကူညီပေးရမလဲ?',
  // },
  km: {
    voiceId: 'English_captivating_female1',
    instruction: 'Always respond in Khmer (ភាសាខ្មែរ), regardless of what language the user speaks.',
    greeting:
      'សួស្តី សូមអរគុណដែលបានហៅមក។ នេះជាខ្សែជំនួយសំឡេងរបស់យើង — ខ្ញុំឈ្មោះ Maya ។ តើខ្ញុំអាចជួយអ្វីបានថ្ងៃនេះ?',
  },
  // 'sg-en': {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Singlish (Singaporean English creole). Use characteristic Singlish features: sentence-final particles like "lah", "leh", "lor", "meh", "sia", "can?"; direct grammar influenced by Malay and Hokkien; and a casual, friendly tone. For example: "Can do one lah, no worries!" or "Wah, that one very good leh."',
  //   greeting: "Hey there lah! You've reached contact center Customer Support. I'm Maya. How can I help you today?",
  // },
  // hi: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Hindi (हिन्दी), regardless of what language the user speaks.',
  //   greeting: 'नमस्ते! आप contact center के ग्राहक सेवा से जुड़े हैं। मैं Maya हूँ। आज मैं आपकी कैसे मदद कर सकती हूँ?',
  // },
  // pa: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Punjabi (ਪੰਜਾਬੀ), regardless of what language the user speaks.',
  //   greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਸੀਂ contact center ਦੀ ਗਾਹਕ ਸੇਵਾ ਨਾਲ ਜੁੜੇ ਹੋ। ਮੈਂ Maya ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੀ ਹਾਂ?',
  // },
  // bn: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Bengali (বাংলা), regardless of what language the user speaks.',
  //   greeting: 'নমস্কার! আপনি contact center গ্রাহক সেবায় যোগাযোগ করেছেন। আমি Maya। আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
  // },
  // te: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Telugu (తెలుగు), regardless of what language the user speaks.',
  //   greeting: 'నమస్కారం! మీరు contact center కస్టమర్ సపోర్ట్‌కు చేరుకున్నారు. నేను Maya. ఈరోజు మీకు ఎలా సహాయం చేయగలను?',
  // },
  // mr: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Marathi (मराठी), regardless of what language the user speaks.',
  //   greeting: 'नमस्कार! तुम्ही contact center च्या ग्राहक सेवेशी जोडले गेले आहात. मी Maya आहे. आज मी तुम्हाला कशी मदद करू शकते?',
  // },
  // kn: {
  //   voiceId: 'English_captivating_female1',
  //   instruction: 'Always respond in Kannada (ಕನ್ನಡ), regardless of what language the user speaks.',
  //   greeting: 'ನಮಸ್ಕಾರ! ನೀವು contact center ಗ್ರಾಹಕ ಸೇವೆಯನ್ನು ತಲುಪಿದ್ದೀರಿ. ನಾನು Maya. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
  // },
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

// Valsea language name strings as expected by the valsea-rtt model.
const VALSEA_ASR_LANGUAGE: Record<string, string> = {
  en: 'english',
  vi: 'vietnamese',
  id: 'indonesian',
  ms: 'malay',
  th: 'thai',
  tl: 'filipino',
  ta: 'tamil',
  km: 'khmer',
};

// Valsea STT — used for all active languages (all of which are Valsea-supported).
class ValseaSTT extends BaseSTT {
  constructor(private language: string) { super(); }
  toConfig() {
    return {
      vendor: 'valsea',
      params: {
        uri: 'wss://api.valsea.ai/v1/realtime',
        auth_mode: 'header',
        header_name: 'Authorization',
        header_value: `Bearer ${requireEnv('NEXT_VALSEA_API_KEY')}`,
        audio_format: 'pcm16',
        sample_rate: 16000,
        model: 'valsea-rtt',
        enable_correction: true,
        language: this.language,
      },
    } as unknown as ReturnType<BaseSTT['toConfig']>;
  }
}

// Qwen TTS via DashScope — uses the OpenAI-compatible vendor path.
// The LLM uses a top-level `url` field (not params.url/base_url) for custom endpoints.
// TTS follows the same pattern: top-level `url` overrides the default OpenAI endpoint.
class QwenTTS extends BaseTTS {
  constructor(
    private apiKey: string,
    private baseUrl: string,
    private model: string,
    private voice: string,
    private speed: number,
  ) { super(); }
  toConfig() {
    return {
      vendor: 'openai',
      // Top-level url mirrors how OpenAI LLM sets its endpoint; Agora routes TTS
      // calls here instead of the default https://api.openai.com/v1/audio/speech.
      url: `${this.baseUrl}/audio/speech`,
      params: {
        api_key: this.apiKey,
        model: this.model,
        voice: this.voice,
        speed: this.speed,
      },
    } as unknown as ReturnType<BaseTTS['toConfig']>;
  }
}

// Returns the TTS engine for the given provider.
// requestProvider (from request body) takes precedence over NEXT_TTS_PROVIDER env var.
// Values: minimax-preset (default) | minimax-byok | qwen
function buildTTS(langVoiceId: string, requestProvider?: string): MiniMaxTTS | QwenTTS {
  const provider = requestProvider ?? process.env.NEXT_TTS_PROVIDER ?? 'minimax-preset';
  const minimaxVoiceId = process.env.NEXT_MINIMAX_VOICE_ID ?? langVoiceId;

  if (provider === 'minimax-byok') {
    return new MiniMaxTTS({
      key: requireEnv('NEXT_MINIMAX_API_KEY'),
      groupId: requireEnv('NEXT_MINIMAX_GROUP_ID'),
      model: process.env.NEXT_MINIMAX_MODEL ?? 'speech-02-turbo',
      voiceId: minimaxVoiceId,
      url: process.env.NEXT_MINIMAX_URL ?? 'wss://api-uw.minimax.io/ws/v1/t2a_v2',
    });
  }

  if (provider === 'qwen') {
    return new QwenTTS(
      requireEnv('DASHSCOPE_API_KEY'),
      process.env.NEXT_QWEN_BASE_URL ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      process.env.NEXT_QWEN_MODEL ?? 'cosyvoice-v2',
      process.env.NEXT_QWEN_VOICE ?? 'longxiaochun',
      Number(process.env.NEXT_QWEN_SPEED ?? '1'),
    );
  }

  // Default: minimax-preset (Agora-managed credentials)
  return new MiniMaxTTS({
    model: 'speech_2_8_turbo',
    voiceId: minimaxVoiceId,
  });
}

export async function POST(request: NextRequest) {
  try {
    // --- 1. Parse request ---

    const body: ClientStartRequest = await request.json();
    const { requester_id, channel_name, languageCode = 'vi', ttsProvider, allowLanguageSwitching = false } = body;
    const lang = LANGUAGE_CONFIG[languageCode] ?? LANGUAGE_CONFIG['vi'];
    const greeting = process.env.NEXT_AGENT_GREETING ?? lang.greeting;

    // Validate required env vars on first request so misconfiguration surfaces
    // with a clear error message rather than a silent failure.
    const appId = requireEnv('NEXT_PUBLIC_AGORA_APP_ID');
    const appCertificate = requireEnv('NEXT_AGORA_APP_CERTIFICATE');

    if (!channel_name || !requester_id) {
      return NextResponse.json(
        { error: 'channel_name and requester_id are required' },
        { status: 400 },
      );
    }

    // --- 2. Build and start the agent ---

    // AgoraClient authenticates API calls to the Agora Conversational AI service.
    const client = new AgoraClient({
      area: Area.US,
      appId,
      appCertificate,
    });

    const tts = buildTTS(lang.voiceId, ttsProvider);

    // STT selection:
    // - Language switching ON  → Agora AresSTT (built-in multilingual, no key required).
    //   The user may speak any language mid-call and the LLM will detect and match it.
    // - Language switching OFF → Valsea STT locked to the selected language for maximum
    //   single-language accuracy.
    let stt: BaseSTT;
    if (allowLanguageSwitching) {
      stt = new AresSTT();
    } else {
      const valseaLang = VALSEA_ASR_LANGUAGE[languageCode] ?? VALSEA_ASR_LANGUAGE['vi'];
      stt = new ValseaSTT(valseaLang);
    }

    // LLM instruction adapts to the switching mode.
    const languageInstruction = allowLanguageSwitching
      ? 'Detect the language the user is currently speaking and respond in that exact language every single turn. If they speak Mandarin (普通话), reply in Mandarin. If they speak Tamil (தமிழ்), reply in Tamil. If they speak English, reply in English. Always match the user\'s language — never lock onto one language.'
      : lang.instruction;

    // Pipeline: STT → OpenAI LLM → MiniMax TTS.
    const agent = new Agent({
      name: `conversation-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      instructions: `${ADA_PROMPT}\n\n# Language\n${languageInstruction}`,
      greeting: greeting,
      failureMessage: 'Please wait a moment.',
      maxHistory: 50,
      turnDetection: {
        config: {
          speech_threshold: 0.6,
          start_of_speech: {
            mode: 'vad',
            vad_config: {
              interrupt_duration_ms: 320,
              prefix_padding_ms: 300,
            },
          },
          end_of_speech: {
            mode: 'vad',
            vad_config: {
              silence_duration_ms: 480,
            },
          },
        },
      },
      advancedFeatures: { enable_rtm: true, enable_tools: true },
      parameters: { data_channel: 'rtm', enable_error_message: true },
    })
      .withStt(stt)
      .withLlm(
        new OpenAI({
          model: 'gpt-4o-mini',
          greetingMessage: greeting,
          failureMessage: 'Please wait a moment.',
          maxHistory: 15,
          params: {
            max_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
          },
        }),
      )
      .withTts(tts);

    // remoteUids restricts the agent to only process audio from this user
    const session = agent.createSession(client, {
      channel: channel_name,
      agentUid,
      remoteUids: [requester_id],
      idleTimeout: 30,
      expiresIn: ExpiresIn.hours(1),
      debug: true,
    });

    const resolvedProvider = ttsProvider ?? process.env.NEXT_TTS_PROVIDER ?? 'minimax-preset';
    console.log(`[invite-agent] Starting agent — lang=${languageCode} tts=${resolvedProvider}`);
    console.log('[invite-agent] TTS config:', JSON.stringify(tts.toConfig(), null, 2));

    const agentId = await session.start();

    console.log(`[invite-agent] Agent started — id=${agentId} tts=${resolvedProvider}`);

    return NextResponse.json({
      agent_id: agentId,
      create_ts: Math.floor(Date.now() / 1000),
      state: 'RUNNING',
    } as AgentResponse);
  } catch (error) {
    console.error('[invite-agent] Failed to start agent:', error);
    const message = error instanceof Error ? error.message : 'Failed to start conversation';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
