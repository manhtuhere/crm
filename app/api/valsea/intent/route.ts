import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const INTENT_SYSTEM_PROMPT = `You are an intent classifier for a multilingual CX voice agent.
Given a customer transcript and semantic tags from a speech analysis engine, extract structured intent data.
Respond with valid JSON only — no markdown, no prose, just the JSON object.

Schema:
{
  "intent": string,          // snake_case intent label, e.g. "place_order", "complaint", "pricing_inquiry", "track_shipment"
  "confidence": number,      // 0.0–1.0
  "entities": [{ "type": string, "value": string }],  // extracted entities, e.g. { "type": "product", "value": "Coca-Cola 1.5L" }
  "action_suggestion": string  // one-line recommended next action for the agent/CRM
}`;

export async function POST(request: NextRequest) {
  try {
    const { transcript, language } = await request.json() as { transcript?: string; language?: string };

    if (!transcript) {
      return NextResponse.json({ error: 'transcript is required' }, { status: 400 });
    }

    // Step 1: Valsea annotate — semantic tags
    const annotateForm = new URLSearchParams();
    annotateForm.set('model', 'valsea-annotate');
    annotateForm.set('text', transcript);
    annotateForm.set('enable_tags', 'true');
    annotateForm.set('enable_correction', 'false');
    if (language) annotateForm.set('language', language);

    let tags: string[] = [];
    try {
      const annotateRes = await fetch('https://api.valsea.ai/v1/annotate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${requireEnv('NEXT_VALSEA_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'valsea-annotate',
          text: transcript,
          enable_tags: true,
          enable_correction: false,
          ...(language ? { language } : {}),
        }),
      });
      if (annotateRes.ok) {
        const annotateData = await annotateRes.json() as { semantic_tags?: string[] };
        tags = annotateData.semantic_tags ?? [];
      }
    } catch {
      // Annotate failure is non-fatal — continue with LLM-only classification
    }

    // Step 2: LLM structured intent extraction
    const llmApiKey = process.env.NEXT_LLM_API_KEY;
    const llmUrl = process.env.NEXT_LLM_URL;

    if (!llmApiKey || !llmUrl) {
      // Return tag-only result when LLM is not configured
      return NextResponse.json({
        intent: tags[0] ?? 'unknown',
        confidence: tags.length > 0 ? 0.6 : 0.0,
        entities: [],
        action_suggestion: 'Configure NEXT_LLM_API_KEY and NEXT_LLM_URL for full intent analysis.',
        tags,
      });
    }

    const baseURL = llmUrl.replace(/\/chat\/completions\/?$/, '');
    const openai = createOpenAI({ apiKey: llmApiKey, baseURL });

    const userContent = [
      `Transcript: "${transcript}"`,
      tags.length > 0 ? `Semantic tags: ${tags.join(', ')}` : '',
    ].filter(Boolean).join('\n');

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: INTENT_SYSTEM_PROMPT,
      prompt: userContent,
    });

    let parsed: {
      intent?: string;
      confidence?: number;
      entities?: { type: string; value: string }[];
      action_suggestion?: string;
    };
    try {
      // Strip markdown code fences if the model wraps output despite instructions
      const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
      parsed = JSON.parse(clean) as typeof parsed;
    } catch {
      return NextResponse.json({ error: 'LLM returned non-JSON response', raw: text }, { status: 502 });
    }

    return NextResponse.json({
      intent: parsed.intent ?? 'unknown',
      confidence: parsed.confidence ?? 0,
      entities: parsed.entities ?? [],
      action_suggestion: parsed.action_suggestion ?? '',
      tags,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Intent analysis failed' },
      { status: 500 },
    );
  }
}
