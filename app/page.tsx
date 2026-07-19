import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center fadeup">
        {/* 墨のしるし */}
        <div className="mx-auto mb-8 h-16 w-16 rounded-full border-2 border-sumi flex items-center justify-center">
          <span className="text-2xl font-mincho">武</span>
        </div>

        <h1 className="sumi-title font-mincho text-4xl sm:text-5xl font-bold leading-tight mb-6">
          武将診断
        </h1>

        <p className="font-mincho text-base sm:text-lg text-sumigray leading-relaxed mb-2">
          7つの問いに答えると、
        </p>
        <p className="font-mincho text-base sm:text-lg text-sumigray leading-relaxed mb-10">
          あなたの中に眠る<span className="text-shu">戦国武将</span>が姿を現す。
        </p>

        <Link
          href="/shindan"
          className="inline-block bg-sumi text-washi font-mincho text-lg px-12 py-4 rounded-sm tracking-widest hover:bg-shu transition-colors"
        >
          診断を始める
        </Link>

        <p className="mt-8 text-xs text-sumigray/70 font-mincho">
          全7問・所要1分・登録不要
        </p>
      </div>
    </main>
  );
}
