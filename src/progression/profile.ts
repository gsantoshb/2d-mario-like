import {
  CAMPAIGN,
  HEROES,
  SKINS,
  nextLevel,
  type HeroId,
  type LevelId,
} from '../game/data/content';
import { validateLegacyProfile } from './legacy';
export interface Profile {
  version: 2;
  unlocked: LevelId[];
  best: Record<LevelId, number>;
  coins: number;
  owned: string[];
  equipped: Record<HeroId, string>;
  lastHero: HeroId;
  muted: boolean;
  lastReward: string | null;
}
export interface Result {
  runId: string;
  level: LevelId;
  hero: HeroId;
  coins: number;
  score: number;
  seconds: number;
}
export const defaults = (): Profile => ({
  version: 2,
  unlocked: ['festival-run'],
  best: Object.fromEntries(CAMPAIGN.map((id) => [id, 0])) as Record<LevelId, number>,
  coins: 0,
  owned: HEROES.map((h) => `${h.id}-default`),
  equipped: { balayya: 'balayya-default', chiru: 'chiru-default', pk: 'pk-default' },
  lastHero: 'balayya',
  muted: false,
  lastReward: null,
});
const integer = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
export function validateProfile(value: unknown): Profile {
  if (!value || typeof value !== 'object') throw new Error('Invalid profile');
  const p = value as Profile;
  if (
    p.version !== 2 ||
    !Array.isArray(p.unlocked) ||
    !p.unlocked.includes('festival-run') ||
    !p.unlocked.every((id) => CAMPAIGN.includes(id)) ||
    new Set(p.unlocked).size !== p.unlocked.length ||
    !p.best ||
    !CAMPAIGN.every((id) => integer(p.best[id])) ||
    Object.keys(p.best).length !== CAMPAIGN.length ||
    !integer(p.coins) ||
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
  // Old fortress access can be grandfathered across the inserted acts; other unlocks need their predecessor.
  for (const id of p.unlocked) {
    const index = CAMPAIGN.indexOf(id);
    if (
      index > 0 &&
      id !== 'fortress-finale' &&
      !p.best[CAMPAIGN[index - 1]] &&
      !p.best['fortress-finale']
    )
      throw new Error('Invalid unlocks');
  }
  if (
    p.unlocked.includes('fortress-finale') &&
    !p.best['studio-showdown'] &&
    !p.best['rooftop-chase']
  )
    throw new Error('Invalid fortress access');
  return p;
}
export function migrateProfile(value: unknown): Profile {
  const old = validateLegacyProfile(value),
    p = defaults();
  const oldIds: LevelId[] = ['festival-run', 'rooftop-chase', 'fortress-finale'];
  for (const [index, id] of oldIds.entries()) p.best[id] = old.best[index];
  const unlocked = new Set<LevelId>(oldIds.slice(0, old.unlocked + 1));
  for (const id of oldIds) if (p.best[id] && nextLevel(id)) unlocked.add(nextLevel(id)!);
  if (p.best['fortress-finale']) CAMPAIGN.forEach((id) => unlocked.add(id));
  return validateProfile({
    ...p,
    unlocked: CAMPAIGN.filter((id) => unlocked.has(id)),
    coins: old.coins,
    owned: [...old.owned],
    equipped: { ...old.equipped },
    lastHero: old.lastHero,
    muted: old.muted,
    lastReward: old.lastReward,
  });
}
export function reward(p: Profile, r: Result): Profile {
  if (
    p.lastReward === r.runId ||
    !r.runId ||
    !integer(r.coins) ||
    !integer(r.score) ||
    !p.unlocked.includes(r.level) ||
    !CAMPAIGN.includes(r.level) ||
    !Number.isSafeInteger(p.coins + r.coins)
  )
    return p;
  const next = nextLevel(r.level);
  return {
    ...p,
    best: { ...p.best, [r.level]: Math.max(p.best[r.level], r.score) },
    unlocked:
      next && !p.unlocked.includes(next)
        ? CAMPAIGN.filter((id) => p.unlocked.includes(id) || id === next)
        : p.unlocked,
    coins: p.coins + r.coins,
    lastReward: r.runId,
  };
}
export function purchase(p: Profile, id: string): Profile {
  const s = SKINS.find((s) => s.id === id);
  return !s || p.owned.includes(id) || p.coins < s.price
    ? p
    : { ...p, coins: p.coins - s.price, owned: [...p.owned, id] };
}
export function equip(p: Profile, id: string): Profile {
  const s = SKINS.find((s) => s.id === id);
  return s && p.owned.includes(id) ? { ...p, equipped: { ...p.equipped, [s.hero]: id } } : p;
}
