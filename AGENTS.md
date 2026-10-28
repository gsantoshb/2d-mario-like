# Mass Quest project guidance

Read `docs/project-memory.md` for accepted decisions and `docs/patterns.md` for reusable implementation lessons. Read the active OpenSpec change and its specs/tasks before changing behavior.

## User preferences

- Use OpenSpec to explore, propose, then apply. Keep those stages explicit; a request for exploration or a proposal does not start implementation.
- Favor readable TypeScript and tools approachable to a React web developer. Good coding practices are an explicit user requirement.
- Preserve decisions and useful patterns for future reference. Record what was actually verified; do not mark tasks complete just because code exists.

## Architecture and maintenance

- React owns screens and profile orchestration; Phaser owns the live simulation. Keep frame updates out of React state. Use the typed event bridge.
- Keep hero, skin, level, and tuning data in `src/game/data/content.ts`; keep state transitions for rewards, purchases, and saves independently testable.
- Keep scene orchestration separate from player, enemy, boss, world, and audio systems. Prefer focused screen components over expanding App.
- Destroy the game and event listeners on unmount. Check StrictMode and repeated start/leave behavior after lifecycle changes.
- Use the installed dependency types/source as the API reference. Keep exact dependency versions and the lockfile. Format code with Prettier.
- Run relevant tests and `npm run typecheck`, `npm run lint`, and `npm run build` after implementation changes. Broaden browser checks when gameplay or lifecycle changes justify them.

## Gameplay invariants

- Balayya, Chiru, and PK are selectable immediately. All share base movement, health, and hitboxes. Every level must work with each hero.
- Skills use the same X key, bounded cooldowns, and one hit per target per activation. PK must not tunnel through terrain.
- Checkpoint retries restore health and reset enemies/boss, while retaining collected/rewarded entity IDs within that run.
- Growshroom and Mass Star are run-local, shared across heroes, and never required for a route. Preserve foot-anchored clearance checks and the existing boss vulnerability rules.
- Use stable level IDs and preserve the v1 rollback save when changing campaign order.
- Only completed runs bank coins. Reward completion once. Skins are cosmetic only, owned-only, and purchased/equipped atomically.
- Browser saves are local convenience data, never purchase verification. Handle corrupt data and denied storage without preventing play.

## Art and verification

- Preserve the original 8-bit-inspired style, stable frame baseline, nearest-neighbor scaling, and independent collision bodies. Asset provenance lives in `public/assets/ATTRIBUTION.md`.
- Validate the five-level/three-hero completion matrix with actual keyboard input. Development scene inspection is read-only for campaign acceptance; do not teleport, grant health, or fabricate unlocks to claim completion.
- Isolated storage/shop fixtures are acceptable when clearly separated from earned campaign progression. Mark any fixture-based encounter tests as isolated, not full-campaign evidence.
- The development-only `window.__MASS_QUEST__` handle must remain absent from production. Do not add production debug controls or cheats for test convenience.
- Publishing, real-money payments, mobile touch support, and commercial asset clearance are separate scope unless the user requests them.
