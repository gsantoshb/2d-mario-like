import Phaser from 'phaser';
import { HEROES, getLevel, TUNING } from '../data/content';
import { Bridge, type RunConfig, type Hud } from '../events';
import { Player } from '../systems/player';
import { buildWorld, loadArt, makeAnimations, type MovingPlatform } from '../systems/world';
import { EnemyDirector } from '../systems/enemies';
import { Boss } from '../systems/boss';
import { RunLedger } from '../systems/rules';
import { PickupController } from '../systems/pickups';
import palette from '../data/palette.json';
import { audio } from '../systems/audio';

export class PlayScene extends Phaser.Scene {
  player!: Player;
  enemies!: EnemyDirector;
  boss?: Boss;
  readonly ledger = new RunLedger();
  now = 0;
  paused = false;
  completed = false;
  private pickups!: PickupController;
  private world!: ReturnType<typeof buildWorld>;
  private checkpoint = 64;
  private dyingUntil = 0;
  private escapeStart: number | null = null;
  private message = '';
  private messageUntil = 0;
  private lastHud = -1000;
  private coinGraphics!: Phaser.GameObjects.Graphics;
  private effects!: Phaser.GameObjects.Graphics;
  private checkpointIndex = -1;
  private offResume?: () => void;
  private offPause?: () => void;
  private level;

  constructor(
    readonly config: RunConfig,
    private bridge: Bridge,
  ) {
    super('play');
    this.level = getLevel(config.level);
  }
  preload() {
    loadArt(this);
  }
  create() {
    makeAnimations(this);
    this.physics.world.setBounds(0, -128, this.level.width, 512);
    this.world = buildWorld(this, this.level);
    this.player = new Player(this, this.config.hero, this.config.skin);
    this.pickups = new PickupController(this, this.level);
    this.player.sprite.setCollideWorldBounds(true);
    this.physics.add.collider(this.player.sprite, this.world.terrain);
    this.world.moving.forEach((p) => this.physics.add.collider(this.player.sprite, p.sprite));
    this.enemies = new EnemyDirector(this, this.level);
    this.physics.add.collider(this.enemies.group, this.world.terrain);
    this.physics.add.collider(this.enemies.projectiles, this.world.terrain, (shot) =>
      shot.destroy(),
    );
    if (this.level.boss) {
      this.boss = new Boss(this, this.level.boss);
      this.physics.add.collider(this.boss.sprite, this.world.terrain);
    }
    this.coinGraphics = this.add.graphics().setDepth(5);
    this.effects = this.add.graphics().setDepth(11);
    this.cameras.main
      .setBounds(0, 0, this.level.width, 216)
      .startFollow(this.player.sprite, true, 0.14, 0)
      .setRoundPixels(true);
    this.input.keyboard!.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.player.keys.pause.on('down', (_key: Phaser.Input.Keyboard.Key, event: KeyboardEvent) => {
      if (event.repeat) return;
      if (this.paused) this.resumeRun();
      else this.pauseRun();
    });
    const blur = () => this.pauseRun();
    const hidden = () => {
      if (document.hidden) this.pauseRun();
    };
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', hidden);
    this.offResume = this.bridge.on('resume', () => this.resumeRun());
    this.offPause = this.bridge.on('pause', () => this.pauseRun());
    this.events.once('shutdown', () => {
      window.removeEventListener('blur', blur);
      document.removeEventListener('visibilitychange', hidden);
      this.offResume?.();
      this.offPause?.();
      this.input.keyboard?.removeCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    });
    const hero = HEROES.find((h) => h.id === this.config.hero)!;
    this.say(`SPACE to jump · X for ${hero.skill}`, 4200);
    this.publish();
  }

