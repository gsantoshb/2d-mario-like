---
name: web-platformer-patterns
description: Build or extend small browser platformers using the user's OpenSpec-first workflow and React/TypeScript-friendly architecture. Use for similar web game projects, not unrelated React apps.
---

# Browser platformer workflow

The user prefers OpenSpec exploration → proposal → apply, readable TypeScript, and a stack approachable to a React web developer. Respect the requested stage; do not turn exploration into implementation. Treat a new project's cast, art style, controls, platform, and monetization as its own decisions.

For React + Phaser projects, keep React menus/profile orchestration separate from frame-by-frame simulation. Use a small typed event bridge, data-driven content, and focused gameplay systems. Lazy-load the engine and verify cleanup under StrictMode and repeated start/leave cycles.

Use pure functions for rewards, purchases, equipment, and save validation. Version local profiles and tolerate corrupt or denied storage. Track run/entity IDs to avoid checkpoint reward farming and duplicate completion/purchase deductions. Browser saves are not trusted paid entitlements.

Keep required routes completable with every offered hero. Bound fast moves against solids; test hit deduplication, damage protection, forgiving jumps, checkpoint reset, and freeze/resume behavior. In Phaser Arcade, an anchored immovable boss must disable gravity: two immovable bodies do not separate. Check body dimensions after sprite scaling.

For pixel art, align frames on a fixed baseline, use nearest-neighbor integer scaling, keep hitboxes independent of costumes, and inspect animation in the real game. Prefer deterministic source art when useful; generated sheets still need normalization and visual checks. Preserve attribution.

Verify campaign completion through actual inputs for each level/hero combination. Isolate shop/storage fixtures from campaign evidence. Do not teleport actors or grant health/unlocks to claim acceptance. Keep test inspection handles development-only. Record commands, browser checks, screenshots, and actual limits before handoff.

Keep project decisions and demonstrated lessons in repository guidance/reference notes. Do not copy a particular cast, level count, coin price, or fan-game commercialization assumption into unrelated projects.

When inserting or reordering levels, use stable IDs with explicit campaign order and ID-keyed progress. Migrate validated older saves without moving scores to different content or removing earned access; retain a rollback source and check idempotency. For collectible growth, preserve foot position, resize the physical body, and leave a pickup unconsumed when current terrain blocks expansion.
