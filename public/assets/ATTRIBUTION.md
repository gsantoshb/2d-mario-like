# Mass Quest artwork and sound

All included pixel graphics are original procedural artwork authored for this prototype in `scripts/make-art.py`. Rebuild with Python 3; no libraries, remote images, fonts, movie frames, or external asset packs are used. The sprites are stylized interpretations of the named cast, not photographic likenesses.

Animations use a shared 32×32 cell and foot baseline. Frame order: idle (0–1), run (2–5), jump (6), fall (7), skill (8–9), hurt (10), defeat (11), victory (12–13). Alternate skins change only palette/outfit. Scenery and terrain are original pixel compositions. Sound effects are original Web Audio oscillator cues in `src/game/systems/audio.ts`.

This local fan prototype does not imply endorsement by the actors. Commercial likeness, naming, and other asset permissions have not been established.

The five environments now include original Papikondalu-inspired river/forest scenery and a fictional studio backlot. `src/game/data/palette.json` defines shared high-contrast surface caps and coin colors. Original Growshroom and Mass Star graphics are drawn by `scripts/make-art.py`; no Mario assets or level maps are included. See `docs/level-design-notes.md` for design-study attribution.