  update(_time: number, delta: number) {
    if (this.paused || this.completed || !this.player) return;
    this.now += Math.min(delta, 40);
    if (this.dyingUntil && this.now >= this.dyingUntil) this.respawn();
    this.world.moving.forEach((p) => this.movePlatform(p));
    const solids = this.world.terrain.getChildren().map((o) => {
      const b = (o as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.StaticBody;
      return new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height);
    });
    this.world.moving.forEach((p) => {
      const b = p.sprite.body as Phaser.Physics.Arcade.Body;
      solids.push(new Phaser.Geom.Rectangle(b.x, b.y, b.width, b.height));
    });
    this.player.update(this.now, solids, !!this.dyingUntil);
    if (!this.dyingUntil) {
      this.pickups.update(this.now, this.player, solids, (text) => this.say(text, 2500));
      this.enemies.update(this.now, this.player, this.ledger, () => this.damage());
      this.boss?.update(this.now, this.player, () => this.damage());
      if (this.boss?.health === 0) {
        this.ledger.defeat('boss');
        this.finish();
        return;
      }
      this.collectAndCheckpoints();
      if (this.player.sprite.y > 246) this.die('Back to the checkpoint. You’ve got this.');
      this.updateEscape();
      if (this.player.sprite.x >= this.level.exit && !this.boss) this.finish();
    }
    this.drawCoins();
    this.drawEffects();
    if (this.now - this.lastHud > 90) {
      this.publish();
      this.lastHud = this.now;
    }
  }

