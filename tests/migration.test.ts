import { describe, it, expect } from 'vitest';
import { defaults, migrateProfile, validateProfile } from '../src/progression/profile';
import { loadProfile, SAVE_KEY, LEGACY_SAVE_KEY } from '../src/storage/profileStore';
const old = () => ({
  version: 1,
  unlocked: 2,
  best: [100, 200, 0],
  coins: 47,
  owned: ['balayya-default', 'chiru-default', 'pk-default', 'pk-alt'],
  equipped: { balayya: 'balayya-default', chiru: 'chiru-default', pk: 'pk-alt' },
  lastHero: 'pk',
  muted: true,
  lastReward: 'old-run',
});
describe('v1 save compatibility', () => {
  it('preserves fortress identity and prior access while inserting acts', () => {
    const p = migrateProfile(old());
    expect(p.best['rooftop-chase']).toBe(200);
    expect(p.best['papikondalu-trail']).toBe(0);
    expect(p.unlocked).toEqual([
      'festival-run',
      'rooftop-chase',
      'papikondalu-trail',
      'fortress-finale',
    ]);
    expect(p).toMatchObject({ coins: 47, lastHero: 'pk', muted: true, lastReward: 'old-run' });
    expect(p.equipped.pk).toBe('pk-alt');
  });
  it('opens all acts after an old fortress completion', () => {
    const p = migrateProfile({ ...old(), best: [100, 200, 300] });
    expect(p.unlocked).toHaveLength(5);
    expect(p.best['fortress-finale']).toBe(300);
    expect(p.best['studio-showdown']).toBe(0);
  });
  it.each([0, 1, 2])('converts partial progression %i', (unlocked) => {
    const p = migrateProfile({
      ...old(),
      unlocked,
      best: unlocked === 0 ? [0, 0, 0] : unlocked === 1 ? [100, 0, 0] : [100, 200, 0],
    });
    expect(validateProfile(p)).toEqual(p);
  });
  it('retains the old key, prefers v2, and never adds coins on repeat loads', () => {
    const data = new Map([[LEGACY_SAVE_KEY, JSON.stringify(old())]]);
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
    };
    const a = loadProfile(storage);
    expect(data.has(LEGACY_SAVE_KEY)).toBe(true);
    expect(data.has(SAVE_KEY)).toBe(true);
    expect(loadProfile(storage)).toEqual(a);
    expect(a.profile.coins).toBe(47);
  });
  it('keeps migrated state in memory after a denied write', () => {
    const value = JSON.stringify(old());
    const loaded = loadProfile({
      getItem: (key) => (key === LEGACY_SAVE_KEY ? value : null),
      setItem: () => {
        throw Error('denied');
      },
    });
    expect(loaded.profile.coins).toBe(47);
    expect(loaded.notice).not.toBe('');
  });
  it('does not merge invalid newer data with an old save', () => {
    const loaded = loadProfile({
      getItem: (key) => (key === SAVE_KEY ? '{}' : JSON.stringify(old())),
      setItem: () => {},
    });
    expect(loaded.profile).toEqual(defaults());
    expect(loaded.notice).not.toBe('');
  });
  it('rejects unsupported legacy versions and invalid old balances', () => {
    expect(() => migrateProfile({ ...old(), version: 0 })).toThrow();
    expect(() => migrateProfile({ ...old(), coins: -1 })).toThrow();
  });
});
