'use client';

import { useEffect, useState } from 'react';

// 解放演出：結果画面の上に一度だけ再生。タップでスキップ。
// phase 0=溜め(シルエット脈打つ) → 1=墨が弾けて名前スラムイン → 2=晴れる(フェードアウト) → done
export default function RevealOverlay({ name, typeName }: { name: string; typeName: string }) {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 3000);
    const t3 = setTimeout(() => setDone(true), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (done) return null;

  function skip() {
    setPhase(2);
    setTimeout(() => setDone(true), 400);
  }

  return (
    <div
      onClick={skip}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-washi cursor-pointer overflow-hidden"
      style={{ animation: phase === 2 ? 'fadeout 0.5s ease forwards' : undefined }}
    >
      {phase === 0 && (
        <div className="flex flex-col items-center">
          <div className="pulse-dim" style={{ filter: 'blur(6px) grayscale(1)' }}>
            <Kabuto size={140} />
          </div>
          <p className="mt-6 font-mincho text-sumigray tracking-[0.3em] text-sm">
            あなたの武将が、決まった。
          </p>
        </div>
      )}

      {phase >= 1 && (
        <div className="relative flex items-center justify-center">
          {/* 墨だまり */}
          <div className="inkburst absolute h-[320px] w-[320px] rounded-full bg-sumi" />
          {/* 名前スラムイン */}
          <div className="relative z-10 text-center px-6">
            <p className="font-mincho text-washi/70 text-xs tracking-[0.4em] mb-3">其の名は</p>
            <h1 className="slamin font-mincho text-washi text-4xl sm:text-5xl font-bold">{name}</h1>
            <p className="font-mincho text-shu/90 text-sm tracking-[0.3em] mt-4">{typeName}</p>
          </div>
        </div>
      )}

      {phase < 2 && (
        <p className="absolute bottom-8 text-[10px] text-sumigray/50 font-mincho tracking-widest">
          タップでスキップ
        </p>
      )}
    </div>
  );
}

function Kabuto({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden>
      <path d="M60 22c-20 0-34 12-36 30-1 8 2 14 6 16h60c4-2 7-8 6-16-2-18-16-30-36-30z" fill="#1c1a17" />
      <path d="M60 8c-8 6-8 18 0 24 4-3 6-8 6-12s-2-9-6-12z" fill="#1c1a17" />
      <ellipse cx="60" cy="82" rx="26" ry="12" fill="#1c1a17" />
    </svg>
  );
}
