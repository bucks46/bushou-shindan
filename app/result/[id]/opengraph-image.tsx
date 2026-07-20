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

export default async function Image({ params }: { params: { id: string } }) {
  const warrior = getById(params.id);
  const typeName = warrior ? describe(warrior).typeName : '';

  // 元画像(1024x1024・最大2MB弱)をそのままbase64埋め込みすると、画像によって
  // Satori(next/og)側の処理が不安定になり500エラーになる個体があったため、
  // OGP表示に十分な解像度まで縮小・再圧縮してから埋め込む（品川Tier3チェックで検出）。
  let imageSrc: string | null = null;
  if (warrior) {
    const imagePath = path.join(process.cwd(), 'public', 'images', 'warriors', `${warrior.id}.jpg`);
    if (fs.existsSync(imagePath)) {
      const buf = fs.readFileSync(imagePath);
      const resized = await sharp(buf).resize(800, 800, { fit: 'cover' }).jpeg({ quality: 78 }).toBuffer();
      imageSrc = `data:image/jpeg;base64,${resized.toString('base64')}`;
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
