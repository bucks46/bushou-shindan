import { NextRequest, NextResponse } from 'next/server';
import { getById } from '@/lib/appRoster.mjs';
import { logEvent } from '@/lib/kvEvents';

// 短縮リダイレクタ /r/{id}（2026-07-21 実装・最小1本）
// 目的：QRエンコード文字列を短くしドット密度を下げる＝実機スキャン成功率UP。
//       ＋カード経由流入をサーバー側で1回だけ計上（着地side計測との二重化を回避）。
// スコープ厳守：命名体系・チャネル別UTMの拡張は今夜やらない
//   （7/23 岬 CV最適化すり合わせ / 7/26 藤堂アーキテクチャ監査へ分離）。
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // 302を毎回サーバーで返す（キャッシュ焼き付き＝計測漏れ防止）

// 2026-07-31：console.logからKV(Upstash for Redis)集約へ移行。/n/{id}と共通のlogEventを使用。
function recordServerEvent(name: string, props: Record<string, unknown>, req: NextRequest) {
  void logEvent(name, {
    ...props,
    ip: req.headers.get('x-forwarded-for') || 'local',
    ua: req.headers.get('user-agent')?.slice(0, 120) || '',
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const raw = rawId ?? '';
  const id = raw.padStart(2, '0'); // /r/6 も /r/06 も同じ武将に着地させる
  const origin = req.nextUrl.origin;
  const warrior = getById(id);

  if (!warrior) {
    // 範囲外・全角・文字列など不正id：真っ白な404よりトップ着地の方が
    // 物理配布物（刷り直せないカード）として親切。miss数も計上して監視。
    recordServerEvent('qr_redirect_miss', { raw }, req);
    return NextResponse.redirect(new URL('/', origin), 302);
  }

  recordServerEvent('qr_redirect', { id }, req);
  const dest = new URL(`/result/${id}`, origin);
  dest.searchParams.set('utm_source', 'card');
  dest.searchParams.set('utm_medium', 'share');
  dest.searchParams.set('utm_campaign', 'busho_card');
  // 武将別の拡散数を分離計測（2026-07-22 岬UTM体系化MTG 論点B）。
  // /r は既にidを持つため1行で付与＝ShareCard改修・命名体系変更なし（藤堂監査を待たず可）。
  dest.searchParams.set('utm_content', `warrior_${id}`);
  return NextResponse.redirect(dest, 302);
}
