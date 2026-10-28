# Telugu cinema platformer — exploration

Status: exploration complete. The user requested a proposal; see changes/build-platformer-mvp/ for the proposed scope, design, specs, and pending tasks. Implementation has not started.
Date: 2026-10-27

## Starting point

The workspace was empty, with no application, dependencies, Git repository, or existing project instructions. OpenSpec has been initialized with its `spec-driven` schema. Tool integrations have not been installed. The CLI was run through npm's temporary cache; it is not a global installation or a project dependency.

The requested workflow is explore → propose → apply. The user has selected 8-bit graphics, three selectable heroes (Balayya, Chiru, and PK), each with a unique skill, and Prakash Raj as the villain. Other decisions below remain candidates. No game code or art has been generated.

## Product direction

Working title: **Mass Quest** (placeholder).

A simple side-scrolling platformer with Telugu movie stars as selectable heroes and theatrical antagonists, short authored levels, expressive powers, and cosmetic unlocks. Preserve familiar run/jump/stomp mechanics while creating original environments, enemies, music, and visual identity.

Keep actor identities separate from gameplay: character data selects the display name, sprite, colors, effects, and signature skill; movement and powers remain reusable systems. The confirmed roster is Balayya, Chiru, and PK, with Prakash Raj as the boss antagonist. All three heroes are available from the start through character selection.

For any commercial version, resolve permissions for actor likenesses, names, film costumes, dialogue, and music before shipping those assets. Original fictional cinema heroes are an alternative commercial direction, not a replacement assumed for the requested star cast. Asset generation does not settle permissions.

## Recommended stack and alternatives

| Option | Advantages | Tradeoff | Recommendation |
| --- | --- | --- | --- |
| React + TypeScript + Vite + Phaser | Familiar web tooling; Phaser supplies physics, cameras, input, animation, and scenes | Learn Phaser's scene lifecycle and keep it separate from React rendering | Preferred |
| React + custom Canvas loop | Small initial setup; complete control | Must build and maintain platform collision, camera, animation, and input systems | Avoid for the first version |
| Godot web export | Dedicated level editor and game tools | Different development model and additional tooling to learn | Good future alternative |

Use React for title screen, character selection, level selection, settings, and cosmetics. Use Phaser for the running game and Arcade Physics for simple platform collisions. React state should not update every animation frame. Communicate through a small typed event bridge. Start from the official React/TypeScript template after checking its current dependency compatibility at implementation time.

Keep levels, character definitions, powers, and skins in plain TypeScript data. Start with a small tile grid or JSON level format; add Tiled only when authoring levels becomes cumbersome. Save versioned progress and settings in localStorage, with a fallback if storage is unavailable. Browser saves are editable, device-local, and may be cleared.

## Suggested scope

First build a playable slice: one hero, one short level, one enemy type, one power, a checkpoint, and a finish gate. Tune movement before expanding content or producing the full sprite set.

The candidate first release then contains:

- Three selectable stars (Balayya, Chiru, and PK), Prakash Raj as the boss antagonist, and two regular enemy types.
- Three short levels, targeting roughly 2–4 minutes each for a first successful run.
- Run, jump, stomp, health, checkpoints, retry, pause, and level selection.
- One distinct signature skill per hero, activated through a shared power button; optional shared Mass Mode later.
- Keyboard controls first; landscape touch controls as a separate milestone before mobile acceptance.
- Persistent level unlocks, best scores, settings, and earned cosmetic skins.
- Original effects and sound, with a mute control.

| Level | Setting | Teaches | Finale |
| --- | --- | --- | --- |
| 1: Festival Run | Village festival, banners, carts, fields | Movement, safe jumps, stomping, selected hero's skill | Short enemy encounter |
| 2: Rooftop Chase | Hyderabad-inspired skyline and rooftops | Moving platforms, skill timing, trickier routes | Timed escape segment |
| 3: Fortress Finale | Dramatic film-set fortress | Combining movement and powers | Boss with readable windups and vulnerability windows |

Proposed skill mapping (fictional game mechanics, pending user feedback):

- **Balayya — Simha Roar:** a short-range shockwave that knocks back nearby enemies. Strength and crowd control.
- **Chiru — Mega Spin:** a brief spinning attack that hits enemies on either side. Timing and close-range combat.
- **PK — Power Dash:** a short directional burst through an enemy, with brief damage protection during the active dash. Mobility and precision.
- Optional later **Mass Mode:** a temporary empowered state charged by combat and applause collectibles; enhances the selected hero's signature skill with clear start/end feedback.

