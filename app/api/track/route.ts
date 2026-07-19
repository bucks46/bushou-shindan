import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

// イベントをローカルログ(data/events.log)へ追記。1行1JSON。
// 収益導線レビューで集計する用の最小実装（本番はGA4/DB等へ）。
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const line = JSON.stringify({
      ...body,
      ip: req.headers.get('x-forwarded-for') || 'local',
      ua: req.headers.get('user-agent')?.slice(0, 120) || '',
      at: new Date().toISOString(),
    });
    const file = path.join(process.cwd(), 'data', 'events.log');
    fs.appendFileSync(file, line + '\n');
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
