# level-campaign Specification

## Purpose
Provide an authored campaign with increasing challenge, understandable boss combat, and replayable results.

## Requirements

### Requirement: Sequential three-level campaign
The campaign SHALL contain Festival Run, Rooftop Chase, and Fortress Finale in that order. Only Festival Run SHALL initially be unlocked. Completing a level SHALL unlock the next level for every hero. Previously unlocked levels SHALL remain replayable.

#### Scenario: First level completion
- **WHEN** the player completes Festival Run
- **THEN** Rooftop Chase becomes selectable with any hero and Festival Run remains selectable

#### Scenario: Locked level selection
- **WHEN** the player views a level that has not been unlocked
- **THEN** its locked state is visible and a run cannot be started there

### Requirement: Distinct level challenges
Festival Run SHALL teach movement, stomping, and the selected skill. Rooftop Chase SHALL add moving platforms and a timed escape segment whose failure returns the player to a checkpoint before that segment. Fortress Finale SHALL combine learned mechanics and end in a boss arena. The campaign SHALL include patrolling and ranged regular enemies with readable behavior.

#### Scenario: Escape retry
- **WHEN** the escape countdown expires before the player reaches safety
- **THEN** the player returns to the escape checkpoint with the countdown reset and a clear retry cue

### Requirement: Prakash Raj boss encounter
Prakash Raj SHALL be the final boss with visible health and two attack phases. Attacks SHALL have visible windups and recovery windows. The boss SHALL take damage only during marked vulnerable windows from a stomp or any hero's signature skill. Hero defeat SHALL reset the encounter and boss health at the arena checkpoint.

#### Scenario: Boss phase transition
- **WHEN** boss health crosses the phase threshold
- **THEN** a visible cue introduces the second phase's faster attack pattern while preserving readable windups

#### Scenario: Boss defeated
- **WHEN** boss health reaches zero
- **THEN** boss attacks stop and the campaign victory result is shown

### Requirement: Results and run rewards
Completing a level SHALL show score, collected coins, and elapsed active time, with actions to replay, select a hero/level, or continue if another level exists. The score SHALL reward coin collection and enemy defeats. Run coins SHALL be credited to the cosmetic wallet once per completed run; abandoning a run SHALL discard its unbanked coins.

#### Scenario: Duplicate finish event
- **WHEN** the same run receives multiple completion events or the result screen is revisited
- **THEN** its completion reward is applied only once

### Requirement: Checkpoint run consistency
Collected coin identities and credited enemy defeats SHALL remain recorded across checkpoint respawns within a run. Respawns SHALL reset regular enemies as obstacles without yielding repeated rewards for credited defeats. Replay SHALL create a new run with fresh rewards.

#### Scenario: Revisiting a coin after death
- **WHEN** the player respawns and revisits a coin already collected during that run
- **THEN** the coin does not grant another reward
