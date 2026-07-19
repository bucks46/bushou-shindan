// アプリ側の roster 配線（warriors.json を静的import→core純粋関数へ束ねる）
import warriors from '../data/warriors.json';
import { buildRoster, diagnose, provisionalMatch, ranked } from './core.mjs';

export const ROSTER = buildRoster(warriors.fullRoster);
export const runDiagnose = (answers) => diagnose(ROSTER, answers);
export const runProvisional = (answers) => provisionalMatch(ROSTER, answers);
export const getById = (id) => ROSTER.find((w) => w.id === id);
