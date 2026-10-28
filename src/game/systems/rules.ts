import { PowerUpState } from './powers';
import { TUNING } from '../data/content';

export class RunLedger {
  coins = new Set<string>();
  enemies = new Set<string>();
  score = 0;
  collect(id: string) {
    if (this.coins.has(id)) return false;
    this.coins.add(id);
    this.score += 10;
    return true;
  }
  defeat(id: string) {
    if (this.enemies.has(id)) return false;
    this.enemies.add(id);
    this.score += 100;
    return true;
  }
}
export class CombatState {
  readonly powers = new PowerUpState();
  health = 3;
  protectedUntil = 0;
  readyAt = 0;
  activeUntil = 0;
  hits = new Set<string>();
  damage(now: number, dash = false) {
    if (dash || this.powers.starActive(now) || now < this.protectedUntil) return false;
    if (this.powers.grown) this.powers.grown = false;
    else this.health--;
    this.protectedUntil = now + TUNING.protection;
    return true;
  }
  activate(now: number, duration: number) {
    if (now < this.readyAt) return false;
    this.readyAt = now + TUNING.cooldown;
    this.activeUntil = now + duration;
    this.hits.clear();
    return true;
  }
  hit(id: string) {
    if (this.hits.has(id)) return false;
    this.hits.add(id);
    return true;
  }
  reset(now: number) {
    this.powers.reset();
    this.health = 3;
    this.protectedUntil = now + TUNING.protection;
    this.readyAt = now;
    this.activeUntil = 0;
    this.hits.clear();
  }
}
