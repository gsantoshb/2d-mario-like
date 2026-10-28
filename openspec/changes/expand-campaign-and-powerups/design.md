# Design: Clearer platforms and a five-act power-up campaign

## Context

See proposal.md and exploration.md. The accepted MVP is archived and its six capability specs are now the baseline. The current application still has three acts, numeric level IDs, a three-slot score array, muted surface textures, and no collectible power system. This change is planning only until apply.

## Goals / Non-Goals

**Goals:** Add reusable run-local power states; make foreground affordances obvious; expand the campaign without save loss; keep player/scene/UI responsibilities separate.

**Non-goals:** A new engine, dependencies, hero controls, moving mushroom AI, question blocks, hero projectiles, multiplayer, payments, or publishing.

## Decisions

### 1. Two optional pickups with separate state and rendering

Add a focused `PowerUpState` for grown/star state and a pickup controller for placed pickup IDs, collection eligibility, visuals, and respawn availability. Put spawn metadata and tuning in typed content data. Keep state transitions pure where practical; keep Phaser geometry and effects in adapters. PlayScene coordinates updates rather than implementing all collection logic.

Growshroom uses 1.25 scale for the current skin and collision body. Preserve foot world position on growth and shrink. Before collection, calculate the candidate body rectangle and check all static/moving solids and world bounds; touching a floor is allowed, overlap is not. If expansion is blocked, retain the pickup. Duplicate growth does not consume the pickup. Skin changes remain cosmetic: this is a shared gameplay transformation for every hero.

The alternative of visual-only growth would avoid clearance work but mismatch visible size and collisions. Physical growth with clearance checks gives the expected mushroom-style interaction without ceiling clipping. Walking mushrooms and breakable blocks would expand enemy/block behavior unnecessarily for this iteration.

Mass Star lasts 8000 ms on the existing active-play clock. Collection refreshes that expiry to now + 8000, never adds another duration. Reset both effects on death/level transition. Restore pickups on checkpoint respawn, but leave the coin/enemy reward ledger intact. Pickups themselves award no score/currency, so recovery cannot farm rewards. Normal-size required routes ensure a missed or consumed pickup cannot softlock a run.

### 2. Explicit damage priority

Evaluate damage in one shared path: existing short protection or active star/dash rejects damage; otherwise grown state absorbs the hit and shrinks; otherwise decrement health. Accepted shrink/health hits use the existing brief protection interval. Pits and escape timeout bypass collectible protection and use normal death/checkpoint recovery. Star contact defeats regular enemies through their normal reward path, with one reward per enemy ID. It never bypasses the boss's vulnerability or normal attack requirements.

The HUD receives changed power state/countdown along the typed bridge. Growth is a persistent status chip while active; star uses an icon plus remaining seconds. Keep all three existing signature moves and cooldowns intact, with their normal base range independent of growth. Use distinct shapes and a gentle effect rather than relying on fast color flashes.

### 3. Foreground contrast as a palette contract

Define reusable foreground palettes for terrain edges, outlines, coin cores/marks, and pickups. Target top-edge/outline luminance contrast >=3:1 and coin-core/outline >=4.5:1, checked by a small palette test using relative luminance. These are game-art acceptance targets, not a claim that text contrast rules alone establish playability.

Render continuous bright top caps and dark borders for terrain and both static/moving platforms, with shadowed side textures. Keep decoration below the collision edge and do not change surface coordinates for cosmetic outlines. Subdue scenery through theme palette adjustments or a background-only dim layer; avoid dimming the hero, platforms, pickups, or HUD.

Coins become approximately 9×11 logical pixels with a one-pixel outline, gold core, internal mark, and restrained sparkle. Keep the existing collision/collection coordinates and ledger IDs; bobbing is visual only. Share geometry between gameplay rendering and asset previews where useful. Inspect actual bright/dark backgrounds at 1x and 2x plus grayscale. Numeric palette tests alone cannot prove an edge stays readable in a full scene.

### 4. Stable level IDs and preserved old access

