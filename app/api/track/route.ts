import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

// イベント記録。ローカル(dev)は data/events.log に追記、
// 本番(Vercel)はファイルシステムが読み取り専用のため console.log で
// Vercel Function Logsに出力する（`vercel logs`で参照）。
// 恒久対応（週次集計向け永続化）は別途DB/GA4検討。
const IS_VERCEL = !!process.env.VERCEL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const line = JSON.stringify({
      ...body,
      ip: req.headers.get('x-forwarded-for') || 'local',
      ua: req.headers.get('user-agent')?.slice(0, 120) || '',
      at: new Date().toISOString(),
    });
    if (IS_VERCEL) {
      console.log('[EVENT]', line);
    } else {
      const file = path.join(process.cwd(), 'data', 'events.log');
      fs.appendFileSync(file, line + '\n');
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
