'use client';

import { useRef, useState } from 'react';
import QRCode from 'qrcode';
import { trackEvent } from '@/lib/track.mjs';

// 結果カードを canvas 生成 → モバイル:Web Share API(画像付き) / PC:ダウンロード。
// カード面は販促ゼロ（武将+型+ハンドル/URL）＝健太ゲート。
// 墨絵武将画像が public/images/warriors/{id}.jpg にあればそれを描画、無ければ従来の兜シルエットにフォールバック。
// QRは実際に踏める result URL（+UTM）を指す。短縮URL /r/{id} 実装後にそちらへ差し替え予定。
const CARD_W = 1080;
const CARD_H = 1350; // IGフィード 4:5
const IMG_X = 140, IMG_Y = 240, IMG_W = CARD_W - 280, IMG_H = 620;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function ShareCard({ name, typeName, id }: { name: string; typeName: string; id: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [busy, setBusy] = useState(false);
  const displayUrl = `bushou-shindan.com/result/${id}`;
  const qrTargetUrl = `https://bushou-shindan.com/result/${id}?utm_source=card&utm_medium=share`;

  async function draw(): Promise<Blob> {
    const warriorImg = await loadImage(`/images/warriors/${id}.jpg`);
    const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
      margin: 0,
      color: { dark: '#1c1a17', light: '#f4f1e8' },
    });
    const qrImg = await loadImage(qrDataUrl);

    return new Promise((resolve, reject) => {
      const c = canvasRef.current!;
      c.width = CARD_W; c.height = CARD_H;
      const g = c.getContext('2d')!;
      // 和紙地
      g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, CARD_W, CARD_H);
      // 外枠
      g.strokeStyle = '#1c1a17'; g.lineWidth = 4;
      g.strokeRect(40, 40, CARD_W - 80, CARD_H - 80);
      // ヘッダ
      g.fillStyle = '#9b2d1f'; g.textAlign = 'center';
      g.font = '36px "Yu Mincho", serif';
      g.fillText('武 将 診 断', CARD_W / 2, 150);

      if (warriorImg) {
        // 墨絵武将画像（cover-fit・角丸なしでミニマルに）
        g.save();
        g.beginPath(); g.rect(IMG_X, IMG_Y, IMG_W, IMG_H); g.clip();
        const scale = Math.max(IMG_W / warriorImg.width, IMG_H / warriorImg.height);
        const dw = warriorImg.width * scale, dh = warriorImg.height * scale;
        g.drawImage(warriorImg, IMG_X + (IMG_W - dw) / 2, IMG_Y + (IMG_H - dh) / 2, dw, dh);
        g.restore();
      } else {
        // 墨ブロック＋兜シルエット（プレースホルダ・フォールバック）
        g.fillStyle = '#1c1a17';
        g.fillRect(IMG_X, IMG_Y, IMG_W, IMG_H);
        g.save();
        g.translate(CARD_W / 2 - 90, 430); g.scale(1.5, 1.5);
        g.fillStyle = '#f4f1e8';
        g.beginPath();
        g.moveTo(60, 22); g.bezierCurveTo(40, 22, 26, 34, 24, 52);
        g.bezierCurveTo(23, 60, 26, 66, 30, 68); g.lineTo(90, 68);
        g.bezierCurveTo(94, 66, 97, 60, 96, 52); g.bezierCurveTo(94, 34, 80, 22, 60, 22);
        g.fill();
        g.restore();
      }

      // 型
      g.fillStyle = '#9b2d1f'; g.font = '40px "Yu Mincho", serif';
      g.fillText(typeName, CARD_W / 2, 990);
      // 武将名（大）
      g.fillStyle = '#1c1a17'; g.font = 'bold 110px "Yu Mincho", serif';
      g.fillText(name, CARD_W / 2, 1120);
      // 流入装置：URL + 実QR（IGはリンク非対応のため唯一の流入導線・外枠下端1310に収まるよう配置）
      g.font = '26px "Yu Mincho", serif'; g.fillStyle = '#4a463f';
      g.fillText(displayUrl, CARD_W / 2, 1195);
      if (qrImg) {
        const qrSize = 100;
        g.drawImage(qrImg, CARD_W / 2 - qrSize / 2, 1205, qrSize, qrSize);
      }

      c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob失敗'))), 'image/png');
    });
  }

  async function onShare() {
    setBusy(true);
    try {
      const blob = await draw();
      const file = new File([blob], `bushou_${id}.png`, { type: 'image/png' });
      // モバイル：画像付きネイティブ共有（X/IG/LINEのロゴが並ぶOS共有シート）
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: `私は「${name}」型でした #武将診断` });
        trackEvent('card_share', { id, name, method: 'web_share' });
      } else {
        // PC等：ダウンロード
        downloadBlob(blob);
        trackEvent('card_download', { id, name, method: 'download_fallback' });
      }
    } catch {
      /* キャンセル等は無視 */
    } finally {
      setBusy(false);
    }
  }

  async function onDownload() {
    setBusy(true);
    try {
      downloadBlob(await draw());
      trackEvent('card_download', { id, name, method: 'button' });
    } finally {
      setBusy(false);
    }
  }

  function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `武将診断_${name}.png`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-2">
      <button
        onClick={onShare}
        disabled={busy}
        className="w-full bg-shu text-washi rounded-sm px-6 py-4 font-mincho text-base hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {busy ? '生成中…' : '結果カードをシェアする'}
      </button>
      <button
        onClick={onDownload}
        disabled={busy}
        className="w-full border border-sumi/40 rounded-sm px-6 py-2.5 font-mincho text-sm text-sumigray hover:border-sumi transition-colors disabled:opacity-50"
      >
        カード画像を保存（X・Instagram・LINEへ）
      </button>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
