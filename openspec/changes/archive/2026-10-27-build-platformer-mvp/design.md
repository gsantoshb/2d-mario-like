# Design: Mass Quest

## Context

The repository contains OpenSpec exploration and this change, with no application yet. The user chose 8-bit visuals, Balayya/Chiru/PK as selectable heroes, and Prakash Raj as the antagonist. See proposal.md for scope and the six delta specs for observable behavior.

This design assumes a desktop-first local fan-game prototype. Touch input and paid entitlements are future work. The working title and simplified original outfits can change without altering the architecture.

## Goals / Non-Goals

**Goals:** Keep a clear boundary between browser UI and game simulation; make new heroes, skins, and levels editable as typed data; make combat and progression predictable; ship as static files.

**Non-goals:** A generalized engine, a store backend, a custom level editor, hardware-accurate NES emulation, or an extensive state-management framework.

## Decisions

### 1. React shell, Phaser game, TypeScript throughout

Use Vite for local development and static builds. React owns the surrounding screens and settings; Phaser owns scenes, movement, collision, input, cameras, and effects. Choose Arcade Physics for rectangular platform collisions. Resolve and pin compatible dependencies during apply; do not copy an unverified template lockfile.

Alternative: a custom Canvas engine would expose more low-level details but require rebuilding collision and animation systems. Godot would introduce a separate authoring model. A React DOM animation loop would couple gameplay to UI rendering.

The React game host creates one Phaser instance, subscribes once to a small typed event bridge, and destroys the instance and subscriptions on unmount. Events carry run configuration, HUD snapshots, pause requests, and one completion result. Avoid React state updates for every position change; send HUD events only when values change. Exercise development StrictMode remount behavior explicitly.

### 2. Small modules and data-driven content

Proposed layout:

```text
src/
  ui/                 # React menus, HUD, shop, game host
  game/
    scenes/           # boot/loading and gameplay lifecycle
    systems/          # player controller, combat, skills, checkpoints, boss
    data/             # typed heroes, skins, enemies, levels, tuning
    events.ts         # typed boundary between React and Phaser
  progression/        # profile validation, rewards, purchases
  storage/            # versioned localStorage adapter
public/assets/        # final sprites, tiles, backgrounds and attribution
```

Use authored tile arrays/JSON plus stable entity IDs and spawn metadata. Moving platforms and boss arenas are explicit level objects. Three separate short layouts are easier to teach and tune than procedural generation. A visual editor can be added later without changing the level contract.

### 3. Shared controller and bounded skills

Use identical base movement and hitboxes for all heroes, with hero-specific skill configurations. Initial tuning targets are 100 ms jump buffering, 100 ms ledge grace, one second damage protection, and a three-second skill cooldown. Values live together and can be adjusted through playtesting without changing the behavior specs.

Balayya emits a forward short-range shockwave; Chiru activates a temporary two-sided hit area; PK receives a bounded horizontal dash. Track target IDs per activation to prevent frame-by-frame damage. PK remains subject to solid collision and world bounds; limit simulation steps and use a swept path check or substeps for dash collision so high speed cannot bypass thin walls. Grounded movement carries the hero with moving platforms; validate this before the rooftop level is accepted.

Boss damage checks are separate from ordinary enemy knockback. A vulnerable boss accepts either a descending stomp or any signature skill, then briefly rejects duplicate hits. Active skill effects are cancelled on death and scene exit. Pause freezes physics, animation-driven gameplay, timers, and cooldown clocks; audio handling is explicit. Clear input latches on pause/resume and focus changes.

### 4. Run state and boss lifecycle

Each run has a unique ID, selected hero/skin, level ID, checkpoint, health, score, collected coin IDs, rewarded enemy IDs, active elapsed time, and completion status. No mid-run checkpoint persistence is offered. Death restores health at the checkpoint, resets ordinary enemy positions and boss state, and retains the run's reward ledger. Returning enemies cannot yield repeated rewards in that run. Starting replay or choosing another hero creates a fresh run.

