"use client";

import type { RTMClient } from "agora-rtm";
import { Loader2, Sun, Moon } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentResponse,
  AgoraRenewalTokens,
  AgoraTokenData,
  ClientStartRequest,
} from "../types/conversation";
import { ErrorBoundary } from "./ErrorBoundary";
import { OnboardingTip } from "./OnboardingTip";
import {
  SessionConnectingOverlay,
  type ConnectStep,
} from "./SessionConnectingOverlay";
import { useDocumentLang } from "@/hooks/useDocumentLang";
import { useTheme } from "@/hooks/useTheme";
import { LoadingSkeleton } from "./LoadingSkeleton";

const ConversationComponent = dynamic(() => import("./ConversationComponent"), {
  ssr: false,
});

const AgoraProvider = dynamic(
  async () => {
    const { AgoraRTCProvider, default: AgoraRTC } =
      await import("agora-rtc-react");
    return {
      default: function AgoraProviders({
        children,
      }: {
        children: React.ReactNode;
      }) {
        const clientRef = useRef<ReturnType<
          typeof AgoraRTC.createClient
        > | null>(null);
        if (!clientRef.current) {
          clientRef.current = AgoraRTC.createClient({
            mode: "rtc",
            codec: "vp8",
          });
        }
        return (
          <AgoraRTCProvider client={clientRef.current}>
            {children}
          </AgoraRTCProvider>
        );
      },
    };
  },
  { ssr: false },
);

// Valsea-ASR-supported languages
const LANGUAGE_OPTIONS = [
  { label: "English", code: "en" },
  { label: "Vietnamese (Tiếng Việt)", code: "vi" },
] as const;

const AGORA_APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;

