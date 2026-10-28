# Project memory

Recorded at the user's request on 2026-10-27. This file preserves accepted choices across chats in this repository; it is not a claim of global conversational memory.

## User intent and decisions

- Build a simple Mario-like browser platformer with levels and cool powers, themed around Telugu cinema.
- Use **8-bit-inspired pixel graphics**.
- Make **Balayya**, **Chiru**, and **PK** selectable from the beginning, with one unique skill each.
- Use **Prakash Raj** as the final villain.
- Proposed and accepted skill mapping: Simha Roar (Balayya), Mega Spin (Chiru), Power Dash (PK).
- Keep development approachable for a web developer using React and TypeScript.
- Follow **OpenSpec explore → propose → apply**. The user explicitly requested each stage and then authorized implementation.
- The user explicitly asked for good coding practices and for decisions/patterns to be retained for future similar projects.

## Agreed implementation scope

- Working title: **Mass Quest**.
- React + TypeScript + Vite shell; Phaser Arcade Physics for gameplay.
- Current five-act order: Festival Run, Rooftop Chase, Papikondalu Trail, Studio Showdown, Fortress Finale. The original MVP had three acts.
- Three health points, unlimited checkpoint retries, run/jump/stomp, one skill button, readable boss attacks and vulnerability windows.
- Desktop keyboard first: A/D or arrows, Space, X, Escape. Touch controls are deferred.
- Client-side profile stores unlocks, best scores, banked coins, owned/equipped skins, last hero, and mute setting.
- Earned cosmetics first; alternate skins cost 30 gameplay coins. No real-money purchases in this release.
- Original pixel sprites/scenery and audio. Generated assets are optional; this implementation uses reproducible original pixel drawing code to keep frame alignment deterministic.
- Paid entitlements would require a trusted service; publishing and commercial permissions are separate future scope.

## Current references

- `openspec/changes/archive/2026-10-27-build-platformer-mvp/`: accepted MVP proposal, design, specs, and completed tasks.
- `openspec/specs/`: synchronized baseline capabilities.
- `openspec/changes/expand-campaign-and-powerups/`: next proposed iteration; implementation is pending.
- `README.md`: run commands, controls, data editing, assets, and limitations.
- `docs/verification.md`: recorded checks and acceptance evidence, updated during handoff.
- `docs/patterns.md`: transferable lessons; adapt these to future projects rather than copying the cast or monetization assumptions automatically.

## Changes discovered during implementation

- Split large screens out of App and lazy-load Phaser gameplay so the landing page does not load the engine upfront.
- Simplified an overlapping low-platform arrangement in Rooftop Chase after keyboard playtests exposed frustrating ceiling collisions.
- An immovable Arcade boss must also disable gravity when anchored; two immovable bodies do not separate, so a terrain collider alone cannot hold it up.
- A keyboard test driver must release held keys after death because the controller deliberately clears input latches on respawn.

## Applied and verified

The original game is implemented. All nine hero/level combinations, escape timeout recovery, boss defeat/reset, and 30/60 Hz dash collision checks passed. Chrome and Firefox production smoke checks, 22 focused tests, typecheck, lint, and the static build passed. After the user's positive review, the completed MVP was archived and its six specs synchronized as the baseline for the next change.

The reusable workflow is also installed as the personal Codex skill `web-platformer-patterns` under `~/.codex/skills/`; the repository copy is `docs/reusable-skill/SKILL.md`. That skill preserves transferable preferences without forcing this project's cast or level design onto future games.

## Five-act iteration (implemented)

The user requested Mario-style mushroom/pickup powers, higher-contrast platforms/coins, and two more levels through OpenSpec, then authorized apply and testing all five acts with each hero. Growshroom now grows the hero 1.25× and absorbs one hit; Mass Star grants eight active-play seconds of enemy/projectile protection. Both are optional and preserve the X skill. Safe-clearance growth, hit priority, pause/reset rules, and boss vulnerability are covered by focused and isolated browser tests.

Papikondalu Trail and Studio Showdown precede the fortress. Bright platform caps, dark borders, larger outlined coins, and subdued scenery improve foreground readability at 1x/2x and grayscale. Original art remains reproducible through the generator; the shared palette has numeric contrast tests.

The campaign now uses stable string IDs and a v2 score/unlock record. Valid original v1 saves migrate without losing currency, cosmetics, scores, or prior access; the original key remains as a rollback source. Old fortress completion opens the new acts. No active pickup state is persisted.

All 15 fresh-save hero/act combinations passed with both pickups observed in every run. All 15 combinations also passed in a second matrix without collecting either pickup. Migration/browser checks and fixture evidence are recorded in `docs/verification.md`. The user also requested Mario level inspiration: references to the opening sequence, World 1-3, and Donut Plains 1 informed safe teaching, coin-guided crossings, and optional routes; no exact maps or assets were copied. See `docs/level-design-notes.md`.

The current iteration stays unarchived for user review. Local servers are used for testing and should be stopped at handoff unless the user requests a live preview.
