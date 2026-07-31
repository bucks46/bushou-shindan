import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/kvEvents';

// note記事への自社所有リダイレクタ /n/{id}（2026-07-28設計・2026-07-31実装）
// 目的：X武将投稿→note記事のクリックをサーバー側で計上する。
// note.com側にはGA4等のトラッキングを置けず、着地先がnote.com(外部)のため
// クライアント計測の補助も効かない＝このサーバー側ログが唯一の測定点。
// /r/{id}と同じ武将ID体系・同じforce-dynamic+302パターンを踏襲。
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// id(=warriors.jsonのid) → note記事URL。note有の武将のみ掲載（project_hightticket_note_workflow.md準拠）
const NOTE_URLS: Record<string, string> = {
  '01': 'https://note.com/ty_jiritsu/n/n613f31748de8', // 真田幸村
  '02': 'https://note.com/ty_jiritsu/n/nc1ed80eb0dd5', // 伊達政宗
  '03': 'https://note.com/ty_jiritsu/n/n08430a98c4e0', // 明智光秀
  '04': 'https://note.com/ty_jiritsu/n/nac2a4c33f71a', // 黒田官兵衛
  '05': 'https://note.com/ty_jiritsu/n/ne4a3cd2f99ff', // 織田信長
  '06': 'https://note.com/ty_jiritsu/n/n4591edf1d105', // 徳川家康
  '07': 'https://note.com/ty_jiritsu/n/n7f4c2c9608b5', // 豊臣秀吉
  '11': 'https://note.com/ty_jiritsu/n/nb5ab97165e63', // 本多忠勝
  '12': 'https://note.com/ty_jiritsu/n/n00a6adf00712', // 立花宗茂
};

export function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const raw = params.id ?? '';
  const id = raw.padStart(2, '0');
  const origin = req.nextUrl.origin;
  const dest = NOTE_URLS[id];

  if (!dest) {
    // note未掲載の武将・不正id：トップへフォールバック（/rと同じ方針）
    void logEvent('note_redirect_miss', { raw });
    return NextResponse.redirect(new URL('/', origin), 302);
  }

  const url = new URL(dest);
  url.searchParams.set('utm_source', 'x');
  url.searchParams.set('utm_medium', 'social');
  url.searchParams.set('utm_campaign', 'warrior_x');
  url.searchParams.set('utm_content', `warrior_${id}`);

  void logEvent('note_redirect', {
    id,
    ip: req.headers.get('x-forwarded-for') || 'local',
    ua: req.headers.get('user-agent')?.slice(0, 120) || '',
  });

  return NextResponse.redirect(url, 302);
}
