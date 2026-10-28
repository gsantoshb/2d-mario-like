# Proposal: Power-ups, clearer playfields, and five acts

## Why

The first playtest found that platforms and coins blend into the scenery. Collectible power-ups and two additional levels will add variety while keeping the controls and character skills familiar.

## What Changes

- Add original **Growshroom** pickups: grow larger and absorb one damaging hit before shrinking. Preserve each hero's existing signature skill.
- Add original **Mass Star** pickups: eight seconds of protection from enemies/projectiles, with a visible countdown. Pits and escape deadlines still matter; boss vulnerability rules remain intact.
- Give terrain and platforms bright walkable edges, dark outlines, and distinct side textures; reduce background prominence.
- Make coins brighter, clearly outlined, slightly larger, and visibly marked/sparkling so their shape reads against every environment.
- Expand the campaign to five acts: Festival Run → Rooftop Chase → **Papikondalu Trail** → **Studio Showdown** → Fortress Finale. Keep Prakash Raj as the final boss.
- Preserve existing scores, access, coins, skins, and settings through an explicit save migration. Replace index-based level assumptions with stable level identities.

## Capabilities

### New Capabilities

- `collectible-powerups`: Pickup collection, safe growth/shrink, timed star protection, HUD feedback, and retry/reset behavior.

### Modified Capabilities

- `platforming`: Damage priority and checkpoint recovery with collectible power states.
- `pixel-presentation`: Foreground/background separation, readable platform edges and coins, and power-up HUD feedback.
- `level-campaign`: Five ordered acts with two distinct new environments and the existing final boss.
- `local-progression`: Preserve valid three-level saves while introducing stable level identities and five-level progression.

## Impact

Touches typed level/tuning data, player/combat systems, scene orchestration, world/coin rendering, generated pixel assets, HUD/menus, progression/storage, and browser acceptance scripts. Introduce a focused power-up system rather than growing PlayScene. No new framework, backend, payment integration, or control binding is required.

Scope is a proposed next iteration; application code and servers remain unchanged/stopped until apply. Moving mushroom AI, breakable/question blocks, projectiles for heroes, extra characters, and touch controls are deferred. The original completed MVP change is archived as the baseline for these deltas.
