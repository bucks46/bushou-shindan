import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/kvEvents';

// イベント記録。Upstash for Redis(KV)に集約（2026-07-31 藤堂設計→橘実装）。
// 旧console.log方式はVercel Function Logsの保持期間が短く事後集計不可だったため置き換え。
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await logEvent(body.name, {
      ...body.props,
      path: body.path,
      ip: req.headers.get('x-forwarded-for') || 'local',
      ua: req.headers.get('user-agent')?.slice(0, 120) || '',
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
