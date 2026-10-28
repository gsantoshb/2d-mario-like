import Phaser from 'phaser';
import type { Player } from './player';

export class Boss {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly shots: Phaser.Physics.Arcade.Group;
  health = 6;
  active = false;
  phase = 'WAITING';
  private cycleStart = 0;
  private shot = false;
  private lastHit = -1000;
  constructor(
    private scene: Phaser.Scene,
    readonly x: number,
  ) {
    this.sprite = scene.physics.add
      .sprite(x, 172, 'boss')
      .setScale(1.25)
      .setDepth(9)
      .setImmovable(true);
    this.sprite.setSize(20, 28).setOffset(6, 3);
    // The arena boss is anchored. Two immovable bodies do not separate in Arcade Physics.
    (this.sprite.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.sprite.setFlipX(true);
    this.shots = scene.physics.add.group({ allowGravity: false });
  }
  reset() {
    this.health = 6;
    this.active = false;
    this.phase = 'WAITING';
    this.shot = false;
    this.lastHit = -1000;
    this.shots.clear(true, true);
    this.sprite.setPosition(this.x, 172).setVelocity(0, 0).clearTint();
  }
  update(now: number, player: Player, damage: () => void) {
    if (this.health <= 0) return;
    if (!this.active && player.sprite.x > this.x - 210) {
      this.active = true;
      this.cycleStart = now;
    }
    if (!this.active) return;
    const second = this.health <= 3;
    const windup = second ? 800 : 1000;
    const attack = 450;
    const recovery = 1400;
    let elapsed = now - this.cycleStart;
    if (elapsed > windup + attack + recovery) {
      this.cycleStart = now;
      this.shot = false;
      elapsed = 0;
    }
    this.phase = elapsed < windup ? 'WINDUP' : elapsed < windup + attack ? 'ATTACK' : 'VULNERABLE';
    this.sprite.anims.play(
      `boss-${this.phase === 'VULNERABLE' ? 'hurt' : this.phase === 'ATTACK' ? 'skill' : 'idle'}`,
      true,
    );
    this.sprite.setTint(
      this.phase === 'VULNERABLE' ? 0x7ef5bb : this.phase === 'WINDUP' ? 0xffb38d : 0xffffff,
    );
    this.sprite.setFlipX(player.sprite.x < this.sprite.x);
    if (this.phase === 'ATTACK' && !this.shot) {
      this.shot = true;
      for (let i = 0; i < (second ? 2 : 1); i++) {
        const s = this.shots.create(
          this.sprite.x,
          174 - i * 20,
          'ranged',
        ) as Phaser.Physics.Arcade.Sprite;
        s.setDisplaySize(8, 5)
          .setTint(0xef886c)
          .setDepth(12)
          .setVelocityX((player.sprite.x < this.x ? -1 : 1) * (second ? 115 : 90));
      }
    }
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const overlap = this.scene.physics.overlap(player.sprite, this.sprite);
    const stomp = overlap && player.body.velocity.y > 25 && player.body.bottom < body.top + 15;
    const skill = player.attackHits(this.sprite, now);
    if (
      this.phase === 'VULNERABLE' &&
      now - this.lastHit > 850 &&
      (stomp || (skill && player.combat.hit(`boss-${this.health}`)))
    ) {
      this.health--;
      this.lastHit = now;
      this.scene.cameras.main.shake(80, 0.003);
      if (stomp) player.sprite.setVelocityY(-230);
      if (this.health === 0) {
        this.shots.clear(true, true);
        this.sprite.anims.play('boss-defeat');
        this.sprite.setTint(0x9990a3);
        return;
      }
    } else if (stomp) player.sprite.setVelocityY(-210);
    else if (overlap && !skill) damage();
    for (const child of this.shots.getChildren()) {
      const shot = child as Phaser.Physics.Arcade.Sprite;
      if (Math.abs(shot.x - this.x) > 400) {
        shot.destroy();
        continue;
      }
      if (this.scene.physics.overlap(player.sprite, shot)) {
        damage();
        shot.destroy();
      }
    }
  }
}
