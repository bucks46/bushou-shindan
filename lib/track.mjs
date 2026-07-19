// 軽量イベント計測（クリック/シェア/DL）。sendBeaconで/api/trackへ。
// 収益導線レビュー(金)の"計測の穴"を埋める最小実装。将来GA4/analyticsへ差し替え可。
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
}