export default function LandingPage() {
  const [showConversation, setShowConversation] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("vi");
  const [allowLanguageSwitching, setAllowLanguageSwitching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agoraData, setAgoraData] = useState<AgoraTokenData | null>(null);
  const [rtmClient, setRtmClient] = useState<RTMClient | null>(null);
  const [agentJoinError, setAgentJoinError] = useState(false);
  const [connectSteps, setConnectSteps] = useState<ConnectStep[]>([
    { id: "token", label: "Securing voice channel", status: "pending" },
    { id: "agent", label: "Starting AI agent", status: "pending" },
    { id: "rtm", label: "Connecting transcript stream", status: "pending" },
  ]);
  const { isDark, toggle: toggleTheme } = useTheme();

  useDocumentLang(selectedLanguage);

  const setStepStatus = (
    id: string,
    status: ConnectStep["status"],
  ) => {
    setConnectSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s)),
    );
  };

  useEffect(() => {
    import("agora-rtc-react").catch(() => {});
    import("agora-rtm").catch(() => {});
  }, []);

  const handleTokenWillExpire = useCallback(
    async (uid: string): Promise<AgoraRenewalTokens> => {
      const channel = agoraData?.channel;
      if (!channel) throw new Error("Missing channel for token renewal");
      const [rtcResponse, rtmResponse] = await Promise.all([
        fetch(`/api/generate-agora-token?channel=${channel}&uid=${uid}`),
        fetch(`/api/generate-agora-token?channel=${channel}&uid=0`),
      ]);
      const [rtcData, rtmData] = await Promise.all([
        rtcResponse.json(),
        rtmResponse.json(),
      ]);
      if (!rtcResponse.ok || !rtmResponse.ok)
        throw new Error("Failed to generate renewal tokens");
      return { rtcToken: rtcData.token, rtmToken: rtmData.token };
    },
    [agoraData],
  );

  const handleChangeLanguage = useCallback(
    async (newLang: string) => {
      // Throw so the caller (handleLangChange) can catch and revert the optimistic update.
      if (!agoraData?.channel || !agoraData.uid) {
        throw new Error("Missing session data for language switch");
      }
      if (agoraData.agentId) {
        // Stop old agent — best-effort, never block the switch on failure.
        try {
          await fetch("/api/stop-conversation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agent_id: agoraData.agentId }),
          });
        } catch (err) {
          console.warn(
            "[lang-switch] stop-conversation failed (continuing):",
            err,
          );
        }
        // client.stopAgent() signals Agora asynchronously — the agent leaves the RTC
        // channel 1–3 s after the HTTP 200. Wait before starting the replacement so
        // both agents aren't live simultaneously and the old one can't reply in the wrong language.
        await new Promise<void>((r) => setTimeout(r, 1500));
      }
      const res = await fetch("/api/invite-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requester_id: agoraData.uid,
          channel_name: agoraData.channel,
          languageCode: newLang,
          allowLanguageSwitching,
        } as ClientStartRequest),
      });
      if (!res.ok) throw new Error("Failed to restart agent with new language");
      const data: AgentResponse = await res.json();
      setAgoraData((prev) =>
        prev ? { ...prev, agentId: data.agent_id } : prev,
      );
      setSelectedLanguage(newLang);
    },
    [agoraData, allowLanguageSwitching],
  );

  if (!AGORA_APP_ID) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center bg-vs-page text-vs-fg">
        <p className="text-sm max-w-sm text-vs-fg-muted">
          <code className="bg-vs-brand-acc px-1.5 py-0.5 rounded text-vs-brand-text font-mono">
            NEXT_PUBLIC_AGORA_APP_ID
          </code>{" "}
          is not set. Add it to your environment and restart.
        </p>
      </div>
    );
  }

  const handleStartConversation = async () => {
    setIsLoading(true);
    setError(null);
    setAgentJoinError(false);
    setConnectSteps([
      { id: "token", label: "Securing voice channel", status: "active" },
      { id: "agent", label: "Starting AI agent", status: "pending" },
      { id: "rtm", label: "Connecting transcript stream", status: "pending" },
    ]);
    try {
      const agoraResponse = await fetch("/api/generate-agora-token");
      const responseData = await agoraResponse.json();
      if (!agoraResponse.ok) {
        throw new Error(
          `Failed to generate token: ${JSON.stringify(responseData)}`,
        );
      }
      setStepStatus("token", "done");
      setStepStatus("agent", "active");
      setStepStatus("rtm", "active");

      const { default: AgoraRTM } = await import("agora-rtm");
      const rtm: RTMClient = new AgoraRTM.RTM(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        String(Date.now()),
      );
      await rtm.login({ token: responseData.token });
      await rtm.subscribe(responseData.channel);

      setStepStatus("agent", "done");
      setStepStatus("rtm", "done");
      setRtmClient(rtm);
      setAgoraData(responseData);
      setShowConversation(true);
    } catch (err) {
      setError("Failed to start conversation. Please try again.");
      console.error("Error starting conversation:", err);
      setConnectSteps((prev) =>
        prev.map((s) =>
          s.status === "active" ? { ...s, status: "pending" as const } : s,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = () => {
    rtmClient?.logout().catch((err) => console.error("RTM logout error:", err));
    setRtmClient(null);
    setShowConversation(false);
  };

  // ── Active conversation: full-screen ────────────────────────────────────────
  if (showConversation && agoraData && rtmClient) {
    return (
      <div className="relative">
        {agentJoinError && (
          <div
            role="alert"
            className="absolute top-14 left-4 right-4 z-50 mx-auto max-w-lg text-xs text-center py-2.5 px-4 rounded-xl border border-amber-500/30 text-amber-100 bg-amber-950/90 backdrop-blur-md shadow-vs-md animate-fade-up"
          >
            Agent connection failed — conversation may not work as expected.
          </div>
        )}
        <Suspense fallback={<LoadingSkeleton />}>
          <ErrorBoundary>
            <AgoraProvider>
              <ConversationComponent
                agoraData={agoraData}
                rtmClient={rtmClient}
                onTokenWillExpire={handleTokenWillExpire}
                onEndConversation={handleEndConversation}
                selectedLanguage={selectedLanguage}
                allowLanguageSwitching={allowLanguageSwitching}
                onChangeLanguage={
                  allowLanguageSwitching ? handleChangeLanguage : undefined
                }
              />
            </AgoraProvider>
          </ErrorBoundary>
        </Suspense>
      </div>
    );
  }

  // ── Pre-call landing page ────────────────────────────────────────────────────
  return (
    <div className="vs-page-shell min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden p-6 sm:p-10 px-safe bg-vs-page text-vs-fg">
      <SessionConnectingOverlay visible={isLoading} steps={connectSteps} />
      <div className="vs-mesh-bg" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'var(--vs-ambient)' }}
      />

      <button
        onClick={toggleTheme}
        className="absolute top-safe right-5 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ease-vs-out bg-vs-ctrl-bg border border-vs-border-md text-vs-ctrl-icon shadow-vs-sm hover:shadow-vs-md hover:border-vs-brand/40 hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10 w-full max-w-md">
        <div className="flex flex-col items-center gap-4 text-center animate-fade-up">
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-3xl opacity-60 animate-vs-glow-pulse"
              style={{
                background:
                  'radial-gradient(circle, rgba(122,86,170,0.35) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />
            <Image
              src="/valsea-logo.png"
              alt="Valsea"
              width={72}
              height={72}
              className="relative rounded-2xl shadow-vs-lg ring-1 ring-vs-border-md"
              priority
            />
          </div>
          <div className="space-y-1.5">
            <p className="vs-label">Speech Intelligence</p>
            <h1 className="vs-heading text-2xl sm:text-3xl font-semibold text-vs-fg">
              Voice Agent Demo
            </h1>
            <p className="text-sm text-vs-fg-muted max-w-xs leading-relaxed">
              Real-time accent-aware conversation for Southeast Asian markets.
            </p>
          </div>
        </div>

        <div className="relative w-full animate-fade-up animate-fade-up-d1">
          <div className="vs-glass-card vs-panel-reveal relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 flex flex-col gap-6" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center font-display font-bold text-white text-base shadow-vs-sm">
                  C
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-vs-card" />
              </div>
              <div className="min-w-0">
                <p className="vs-heading text-base font-semibold leading-tight">
                  Coke CX
                </p>
                <p className="vs-label mt-1">
                  Customer experience pilot
                </p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-vs-divider to-transparent" />

            <OnboardingTip message="Tap Start, allow your microphone, then speak naturally. Real-time analysis appears as you talk." />

            <div className="flex flex-col gap-2.5">
              <label htmlFor="language-select" className="vs-label">
                Agent language
              </label>
              <select
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isLoading}
                className="vs-select w-full h-11 rounded-xl border border-vs-border-md px-3.5 text-sm font-medium text-vs-fg bg-vs-select-bg focus:outline-none focus:ring-2 focus:ring-vs-brand/30 focus:border-vs-brand disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-vs-out"
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option
                    key={opt.code}
                    value={opt.code}
                    className="bg-vs-select-option text-vs-fg"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStartConversation}
              disabled={isLoading}
              className="vs-btn-primary w-full h-12 rounded-xl text-white text-sm font-semibold font-display tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              style={
                isLoading
                  ? { background: 'var(--vs-btn-loading)', boxShadow: 'none' }
                  : undefined
              }
              aria-label={
                isLoading ? 'Starting conversation' : 'Start conversation'
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting session…
                </>
              ) : (
                'Start conversation'
              )}
            </button>

            {error && (
              <p
                role="alert"
                className="text-xs text-red-500 dark:text-red-400 text-center leading-relaxed animate-fade-up"
              >
                {error}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-vs-fg-dim text-center tracking-wide animate-fade-up animate-fade-up-d2 max-w-sm leading-relaxed">
          VALSEA — built for the way Asia really speaks.
        </p>
      </div>
    </div>
  );
}
