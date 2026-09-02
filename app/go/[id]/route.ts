import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/kvEvents';

// 汎用アウトバウンドリダイレクタ /go/{id}（2026-09-02設計・実装）
// 目的：note.com以外の外部アフィリエイト先（STUDYing等）へのXリンクが
// 「potentially harmful」判定を受けてブロックされる問題を回避する。
// 2026-08-11判明：a8.net/afi-b.com等の直リンクをX投稿本文に貼ると、
// Xがリンクを危険判定してブロックすることがある(prj_hightticket_account_persona_pivot_studying_20260811.md参照)。
// 自社ドメイン(bushou-shindan.com)経由に迂回することでこれを回避しつつ、
// サーバー側でクリックを計測する。/n/{id}と同じforce-dynamic+302パターンを踏襲。
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// id → 外部リンク。note.com以外の任意の外部アフィリエイト・提携先を想定。
const GO_URLS: Record<string, string> = {
  'studying': 'https://t.afi-b.com/visit.php?a=y7404W-W244982K&p=j984727j', // STUDYing(KIYOラーニング) A8.net提携リンク・PID:7404
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const raw = rawId ?? '';
  const id = raw.toLowerCase();
  const origin = req.nextUrl.origin;
  const dest = GO_URLS[id];

  if (!dest) {
    void logEvent('go_redirect_miss', { raw });
    return NextResponse.redirect(new URL('/', origin), 302);
  }

  const url = new URL(dest);

  void logEvent('go_redirect', {
    id,
    ip: req.headers.get('x-forwarded-for') || 'local',
    ua: req.headers.get('user-agent')?.slice(0, 120) || '',
  });

  return NextResponse.redirect(url, 302);
}
