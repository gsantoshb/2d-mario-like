# Mass Quest

A client-side Telugu cinema fan platformer: choose **Balayya**, **Chiru**, or **PK**, cross five original pixel environments, and face **Prakash Raj**. Built with React, TypeScript, Vite, and Phaser Arcade Physics.

## Run locally

Requires Node.js 22.19+ (tested with Node 22.23.1) and npm. Open Terminal and enter the project directory:

```sh
cd /Users/gsantoshb/Documents/vscode-ws/2d-mario-like
```

For the first start, or after dependencies change, install the locked dependencies:

```sh
npm ci
```

Start the development server:

```sh
npm run dev
```

Keep that terminal open and visit the URL Vite prints (normally `http://127.0.0.1:5173`). Choose a hero, choose an unlocked level, and click **Start adventure**. Desktop + keyboard is the supported play target. Later starts only require `npm run dev` from this directory.

To stop the server, press **Ctrl+C** in its terminal. Closing the browser tab does not stop the server. Browser-saved progress remains available on the same browser and URL; unfinished runs are not saved.

### Preview the production build

```sh
npm run build
npm run preview
```

Open the preview URL printed in the terminal (normally `http://127.0.0.1:4173`). Stop it with **Ctrl+C** too. Development and preview URLs use different ports, so they have separate browser saves. If a port is occupied, Vite can choose another; use the printed URL. Serve the build through the preview server instead of opening `dist/index.html` directly.

### Development checks

```sh
npm test              # Focused progression, storage, combat, and ledger tests
npm run typecheck
npm run lint
npm run build         # Static output in dist/
```

## Play

| Input | Action |
| --- | --- |
| A/D or ←/→ | Move |
| Space | Jump; land on enemies to stomp and bounce |
| X | Use your signature skill (3-second cooldown) |
| Escape | Pause/resume |

- **Balayya / Simha Roar:** forward shockwave.
- **Chiru / Mega Spin:** attack both sides.
- **PK / Power Dash:** dash through enemies with brief contact protection. Walls remain solid.

You have three hearts and unlimited retries. Green flags save your checkpoint for the current run. Progress through Festival Run → Rooftop Chase → Papikondalu Trail → Studio Showdown → Fortress Finale. In the rooftop escape, reach the flag before the countdown ends. Prakash Raj telegraphs his attacks; his green recovery glow is your opening. All three heroes can finish every level.

### Collectible powers

Touch an orange **Growshroom** to grow 1.25× larger and absorb one enemy/projectile hit before shrinking. If there is not enough room under a ceiling, the pickup stays available until growth is safe. Another mushroom does not stack extra hits.

A gold **Mass Star** grants eight active-play seconds of enemy/projectile protection and defeats regular enemies on contact. Another star refreshes the timer to eight seconds. Pausing freezes it. The boss still requires its green vulnerability window and a stomp or X attack; pits and escape deadlines still cause defeat.

Both powers have HUD indicators and leave your X signature move intact. Checkpoint retries restore pickup availability and clear active powers; they do not reset the coin/enemy reward ledger. Pickups grant no score or money, and no required route depends on collecting them.

Coins and enemy defeats increase your score. Collected coins enter your wallet only when you finish a level. Dying retains the run's collected-coin/defeat ledger, so returning enemies cannot be farmed for additional rewards. Leaving or reloading discards unfinished-run rewards. Replays are fresh runs and can earn coins again.

The Wardrobe offers one 30-coin alternate for each hero. Skins change visuals only. There are no real payments, accounts, subscriptions, or pay-to-win features.

## Find your way around

```text
src/ui/                 React navigation, menus, HUD and Phaser host
src/game/scenes/         Run orchestration and pause/completion lifecycle
src/game/systems/        Player, enemy, boss, world, sound and combat rules
src/game/data/           Typed hero, skin, level and tuning data
src/progression/         Pure profile validation, reward and purchase rules
src/storage/             Local storage adapter and failure notices
public/assets/          Local PNG sheets, scenery and attribution
scripts/make-art.py      Reproducible pixel artwork (Python standard library)
tests/                  Focused unit tests
openspec/               Exploration, proposal, specs, design and tracked tasks
```

React owns screens and profile updates; Phaser owns the live simulation. A typed `Bridge` communicates HUD changes, pause events, and a single run-completion result. The game instance and listeners are destroyed when leaving play. Profile updates are computed before a complete JSON snapshot is saved.

### Change a hero or power

Edit `src/game/data/content.ts` for names, descriptions, colors, and shared movement tuning. Change range/activation behavior in `src/game/systems/player.ts`. Add matching pixel sheets and animation frames; keep hitboxes independent of appearance. Signature moves share the X input and per-activation hit tracking.

### Change a level

Edit `LEVELS` in `src/game/data/content.ts`. `ground` entries are `[x, width]` spans at y=192; platforms specify top-left coordinates, width, and optional horizontal movement. Coins use `[x,y]` positions. Enemies declare patrol limits and kind. Array positions supply stable reward IDs within a run. Checkpoints are grounded X positions; the boss and exit are explicit. Keep required gaps and routes reachable with base jumping, without relying on any signature skill.

### Change the art

```sh
python3 scripts/make-art.py
```

All character sheets use 32×32 cells and a stable foot baseline. See `public/assets/ATTRIBUTION.md` for frame order and source details. Scenery is 768×216, tiles are 32×32, and the game uses a 384×216 logical canvas with crisp integer scaling. No external fonts or asset services are required at runtime.

## Saves and compatibility

Current saves use `mass-quest.v2`, with stable level names, best-score records, unlocked acts, coins, skins, last hero, and mute preference. Existing `mass-quest.v1` saves are validated and migrated automatically when no v2 save exists. The original key is retained for rollback; subsequent loads prefer v2. Migration grants no money and never assigns an old fortress score to a new middle act.

Previously unlocked content stays available. Old Rooftop completion also opens Papikondalu Trail; old Fortress completion opens all five acts. Otherwise new acts unlock through the normal sequence. An older build can still read the retained v1 save but cannot see later v2 progress. Invalid saves fall back to visible safe defaults, and denied writes retain session progress with a notice.

Checkpoints, active powers, and unfinished rewards are never persisted. Clearing browser data removes progress. Saves can be edited and are not synchronized across tabs, devices, or accounts. Real-money payments, touch controls, publishing, and commercial permissions remain outside this release.

## Browser verification

With the development server running and Chrome installed:

```sh
npm run test:browser
node scripts/campaign-check.mjs
NO_POWER=1 node scripts/campaign-check.mjs
node scripts/power-check.mjs
node scripts/visual-check.mjs
```

The campaign runner uses real keyboard events and reads a development-only scene handle to decide when to jump or attack. It does not change positions, health, currency, or unlocks. Each hero starts fresh and earns subsequent levels through completion. Screenshots and machine-readable results go to ignored `test-results/`. The scene handle is absent from production builds.

See `docs/verification.md` for the recorded checks and remaining limitations.

## Project memory and future work

`AGENTS.md` preserves the user's project preferences and maintenance rules. `docs/project-memory.md` records accepted choices; `docs/patterns.md` captures transferable implementation lessons. The portable personal-skill source is `docs/reusable-skill/SKILL.md` (also installed as `web-platformer-patterns`). These files preserve context without relying on a future chat remembering this conversation.

The expanded layouts use original data and art. See `docs/level-design-notes.md` for the Mario level-study references and how their teaching/pacing principles informed the new acts. Palette values in `src/game/data/palette.json` are shared by the art generator, runtime coin rendering, and numeric contrast tests.
