'use client';

import { trackEvent } from '@/lib/track.mjs';

type Cta = {
  id: string;
  headline: string;
  service: string;
  questions: string[];
  bullets: string[];
  closing: string;
  button: string;
  url: string;
  narrative?: string;
  noteBridge?: string;
  qualification?: string;
};

// 武将軸で選ばれた1CVを、箇条書きで直感的に見せる。クリック計測付き。
// narrative（武将固有の資格マッチングエピソード）がある場合は、
// 汎用の「痛みの問い」の代わりにそちらを表示する（2026-08-07 全武将アガルート一本化）。
export default function CTABlock({ cta, warriorId }: { cta: Cta; warriorId: string }) {
  return (
    <div className="rounded-sm border border-sumi/20 bg-white/50 p-6 font-mincho">
      <p className="text-lg font-bold sumi-title leading-snug mb-1">{cta.headline}</p>
      <p className="text-xs text-shu tracking-widest mb-4">── {cta.service}</p>

      {cta.narrative ? (
        <div className="mb-4">
          {cta.qualification && (
            <p className="inline-block text-[11px] text-shu border border-shu/40 rounded-sm px-2 py-0.5 mb-2 tracking-wider">
              {cta.qualification}
            </p>
          )}
          <p className="text-sumi/90 text-[15px] leading-relaxed">{cta.narrative}</p>
          {cta.noteBridge && (
            <p className="text-[11px] text-sumigray/70 mt-1">{cta.noteBridge}</p>
          )}
        </div>
      ) : (
        /* 痛みの問い */
        <div className="mb-4 space-y-1">
          {cta.questions.map((q, i) => (
            <p key={i} className="text-sumi/90 text-[15px]">
              <span className="text-shu mr-1">?</span>{q}
            </p>
          ))}
        </div>
      )}

      {/* 価値ドット */}
      <ul className="mb-4 space-y-1.5">
        {cta.bullets.map((b, i) => (
          <li key={i} className="flex text-sm text-sumi leading-relaxed">
            <span className="text-shu mr-2 shrink-0">・</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-sumigray mb-4">{cta.closing}</p>

      <a
        href={cta.url}
        target="_blank"
        rel="noopener sponsored"
        onClick={() => trackEvent('cta_click', { cta: cta.id, warriorId })}
        className="block bg-sumi text-washi rounded-sm px-6 py-4 text-center hover:bg-shu transition-colors"
      >
        ▶ {cta.button}
      </a>
    </div>
  );
}
