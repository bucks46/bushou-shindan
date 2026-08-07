// サイト定数・CTA。武将軸で1CVに絞り、箇条書きで直感的に刺す（2026-07-16 CEO確定）。
import agarootMatches from '../data/agaroot_matches.json';

export const SITE = {
  name: '武将診断',
  tagline: '7つの問いで、あなたの中の戦国武将を診断する。',
  domain: 'bushou-shindan.com',
};

// 各CTAは箇条書き構造（見出し→痛みの問い→価値ドット→締め→ボタン）
export const CTA_CONTENT = {
  posiwill: {
    id: 'posiwill',
    headline: '「転職」の前に、"どう生きたいか"から。',
    service: 'POSIWILLキャリア',
    questions: ['本当に、転職が必要？', '自分の強みって、何だろう？'],
    bullets: [
      '転職サイトやエージェントでは埋まらない「自分の軸」と「本当の強み」を明確に',
      '自己分析 → キャリア設計 → 転職活動まで徹底伴走',
      '"どう生きたいか"を起点に、中長期のキャリアを一緒に描く',
    ],
    closing: 'まずは無料カウンセリングで、頭の中を棚卸ししませんか？',
    button: '無料カウンセリングを受けてみる',
    url: 'https://px.a8.net/svt/ejp?a8mat=4B5R07+CAD4SI+5H76+5YJRM',
  },
  agaroot: {
    id: 'agaroot',
    headline: '"武器"を、資格というかたちで。',
    service: 'アガルートアカデミー',
    questions: ['今の自分に、武器が足りない気がする', 'でも、独学は続かない'],
    bullets: [
      '講師が出題傾向を分析したオリジナルテキスト',
      '質問サービス・定期カウンセリング・バーチャル校舎で"孤独にさせない"サポート',
      '最大3倍速・動画DL・マルチデバイスで、いつでもどこでも',
      '対象講座に合格で受講料が全額返金される「合格特典」つき（※対象講座・合格条件あり）',
    ],
    closing: 'まずは、気になる資格の合格実績から見てみませんか？',
    button: '講座と合格実績を見る',
    url: 'https://t.afi-b.com/visit.php?a=W10308J-e346258m&p=j984727j',
  },
};

// 【2026-08-07 CEO決定】20体全武将にアガルート資格を個別マッチングし、1CVをアガルートへ一本化。
// mainAxis別出し分け（策謀=資格／他=POSIWILL）は廃止。旧ロジックはgitログ参照。
// 武将id → 個別マッチング済み資格情報（headline/narrative/note_bridge）を、
// アガルート共通CTA（bullets/closing/button/url）とマージして返す。
// narrativeが「痛みの問い」の代わりを担うため、questionsは持たせない。
export function agarootCtaForWarrior(warriorId) {
  const match = agarootMatches[warriorId];
  const base = CTA_CONTENT.agaroot;
  if (!match) return base; // 未マッチ武将はフォールバック（現状20体全て定義済み）
  return {
    ...base,
    headline: match.headline,
    narrative: match.narrative,
    noteBridge: match.note_bridge,
    qualification: match.qualification,
    questions: [], // narrativeで代替するため空に
  };
}

export const PR_LABEL = '※本ページはアフィリエイト広告（PR）を含みます。';
