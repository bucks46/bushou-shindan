// Node向け薄いラッパ（fsでroster読込→core純粋関数へ）。回帰テスト/CLIが使用。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRoster, diagnose as _diagnose, provisionalMatch as _prov, ranked as _ranked } from './core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/warriors.json'), 'utf-8'));

export const ROSTER = buildRoster(raw.fullRoster);
export const diagnose = (answers) => _diagnose(ROSTER, answers);
export const provisionalMatch = (answers) => _prov(ROSTER, answers);
export const ranked = (answers) => _ranked(ROSTER, answers);
