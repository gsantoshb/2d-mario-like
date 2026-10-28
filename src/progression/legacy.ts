import { HEROES, SKINS, type HeroId } from '../game/data/content';
export interface LegacyProfile {
  version: 1;
  unlocked: number;
  best: number[];
  coins: number;
  owned: string[];
  equipped: Record<HeroId, string>;
  lastHero: HeroId;
  muted: boolean;
  lastReward: string | null;
}
const integer = (n: unknown): n is number =>
  typeof n === 'number' && Number.isSafeInteger(n) && n >= 0;
export function validateLegacyProfile(value: unknown): LegacyProfile {
  if (!value || typeof value !== 'object') throw new Error('Invalid profile');
  const p = value as LegacyProfile;
  if (
    p.version !== 1 ||
    !integer(p.unlocked) ||
    p.unlocked > 2 ||
    !integer(p.coins) ||
    !Array.isArray(p.best) ||
    p.best.length !== 3 ||
    !p.best.every(integer) ||
    !Array.isArray(p.owned) ||
    !p.owned.every((id) => SKINS.some((s) => s.id === id)) ||
    new Set(p.owned).size !== p.owned.length ||
    !HEROES.some((h) => h.id === p.lastHero) ||
    typeof p.muted !== 'boolean' ||
    !(p.lastReward === null || typeof p.lastReward === 'string')
  )
    throw new Error('Invalid profile');
  for (const h of HEROES)
    if (
      !p.owned.includes(`${h.id}-default`) ||
      !SKINS.some((s) => s.hero === h.id && s.id === p.equipped?.[h.id] && p.owned.includes(s.id))
    )
      throw new Error('Invalid equipment');
  for (let i = 1; i <= p.unlocked; i++) if (!p.best[i - 1]) throw new Error('Invalid unlocks');
  return p;
}
