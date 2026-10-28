# Tasks

Implemented under the user’s apply authorization. All tasks below are verified; see docs/verification.md. The change remains unarchived for review.

## 1. Stable campaign identity and save compatibility

- [x] 1.1 Introduce stable level IDs and explicit campaign ordering, updating rewards, selection, results, and browser helpers to remove final-index/three-slot assumptions; verify existing three-act navigation and typecheck before adding content.
- [x] 1.2 Add validated v2 profiles with ID-keyed scores/unlocks and deterministic v1 migration that retains the original save; verify fixtures for each old progression state, completed fortress, equipment/currency/settings, repeated loads, invalid data, duplicate rewards, and denied reads/writes.
- [x] 1.3 Document migration and rollback behavior in README and update the main campaign Purpose to avoid a fixed act count; verify old scores map to their named levels and old fortress access is preserved.

## 2. Foreground readability

- [x] 2.1 Define foreground/coin palettes and contrast helpers with tests for the specified luminance ratios; verify static and moving platform top caps/outlines share the same readable treatment.
- [x] 2.2 Update platform/terrain art and subdue backgrounds without changing collision geometry; inspect before/after game-scale comparisons in bright/dark regions and grayscale at 1x/2x.
- [x] 2.3 Update coin shape, outline, internal mark, and sparkle/bob rendering while preserving collection coordinates and reward IDs; verify coins remain recognizable in warm scenery and pickup rewards are unchanged.
- [x] 2.4 Document the palette/rendering controls and inspection results alongside asset provenance; verify the original generator reproduces the updated assets.

## 3. Collectible power systems

- [x] 3.1 Implement typed pickup spawns, a focused run-local power-state/controller, and pure transition tests; verify Growshroom non-stacking, eight-second star refresh/expiry, pause freezing, and reset behavior.
- [x] 3.2 Integrate foot-anchored growth/shrink with collision-body resizing and clearance checks; verify all heroes/skins grow safely near ceilings, thin walls, world bounds, and moving platforms, leaving blocked pickups available.
- [x] 3.3 Centralize damage priority and star enemy-contact behavior without bypassing boss rules; verify growth absorbs one hit, protected hits preserve growth/health, rewards remain deduplicated, and pits/deadlines still cause checkpoint recovery.
- [x] 3.4 Create distinct original pickup sprites/effects and add growth/star indicators through the typed HUD bridge; verify both powers and existing skill readiness remain readable together at supported desktop sizes.
- [x] 3.5 Restore pickup availability on checkpoint retry while retaining reward ledgers; verify death/level exit clears powers, reload never restores them, and README/guide explains the controls and effects.

## 4. Two new acts and pickup placement

- [x] 4.1 Add Papikondalu Trail and Studio Showdown layouts, checkpoints, scenery, moving surfaces, coin routes, and pickups; verify their themes and geometry are distinct and the fortress remains last in new-profile progression.
- [x] 4.2 Add safe pickup teaching to Festival Run and useful optional placements to all acts; verify each required route remains reachable at normal size without star protection and enlarged heroes cannot be trapped by required geometry.
- [x] 4.3 Expand level-selection layouts and replay/next-act/victory behavior for five acts; verify keyboard navigation, locked states, grandfathered access, and narrow desktop layouts, and document level authoring changes.

## 5. Integrated acceptance

- [x] 5.1 Complete and record all 15 hero/act combinations through keyboard input, including normal-size/no-star required-route checks and both pickups with each hero; separately record checkpoint/escape/boss retries and 30/60 Hz dash/growth collision checks.
- [x] 5.2 Run Chrome/Firefox production checks for migrated/fresh saves, power timers/pause, HUD, five-act menus, wardrobe, mute, repeated mounts, and absent production debug handles; record results and scene comparisons.
- [x] 5.3 Run focused tests, typecheck, lint, production build, and OpenSpec strict validation; resolve failures and update verification notes, README, AGENTS.md, and project memory to five acts/15 combinations only after results support it.

## Workflow follow-up

- Review the proposal before applying the change.
- Archive and sync this change after implementation and user acceptance.
