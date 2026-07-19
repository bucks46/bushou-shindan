import Link from 'next/link';
import type { Metadata } from 'next';
import fs from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import { getById } from '@/lib/appRoster.mjs';
import { describe } from '@/lib/descriptions.mjs';
import { ctaForAxis, PR_LABEL, SITE } from '@/lib/site.mjs';
import RevealOverlay from '@/components/RevealOverlay';
import ShareCard from '@/components/ShareCard';
import CTABlock from '@/components/CTABlock';

type Props = { params: { id: string } };

export function generateMetadata({ params }: Props): Metadata {
  const w = getById(params.id);
  if (!w) return { title: '武将診断' };
  return {
    title: `あなたは「${w.name}」型 | 武将診断`,
    description: `${SITE.tagline} 診断結果：${w.name}型。`,
    openGraph: { title: `あなたは「${w.name}」型`, description: SITE.tagline },
  };
}

export default function Result({ params }: Props) {
  const warrior = getById(params.id);
  if (!warrior) notFound();
  const d = describe(warrior);

  // 墨絵カード画像が選定済み（public/images/warriors/{id}.jpg）ならそれを表示、無ければ従来の墨プレースホルダ
  const hasImage = fs.existsSync(
    path.join(process.cwd(), 'public', 'images', 'warriors', `${warrior.id}.jpg`)
  );

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12">
      <RevealOverlay name={warrior.name} typeName={d.typeName} />
      <div className="w-full max-w-xl fadeup">
        <p className="text-center text-sm font-mincho text-shu tracking-widest mb-2">診断結果</p>

        {hasImage ? (
          <div className="mx-auto mb-6 aspect-[16/10] w-full rounded-sm overflow-hidden relative bg-sumi/90">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/warriors/${warrior.id}.jpg`}
              alt={`${warrior.name}（${d.typeName}）`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sumi/90 to-transparent px-4 pt-8 pb-3 text-washi">
              <span className="block text-xs tracking-widest opacity-80 mb-1">{d.typeName}</span>
              <span className="block font-mincho text-2xl font-bold tracking-wider">{warrior.name}</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto mb-6 aspect-[16/10] w-full rounded-sm bg-sumi/90 flex flex-col items-center justify-center text-washi">
            <span className="text-xs tracking-widest opacity-70 mb-2">{d.typeName}</span>
            <span className="font-mincho text-4xl font-bold tracking-wider">{warrior.name}</span>
          </div>
        )}

        <h1 className="sumi-title font-mincho text-2xl font-bold text-center mb-6">
          あなたは「{warrior.name}」型
        </h1>

        <section className="font-mincho leading-relaxed text-sumi space-y-4 mb-8">
          <div>
            <h2 className="text-shu text-sm mb-1 tracking-wider">◤ あなたは、こういう人</h2>
            <p>{d.self}</p>
          </div>
          <div>
            <h2 className="text-shu text-sm mb-1 tracking-wider">◤ この型が、いまの働き方でどう活きるか</h2>
            <p>{d.career}</p>
          </div>
        </section>

        {/* 武将軸で選ばれた1CVを箇条書きで（策謀=アガルート／他=POSIWILL） */}
        <div className="mb-3">
          <CTABlock cta={ctaForAxis(warrior.mainAxis)} warriorId={warrior.id} />
        </div>

        <p className="text-[10px] text-sumigray/70 font-mincho text-center mb-10">{PR_LABEL}</p>

        {/* 結果カードのシェア/DL（拡散エンジン＝販促ゼロのカード面） */}
        <div className="border-t border-sumi/15 pt-8 mb-6">
          <p className="text-center font-mincho text-sm text-sumigray mb-4 tracking-wider">
            この結果をカードで残す・広める
          </p>
          <ShareCard name={warrior.name} typeName={d.typeName} id={warrior.id} />
        </div>

        {/* 再診断 */}
        <div className="flex items-center justify-center font-mincho text-sm">
          <Link href="/shindan" className="text-sumigray hover:text-sumi">
            もう一度診断する
          </Link>
        </div>
      </div>
    </main>
  );
}
