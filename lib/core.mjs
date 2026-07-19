// 武将診断 — 純粋ロジック（fs非依存＝ブラウザ/Node両用）
// roster は呼び出し側が渡す（Nodeはfs読込・Nextはjson import）。ロジック二重管理を防ぐ単一の正。
import { AXES, QUESTIONS, SILHOUETTE_REVEAL_FROM } from './questions.mjs';

// raw.fullRoster → [{id,name,mainAxis,v:[6軸]}]
export function buildRoster(fullRoster) {
  return fullRoster.map((w) => ({
    id: w.id,
    name: w.displayName,
    mainAxis: w.mainAxis,
    v: AXES.map((a) => w.axisScores[a]),
  }));
}

function meanOf(roster) {
  return AXES.map((_, i) => roster.reduce((s, w) => s + w.v[i], 0) / roster.length);
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : -1;
}

// 回答（各問の選択肢index 0-2、部分可）→ 6軸ベクトル
export function vectorFromAnswers(answers) {
  const vec = [0, 0, 0, 0, 0, 0];
  answers.forEach((optIndex, qi) => {
    if (optIndex == null) return;
    const sc = QUESTIONS[qi].options[optIndex].score;
    AXES.forEach((a, i) => { vec[i] += sc[a] || 0; });
  });
  return vec;
}

// 中心化コサインで全武将を降順（決定的：同点はid昇順）
export function ranked(roster, answers) {
  const mean = meanOf(roster);
  const uc = vectorFromAnswers(answers).map((x, i) => x - mean[i]);
  return roster
    .map((w) => ({ id: w.id, name: w.name, mainAxis: w.mainAxis, score: cosine(uc, w.v.map((x, i) => x - mean[i])) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

// 最終診断（7問完答前提）
export function diagnose(roster, answers) {
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length || answers.some((a) => a == null)) {
    throw new Error(`全${QUESTIONS.length}問の回答が必要です（未回答での診断は不可）`);
  }
  return ranked(roster, answers)[0];
}

// シルエット暫定1位（REVEAL_FROM問未満は null＝汎用影）
export function provisionalMatch(roster, answersSoFar) {
  const answered = answersSoFar.filter((a) => a != null).length;
  if (answered < SILHOUETTE_REVEAL_FROM) return null;
  return ranked(roster, answersSoFar)[0];
}
