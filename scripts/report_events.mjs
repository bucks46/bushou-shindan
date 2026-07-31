// イベント集計スクリプト（2026-07-31 藤堂設計→橘実装）
// 実行：node --env-file=.env.local scripts/report_events.mjs
// KVに溜まったイベントログから、質問到達数（離脱ポイント）とCTA/シェア系の件数を集計する。
import { kv } from '@vercel/kv';

const EVENTS_KEY = 'events:log';

async function main() {
  const raw = await kv.lrange(EVENTS_KEY, 0, -1);
  const events = raw
    .map((line) => {
      try {
        return typeof line === 'string' ? JSON.parse(line) : line;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  console.log(`総イベント数: ${events.length}`);
  if (events.length === 0) {
    console.log('（まだイベントがありません）');
    return;
  }

  // 質問到達数（0始まり=Q1として+1表示）＝離脱ポイントの可視化
  const questionCounts = {};
  for (const e of events) {
    if (e.name === 'question_answered') {
      const q = e.props?.q;
      if (typeof q === 'number') questionCounts[q + 1] = (questionCounts[q + 1] || 0) + 1;
    }
  }
  console.log('\n■ 質問到達数（第何問まで回答したか）');
  const maxQ = Math.max(0, ...Object.keys(questionCounts).map(Number));
  for (let q = 1; q <= maxQ; q++) {
    console.log(`  第${q}問回答: ${questionCounts[q] || 0}件`);
  }

  // その他主要イベントの単純カウント
  const otherNames = ['cta_click', 'card_share', 'card_download', 'qr_redirect', 'qr_redirect_miss', 'note_redirect', 'note_redirect_miss'];
  console.log('\n■ その他イベント件数');
  for (const name of otherNames) {
    const count = events.filter((e) => e.name === name).length;
    console.log(`  ${name}: ${count}件`);
  }

  // 直近10件（動作確認用）
  console.log('\n■ 直近10件のイベント');
  for (const e of events.slice(0, 10)) {
    console.log(`  [${e.at}] ${e.name} ${JSON.stringify(e.props || {})}`);
  }
}

main().catch((err) => {
  console.error('集計エラー:', err);
  process.exit(1);
});
