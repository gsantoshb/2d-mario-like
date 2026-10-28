import { TUNING } from '../data/content';
export type PowerKind = 'growshroom' | 'star';
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export function canExpand(candidate: Rect, solids: Rect[], worldWidth: number): boolean {
  return (
    candidate.x >= 0 &&
    candidate.x + candidate.width <= worldWidth &&
    !solids.some(
      (s) =>
        candidate.x < s.x + s.width - 0.05 &&
        candidate.x + candidate.width > s.x + 0.05 &&
        candidate.y < s.y + s.height - 0.05 &&
        candidate.y + candidate.height > s.y + 0.05,
    )
  );
}
export class PowerUpState {
  grown = false;
  starUntil = 0;
  starActive(now: number) {
    return now < this.starUntil;
  }
  collect(kind: PowerKind, now: number, room = true): boolean {
    if (kind === 'growshroom') {
      if (this.grown || !room) return false;
      this.grown = true;
    } else this.starUntil = now + TUNING.starDuration;
    return true;
  }
  reset() {
    this.grown = false;
    this.starUntil = 0;
  }
}
