'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONS, SILHOUETTE_REVEAL_FROM } from '@/lib/questions.mjs';
import { runDiagnose, runProvisional } from '@/lib/appRoster.mjs';

export default function Shindan() {
  const router = useRouter();
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [current, setCurrent] = useState(0);

  const answeredCount = answers.filter((a) => a !== null).length;
  const q = QUESTIONS[current];

  // シルエット暫定（Q4以降のみ武将確定・それ未満はnull=汎用影）
  const provisional = useMemo(() => runProvisional(answers), [answers]);

  // 姿の鮮明さ：回答が進むほど blur が晴れる
  const blur = Math.max(0, 22 - answeredCount * 3);
  const revealed = answeredCount >= SILHOUETTE_REVEAL_FROM;

  function choose(optIndex: number) {
    const next = [...answers];
    next[current] = optIndex;
    setAnswers(next);

    if (current < QUESTIONS.length - 1) {
      setTimeout(() => setCurrent(current + 1), 180);
    } else {
      const result = runDiagnose(next);
      setTimeout(() => router.push(`/result/${result.id}`), 300);
    }
  }

  function back() {
    if (current > 0) setCurrent(current - 1);
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-xl">
        {/* プログレスバー7分割 */}
        <div className="flex gap-1.5 mb-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= current ? 'bg-sumi' : 'bg-sumi/15'
              }`}
            />
          ))}
        </div>

        {/* シルエット演出 */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="silhouette"
            style={{ filter: `blur(${blur}px) grayscale(1)`, opacity: 0.35 + answeredCount * 0.09 }}
          >
            <Kabuto />
          </div>
          <p className="mt-3 text-xs font-mincho text-sumigray/80 tracking-wider">
            {revealed && provisional
              ? '……何者かの輪郭が、見えてきた'
              : 'あなたの武将は、まだ影の中'}
          </p>
        </div>

        {/* 設問 */}
        <div key={current} className="fadeup">
          <p className="text-xs font-mincho text-shu mb-2 tracking-widest">
            第{current + 1}問 / 全{QUESTIONS.length}問
          </p>
          <h2 className="sumi-title font-mincho text-xl sm:text-2xl font-bold mb-6 leading-relaxed">
            {q.text}
          </h2>

          <div className="flex flex-col gap-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(i)}
                className="option-card text-left font-mincho bg-white/60 border border-sumi/25 rounded-sm px-5 py-4 leading-relaxed"
              >
                {opt.label}
              </button>
            ))}
          </div>

          {current > 0 && (
            <button
              onClick={back}
              className="mt-6 text-sm font-mincho text-sumigray/70 hover:text-sumi transition-colors"
            >
              ← 前の問いに戻る
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

// 兜（かぶと）シルエット：抽象・素材不要。結果まで正体は伏せる。
function Kabuto() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
      <path
        d="M60 22c-20 0-34 12-36 30-1 8 2 14 6 16h60c4-2 7-8 6-16-2-18-16-30-36-30z"
        fill="#1c1a17"
      />
      {/* 前立て（三日月） */}
      <path d="M60 8c-8 6-8 18 0 24 4-3 6-8 6-12s-2-9-6-12z" fill="#1c1a17" />
      <ellipse cx="60" cy="82" rx="26" ry="12" fill="#1c1a17" />
    </svg>
  );
}
