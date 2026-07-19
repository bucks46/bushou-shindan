/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        washi: '#f4f1e8',   // 和紙・生成り
        sumi: '#1c1a17',    // 墨
        sumigray: '#4a463f', // 淡墨
        shu: '#9b2d1f',     // 朱（アクセント）
      },
      fontFamily: {
        mincho: ['"Yu Mincho"', '"YuMincho"', '"Hiragino Mincho ProN"', '"Noto Serif JP"', 'serif'],
      },
    },
  },
  plugins: [],
};
