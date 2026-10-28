# Verification record

Date: 2026-10-27. Environment: macOS, Node 22.23.1, npm 10.9.8.

## Automated checks

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 22 tests passed across progression/storage and combat/ledger suites.
- `npm run build`: passed; static files produced in `dist/`.
- OpenSpec strict validation: passed when the proposal was created; revalidated at handoff.

The production build keeps React/UI and Phaser/gameplay in separate chunks. Phaser is loaded on entering a run. Vite reports the engine chunk above its default 500 kB warning threshold (about 1.19 MB minified, 318 kB gzip); this is a known engine payload, not a build failure. There are no runtime remote assets, fonts, accounts, payments, or AI calls.

## Production browser smoke checks

`GAME_URL=http://127.0.0.1:4173 npm run test:browser` passes in installed-channel Chrome and Playwright Firefox 157. Checks include:

- All three heroes available; later acts initially locked.
- Keyboard hero selection and starting a run.
- Movement collects coins, pause freezes the displayed timer/cooldown, and Tab remains within the pause dialog.
- Explicit resume and focus-loss pause.
- Repeated start/pause/leave cycles leave exactly one active canvas and zero canvases after leaving.
- Unfinished runs do not bank coins or unlock levels.
- Shop purchase/equip/reload round-trip with an isolated completed-save fixture.
- Mute preference persists, invalid JSON produces safe defaults with a notice, and supported layouts do not overflow at 900 px.
- Small viewports show the desktop recommendation.
- Development scene inspection handle is absent from the production build.
- No uncaught browser errors.

Screenshots and raw JSON reports are in ignored `test-results/`. Shop fixtures are not campaign completion evidence.

## Campaign acceptance

All nine keyboard-driven runs passed with no uncaught browser errors. The runner inspects development state to decide real keyboard inputs; full-campaign runs begin from fresh saves and earn every unlock. Times below are automated route wall times, not advertised first-play completion times.

| Hero | Festival Run | Rooftop Chase | Fortress Finale |
| --- | --- | --- | --- |
| Balayya | Pass, 21 s | Pass, 25 s | Pass, 38 s |
| Chiru | Pass, 22 s | Pass, 25 s | Pass, 38 s |
| PK | Pass, 21 s | Pass, 23 s | Pass, 41 s |

Separate edge-case runs also passed:

- PK dashed into the real 16-pixel-wide solid obstacle at both 30 Hz and 60 Hz physics simulation rates. His body stopped at the wall's x=2080 boundary, then he cleared it by jumping and completed the level.
- The rooftop escape was deliberately allowed to expire. The hero returned to the escape checkpoint at x=2016 with full health, retained collected coins, and completed the level after retrying.
- After reducing boss health, the hero was deliberately walked into damage until defeat. Respawn restored full hero health at the arena checkpoint x=1824 and reset the boss to all six health points. The fight was then completed normally.

The retry tests use a labeled unlocked-level fixture only to enter the relevant level and never change actor position, health, boss health, or live rewards. They are separate from the fresh-save matrix. Raw evidence: `test-results/campaign.json`, `campaign-30.json`, `campaign-60.json`, and `campaign-retries.json`.

Useful reproduction commands with the development server running:

```sh
node scripts/campaign-check.mjs
HERO=pk CAMPAIGN_LEVELS=1 PHYSICS_FPS=30 node scripts/campaign-check.mjs
HERO=pk CAMPAIGN_LEVELS=1 PHYSICS_FPS=60 node scripts/campaign-check.mjs
HERO=balayya START_LEVEL=1 VERIFY_RETRY=1 node scripts/campaign-check.mjs
```

## Visual inspection

Inspected landing/hero selection, game canvas, wardrobe, pause, desktop resizing, and small-viewport screenshots. Pixel assets use fixed 32×32 frames, stable foot alignment, distinct silhouettes, and a consistent palette. The original art generator and frame order are documented in asset attribution. Audio is original oscillator-based effects with visual equivalents for essential cues.

## Known limitations

- Compact authored levels take roughly 20–45 seconds on successful automated routes; a first playthrough can take longer with retries. The exploration's early 2–4 minute estimate is not a guaranteed duration.
- Desktop keyboard only. Responsive menus work on smaller devices, but touch controls are deferred.
- Local saves can be cleared/edited and are not synchronized across tabs or devices. Persistence failure falls back to session memory.
- Skins use earned coins. Real payments and protected entitlements are not implemented.
- Artwork is stylized original pixel art, not a licensed actor/film asset pack. Commercial clearance and publishing are outside this change.
- Browser automation verifies flows and gameplay invariants; subjective difficulty and likeness can still benefit from the user's playtest.
