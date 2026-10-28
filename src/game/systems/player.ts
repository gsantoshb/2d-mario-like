import Phaser from 'phaser';
import { TUNING, type HeroId } from '../data/content';
import { canExpand } from './powers';
import { CombatState } from './rules';
import { audio } from './audio';

type Keys = Record<
  'left' | 'right' | 'a' | 'd' | 'jump' | 'skill' | 'pause',
  Phaser.Input.Keyboard.Key
>;
export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly combat = new CombatState();
  readonly keys: Keys;
  facing = 1;
  private lastGround = -1000;
  private lastJump = -1000;
  private jumpReleased = true;
  private skillReleased = true;

  constructor(
    private scene: Phaser.Scene,
    readonly hero: HeroId,
    texture: string,
  ) {
    this.sprite = scene.physics.add.sprite(64, 176, texture).setDepth(10);
    this.sprite.setSize(14, 26).setOffset(9, 5).setMaxVelocity(260, 420);
    this.keys = scene.input.keyboard!.addKeys({
      left: 'LEFT',
      right: 'RIGHT',
      a: 'A',
      d: 'D',
      jump: 'SPACE',
      skill: 'X',
      pause: 'ESC',
    }) as Keys;
  }

  get body() {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }
  isActive(now: number) {
    return now < this.combat.activeUntil;
  }
  isDashing(now: number) {
    return this.hero === 'pk' && this.isActive(now);
  }

  update(now: number, solids: Phaser.Geom.Rectangle[], dead = false) {
    if (dead) {
      this.sprite.setVelocityX(0);
      this.sprite.anims.play(`${this.sprite.texture.key}-defeat`, true);
      return;
    }
    const grounded = this.body.blocked.down || this.body.touching.down;
    if (grounded) this.lastGround = now;
    if (!this.keys.jump.isDown) this.jumpReleased = true;
    if (!this.keys.skill.isDown) this.skillReleased = true;
    if (this.keys.jump.isDown && this.jumpReleased) {
      this.lastJump = now;
      this.jumpReleased = false;
    }
    const moving =
      Number(this.keys.right.isDown || this.keys.d.isDown) -
      Number(this.keys.left.isDown || this.keys.a.isDown);
    if (moving && !this.isDashing(now)) this.facing = moving;
    this.sprite.setFlipX(this.facing < 0);
    if (
      this.lastJump >= 0 &&
      now - this.lastJump <= TUNING.buffer &&
      now - this.lastGround <= TUNING.coyote
    ) {
      this.sprite.setVelocityY(-TUNING.jump);
      this.lastJump = -1000;
      this.lastGround = -1000;
      audio.play('jump');
    }
    if (this.keys.skill.isDown && this.skillReleased) {
      this.skillReleased = false;
      if (
        this.combat.activate(now, this.hero === 'pk' ? TUNING.dashDuration : TUNING.skillDuration)
      )
        audio.play('skill');
    }
    let speed = this.isDashing(now) ? this.facing * TUNING.dashSpeed : moving * TUNING.speed;
    // Bound each dash step by the nearest solid edge; physics still resolves contact.
    if (this.isDashing(now))
      for (const rect of solids) {
        if (this.body.bottom <= rect.top + 1 || this.body.top >= rect.bottom - 1) continue;
        const distance =
          this.facing > 0 ? rect.left - this.body.right : this.body.left - rect.right;
        if (distance >= -0.5 && distance < Math.abs(speed) / 30 + 1)
          speed = this.facing * Math.max(0, distance) * 30;
      }
    this.sprite.setVelocityX(speed);
    if (this.combat.powers.starActive(now))
      this.sprite.setTint(Math.floor(now / 500) % 2 ? 0xffed9a : 0xbdf5dc);
    else this.sprite.clearTint();
    const protectedNow = now < this.combat.protectedUntil;
    this.sprite.setAlpha(protectedNow && Math.floor(now / 80) % 2 === 0 ? 0.4 : 1);
    const state =
      now < this.combat.protectedUntil - 650
        ? 'hurt'
        : this.isActive(now)
          ? 'skill'
          : !grounded
            ? this.body.velocity.y < 0
              ? 'jump'
              : 'fall'
            : moving
              ? 'run'
              : 'idle';
    this.sprite.anims.play(`${this.sprite.texture.key}-${state}`, true);
  }

  attackHits(target: Phaser.GameObjects.Sprite, now: number): boolean {
    if (!this.isActive(now)) return false;
    const dx = target.x - this.sprite.x,
      dy = Math.abs(target.y - this.sprite.y);
    if (dy > 32) return false;
    return this.hero === 'chiru'
      ? Math.abs(dx) < 43
      : this.hero === 'balayya'
        ? dx * this.facing >= -6 && dx * this.facing < 66
        : Math.abs(dx) < 28;
  }

  canGrow(solids: Phaser.Geom.Rectangle[], worldWidth: number) {
    const scale = TUNING.growthScale;
    return canExpand(
      {
        x: this.body.center.x - (14 * scale) / 2,
        y: this.body.bottom - 26 * scale,
        width: 14 * scale,
        height: 26 * scale,
      },
      solids,
      worldWidth,
    );
  }
  syncSize() {
    const scale = this.combat.powers.grown ? TUNING.growthScale : 1;
    if (this.sprite.scaleX === scale) return;
    const bottom = this.body.bottom,
      center = this.body.center.x;
    this.sprite.setScale(scale);
    // Sprite has a half-pixel transparent bottom margin below its collision body.
    this.sprite.setPosition(center, bottom - 15 * scale);
    this.body.updateFromGameObject();
  }
  clearInput() {
    Object.values(this.keys).forEach((key) => key.reset());
    this.lastJump = -1000;
    this.jumpReleased = false;
    this.skillReleased = false;
  }

  respawn(x: number, now: number) {
    this.combat.reset(now);
    this.syncSize();
    this.sprite.setPosition(x, 176).setVelocity(0, 0).setAlpha(1);
    this.body.reset(x, 176);
    this.clearInput();
    this.lastGround = -1000;
  }
}
