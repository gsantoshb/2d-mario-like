## Purpose

Give players three recognizable heroes whose distinct skills change combat style without restricting campaign access.

## ADDED Requirements

### Requirement: Three immediately selectable heroes
The character screen SHALL offer Balayya, Chiru, and PK from the first session, showing each name and skill description. Players SHALL be able to change heroes between level runs but not during active gameplay. Base movement, jump height, health, and collision dimensions SHALL be equal across heroes.

#### Scenario: First character selection
- **WHEN** a player opens character selection with a new save
- **THEN** all three heroes are selectable without currency or progression requirements

### Requirement: Distinct signature skills
Balayya SHALL use Simha Roar to damage and knock back regular enemies in a short forward area. Chiru SHALL use Mega Spin to damage regular enemies on either side during a brief spin. PK SHALL use Power Dash to burst in the facing direction, damage enemies on the path, and resist contact damage during the active dash. Each activation SHALL damage each target at most once.

#### Scenario: Balayya uses Simha Roar
- **WHEN** Balayya activates a ready skill facing a regular enemy within range
- **THEN** a visible shockwave damages and knocks back that enemy

#### Scenario: Chiru uses Mega Spin
- **WHEN** Chiru activates a ready skill with regular enemies on both sides within range
- **THEN** both enemies are hit at most once by the spin

#### Scenario: PK dashes into combat
- **WHEN** PK activates a ready skill toward a regular enemy before a wall
- **THEN** PK damages the enemy, takes no contact damage during the active dash, and stops before the wall

### Requirement: Skill readiness feedback
Skills SHALL have a visible cooldown indicator. Activations while cooling down SHALL have no gameplay effect and SHALL not reset the timer. Respawning SHALL cancel active skill effects and restore readiness.

#### Scenario: Repeated activation
- **WHEN** a player presses the skill key during cooldown
- **THEN** no extra attack is created and the current cooldown continues

### Requirement: Hero-independent completion
Every required route, enemy encounter, and boss phase SHALL be completable with any selected hero. Any skill-specific shortcut SHALL lead to optional rewards and SHALL not be required for progression.

#### Scenario: Full roster completion
- **WHEN** the campaign is played separately as Balayya, Chiru, and PK
- **THEN** each hero can reach all three exits and defeat the final boss without changing heroes
