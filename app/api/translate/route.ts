import { NextRequest, NextResponse } from 'next/server';

const LANGUAGE_NAMES: Record<string, string> = {
  vi: 'Vietnamese',
  en: 'English',
  zh: 'Simplified Chinese',
};

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json() as { text?: string; targetLanguage?: string };
    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'text and targetLanguage are required' }, { status: 400 });
    }
    const apiKey = process.env.NEXT_LLM_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'NEXT_LLM_API_KEY not set' }, { status: 500 });

    const langName = LANGUAGE_NAMES[targetLanguage] ?? targetLanguage;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Translate the following text to ${langName}. Output only the translation, no explanations or extra text.`,
          },
          { role: 'user', content: text },
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!res.ok) return NextResponse.json({ error: 'OpenAI request failed' }, { status: res.status });
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const translation = data.choices?.[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ translation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Translation failed' },
      { status: 500 },
    );
  }
}
