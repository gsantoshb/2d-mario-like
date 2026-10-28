## Purpose

Define responsive platform movement and predictable recovery so players can learn and complete short action-platforming levels.

## ADDED Requirements

### Requirement: Keyboard movement and jumping
The game SHALL support A/D or Left/Right to move, Space to jump, X to use the selected hero's skill, and Escape to pause. Movement SHALL include jump buffering and a short ledge grace period. Required controls SHALL be visible before play.

#### Scenario: Buffered jump
- **WHEN** the player presses jump within the configured buffer interval before landing
- **THEN** the hero jumps upon landing without another keypress

#### Scenario: Ledge grace
- **WHEN** the player presses jump within the configured grace interval after leaving a ledge
- **THEN** the hero can still jump once

### Requirement: Solid terrain and stomp combat
The hero SHALL collide with solid terrain without passing through it. Landing on a regular enemy from above while descending SHALL defeat that enemy and bounce the hero; side contact SHALL cause damage unless a skill or damage protection applies.

#### Scenario: Descending stomp
- **WHEN** a descending hero lands on the top of a regular enemy
- **THEN** that enemy is defeated once and the hero bounces without contact damage

#### Scenario: Blocked movement
- **WHEN** a hero runs or dashes into a solid wall
- **THEN** the hero remains on the accessible side of the wall

### Requirement: Health and checkpoint recovery
The hero SHALL start with three health points. Harmful contact SHALL remove one point and grant brief visible damage protection. At zero health or after falling into a pit, the hero SHALL respawn at the latest checkpoint, or the level start if none, with full health and no limited retry counter.

#### Scenario: Repeated enemy contact
- **WHEN** the hero touches an enemy again during damage protection
- **THEN** no additional health is lost during that protection interval

#### Scenario: Falling after a checkpoint
- **WHEN** the hero falls into a pit after activating a checkpoint
- **THEN** the hero respawns at that checkpoint with three health points and the same selected hero

### Requirement: Pause and focus recovery
The game SHALL pause simulation, cooldowns, and level timers on Escape or browser focus loss. Resume SHALL require an explicit action, clear held inputs, and restore the previous gameplay state without elapsed background time advancing it.

#### Scenario: Returning to the browser
- **WHEN** the player returns after switching away from the game
- **THEN** a pause screen remains visible until Resume is activated
- **AND** movement, enemies, and skill cooldowns have not advanced while paused
