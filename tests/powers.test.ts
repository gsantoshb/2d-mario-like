import { describe, it, expect } from 'vitest';
import { PowerUpState, canExpand } from '../src/game/systems/powers';
import { CombatState } from '../src/game/systems/rules';
import { contrast } from '../src/game/systems/contrast';
import palette from '../src/game/data/palette.json';

describe('collectible powers', () => {
  it('requires clearance and never stacks growth', () => {
    const p = new PowerUpState();
    expect(p.collect('growshroom', 0, false)).toBe(false);
    expect(p.collect('growshroom', 0)).toBe(true);
    expect(p.collect('growshroom', 1)).toBe(false);
  });
  it('refreshes star expiry instead of adding durations', () => {
    const p = new PowerUpState();
    p.collect('star', 0);
    expect(p.starActive(7999)).toBe(true);
    p.collect('star', 6000);
    expect(p.starUntil).toBe(14000);
    expect(p.starActive(14000)).toBe(false);
    p.reset();
    expect(p.grown).toBe(false);
    expect(p.starUntil).toBe(0);
  });
  it('rejects ceilings, side overlaps and world boundaries but permits touching a floor', () => {
    const grown = { x: 90, y: 159.5, width: 17.5, height: 32.5 };
    expect(canExpand(grown, [{ x: 0, y: 192, width: 200, height: 64 }], 200)).toBe(true);
    expect(canExpand(grown, [{ x: 80, y: 151, width: 80, height: 10 }], 200)).toBe(false);
    expect(canExpand(grown, [{ x: 105, y: 160, width: 16, height: 32 }], 200)).toBe(false);
    expect(canExpand({ ...grown, x: -1 }, [], 200)).toBe(false);
  });
  it('gives protection priority, then consumes growth, then health', () => {
    const c = new CombatState();
    c.powers.collect('growshroom', 0);
    c.powers.collect('star', 0);
    expect(c.damage(500)).toBe(false);
    expect(c.powers.grown).toBe(true);
    expect(c.health).toBe(3);
    expect(c.damage(8001)).toBe(true);
    expect(c.powers.grown).toBe(false);
    expect(c.health).toBe(3);
    expect(c.damage(8100)).toBe(false);
    expect(c.damage(9002)).toBe(true);
    expect(c.health).toBe(2);
    c.reset(10000);
    expect(c.powers.starUntil).toBe(0);
    expect(c.powers.grown).toBe(false);
  });
});
it('keeps platform edges and coins above their contrast targets', () => {
  for (const top of Object.values(palette.tops))
    expect(contrast(top, palette.outline)).toBeGreaterThanOrEqual(3);
  expect(contrast(palette.coin, palette.outline)).toBeGreaterThanOrEqual(4.5);
});
