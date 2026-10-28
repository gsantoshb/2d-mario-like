import { describe, expect, it } from 'vitest';
import {
  defaults,
  equip,
  purchase,
  reward,
  validateProfile,
  type Result,
} from '../src/progression/profile';
import { loadProfile, saveProfile } from '../src/storage/profileStore';
const result: Result = {
  runId: 'run-1',
  level: 'festival-run',
  hero: 'balayya',
  coins: 36,
  score: 1260,
  seconds: 90,
};

describe('local progression', () => {
  it('unlocks the next act and banks each completed run once', () => {
    const initial = defaults();
    const first = reward(initial, result);
    expect(first.unlocked).toEqual(['festival-run', 'rooftop-chase']);
    expect(first.coins).toBe(36);
    expect(first.best['festival-run']).toBe(1260);
    expect(reward(first, result)).toBe(first);
    const replay = reward(first, { ...result, runId: 'run-2', score: 500 });
    expect(replay.coins).toBe(72);
    expect(replay.best['festival-run']).toBe(1260);
    expect(initial.coins).toBe(0);
  });
  it('rejects out-of-sequence and invalid rewards', () => {
    const p = defaults();
    expect(reward(p, { ...result, level: 'fortress-finale' })).toBe(p);
    expect(reward(p, { ...result, coins: -1 })).toBe(p);
  });
  it('buys and equips cosmetics atomically without double charging', () => {
    const p = reward(defaults(), result),
      bought = purchase(p, 'balayya-alt');
    expect(bought.coins).toBe(6);
    expect(bought.owned).toContain('balayya-alt');
    expect(purchase(bought, 'balayya-alt')).toBe(bought);
    expect(purchase(bought, 'chiru-alt')).toBe(bought);
    expect(purchase(bought, 'unknown')).toBe(bought);
    expect(equip(p, 'chiru-alt')).toBe(p);
    const equipped = equip(bought, 'balayya-alt');
    expect(equipped.equipped).toEqual({
      balayya: 'balayya-alt',
      chiru: 'chiru-default',
      pk: 'pk-default',
    });
  });
  it('validates a fully progressed profile and preserves default equipment', () => {
    let p = defaults();
    for (const level of [
      'festival-run',
      'rooftop-chase',
      'papikondalu-trail',
      'studio-showdown',
      'fortress-finale',
    ] as const)
      p = reward(p, { ...result, level, runId: `run-${level}` });
    expect(validateProfile(JSON.parse(JSON.stringify(p)))).toEqual(p);
  });
  it.each([
    null,
    {},
    { ...defaults(), version: 9 },
    { ...defaults(), coins: -1 },
    { ...defaults(), coins: Infinity },
    { ...defaults(), owned: ['unknown'] },
    { ...defaults(), unlocked: 2 },
    {
      ...defaults(),
      equipped: {
        balayya: 'balayya-alt',
        chiru: 'chiru-default',
        pk: 'pk-default',
      },
    },
    { ...defaults(), lastHero: 'boss' },
    { ...defaults(), best: [0] },
  ])('rejects malformed or inconsistent profile %#', (value) => {
    expect(() => validateProfile(value)).toThrow();
  });
});

describe('storage boundary', () => {
  it('starts fresh without a notice when there is no save', () => {
    expect(loadProfile({ getItem: () => null, setItem: () => {} })).toEqual({
      profile: defaults(),
      notice: '',
    });
  });
  it('round-trips completed progress but stores no unfinished run', () => {
    let raw = '';
    const storage = {
      getItem: () => raw,
      setItem: (_key: string, v: string) => {
        raw = v;
      },
    };
    const p = reward(defaults(), result);
    expect(saveProfile(storage, p)).toBe('');
    expect(loadProfile(storage).profile).toEqual(p);
    expect(raw).not.toContain('checkpoint');
  });
  it('falls back on corrupt JSON or read failures', () => {
    for (const getItem of [
      () => '{bad',
      () => {
        throw new Error('denied');
      },
    ]) {
      const loaded = loadProfile({ getItem, setItem: () => {} });
      expect(loaded.profile).toEqual(defaults());
      expect(loaded.notice).not.toBe('');
    }
  });
  it('reports write failure without mutating the in-memory profile', () => {
    const p = reward(defaults(), result);
    expect(
      saveProfile(
        {
          getItem: () => null,
          setItem: () => {
            throw new Error('full');
          },
        },
        p,
      ),
    ).not.toBe('');
    expect(p.coins).toBe(36);
  });
});
