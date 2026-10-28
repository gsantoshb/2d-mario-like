# cosmetic-shop Specification

## Purpose
Let players spend earned campaign rewards on visible hero customization without changing difficulty or requiring payments.

## Requirements

### Requirement: Earned cosmetic catalog
The shop SHALL offer a default skin and at least one earned alternate skin for each of Balayya, Chiru, and PK. Each entry SHALL show the hero, appearance preview, coin price, and ownership/equipped state. The shop SHALL identify coins as earned through gameplay and SHALL not solicit real payment.

#### Scenario: New player shop
- **WHEN** a player with a fresh profile opens the shop
- **THEN** each hero's default skin is owned and an alternate skin has a visible earned-coin price

### Requirement: Purchase validation
A purchase SHALL require an unowned catalog skin and sufficient banked coins. A successful purchase SHALL deduct the price once and grant ownership together. Insufficient funds, unknown items, and repeat requests for owned items SHALL not change the wallet.

#### Scenario: Successful purchase
- **WHEN** a player buys an unowned skin they can afford
- **THEN** its exact price is deducted and the skin becomes available to equip

#### Scenario: Repeated purchase input
- **WHEN** the same purchase is requested again after ownership was granted
- **THEN** no additional coins are deducted

#### Scenario: Insufficient coins
- **WHEN** the player cannot afford the selected skin
- **THEN** ownership and balance remain unchanged and the price shortfall is clear

### Requirement: Cosmetic equipment
Only owned skins SHALL be equipable, and equipment SHALL be stored separately for each hero. Skin selection SHALL change appearance without changing movement, health, damage, cooldowns, collision dimensions, or access to content.

#### Scenario: Switching heroes with equipped skins
- **WHEN** the player equips Balayya's alternate skin and then selects Chiru
- **THEN** Chiru uses his own equipped skin and Balayya's selection is retained

#### Scenario: Gameplay parity
- **WHEN** the same hero is played in default and alternate skins
- **THEN** gameplay statistics and collision behavior are identical
