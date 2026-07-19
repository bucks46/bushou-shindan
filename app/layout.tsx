import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '武将診断 | 7つの問いで、あなたの中の戦国武将を知る',
  description: '7つの質問に答えるだけ。あなたの性格・価値観に最も近い戦国武将を診断します。',
  openGraph: {
    title: '武将診断',
    description: '7つの問いで、あなたの中の戦国武将を診断する。',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
