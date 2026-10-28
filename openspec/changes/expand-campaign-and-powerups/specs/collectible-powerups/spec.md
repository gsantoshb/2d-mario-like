## Purpose

Give all heroes optional collectible boosts with readable effects, safe geometry changes, and predictable retry behavior.

## ADDED Requirements

### Requirement: Placed original pickups
Levels SHALL contain recognizable stationary Growshroom and Mass Star pickups with distinct silhouettes. Collection SHALL use contact without a new button and SHALL leave the hero's existing signature skill available. Every required route and boss encounter SHALL remain completable without pickups.

#### Scenario: Collecting a pickup
- **WHEN** any hero touches an available collectible with sufficient space for its effect
- **THEN** the pickup is consumed once and its effect and name appear visually
- **AND** X still activates that hero's normal signature skill

### Requirement: Safe Growshroom transformation
A Growshroom SHALL enlarge the hero and collision body to 1.25 times normal size, anchored at the feet, and grant one hit of extra protection without increasing speed, jump height, damage, or skill range. If growth would overlap solid terrain, the pickup SHALL remain available until there is room. Recollection while grown SHALL not stack protection or consume the pickup.

#### Scenario: Insufficient headroom
- **WHEN** a normal hero touches a Growshroom under a ceiling too low for growth
- **THEN** the hero remains normal and unclipped and the pickup remains available

#### Scenario: Safe growth
- **WHEN** a normal hero collects a Growshroom in clear space
- **THEN** the hero grows with the feet staying in place and the HUD shows growth protection

#### Scenario: Already grown
- **WHEN** a grown hero touches another Growshroom
- **THEN** it remains available and the hero still has only one growth-protection hit

### Requirement: Mass Star protection
A Mass Star SHALL grant eight seconds of enemy/projectile damage protection and defeat regular enemies on contact during that period. Recollection SHALL refresh to eight seconds rather than stack durations. The HUD SHALL display remaining active-play time and a distinct power indicator. Pits and escape deadlines SHALL remain lethal; boss damage SHALL still require a vulnerable window and a normal stomp or signature skill.

#### Scenario: Star contact
- **WHEN** a star-protected hero contacts a regular enemy or projectile
- **THEN** health and growth protection are retained and regular enemy contact defeats that enemy with normal reward deduplication

#### Scenario: Invulnerable boss
- **WHEN** a star-protected hero contacts the boss outside its vulnerable window
- **THEN** the hero takes no contact damage and the boss takes no damage

#### Scenario: Timer refresh and expiry
- **WHEN** a hero with two seconds of star protection collects another Mass Star
- **THEN** the timer resets to eight seconds and protection ends after eight further active-play seconds

### Requirement: Power lifecycle
Star timers SHALL freeze while paused. Death, leaving a run, and starting another level SHALL clear growth and star effects. Checkpoint respawns SHALL restore pickup availability for that level without resetting its coin/enemy reward ledger. Pickups SHALL award no coins or score and SHALL never be written into the persistent profile.

#### Scenario: Pause during protection
- **WHEN** the player pauses with four seconds of star protection remaining
- **THEN** four seconds remain on explicit resume

#### Scenario: Checkpoint retry
- **WHEN** a powered hero falls into a pit and respawns
- **THEN** the hero returns at normal size without star protection, pickups are available again, and previously credited coin/enemy rewards cannot be earned twice
