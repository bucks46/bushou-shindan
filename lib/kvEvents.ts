import { kv } from '@vercel/kv';

// 全イベントをRedisリストに集約（2026-07-31 藤堂設計→橘実装）。
// 直近MAX_EVENTS件のみ保持（無料枠のメモリを圧迫しないためのローテーション）。
const EVENTS_KEY = 'events:log';
const MAX_EVENTS = 5000;

export async function logEvent(name: string, props: Record<string, unknown> = {}) {
  const line = JSON.stringify({
    name,
    props,
    ts: Date.now(),
    at: new Date().toISOString(),
  });
  try {
    await kv.lpush(EVENTS_KEY, line);
    await kv.ltrim(EVENTS_KEY, 0, MAX_EVENTS - 1);
  } catch (err) {
    // 計測失敗でリクエスト自体は落とさない
    console.error('[EVENT_KV_ERROR]', err);
  }
}
