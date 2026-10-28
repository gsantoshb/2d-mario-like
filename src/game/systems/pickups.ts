import Phaser from 'phaser';
import type { Level } from '../data/content';
import type { Player } from './player';
import { audio } from './audio';
export class PickupController {
  private consumed = new Set<string>();
  private sprites: Phaser.GameObjects.Image[];
  constructor(
    private scene: Phaser.Scene,
    private level: Level,
  ) {
    this.sprites = level.pickups.map((p) => scene.add.image(p.x, p.y, p.kind).setDepth(7));
  }
  update(
    now: number,
    player: Player,
    solids: Phaser.Geom.Rectangle[],
    onCollect: (name: string) => void,
  ) {
    this.level.pickups.forEach((p, i) => {
      const sprite = this.sprites[i];
      sprite.setVisible(!this.consumed.has(p.id));
      sprite.setY(p.y + Math.round(Math.sin(now / 400 + i) * 1));
      if (
        this.consumed.has(p.id) ||
        Math.abs(player.sprite.x - p.x) > 15 ||
        Math.abs(player.sprite.y - p.y) > 21
      )
        return;
      const room = p.kind === 'star' || player.canGrow(solids, this.level.width);
      if (player.combat.powers.collect(p.kind, now, room)) {
        player.syncSize();
        this.consumed.add(p.id);
        sprite.setVisible(false);
        audio.play('checkpoint');
        onCollect(
          p.kind === 'growshroom'
            ? 'GROWSHROOM · One extra hit!'
            : 'MASS STAR · Eight seconds of invincibility!',
        );
      }
    });
  }
  reset() {
    this.consumed.clear();
    this.sprites.forEach((s) => s.setVisible(true));
  }
}
