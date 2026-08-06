import { ImageResponse } from 'next/og';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { getById } from '@/lib/appRoster.mjs';
import { describe } from '@/lib/descriptions.mjs';

export const runtime = 'nodejs';
export const alt = '武将診断結果';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const WASHI = '#f4f1e8';
const SUMI = '#1c1a17';
const SHU = '#9b2d1f';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const warrior = getById(id);
  const typeName = warrior ? describe(warrior).typeName : '';

  // 元画像をそのままbase64埋め込みすると、画像によってSatori(next/og)側の処理が
  // 不安定になり500エラーになる個体があったため、OGP表示に十分な解像度まで
  // 縮小・再圧縮してから埋め込む（品川Tier3チェックで検出）。
  // クロップはSatori側のobjectFit任せ(中央固定)でなく、sharpで事前に1200x630へ
  // 上寄せクロップする。元画像は正方形が多く、中央クロップだと兜・旗・掲げた得物
  // など画面上部のモチーフが欠けやすいため、下部(地面・砂塵)側から多く削る。
  let imageSrc: string | null = null;
  if (warrior) {
    const imagePath = path.join(process.cwd(), 'public', 'images', 'warriors', `${warrior.id}.jpg`);
    if (fs.existsSync(imagePath)) {
      const buf = fs.readFileSync(imagePath);
      const TARGET_W = 1200;
      const TARGET_H = 630;
      const TOP_BIAS = 0.35; // 縦方向の余剰クロップのうち上から削る割合（0.5=中央/小さいほど上部を残す）
      const meta = await sharp(buf).metadata();
      const srcW = meta.width ?? TARGET_W;
      const srcH = meta.height ?? TARGET_H;
      const scale = Math.max(TARGET_W / srcW, TARGET_H / srcH);
      const scaledW = Math.round(srcW * scale);
      const scaledH = Math.round(srcH * scale);
      const excessW = scaledW - TARGET_W;
      const excessH = scaledH - TARGET_H;
      const left = Math.max(0, Math.min(excessW, Math.round(excessW / 2)));
      const top = Math.max(0, Math.min(excessH, Math.round(excessH * TOP_BIAS)));
      const cropped = await sharp(buf)
        .resize(scaledW, scaledH)
        .extract({ left, top, width: TARGET_W, height: TARGET_H })
        .jpeg({ quality: 78 })
        .toBuffer();
      imageSrc = `data:image/jpeg;base64,${cropped.toString('base64')}`;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: SUMI,
        }}
      >
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            width={1200}
            height={630}
            style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: SUMI,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 56px 44px',
            background: 'linear-gradient(to top, rgba(28,26,23,0.95), rgba(28,26,23,0))',
          }}
        >
          <div style={{ display: 'flex', color: SHU, fontSize: 28, letterSpacing: 6, marginBottom: 10 }}>
            武将診断
          </div>
          <div style={{ display: 'flex', color: WASHI, opacity: 0.8, fontSize: 26, letterSpacing: 4, marginBottom: 6 }}>
            {typeName}
          </div>
          <div style={{ display: 'flex', color: WASHI, fontSize: 64, fontWeight: 700, letterSpacing: 4 }}>
            あなたは「{warrior ? warrior.name : ''}」型
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
