import type { HeroId, LevelId } from './data/content';
import type { Result } from '../progression/profile';
export interface RunConfig {
  hero: HeroId;
  skin: string;
  level: LevelId;
  runId: string;
}
export interface Hud {
  health: number;
  grown: boolean;
  starSeconds: number;
  coins: number;
  score: number;
  ready: number;
  seconds: number;
  checkpoint: boolean;
  message: string;
  bossHealth: number | null;
  bossPhase: string;
  escape: number | null;
  progress: number;
}
type Events = {
  hud: Hud;
  paused: boolean;
  complete: Result;
  resume: undefined;
  pause: undefined;
};
export class Bridge {
  private handlers = new Map<keyof Events, Set<(value: never) => void>>();
  on<K extends keyof Events>(type: K, handler: (value: Events[K]) => void) {
    const set = this.handlers.get(type) ?? new Set();
    set.add(handler as (value: never) => void);
    this.handlers.set(type, set);
    return () => {
      set.delete(handler as (value: never) => void);
    };
  }
  emit<K extends keyof Events>(type: K, value: Events[K]) {
    this.handlers.get(type)?.forEach((fn) => fn(value as never));
  }
  clear() {
    this.handlers.clear();
  }
}
