import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/kvEvents';

// note記事への自社所有リダイレクタ /n/{id}（2026-07-28設計・2026-07-31実装）
// 目的：X武将投稿→note記事のクリックをサーバー側で計上する。
// note.com側にはGA4等のトラッキングを置けず、着地先がnote.com(外部)のため
// クライアント計測の補助も効かない＝このサーバー側ログが唯一の測定点。
// /r/{id}と同じ武将ID体系・同じforce-dynamic+302パターンを踏襲。
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// id(=warriors.jsonのid) → note記事URL。
// 【2026-08-06暫定対応】2026-08-04のアカウント基盤刷新でnote12本を下書き非公開化したため、
// 従来の武将別note個別リンクは全て下書き状態（=リンク切れ）になっていた。
// 復旧するまでの暫定措置として、現在公開中の唯一のnote記事へ全武将を集約する。
// 武将別のUTM(utm_content)は維持するため、どの武将投稿からの流入かは引き続き計測可能。
// note3軸ローテーション設計（8/7収益導線レビュー）で恒久対応を決定予定。
const FALLBACK_NOTE_URL = 'https://note.com/ty_jiritsu/n/n36a80132fae6';
const NOTE_URLS: Record<string, string> = {
  '01': 'https://note.com/ty_jiritsu/n/nd5dc23b4b990', // 真田幸村（2026-08-07 書き直し版に差し戻し完了）
  '02': FALLBACK_NOTE_URL, // 伊達政宗
  '03': FALLBACK_NOTE_URL, // 明智光秀
  '04': 'https://note.com/ty_jiritsu/n/n3adcf20c854a', // 黒田官兵衛（2026-08-07 書き直し版に差し戻し完了）
  '05': FALLBACK_NOTE_URL, // 織田信長
  '06': FALLBACK_NOTE_URL, // 徳川家康
  '07': 'https://note.com/ty_jiritsu/n/n82f5c6e53133', // 豊臣秀吉（2026-08-14 書き直し版に差し戻し完了）
  '11': 'https://note.com/ty_jiritsu/n/nd8e7ab8eceb7', // 本多忠勝（2026-08-06 書き直し版に差し戻し完了）
  '12': FALLBACK_NOTE_URL, // 立花宗茂
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const raw = rawId ?? '';
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
