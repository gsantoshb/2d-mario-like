# Exploration findings

The user requested mushroom-like powers, stronger platform/coin contrast, and a couple more levels. These four requests are confirmed; power names/durations and new level themes below are proposed defaults for review.

- Current game has hero skills but no collectible power state. `CombatState` controls health/protection/cooldowns, and Player owns sprite/body geometry; those are the integration points for growth and star effects.
- Platform tops reuse narrow slices of muted terrain textures; all scenery uses a similar saturation/value range. Coin drawing is a small 5–7 pixel gold shape with little separation from warm backgrounds. Improve both silhouettes and luminance, not just hue.
- Current IDs are `0 | 1 | 2`; profiles use a three-entry best-score array and highest-unlocked index. Inserting acts would otherwise attach the fortress score to a new level and could reject or reset old saves.
- Insert new acts before the fortress to preserve the final-villain structure. Prefer an outdoor river/forest trail and an artificial studio-backlot course for visually distinct layouts using existing movement mechanics.
- Propose stationary placed pickups first; no moving mushroom AI or question blocks. All required routes must still work without pickups, so a consumed boost never blocks progression.
- Physical growth is more convincing than a cosmetic tint but requires clearance checks and foot-anchored body changes. Defer collection when there is insufficient room rather than clipping the hero into a ceiling.
- Previous MVP was accepted by the user and fully verified. It was archived using the OpenSpec CLI, synchronizing six main capability specs. New work will be a separate reviewed change.

Recommended review choices: Growshroom absorbs one hit with no timer; Mass Star lasts eight active-play seconds; two new acts are Papikondalu Trail and Studio Showdown. No implementation has started.
