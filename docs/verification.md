# Five-act iteration verification

Date: 2026-10-27. Environment: macOS, Node 22.23.1, npm 10.9.8. This supersedes the MVP verification preserved in `docs/verification-mvp.md`.

## Campaign: all five levels with each hero

All 15 fresh-save campaign combinations passed through real keyboard input. Each hero earned the later act unlocks through completion. Growth and star effects were observed with every hero in every act; no actor position, health, rewards, or boss state was set by the campaign runner. The two retries shown below recovered normally through checkpoints.

| Hero | Festival Run | Rooftop Chase | Papikondalu Trail | Studio Showdown | Fortress Finale |
| --- | --- | --- | --- | --- | --- |
| Balayya | Pass, 22 s | Pass, 25 s | Pass, 28 s (1 retry) | Pass, 25 s | Pass, 38 s |
| Chiru | Pass, 21 s | Pass, 28 s (1 retry) | Pass, 24 s | Pass, 25 s | Pass, 39 s |
| PK | Pass, 24 s | Pass, 23 s | Pass, 23 s | Pass, 24 s | Pass, 38 s |

Times are automated-route wall times, not promised first-play durations. Raw evidence is in ignored `test-results/campaign.json`. A second, independently driven no-pickup matrix also passed all 15 combinations. It used normal-size heroes throughout with no star protection. Balayya and Chiru each completed the five acts without a death; PK used ordinary jumps/stomps for much of the run and needed checkpoint retries (including seven in the final act), then completed the campaign. Both matrices use normal gameplay inputs; isolated fixtures below are separate. Raw additional coverage is `test-results/campaign-unboosted.json`.

## Power-up and geometry checks

All six hero/skin combinations (three heroes × default/alternate outfits) passed isolated browser checks for blocked growth under a ceiling, retaining the blocked pickup, foot-anchored expansion to a 17.5×32.5 body, star collection, timer freeze during pause, and protected enemy contact. Default-skin cases for each hero additionally verified pit recovery, pickup availability reset, retained reward ledgers, recollection without duplicate coins, shrink-on-hit, and normal 14×26 body restoration.

The isolated fixture adds/removes one low ceiling using normal terrain bodies; the actor moves and obtains/loses powers only through normal inputs and gameplay. Alternate-skin ownership is seeded solely to inspect those outfits. These fixture checks are not counted as campaign completions. Evidence: `test-results/powers.json` and hero/skin screenshots.

Grown PK stops at the real solid obstacle at x=2080 at both 30 Hz and 60 Hz physics rates, and then clears it by jumping. The 60 Hz case is included in the fresh campaign; the 30 Hz case is `test-results/campaign-30.json`.

## Production browser checks

Chrome and Firefox pass the final production smoke suite for keyboard menus, five act choices/locks, movement, skill input, pause/resume and frozen clocks, focus loss, pause-dialog focus trap, repeated mounts/unmounts, wardrobe purchase/equipment, mute, corrupt-save fallback, and responsive layouts. Production has no development inspection handle. No uncaught browser errors were recorded.

The migration fixture verifies v1 → v2 in both browsers: coins and equipment remain intact, Rooftop's score stays attached to Rooftop, the forest starts with no score, old fortress access is retained, Studio remains locked until earned, and the original v1 key remains present. Reloading does not add coins. Browser fixtures are separate from fresh campaign evidence. See `test-results/browser.json` and migrated-campaign screenshots.

## Visual readability

All five themes were captured and inspected at integer 1x and 2x scaling, in color and grayscale. Walkable caps/borders and coin outlines remain visibly distinct from the subdued scenery. The numeric palette test enforces top/outline contrast ≥3:1 and coin/outline contrast ≥4.5:1. These are game-art checks rather than a blanket accessibility certification.

Screenshots include `papikondalu-trail-2x.png`, `studio-showdown-2x-gray.png`, and `fortress-finale-1x.png`; raw coverage is `test-results/visual.json`. Original pixel assets are reproduced by `python3 scripts/make-art.py`. The shared palette and attribution are documented with the assets.

## Scope and limitations

Desktop keyboard remains the supported play target. Checkpoints/powers are run-local; banked progress remains local to this browser and port. The retained v1 key supports an old-build rollback but does not receive new v2 progress. No backend, paid entitlements, touch controls, or publishing was added. The Phaser engine chunk remains about 1.19 MB minified / 318 kB gzip and is loaded on entering gameplay; its build size warning is expected.

The Mario reference study and original-layout adaptations are in `docs/level-design-notes.md`. Difficulty, likeness, and pacing can still benefit from the user's own playtest.

## Additional retry and boss cases

A grown hero was deliberately defeated in the final arena. Respawn restored three hearts at the arena checkpoint and reset the boss to six health; the fight was then completed normally (`test-results/campaign-boss-retry.json`). A separate isolated scene adds a star pickup near the boss: protected contact during an invulnerable phase changes neither hero health nor boss health, and the fight can still be won through normal vulnerability windows (`test-results/campaign-star-boss.json`). The latter fixture only places a pickup; it does not grant powers or change actors directly.

The rooftop timeout was also tested after deliberately collecting its star late in the escape. The deadline still causes checkpoint recovery, clears active effects, restores health, and retains collected coins. This confirms invincibility does not bypass the escape rule.

## Final command checks

- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm test`: 36 focused tests passed across four suites.
- `npm run build`: pass.
- OpenSpec strict validation: pass.
- Sprite/scenery regeneration: all PNG hashes unchanged after rerunning the art generator.

The requested 15 campaign combinations and the additional 15 unboosted combinations are complete. Detailed commands are in README and the browser scripts. The current change stays unarchived for user review. Test servers are stopped at handoff.
