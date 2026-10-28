## Purpose

Preserve progression, settings, and cosmetics on the player's browser while keeping the game playable when storage fails.

## ADDED Requirements

### Requirement: Persistent local profile
The game SHALL save unlocked levels, per-level best scores, banked coins, owned and equipped skins, last selected hero, and mute preference on the same browser. Best scores SHALL never decrease after replay. An unfinished level SHALL restart as a new run after a page reload, without banking unfinished rewards.

#### Scenario: Reload after completion
- **WHEN** a player reloads after finishing a level and equipping a skin
- **THEN** its unlocks, best score, wallet, and equipped skin are restored

#### Scenario: Reload mid-run
- **WHEN** a player reloads during an unfinished level
- **THEN** no checkpoint run is restored and no coins from that unfinished run are credited

### Requirement: Versioned and validated saves
Saved data SHALL have a version and be validated before use. Missing, malformed, unsupported-version, or structurally invalid data SHALL fall back to a safe default profile. Invalid data SHALL not crash startup or grant negative balances, unknown skins, or locked equipment.

#### Scenario: Invalid stored data
- **WHEN** the stored profile contains malformed JSON or invalid ownership and balance values
- **THEN** the game starts with a safe default profile and explains that local progress could not be restored

### Requirement: Storage failure fallback
If browser storage cannot be read or written, the game SHALL continue with an in-memory profile and display a non-blocking notice that progress may not survive reload. Successful game actions SHALL remain usable in that session.

#### Scenario: Write rejected
- **WHEN** saving a completed level fails because storage is unavailable
- **THEN** its rewards and unlocks remain available in the current session and a persistence notice appears

### Requirement: Local save disclosure
The game SHALL explain that progress is stored on the current browser, can be cleared or edited locally, and does not provide account sync or verified purchase ownership.

#### Scenario: Viewing save information
- **WHEN** a player views settings or the shop's save information
- **THEN** the browser-local save limitation is visible
