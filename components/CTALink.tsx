'use client';

import { trackEvent } from '@/lib/track.mjs';

// CTAクリックを計測する外部リンク。どのCTAが押されたかを収益導線レビューで見る。
export default function CTALink({
  href, cta, warriorId, className, children,
}: {
  href: string; cta: string; warriorId: string; className?: string; children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener sponsored"
      className={className}
      onClick={() => trackEvent('cta_click', { cta, warriorId })}
    >
      {children}
    </a>
  );
}