Replace numeric identity with a `LevelId` derived from stable content names: `festival-run`, `rooftop-chase`, `papikondalu-trail`, `studio-showdown`, and `fortress-finale`. Use an explicit ordered campaign list for display and next-act navigation. Make score and unlock storage keyed by IDs; avoid magic final-index checks in rewards, Results, App, and acceptance scripts.

Use a v2 profile with best-score records and an unlocked-ID set/list. Read v2 first and migrate validated v1 data if v2 is absent. Keep the original `mass-quest.v1` entry as a rollback source; write v2 to `mass-quest.v2`. For invalid data, retain the established visible safe-default behavior rather than inventing rewards or merging an invalid newer profile with older currency. If storage access or v2 writes fail, use the migrated in-memory snapshot with a notice.

Migration maps old score indices 0/1/2 to the original three stable IDs. Preserve original unlocked levels. Any completed original act also grants access to its next act in the new order, making the forest available after an old Rooftop completion. An old Fortress completion opens all five acts as post-campaign content. Otherwise Studio stays locked until Forest completion. This deliberately permits grandfathered fortress access without forcing returning players to re-unlock content.

Retain original coins, owned/equipped skins, mute, selected hero, and last reward ID. Migration itself grants no currency or scores. Validate v1 before conversion and validate resulting v2; repeated conversion must be deterministic. A successful v2 save takes priority on future loads. Do not store power-up state in either profile.

### 5. Two authored environments, existing movement vocabulary

Papikondalu Trail uses a clearly silhouetted river/forest background, stepping platforms, river gaps treated as pits, and forgiving grounded checkpoints. Studio Showdown uses film-set facades, crates/set obstacles, and moving rig platforms. No new hazard engine or control scheme is necessary. Add distinct scenery/terrain assets to the original art generator and provenance notes.

Place safe first encounters with both pickups in Festival Run, then optional useful placements in all acts. Check enlarged clearance, jumping onto moving surfaces, dash boundaries, and small-platform landing in all themes. Keep the fortress last in the ordered campaign. Do not move its existing score/history merely because its array position changes.

### 6. Verification grows with campaign coverage

Test pure power transitions, damage priority, timer refresh/pause, palette contrast, v1→v2 migration/idempotency, and save write failures. Browser-check growing under low ceilings, shrinking by enemies/projectiles, star contact and expiry, pit/time-limit death, duplicate pickup overlap, HUD fitting, and checkpoints.

Complete the five acts with all three heroes through keyboard inputs (15 combinations). Include normal-size/no-star required-route checks and both pickups with each hero. Fixtures for isolated power/migration cases must be labeled separately from campaign progression. Preserve existing shop, audio, pause, lifecycle, and 30/60 Hz dash checks. Produce before/after scene comparisons for foreground readability and update the verification note with observed results.

## Risks / Trade-offs

- Growth can wedge a hero into terrain → candidate-body clearance checks, foot anchoring, and low-ceiling/moving-platform tests before level expansion.
- Brighter art can become noisy → reserve the strongest highlights for interactive objects, keep scenery subdued, and review in grayscale.
- Reordered content can corrupt progress → stable IDs, explicit v1 mapping, separate v2 storage, preserved old access, and migration fixtures for each prior unlock state.
- Combined star/growth/skill states can bypass intended combat → one damage-priority path and explicit boss-contact rules.
- Five choices can overflow menus or hide HUD controls → responsive level grid and desktop sizing checks with active power chips.

## Migration Plan

Implement stable IDs/migration with tests before inserting levels. Add the power-state/controller and contrast updates, then author the new acts and update UI/navigation. Validate the full campaign and production build before handoff. Do not start/publish servers as a side effect of proposal creation.

During apply, update the main `level-campaign` Purpose text to describe an authored campaign without hard-coding three acts; the renamed/modified requirement below supplies the five-act contract. Update AGENTS.md, README, and project memory to refer to five acts/15 combinations only after implementation is verified. Keep the original MVP archive immutable. An old build can still read its retained v1 save after rollback; it will not include newer v2 progress.
