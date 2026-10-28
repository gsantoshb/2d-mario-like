# Tasks: Mass Quest

Implemented under the user’s apply authorization. All tasks below were verified; see docs/verification.md for evidence and limitations. The change remains unarchived for review.

## 1. Application foundation

- [x] 1.1 Scaffold React, TypeScript, Vite, Phaser, and focused test tooling with pinned compatible dependencies; verify install, typecheck, and production build succeed.
- [x] 1.2 Add the React game host, typed event bridge, and Phaser lifecycle cleanup; verify repeated mount/unmount and development StrictMode leave exactly one canvas and one set of listeners.
- [x] 1.3 Build title, hero selection, level selection, settings, pause, and result screen navigation with visible keyboard focus; verify a keyboard-only path can start and leave a placeholder run.
- [x] 1.4 Document install/dev/build commands and the UI/game boundary in README; verify each documented command works.

## 2. Playable platforming slice

- [x] 2.1 Implement shared run/jump controls, buffering, ledge grace, camera tracking, terrain collision, and a test level; verify jumps at ledges and solid-wall collision at different frame rates.
- [x] 2.2 Add patrol enemies, stomp bounce, three-point health, damage protection, pits, and checkpoint respawns; verify stomp versus side contact, repeated contact protection, and full-health checkpoint recovery.
- [x] 2.3 Add pause on Escape/focus loss, explicit resume, cleared inputs, and frozen gameplay timers; verify switching tabs cannot move the hero or advance cooldowns/countdowns.
- [x] 2.4 Add focused tests for damage protection and checkpoint reward-ledger behavior; verify duplicate enemy defeats and coin pickups cannot award again after respawn.
- [x] 2.5 Document controls and movement tuning locations; verify the short slice can be completed and retried without reading implementation code.

## 3. Heroes and signature skills

- [x] 3.1 Define Balayya, Chiru, and PK as selectable character data with equal base movement and hitboxes; verify all three are available on a new profile and changes apply only between runs.
- [x] 3.2 Implement Simha Roar, Mega Spin, and Power Dash with per-activation target tracking and visible cooldowns; verify the specified range/direction behavior and no duplicate damage per activation.
- [x] 3.3 Add dash collision protection, skill cancellation on death, and readiness reset on respawn; verify PK cannot tunnel through thin walls or cross level bounds.
- [x] 3.4 Add focused skill transition/cooldown tests and document how to edit a hero or skill; verify each hero completes the slice with no skill-specific required route.

## 4. Pixel art and audio foundation

- [x] 4.1 Create a consistent 8-bit-style reference lineup and one aligned hero animation proof; verify recognizable silhouettes, transparency, palette, and stable foot placement at actual game scale.
- [x] 4.2 Produce and integrate all three hero animations, Prakash Raj boss art, two enemy types, tiles, backgrounds, and power effects; inspect required states in runtime playback and record asset sources/attribution.
- [x] 4.3 Configure the logical canvas, unsmoothed integer scaling, letterboxing, responsive menus, and small-viewport recommendation; verify resizing preserves aspect ratio and keeps HUD/menu controls accessible.
- [x] 4.4 Add original audio cues, gesture-based audio startup, and mute controls; verify current sound stops on mute and every essential cue also has visible feedback.

## 5. Three-level campaign and boss

- [x] 5.1 Author Festival Run with safe control/skill teaching, rewards, checkpoints, and an exit; verify it is completable with each hero and targets a short first successful run.
- [x] 5.2 Author Rooftop Chase with moving platforms, ranged enemies, and a checkpoint before its timed escape; verify platform carrying and countdown reset after failure with each hero.
- [x] 5.3 Author Fortress Finale and Prakash Raj's telegraph/attack/recovery boss loop with two phases and visible health; verify all three skills and stomps can exploit recovery windows, invulnerable windows reject hits, and death resets the fight.
- [x] 5.4 Implement sequential unlocks, run results, active play timing, replay, next-level navigation, and campaign victory; verify one completed run emits one reward event even if the exit is triggered repeatedly.
- [x] 5.5 Document level/entity data, checkpoint reset rules, and boss tuning; verify adding or moving a collectible uses data changes without rewriting a scene.

## 6. Local progression and earned cosmetics

- [x] 6.1 Implement the versioned profile validator and storage adapter with in-memory fallback; verify tests cover absent, malformed, unsupported, invalid-ID, invalid-balance, and read/write-failure cases.
- [x] 6.2 Implement completion rewards, best scores, unlocks, and last rewarded run tracking; verify tests cover duplicate completion, replay rewards, best-score preservation, and unfinished-run abandonment.
- [x] 6.3 Build the cosmetic catalog and shop with one default and one earned alternate per hero; verify tests cover insufficient funds, duplicate purchases, invalid items, owned-only equipment, and separate equipment per hero.
- [x] 6.4 Persist settings, last hero, rewards, and equipped skins; verify browser reload restores completed progress and never credits an unfinished run.
- [x] 6.5 Add visible earned-currency labels, local-save limitations, persistence failure notices, and shop/save documentation; verify no UI implies real purchases, account sync, or gameplay advantages from skins.

## 7. Integrated acceptance and handoff

- [x] 7.1 Run and record the nine-completion matrix (three levels × three heroes), including checkpoint and boss retries; verify no required route depends on a particular skill.
- [x] 7.2 Smoke-test the production preview in current desktop Chrome and Firefox, covering keyboard menus, focus pause, audio mute, shop purchases, reload, and resizing; record observed results and any limitations.
- [x] 7.3 Run the complete focused test suite, typecheck, lint, and production build; resolve failures and record commands/results in a verification note.
- [x] 7.4 Finish README instructions for play, controls, editing content, save behavior, and deferred features; verify the documented fresh-start flow matches the production preview and provide the local playable result for review.

## Workflow follow-up

- Review the implemented game against the proposal and capability specs.
- Archive this change and sync its specs only after implementation and acceptance are complete.
- Handle publishing, commercial permissions, touch controls, and payment services as separate work when requested.
