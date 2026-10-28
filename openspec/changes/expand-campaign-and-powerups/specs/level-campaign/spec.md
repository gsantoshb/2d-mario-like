## RENAMED Requirements

- FROM: `### Requirement: Sequential three-level campaign`
- TO: `### Requirement: Sequential campaign`

## MODIFIED Requirements

### Requirement: Sequential campaign
For new profiles the campaign SHALL progress through Festival Run, Rooftop Chase, Papikondalu Trail, Studio Showdown, and Fortress Finale in that order. Only Festival Run SHALL initially be unlocked. Completion SHALL unlock the next act for every hero, and unlocked acts SHALL remain replayable. Existing profiles SHALL retain their prior level access through migration. Prakash Raj SHALL remain the final-act boss.

#### Scenario: First level completion
- **WHEN** the player completes Festival Run
- **THEN** Rooftop Chase becomes selectable with any hero and Festival Run remains selectable

#### Scenario: Locked level selection
- **WHEN** the player views a level that has not been unlocked
- **THEN** its locked state is visible and a run cannot be started there

#### Scenario: New middle acts
- **WHEN** a new-profile player completes Rooftop Chase and then Papikondalu Trail
- **THEN** Papikondalu Trail unlocks first and Studio Showdown unlocks after it
- **AND** Fortress Finale unlocks after completing Studio Showdown

### Requirement: Distinct level challenges
Festival Run SHALL teach movement, stomping, the selected skill, and pickups. Rooftop Chase SHALL add moving platforms and a retryable timed escape. Papikondalu Trail SHALL use river gaps and stepping platforms. Studio Showdown SHALL use film-set obstacles and moving rig platforms. Fortress Finale SHALL combine learned mechanics and end in a boss arena. The campaign SHALL include patrolling and ranged regular enemies with readable behavior.

#### Scenario: Escape retry
- **WHEN** the escape countdown expires before the player reaches safety
- **THEN** the player returns to the escape checkpoint with the countdown reset and a clear retry cue

#### Scenario: Distinct new acts
- **WHEN** the player enters Papikondalu Trail and Studio Showdown
- **THEN** each has its own authored layout, scenery, checkpoint placement, coin routes, and pickup placements
- **AND** every required route can be completed by each hero at normal size without star protection