Keep base movement, jump height, health, and collision bodies consistent across heroes. Balance signature skills with cooldowns and readable effects. Every required jump, route, enemy encounter, and boss phase must be completable with any hero; skill-specific shortcuts can be optional. A dash must stop at solid walls and must not tunnel through terrain. Allow hero changes between levels or runs rather than during action.

Introduce one new mechanic at a time. Include jump buffering and a brief grace period after stepping off a ledge. Recovery and retries should be quick. Keep the initial controls to movement, jump, and one signature-skill button; trigger optional Mass Mode through a separate meter action only if playtesting supports it.

## Art exploration

Confirmed style: 8-bit-inspired pixel art with bold silhouettes, limited palettes, tiled environments, and crisp integer scaling without image smoothing. Proposed starting point: 32×32 character cells, verified at actual play scale. This is a visual style, not a requirement to emulate historical console hardware limits. Distinguish Balayya, Chiru, PK, and Prakash Raj through hairstyles, outfits, poses, and power effects within the small sprite size.

Generate one character concept first, then a small animation proof. Required states include idle, run, jump, fall, attack, hurt, and defeat. Normalize frame size, baseline, transparency, facing, and palette. Check animation in-game: a generated sheet is source art and may need cleanup to prevent pose drift, clipping, or jitter. Keep collision bodies stable and independent of costume outlines.

Generate backgrounds, tiles, and effects only after agreeing on the character style. Keep a source/attribution record. Avoid importing movie clips, music, logos, or dialogue as placeholders.

## Monetization exploration

Keep the initial game entirely client-side: earn in-game currency through levels and spend it on cosmetic outfits, color palettes, trails, and victory poses. Cosmetic changes should not alter speed, damage, collision bodies, or level access. A prototype shop must label its currency and unlocks as earned/demo features and must not imply real purchases.

For a strictly static first launch, an optional hosted support/donation link is simpler than selling protected entitlements. If paid skins become a requirement, add hosted checkout and a small trusted service for webhook verification, entitlement issuance, and restoration. A checkout success URL or localStorage flag is not sufficient proof of purchase. Account-based restoration adds scope; do not silently include it in the client-only release. Avoid subscriptions, loot boxes, and competitive paid advantages in this small game.

## Candidate implementation boundaries

Proposed modules: `ui/` for React screens, `game/scenes/` for Phaser scenes, `game/systems/` for reusable movement/combat, `game/data/` for level/character/skin definitions, and `storage/` for local saves. These are proposed paths; no files exist yet.

Verify movement and collisions at ledges and high speed, damage/invulnerability, checkpoint recovery, unlocking the next level, power cooldowns, save restoration, pause/resume, and React mount/unmount without duplicate canvases or listeners. Add focused tests for progression/save logic and smoke-test a production build in a browser. Art acceptance requires inspecting both frames and actual playback.

Out of the first release: multiplayer, accounts, payment processing, online leaderboards, procedural levels, a large star roster, and a level editor.

## Decisions for the next conversation

1. Confirm or revise the suggested signature skills: Balayya's Simha Roar, Chiru's Mega Spin, and PK's Power Dash.
2. Choose preferred outfits or reference looks for the confirmed cast if desired; otherwise propose original simplified outfits.
3. Is the first target a desktop demo or a mobile browser game? Recommended: desktop demo first, then touch support.
4. Keep the first release as a personal/fan prototype with earned skins, or plan a commercial release? This affects the asset and entitlement work.

Once the direction is agreed, create an OpenSpec change such as `build-platformer-mvp`. Draft proposal.md, design.md, capability delta specs, and tasks.md; validate them; then use apply to implement the agreed work. Do not treat this exploration note as an approved proposal.

## Sources

- OpenSpec exploration workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/explore.md
- OpenSpec CLI setup and artifact workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/cli.md
- Official React + TypeScript + Phaser template: https://github.com/phaserjs/template-react-ts
- Phaser physics guide: https://phaser.io/oss/docs/phaser/concepts/physics
- Stripe payment fulfillment guidance: https://docs.stripe.com/payments/existing-customers?platform=web&ui=stripe-hosted
