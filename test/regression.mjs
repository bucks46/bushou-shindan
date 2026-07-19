// 回帰テスト（Tier3の心臓部）— 実装コードそのものに全2187通りを流す。
// 受け入れ基準（設計書/プロンプト§8）：①20/20到達 ②最大集中30%未満 ③決定的
import { QUESTIONS } from '../lib/questions.mjs';
import { diagnose, ROSTER } from '../lib/diagnosis.mjs';

const nQ = QUESTIONS.length;
const tally = {};
let total = 0;

// 3^7 総当たり
(function rec(qi, answers) {
  if (qi === nQ) {
    const r = diagnose(answers);
    tally[r.name] = (tally[r.name] || 0) + 1;
    total++;
    return;
  }
  for (let opt = 0; opt < 3; opt++) rec(qi + 1, [...answers, opt]);
})(0, []);

const rows = Object.entries(tally).sort((a, b) => b[1] - a[1]);
const reached = rows.length;
const maxSharePct = (rows[0][1] / total) * 100;
const zero = ROSTER.map((w) => w.name).filter((n) => !tally[n]);

// 決定性チェック：同一回答を2回→同一結果
const sample = [0, 2, 1, 0, 2, 1, 0];
const det = diagnose(sample).name === diagnose(sample).name;

// 未回答ガード：例外が飛ぶこと
let guardOK = false;
try { diagnose([0, 1, 2]); } catch { guardOK = true; }

console.log(`総当たり ${total} 通り / ヒット ${reached}/20 体`);
console.log(`最大集中: ${maxSharePct.toFixed(1)}% (${rows[0][0]})`);
console.log(`到達不能: ${zero.length ? zero.join(', ') : 'なし ✓'}`);
console.log(`決定性: ${det ? 'OK' : 'NG'} / 未回答ガード: ${guardOK ? 'OK' : 'NG'}`);
console.log('下位5体:', rows.slice(-5).map(([n, c]) => `${n}:${(c / total * 100).toFixed(1)}%`).join(' , '));

const pass =
  total === 3 ** nQ &&
  reached === 20 &&
  maxSharePct < 30 &&
  det &&
  guardOK;

console.log('\n' + (pass ? '✅ PASS（Tier3受け入れ基準クリア）' : '❌ FAIL'));
process.exit(pass ? 0 : 1);
