// 武将解説（2026-07-08 council通過・CEO承認済み20体コピー）。
// data/descriptions.json（key=id）を正とし、万一欠けたら mainAxis 汎用にフォールバック。
import DESCRIPTIONS from '../data/descriptions.json';

const AXIS_FALLBACK = {
  動: { typeName: '猛進型', bridge: '強みの"置き場所"を一緒に見直す' },
  静: { typeName: '深慮型', bridge: '自分の"軸"を言葉にするところから' },
  策謀: { typeName: '軍師型', bridge: '強みの"置き場所"を一緒に見直す' },
  宴: { typeName: '人望型', bridge: '「このままでいいのか」を、責められずにほどく' },
  斜陽: { typeName: '不屈型', bridge: '「このままでいいのか」を、責められずにほどく' },
  象徴: { typeName: 'カリスマ型', bridge: '自分の"軸"を言葉にするところから' },
};

export function describe(warrior) {
  const d = DESCRIPTIONS[warrior.id];
  if (d) {
    return {
      typeName: d.typeName,
      self: d.self,      // 【A】自己投影
      career: d.career,  // 【B】キャリア解放
      bridge: d.bridge,  // 【C】POSIWILLへの橋渡し（mainAxis 3型）
    };
  }
  // フォールバック（本来は全20体JSONにある想定）
  const f = AXIS_FALLBACK[warrior.mainAxis] || AXIS_FALLBACK['象徴'];
  return {
    typeName: f.typeName,
    self: `あなたは「${warrior.name}」型。${f.typeName}の持ち味を備えた人です。`,
    career: 'この持ち味は、正しく置かれた場所でこそ武器になります。',
    bridge: f.bridge,
  };
}
