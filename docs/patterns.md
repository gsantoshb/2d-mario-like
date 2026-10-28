# Reusable browser-platformer patterns

These are practical patterns from Mass Quest. Apply them when relevant; the cast, exact levels, prices, and hero count are project choices, not universal defaults.

## Shape the project before building

Use OpenSpec exploration to settle controls, game scope, art direction, and monetization boundaries. A proposal should define observable behavior with scenarios and a technical design that resolves architectural choices. Implementation tasks need their own verification criteria. Keep the distinction between proposed, implemented, and verified work explicit.

## Separate UI from simulation

Use React for menus and progression and a game engine for frame-by-frame state. Send typed HUD changes and completion events across a narrow bridge instead of rerendering React for every player position. Lazy-load the engine on entering play. Destroy the engine, input handlers, observers, and subscriptions when leaving. Development StrictMode is useful for catching lifecycle errors early.

## Favor data and pure state transitions

Put hero definitions, level surfaces/spawns, skins, and tuning values in typed data. Share base movement and hitboxes when different characters must complete the same campaign. Compute rewards, ownership, equipment, and profile validation as pure functions; keep storage I/O in a small adapter. Persist a complete versioned snapshot, and keep an in-memory fallback when storage is denied.

## Make retries and rewards deterministic

Give each run an ID and each collectible/enemy a stable ID. Track collected coins and credited defeats for the duration of the run, including checkpoint retries. Only bank coins on successful completion, and make duplicate completion and purchase requests harmless. Do not confuse local cosmetic ownership with verified real-money entitlements.

## Treat physics and input as observable contracts

Use jump buffering and ledge grace for forgiving movement. Check ceiling and edge geometry rather than assuming a jumpable height is reachable in context. Test high-speed skills against thin walls at more than one simulation rate. Use per-activation hit sets and explicit invulnerability intervals. Freeze physics, gameplay clocks, cooldowns, and relevant tweens on pause; clear held input on pause/resume and respawn.

For Phaser Arcade specifically, an anchored immovable actor should disable gravity. Two immovable bodies do not separate, so a collider alone will not keep that actor on the floor. When scaling a sprite, check the actual world-space body dimensions instead of applying a second size reduction accidentally.

## Prove pixel assets in motion

Choose logical canvas, tile size, sprite cells, and foot baseline together. Use nearest-neighbor scaling and disable smoothing. Inspect an idle/run/jump/attack proof at actual game size before producing all variants. Keep collision bodies independent of costume outlines. Deterministic code-drawn sprites work well for small pixel art; use image generation where it improves the result, then normalize and inspect frames. Record provenance and keep runtime assets local.

## Verify what players will actually do

Use focused tests for state rules, and browser checks for physics, keyboard menus, focus pause, saves, rendering, and repeated mounts. Complete each required level with each mechanically distinct hero through real input. Test fixtures for shop/storage error states are useful, but they must not be counted as earned campaign completion. Test-driver failures can differ from gameplay failures: capture position, grounded state, cooldown, facing, and boss state before changing game mechanics.

Record browser versions or environments, commands, screenshots, successes, and unresolved limits. Do not leave cheats or unrestricted test handles in production builds. Keep final handoff concise: where to play, how to run it, what passed, and what remains outside scope.

## Expand a campaign without losing progress

Separate a level’s stable identity from its display order. Store scores and access by stable IDs before inserting or reordering content. Migrate validated old data explicitly, preserve previously earned access, retain a rollback source, and prove migration is idempotent. A returning player’s completed finale should not silently become a new middle level’s score.

Shared collectible growth needs foot-anchored collision resizing and a clearance query over current static and moving solids. Reject a blocked collection rather than pushing a hero through terrain. Keep visual contrast in a shared palette and inspect whole scenes in grayscale; numeric palette ratios alone cannot prove playability.
