import Phaser from 'phaser';
import type { Level } from '../data/content';

export interface MovingPlatform {
  sprite: Phaser.Physics.Arcade.Sprite;
  origin: number;
  travel: number;
  phase: number;
}
export function loadArt(scene: Phaser.Scene) {
  for (const name of ['balayya', 'balayya-alt', 'chiru', 'chiru-alt', 'pk', 'pk-alt', 'boss'])
    scene.load.spritesheet(name, `assets/${name}.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });
  for (const name of ['village', 'city', 'forest', 'studio', 'fort']) {
    scene.load.image(name, `assets/${name}.png`);
    scene.load.image(`tile-${name}`, `assets/tile-${name}.png`);
    scene.load.image(`platform-${name}`, `assets/platform-${name}.png`);
  }
  for (const name of ['patrol', 'ranged', 'growshroom', 'star'])
    scene.load.image(name, `assets/${name}.png`);
}
export function makeAnimations(scene: Phaser.Scene) {
  const definitions: Record<string, [number, number, number]> = {
    idle: [0, 1, 3],
    run: [2, 5, 9],
    jump: [6, 6, 1],
    fall: [7, 7, 1],
    skill: [8, 9, 12],
    hurt: [10, 10, 1],
    defeat: [11, 11, 1],
    victory: [12, 13, 5],
  };
  for (const texture of ['balayya', 'balayya-alt', 'chiru', 'chiru-alt', 'pk', 'pk-alt', 'boss'])
    for (const [state, [start, end, rate]] of Object.entries(definitions)) {
      if (!scene.anims.exists(`${texture}-${state}`))
        scene.anims.create({
          key: `${texture}-${state}`,
          frames: scene.anims.generateFrameNumbers(texture, { start, end }),
          frameRate: rate,
          repeat: -1,
        });
    }
}
export function buildWorld(scene: Phaser.Scene, level: Level) {
  const terrain = scene.physics.add.staticGroup();
  const moving: MovingPlatform[] = [];
  scene.add
    .tileSprite(0, 0, level.width * 2, 216, level.theme)
    .setOrigin(0)
    .setScrollFactor(0.25)
    .setDepth(-10);
  scene.add.rectangle(0, 0, 384, 216, 0x08121e, 0.28).setOrigin(0).setScrollFactor(0).setDepth(-9);
  for (const [x, width] of level.ground) {
    const tile = scene.add
      .tileSprite(x, 192, width, 64, `tile-${level.theme}`)
      .setOrigin(0)
      .setDepth(1);
    scene.physics.add.existing(tile, true);
    terrain.add(tile);
  }
  level.platforms.forEach((p, index) => {
    if (p.moving) {
      const s = scene.physics.add
        .sprite(p.x + p.w / 2, p.y + 4, `platform-${level.theme}`)
        .setDisplaySize(p.w, 8)
        .setDepth(2);
      s.setImmovable(true);
      s.body!.setAllowGravity(false);
      s.setFrictionX(1);
      moving.push({
        sprite: s,
        origin: p.x + p.w / 2,
        travel: p.travel ?? 24,
        phase: index,
      });
    } else {
      const tile = scene.add
        .tileSprite(
          p.x,
          p.y,
          p.w,
          p.h ?? 8,
          `${(p.h ?? 8) > 8 ? 'tile' : 'platform'}-${level.theme}`,
        )
        .setOrigin(0)
        .setDepth(2);
      scene.physics.add.existing(tile, true);
      terrain.add(tile);
    }
  });
  // Small foreground tufts, lights, festival flags and set dressing.
  const deco = scene.add.graphics().setDepth(3);
  for (const [x, w] of level.ground)
    for (let xx = x + 12; xx < x + w; xx += 48) {
      if (level.theme === 'village') {
        deco
          .fillStyle(0xb4af6f)
          .fillRect(xx, 195, 2, 4)
          .fillRect(xx + 3, 195, 2, 6);
      } else {
        deco.fillStyle(level.theme === 'city' ? 0x8c9fa6 : 0xa57b8b).fillRect(xx, 194, 16, 2);
      }
    }
  for (const [i, x] of level.checkpoints.entries()) {
    deco.fillStyle(0xd6b885).fillRect(x, 158, 2, 34);
    deco.fillStyle(0x77b79d).fillRect(x + 2, 158, 12, 8);
    scene.add
      .text(x - 4, 149, `0${i + 1}`, {
        fontFamily: 'monospace',
        fontSize: '6px',
        color: '#ffe1ac',
      })
      .setDepth(3);
  }
  deco
    .fillStyle(0xefc86c)
    .fillRect(level.exit, 136, 3, 56)
    .fillRect(level.exit + 3, 136, 23, 14);
  scene.add
    .text(level.exit + 5, 139, 'GO!', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#372d37',
    })
    .setDepth(4);
  return { terrain, moving };
}