Level one teaches the selected skill in a safe space. Level two has a checkpoint immediately before its timed segment, whose deadline resets on retry. Level three places the arena checkpoint before boss activation. The boss has a telegraph → attack → recovery loop; at half health it adds a faster projectile pattern. Only recovery is vulnerable. All cues and safe routes must work for all heroes.

### 5. Local profile and transaction boundary

Use a single versioned JSON profile containing unlocked levels, best scores, banked coins, owned skin IDs, equipped skin ID per hero, last hero, mute preference, and the most recently rewarded run ID. Validate types, known IDs, finite nonnegative integer balances, ownership, and reachable unlocks; fall back to defaults for invalid or unsupported data. No migration is needed for the first schema version.

Pure progression functions compute a new profile for completion, purchases, and equipment. A completion event credits the run once, updates its best score and unlocks, then saves a whole-profile snapshot. Repeated input returns the current profile for owned skins or the last rewarded run. The runtime also locks a completed run against further completion callbacks. Because runs do not survive reload and only one run is active, an unbounded persistent reward history is unnecessary. Concurrent browser tabs are not synchronized; do not promise account-grade consistency.

A failed localStorage operation retains the in-memory snapshot and shows a persistence notice. Treat local saves as editable conveniences, never proof of payment. Earned coins are awarded only after completion, not per coin pickup; this makes abandonment and checkpoint recovery consistent. Initial shop: one free default plus one 30-coin alternate palette/outfit per hero. Level coin placement should allow the first cosmetic within roughly one or two successful runs. Currency and score remain separate.

### 6. Pixel assets and rendering

Start at a 384×216 logical playfield with 16×16 tiles and 32×32 hero cells. Use nearest-neighbor textures, pixel-rounded cameras, disabled smoothing, and integer CSS/canvas scaling with letterboxing at viewports large enough for the logical canvas plus shell. Below 384 pixels of available width or 216 of playfield height, show the desktop recommendation; defer touch controls. Menus remain readable DOM text rather than rasterized sprite text.

During apply, create a consistent hero/boss reference lineup and one animation proof before expanding the sprite set. Generate pixel source art if useful, then normalize transparency, frame dimensions, palette, and foot baseline. Inspect frames and runtime playback; a generated sheet is not automatically an animation-ready asset. Keep hitboxes independent of costume outlines. No generation runs during propose. Retain source/attribution details and keep final assets local.

Use original Web Audio cues where practical to avoid audio downloads and movie excerpts. Unlock audio on the first user gesture; mute stops current sounds as well as future playback. Provide visual cues for damage, skill readiness, escape countdown, and boss windups.

### 7. Verification proportional to risk

Use focused unit tests for profile validation, completion idempotency, purchasing, equipment constraints, reward ledgers, and cooldown/damage transitions. Use browser smoke checks for title-to-victory flow, physics edge cases, keyboard menus, focus pause, rendering, and React lifecycle cleanup. Validate all three levels with all three heroes, recording a nine-run completion matrix. Build, typecheck, and lint before handoff. Include a short README explaining how to run the game and edit a hero, skin, or level.

## Risks / Trade-offs

- Generated pixel frames can drift or jitter → prove one animation first; align and clean frames before expansion.
- Small sprites can lose likeness → use distinct hair, outfits, silhouettes, names, and skill effects; inspect at actual scale.
- Dash speed and moving platforms can break collisions → test thin walls, corners, platform carrying, and multiple frame rates early.
- Three heroes increase balance work → share base movement and validate the complete campaign with each hero.
- Browser saves can be cleared, edited, or overwritten by other tabs → disclose local-only persistence; no paid entitlement claims.
- Actor/film assets complicate a commercial release → keep this change a local prototype; track asset sources and address commercial permissions separately before publication.
- Desktop-first excludes touch-only play → communicate supported controls and defer touch behavior to its own tested change.

## Migration Plan

No existing application or user data needs migration. Build incrementally: playable slice, full roster, campaign, progression/shop, then art and verification. Produce a static `dist/` build and local preview. Publishing is outside this change. Future static deployment can roll back by restoring the previous build; future save versions must add an explicit migration or safe fallback before changing the schema.
