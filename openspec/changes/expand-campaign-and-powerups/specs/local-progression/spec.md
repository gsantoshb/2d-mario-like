## ADDED Requirements

### Requirement: Compatible five-act saves
The game SHALL migrate valid original three-act profiles to the five-act campaign without losing banked coins, skins, equipment, mute preference, last hero, prior scores, or prior level access. Scores SHALL remain attached to their original named levels when campaign order changes. Migrated saves SHALL preserve duplicate-completion protection. Failed persistence SHALL retain the usable migrated profile in memory and show the existing save notice.

#### Scenario: Original fortress score
- **WHEN** a valid original profile with a Fortress Finale score loads into the expanded campaign
- **THEN** that score remains the fortress best score and is not assigned to Papikondalu Trail or Studio Showdown
- **AND** new-level best scores initially start at zero

#### Scenario: Partially progressed original profile
- **WHEN** an original profile has Rooftop Chase completed and Fortress Finale unlocked but not completed
- **THEN** Festival Run, Rooftop Chase, Papikondalu Trail, and the previously unlocked Fortress Finale remain selectable
- **AND** Studio Showdown unlocks by completing Papikondalu Trail

#### Scenario: Previously completed campaign
- **WHEN** a valid original profile has completed Fortress Finale
- **THEN** all five acts are selectable, and original best scores, cosmetics, and currency are retained

#### Scenario: Migration write failure
- **WHEN** the original save can be read but the migrated save cannot be persisted
- **THEN** migrated progress remains usable for the session and the original stored save is not deleted

### Requirement: Migration is repeatable and power state is transient
Reloading a migrated profile SHALL not duplicate currency or unlock rewards. Active pickup effects and pickup availability SHALL remain run-local and SHALL not be restored after reload. New profiles SHALL use the expanded campaign's normal sequential progression.

#### Scenario: Reload after migration
- **WHEN** a migrated profile reloads again
- **THEN** currency, scores, ownership, and level access are unchanged and no live power-up state is restored
