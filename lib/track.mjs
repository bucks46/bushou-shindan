// 軽量イベント計測（クリック/シェア/DL）。sendBeaconで/api/trackへ（デバッグ用途）+ GA4（週次集計の本命）。
export function trackEvent(name, props = {}) {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({ name, props, ts: Date.now(), path: location.pathname });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'application/json' } });
    }
  } catch {
    /* 計測失敗はUXを止めない */
  }
  try {
    window.gtag?.('event', name, props);
  } catch {
    /* GA4未ロード等は無視 */
  }
}
