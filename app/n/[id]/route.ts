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
  '02': 'https://note.com/ty_jiritsu/n/nb2bc5a312b22', // 伊達政宗（2026-08-21 書き直し版に差し戻し完了・現代人物並行事例+図解入り）
  '03': 'https://note.com/ty_jiritsu/n/nacf898e91fa1', // 明智光秀（2026-08-25 書き直し版に差し戻し完了・現代人物並行事例+図解入り）
  '04': 'https://note.com/ty_jiritsu/n/n3adcf20c854a', // 黒田官兵衛（2026-08-07 書き直し版に差し戻し完了）
  '05': 'https://note.com/ty_jiritsu/n/ne1131b2ce7ce', // 織田信長（2026-08-28 書き直し版で新規個別URL化・現代事例+図解入り）
  '06': 'https://note.com/ty_jiritsu/n/nde754dd11875', // 徳川家康（2026-09-01 書き直し版で新規個別URL化・現代事例+図解入り）
  '07': 'https://note.com/ty_jiritsu/n/n82f5c6e53133', // 豊臣秀吉（2026-08-14 書き直し版に差し戻し完了）
  '11': 'https://note.com/ty_jiritsu/n/n94470988afc9', // 本多忠勝（2026-09-04 現代事例+図解入り版に差し替え・バフェット「能力の輪」）
  '12': 'https://note.com/ty_jiritsu/n/nb647859440ad', // 立花宗茂（2026-08-18 書き直し版に差し戻し完了）
  // 非武将コンテンツ(武将診断のwarriors.jsonに存在しないid)。
  // 2026-08-21判明：AI活用Tips系noteは直接note.comリンクで投稿してしまい計測不可だった穴を埋めるため追加。
  'tips01': 'https://note.com/ty_jiritsu/n/n61aad7b25b83', // AIに自己分析して丸投げしていませんか？（2026-08-21公開）
  'tips02': 'https://note.com/ty_jiritsu/n/nf064ae997b2a', // AIとの模擬面接、「面接官役をやって」だけで終わっていませんか？（2026-08-22公開）
  'tips03': 'https://note.com/ty_jiritsu/n/n2fbd94a634f9', // 業界研究、AIに「教えて」で終わっていませんか？（2026-08-23公開）
  'tips04': 'https://note.com/ty_jiritsu/n/nf32fe94db1a7', // 退職理由、本音をそのまま話して大丈夫だと思っていませんか？（2026-08-24公開）
  'tips05': 'https://note.com/ty_jiritsu/n/n0339fe975c2a', // 志望動機、AIに書かせたらバレますか？（2026-08-25公開）
  'tips06': 'https://note.com/ty_jiritsu/n/n1380805eb556', // 複数の内定、何を比べればいいか迷っていませんか？（2026-08-26公開）
  'tips07': 'https://note.com/ty_jiritsu/n/n31070221c15a', // 面接の「何か質問はありますか？」、毎回困っていませんか？（2026-08-27公開）
  'tips08': 'https://note.com/ty_jiritsu/n/n4ec4f567a05b', // 転職で年収は上がる、は本当に全世代に当てはまりますか？（2026-08-28公開）
  'tips09': 'https://note.com/ty_jiritsu/n/na0fbd9b93f6b', // 内定後の給与交渉、言い方を間違えると心証を損ねると思っていませんか？（2026-08-29公開）
  'tips10': 'https://note.com/ty_jiritsu/n/nbfbe88a03909', // 退職前の有給消化、切り出し方で気まずくなると思っていませんか？（2026-08-30公開）
  'tips11': 'https://note.com/ty_jiritsu/n/nc70e25abd263', // 職務経歴書、実績が数字で書けないと不利だと思っていませんか？（2026-09-01公開）
  'tips12': 'https://note.com/ty_jiritsu/n/n60f79ddb18a1', // 他社の選考状況、前回と話が変わって"バレる"のが不安になっていませんか？（2026-09-02公開）
  'tips13': 'https://note.com/ty_jiritsu/n/nb5c49d0a70e0', // AIにUIを作らせると、"AIっぽいダサさ"になると感じたことはありませんか？（2026-09-02公開・AI活用術シリーズ新設・CTAはアガルートAI人材コース&id1=ai_jinzai）
  'tips14': 'https://note.com/ty_jiritsu/n/n319ac1b1b3d2', // 見積もり作成、毎回ゼロから書き直していませんか？（2026-09-03公開・AI活用術シリーズ）
  'tips15': 'https://note.com/ty_jiritsu/n/ncf0d1522a146', // 業務委託契約書、この条項って普通ですか？と一人で悩んでいませんか？（2026-09-04公開・AI活用術シリーズ）
  'tips16': 'https://note.com/ty_jiritsu/n/nb4c0c6b6a917', // ポートフォリオ、AIで作った成果物をそのまま載せていませんか？（2026-09-05公開・AI活用術シリーズ）
  'tips17': 'https://note.com/ty_jiritsu/n/n3460aa84e1f6', // 支払い催促のメール、下手に出すぎて"舐められてる"感じになっていませんか？（2026-09-06公開・AI活用術シリーズ）
  'tips18': 'https://note.com/ty_jiritsu/n/n70f3f2a98d8e', // 修正依頼、"1回にまとめて"と言えずに何度も往復していませんか？（2026-09-07公開・AI活用術シリーズ）
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
