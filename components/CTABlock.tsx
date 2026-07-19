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
};

// 武将軸で選ばれた1CVを、箇条書きで直感的に見せる。クリック計測付き。
export default function CTABlock({ cta, warriorId }: { cta: Cta; warriorId: string }) {
  return (
    <div className="rounded-sm border border-sumi/20 bg-white/50 p-6 font-mincho">
      <p className="text-lg font-bold sumi-title leading-snug mb-1">{cta.headline}</p>
      <p className="text-xs text-shu tracking-widest mb-4">── {cta.service}</p>

      {/* 痛みの問い */}
      <div className="mb-4 space-y-1">
        {cta.questions.map((q, i) => (
          <p key={i} className="text-sumi/90 text-[15px]">
            <span className="text-shu mr-1">?</span>{q}
          </p>
        ))}
      </div>

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
