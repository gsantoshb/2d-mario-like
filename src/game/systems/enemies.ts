import Phaser from 'phaser';
import type { Level, EnemySpawn } from '../data/content';
import type { Player } from './player';
import type { RunLedger } from './rules';

interface Enemy {
  sprite: Phaser.Physics.Arcade.Sprite;
  spawn: EnemySpawn;
  id: string;
  direction: number;
  nextShot: number;
}
export class EnemyDirector {
  readonly group: Phaser.Physics.Arcade.Group;
  readonly projectiles: Phaser.Physics.Arcade.Group;
  private enemies: Enemy[] = [];
  constructor(
    private scene: Phaser.Scene,
    private level: Level,
  ) {
    this.group = scene.physics.add.group();
    this.projectiles = scene.physics.add.group({ allowGravity: false });
    this.reset();
  }
  reset() {
    this.group.clear(true, true);
    this.projectiles.clear(true, true);
    this.enemies = this.level.enemies.map((spawn, i) => {
      const sprite = this.group.create(spawn.x, spawn.y, 'patrol') as Phaser.Physics.Arcade.Sprite;
      sprite.setTexture(spawn.kind).setSize(18, 26).setOffset(7, 5).setDepth(8);
      return { sprite, spawn, id: `enemy-${i}`, direction: -1, nextShot: 0 };
    });
  }
  update(now: number, player: Player, ledger: RunLedger, damage: () => void) {
    const p = player.sprite;
    for (const e of this.enemies) {
      const s = e.sprite;
      if (!s.active) continue;
      const body = s.body as Phaser.Physics.Arcade.Body;
      if (s.x < e.spawn.min || body.blocked.left) e.direction = 1;
      if (s.x > e.spawn.max || body.blocked.right) e.direction = -1;
      s.setVelocityX(e.spawn.kind === 'patrol' ? e.direction * 28 : 0).setFlipX(e.direction < 0);
      if (s.y > 240) {
        s.disableBody(true, true);
        continue;
      }
      const close = Math.abs(s.x - p.x) < 210;
      if (e.spawn.kind === 'ranged' && close && now > e.nextShot) {
        e.nextShot = now + 2200;
        const shot = this.projectiles.create(
          s.x,
          s.y - 2,
          'ranged',
        ) as Phaser.Physics.Arcade.Sprite;
        shot
          .setDisplaySize(5, 4)
          .setTint(0xf6c06a)
          .setVelocityX((p.x < s.x ? -1 : 1) * 76)
          .setDepth(9);
      }
      if (
        (player.attackHits(s, now) && player.combat.hit(e.id)) ||
        (player.combat.powers.starActive(now) && this.scene.physics.overlap(p, s))
      ) {
        ledger.defeat(e.id);
        const flying = this.scene.add.sprite(s.x, s.y, s.texture.key).setDepth(9);
        this.scene.tweens.add({
          targets: flying,
          x: s.x + player.facing * 28,
          y: s.y - 16,
          alpha: 0,
          angle: player.facing * 25,
          duration: 250,
          onComplete: () => flying.destroy(),
        });
        s.disableBody(true, true);
        this.burst(s.x, s.y);
        continue;
      }
      if (this.scene.physics.overlap(p, s)) {
        const stomp = player.body.velocity.y > 30 && player.body.bottom < body.top + 12;
        if (stomp) {
          ledger.defeat(e.id);
          s.disableBody(true, true);
          p.setVelocityY(-210);
          this.burst(s.x, s.y);
        } else damage();
      }
    }
    for (const child of this.projectiles.getChildren()) {
      const shot = child as Phaser.Physics.Arcade.Sprite;
      if (Math.abs(shot.x - p.x) > 320 || shot.y > 225) {
        shot.destroy();
        continue;
      }
      if (this.scene.physics.overlap(p, shot)) {
        damage();
        shot.destroy();
      }
    }
  }
  private burst(x: number, y: number) {
    const spark = this.scene.add
      .text(x, y, '✦', { fontSize: '16px', color: '#ffe3a4' })
      .setDepth(20)
      .setOrigin(0.5);
    this.scene.tweens.add({
      targets: spark,
      y: y - 14,
      alpha: 0,
      duration: 280,
      onComplete: () => spark.destroy(),
    });
  }
}
