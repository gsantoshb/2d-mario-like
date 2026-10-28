## ADDED Requirements

### Requirement: Readable walkable surfaces
Solid terrain, static platforms, and moving platforms SHALL have a continuous bright walkable top edge, dark boundary, and distinct side texture. The top-edge/outline relative luminance contrast SHALL be at least 3:1. Background scenery SHALL be visually subdued so surfaces remain distinguishable at 1x and 2x logical scaling and in grayscale across all five themes.

#### Scenario: Moving platform readability
- **WHEN** a moving platform travels in front of the darkest and lightest scenery regions in its level
- **THEN** its landing edge and solid sides remain visible without relying on hue or motion alone

### Requirement: Readable coin silhouettes
Coins SHALL have a bright gold core, dark outline, visible internal mark, and a small sparkle/bob treatment that does not change their collection position. The core/outline luminance contrast SHALL be at least 4.5:1. Their silhouette SHALL remain distinct from pickups, scenery, and power effects at 1x and 2x logical scale, including grayscale.

#### Scenario: Coins on warm scenery
- **WHEN** coins appear against a sunset, lantern, or warm studio background
- **THEN** their complete outline and internal coin mark remain recognizable

## MODIFIED Requirements

### Requirement: Complete browser game flow
The application SHALL expose title, hero selection, level selection, settings, shop, pause, and results screens. The gameplay HUD SHALL show health, run coins, score, selected hero, skill readiness, growth protection, and remaining Mass Star time when active. Menus SHALL support keyboard navigation, visible focus, and pointer activation. Five level choices and added power indicators SHALL fit supported desktop layouts without hiding controls.

#### Scenario: Keyboard start flow
- **WHEN** a player uses only the keyboard from the title screen
- **THEN** they can select a hero and unlocked level, start play, pause, and resume

#### Scenario: Active powers are readable
- **WHEN** the hero has growth and star protection together
- **THEN** the HUD shows both effects distinctly alongside the existing signature-skill readiness