  private movePlatform(p: MovingPlatform) {
    // Velocity-based platforms let Arcade Physics carry a standing body.
    p.sprite.setVelocityX((Math.cos(this.now / 900 + p.phase) * p.travel) / 0.9);
    const target = p.origin + Math.sin(this.now / 900 + p.phase) * p.travel;
    if (Math.abs(p.sprite.x - target) > 4) p.sprite.setX(target);
  }
  private collectAndCheckpoints() {
    const p = this.player.sprite;
    this.level.coins.forEach(([x, y], i) => {
      if (Math.abs(p.x - x) < 16 && Math.abs(p.y - y) < 23 && this.ledger.collect(`coin-${i}`))
        audio.play('coin');
    });
    this.level.checkpoints.forEach((x, i) => {
      if (p.x >= x && i > this.checkpointIndex) {
        this.checkpoint = x;
        this.checkpointIndex = i;
        audio.play('checkpoint');
        this.say('CHECKPOINT · A little closer to legendary.', 2100);
      }
    });
  }
  private updateEscape() {
    const escape = this.level.escape;
    if (!escape) return;
    if (this.player.sprite.x >= escape.start && this.escapeStart === null) {
      this.escapeStart = this.now;
      this.say('ROOFTOP ESCAPE! Reach the flag before time runs out.', 2300);
    }
    if (this.escapeStart !== null && this.now - this.escapeStart > escape.seconds * 1000)
      this.die('Time’s up! Escape timer reset. Try again.');
  }
  private damage() {
    if (this.dyingUntil) return;
    if (this.player.combat.damage(this.now, this.player.isDashing(this.now))) {
      this.player.syncSize();
      audio.play('hurt');
      this.cameras.main.shake(70, 0.003);
      this.player.sprite.setVelocityY(-130);
      if (this.player.combat.health <= 0) this.die('A hero always gets back up.');
    }
  }
  private die(message: string) {
    if (this.dyingUntil) return;
    this.player.combat.powers.reset();
    this.player.syncSize();
    this.player.combat.health = 0;
    this.player.combat.activeUntil = 0;
    this.dyingUntil = this.now + 450;
    this.say(message, 2300);
    this.player.sprite.setVelocity(0, 0);
    this.publish();
  }
  private respawn() {
    this.dyingUntil = 0;
    this.escapeStart = null;
    this.player.respawn(this.checkpoint, this.now);
    this.pickups.reset();
    this.enemies.reset();
    this.boss?.reset();
    this.cameras.main
      .stopFollow()
      .setScroll(Math.max(0, this.checkpoint - 100), 0)
      .startFollow(this.player.sprite, true, 0.14, 0);
  }
  private drawCoins() {
    const g = this.coinGraphics;
    g.clear();
    this.level.coins.forEach(([x, y], i) => {
      if (this.ledger.coins.has(`coin-${i}`)) return;
      const bob = Math.round(Math.sin(this.now / 240 + i) * 2);
      const color = (hex: string) => parseInt(hex.slice(1), 16);
      g.fillStyle(color(palette.outline)).fillRect(x - 4, y - 6 + bob, 9, 12);
      g.fillStyle(color(palette.coin)).fillRect(x - 3, y - 5 + bob, 7, 10);
      g.fillStyle(color(palette.coinMark)).fillRect(x, y - 3 + bob, 1, 6);
      g.fillStyle(color(palette.shine)).fillRect(x - 2, y - 4 + bob, 2, 1);
      if (Math.floor(this.now / 350 + i) % 4 === 0)
        g.fillStyle(color(palette.shine))
          .fillRect(x + 6, y - 6 + bob, 3, 1)
          .fillRect(x + 7, y - 7 + bob, 1, 3);
    });
  }
  private drawEffects() {
    const g = this.effects;
    g.clear();
    if (!this.player.isActive(this.now) || this.dyingUntil) return;
    const { x, y } = this.player.sprite;
    const t = (this.now % 240) / 240;
    if (this.config.hero === 'balayya') {
      g.lineStyle(3, 0xffdc85, 0.9);
      g.strokeCircle(x + this.player.facing * (18 + t * 28), y, 12 + t * 12);
      g.lineStyle(1, 0xfff0c0, 0.8);
      g.strokeCircle(x + this.player.facing * (18 + t * 28), y, 7 + t * 10);
    } else if (this.config.hero === 'chiru') {
      g.lineStyle(3, 0x98efd5, 0.9);
      g.strokeEllipse(x, y + 4, 68, 20);
      g.lineStyle(1, 0xe3fff1, 1);
      g.strokeEllipse(x, y - 1, 58, 13);
    } else {
      for (let i = 1; i < 5; i++)
        g.fillStyle(0xffc49e, (5 - i) / 7).fillRect(
          x - this.player.facing * i * 10 - 7,
          y - 11,
          10,
          20,
        );
    }
  }
  private finish() {
    if (this.completed) return;
    this.completed = true;
    this.physics.pause();
    this.world.moving.forEach((p) => p.sprite.anims.pause());
    this.player.sprite.setAlpha(1).anims.play(`${this.config.skin}-victory`);
    audio.play('win');
    this.say('THAT’S A MASS FINISH!', 2000);
    this.time.delayedCall(900, () =>
      this.bridge.emit('complete', {
        runId: this.config.runId,
        hero: this.config.hero,
        level: this.config.level,
        coins: this.ledger.coins.size,
        score: this.ledger.score + 500,
        seconds: Math.round(this.now / 1000),
      }),
    );
  }
  private say(text: string, duration: number) {
    this.message = text;
    this.messageUntil = this.now + duration;
  }
  private publish() {
    const hud: Hud = {
      health: this.player.combat.health,
      grown: this.player.combat.powers.grown,
      starSeconds: Math.max(0, Math.ceil((this.player.combat.powers.starUntil - this.now) / 1000)),
      coins: this.ledger.coins.size,
      score: this.ledger.score,
      ready: Phaser.Math.Clamp(1 - (this.player.combat.readyAt - this.now) / TUNING.cooldown, 0, 1),
      seconds: Math.floor(this.now / 1000),
      checkpoint: this.checkpointIndex >= 0,
      message: this.now < this.messageUntil ? this.message : '',
      bossHealth: this.boss?.active ? this.boss.health : null,
      bossPhase: this.boss?.phase ?? '',
      escape:
        this.escapeStart !== null
          ? Math.max(
              0,
              Math.ceil(this.level.escape!.seconds - (this.now - this.escapeStart) / 1000),
            )
          : null,
      progress: this.player.sprite.x / this.level.width,
    };
    this.bridge.emit('hud', hud);
  }
  pauseRun() {
    if (this.paused || this.completed || !this.player) return;
    this.paused = true;
    this.physics.pause();
    this.tweens.pauseAll();
    this.anims.pauseAll();
    this.player.clearInput();
    this.input.keyboard!.removeCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.bridge.emit('paused', true);
  }
  resumeRun() {
    if (!this.paused || this.completed) return;
    this.player.clearInput();
    this.paused = false;
    this.physics.resume();
    this.tweens.resumeAll();
    this.anims.resumeAll();
    this.input.keyboard!.addCapture(['SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT']);
    this.bridge.emit('paused', false);
  }
}
