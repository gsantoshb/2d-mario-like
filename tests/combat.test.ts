import { describe, expect, it } from 'vitest';
import { CombatState, RunLedger } from '../src/game/systems/rules';
describe('combat transitions', () => {
  it('rejects repeated contacts during protection and active dash', () => {
    const c = new CombatState();
    expect(c.damage(0)).toBe(true);
    expect(c.health).toBe(2);
    expect(c.damage(500)).toBe(false);
    expect(c.damage(1000, true)).toBe(false);
    expect(c.damage(1001)).toBe(true);
    expect(c.health).toBe(1);
  });
  it('does not extend cooldown on repeated activation', () => {
    const c = new CombatState();
    expect(c.activate(100, 220)).toBe(true);
    expect(c.activate(500, 220)).toBe(false);
    expect(c.readyAt).toBe(3100);
    expect(c.hit('target')).toBe(true);
    expect(c.hit('target')).toBe(false);
    expect(c.activate(3100, 220)).toBe(true);
    expect(c.hit('target')).toBe(true);
  });
  it('respawn cancels effects and restores health and readiness', () => {
    const c = new CombatState();
    c.activate(0, 340);
    c.damage(0);
    c.reset(100);
    expect(c.health).toBe(3);
    expect(c.activeUntil).toBe(0);
    expect(c.activate(100, 340)).toBe(true);
  });
});
describe('run reward ledger', () => {
  it('prevents repeated rewards across checkpoint respawns', () => {
    const ledger = new RunLedger();
    expect(ledger.collect('coin-1')).toBe(true);
    expect(ledger.defeat('enemy-1')).toBe(true);
    expect(ledger.collect('coin-1')).toBe(false);
    expect(ledger.defeat('enemy-1')).toBe(false);
    expect(ledger.score).toBe(110);
    expect(new RunLedger().collect('coin-1')).toBe(true);
  });
});
