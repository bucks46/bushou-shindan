// 読み取り専用: events:log の中身を確認するだけ。書き込みは一切行わない。
const fs = require('fs');
const envText = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

async function main() {
  const url = env.KV_REST_API_URL;
  const token = env.KV_REST_API_READ_ONLY_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.error('KV env vars not found');
    process.exit(1);
  }

  const res = await fetch(`${url}/lrange/events:log/0/-1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  const lines = json.result || [];
  console.log(`total events: ${lines.length}`);

  const counts = {};
  const nonBot = [];
  // 2026-09-11追加：Baiduspider(明示的なbot UA、未検知だった)と、
  // Chrome/48.0.2564.116(2016年当時の旧バージョンUAを使い回すbotファーム、
  // 111.225.x.x/119.249.x.x帯の複数IPから3-4秒間隔でtips全IDを機械的に巡回する
  // パターンを確認、実在の個人がこの古いChromeを使う可能性は無視できるほど低い)を追加。
  // 2026-09-13追加：python-requests(明示的なスクリプトUA)と、
  // "Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0"を
  // 65.21.136.254/46.232.249.132/198.54.130.28/23.168.24.20等、全く異なる複数IPから
  // 一字一句同一のUA文字列で5回以上検出(8/23-9/11)。実在の個人が同一Firefoxバージョンで
  // 複数の海外ホスティングIPから来る確率は極めて低く、bot/クローラーファームと判断(確信度：中)。
  const botPatterns = ['curl', 'Twitterbot', 'trendictionbot', 'Googlebot', 'bingbot', 'Slackbot', 'facebookexternalhit', 'Claude/', 'Baiduspider', 'Chrome/48.0.2564.116', 'python-requests', 'rv:148.0) Gecko/20100101 Firefox/148.0'];
  for (const l of lines) {
    let parsed;
    try { parsed = JSON.parse(l); } catch { continue; }
    counts[parsed.name] = (counts[parsed.name] || 0) + 1;
    const ua = (parsed.props && parsed.props.ua) || '';
    const isBot = botPatterns.some(p => ua.includes(p));
    if (!isBot && parsed.name !== 'note_redirect_miss') nonBot.push(parsed);
  }

  console.log('\n=== event counts (all time) ===');
  for (const [k, v] of Object.entries(counts)) console.log(`${k}: ${v}`);

  console.log(`\n=== likely-real (non-bot, non-curl) clicks: ${nonBot.length} ===`);
  nonBot.forEach(s => console.log(`  ${s.at} | ${s.name} | ${JSON.stringify(s.props)}`));
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
