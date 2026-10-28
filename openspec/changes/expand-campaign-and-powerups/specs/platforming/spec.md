## MODIFIED Requirements

### Requirement: Health and checkpoint recovery
The hero SHALL start with three health points. Damage protection SHALL reject harmful contact first; otherwise a grown hero SHALL shrink without losing health, while a normal hero SHALL lose one point. Both accepted hits SHALL grant brief visible damage protection. At zero health or after falling into a pit, the hero SHALL respawn at the latest checkpoint, or the level start if none, at normal size with full health and no limited retry counter.

#### Scenario: Repeated enemy contact
- **WHEN** the hero touches an enemy again during damage protection
- **THEN** no additional health or growth protection is lost during that protection interval

#### Scenario: Falling after a checkpoint
- **WHEN** the hero falls into a pit after activating a checkpoint
- **THEN** the hero respawns at that checkpoint with three health points and the same selected hero at normal size

#### Scenario: Growth absorbs damage
- **WHEN** a grown hero without current damage protection takes a harmful hit
- **THEN** the hero shrinks with feet anchored, retains current health, and receives the normal brief damage-protection interval

#### Scenario: Star preserves growth
- **WHEN** a grown hero with active star protection contacts an enemy projectile
- **THEN** both growth protection and health remain intact
