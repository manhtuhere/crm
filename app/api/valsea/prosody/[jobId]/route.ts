import { NextRequest, NextResponse } from 'next/server';
import { checkPollCooldown, getCachedResult, cacheResult } from '@/lib/valsea-rate-limit';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await params;

    const cached = getCachedResult(jobId);
    if (cached) return NextResponse.json(cached);

    if (!checkPollCooldown(jobId)) {
      return NextResponse.json({ error: 'Rate limit — try again shortly' }, { status: 429 });
    }

    const authHeader = { Authorization: `Bearer ${requireEnv('NEXT_VALSEA_API_KEY')}` };
    const statusRes = await fetch(`https://api.valsea.ai/v1/prosody/${jobId}`, { headers: authHeader });

    if (!statusRes.ok) return NextResponse.json(await statusRes.json(), { status: statusRes.status });

    const statusData = await statusRes.json() as Record<string, unknown>;
    if (statusData.status !== 'completed') {
      return NextResponse.json(statusData, { status: statusRes.status });
    }

    const resultRes = await fetch(`https://api.valsea.ai/v1/prosody/${jobId}/result`, { headers: authHeader });
    const resultData = await resultRes.json();
    if (resultRes.ok) cacheResult(jobId, resultData);
    return NextResponse.json(resultData, { status: resultRes.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Prosody poll failed' },
      { status: 500 },
    );
  }
}
