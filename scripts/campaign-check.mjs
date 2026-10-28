/** Keyboard-driven acceptance runs. Scene access is read-only and dev-only. */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const reports = [];
const campaign = [
  'festival-run',
  'rooftop-chase',
  'papikondalu-trail',
  'studio-showdown',
  'fortress-finale',
];
const held = new Set();
async function key(key, down) {
  if (down && !held.has(key)) {
    await page.keyboard.down(key);
    held.add(key);
  }
  if (!down && held.has(key)) {
    await page.keyboard.up(key);
    held.delete(key);
  }
}
async function pulse(k) {
  await page.keyboard.press(k, { delay: process.env.NO_POWER ? 50 : 18 });
}
async function snapshot() {
  return page.evaluate(() => {
    const s = window.__MASS_QUEST__?.scene.getScene('play');
    if (!s?.player) return null;
    const p = s.player,
      b = p.body;
    return {
      x: p.sprite.x,
      y: p.sprite.y,
      vx: b.velocity.x,
      vy: b.velocity.y,
      bottom: b.bottom,
      right: b.right,
      grounded: b.blocked.down || b.touching.down,
      health: p.combat.health,
      facing: p.facing,
      skillActive: p.combat.activeUntil,
      readyAt: p.combat.readyAt,
      ready: s.now >= p.combat.readyAt,
      now: s.now,
      paused: s.paused,
      complete: s.completed,
      checkpoint: s.checkpoint,
      escapeStart: s.escapeStart,
      coins: s.ledger.coins.size,
      grown: p.combat.powers.grown,
      star: p.combat.powers.starActive(s.now),
      pickups: s.level.pickups,
      grounds: s.level.ground,
      platforms: [
        ...s.level.platforms.filter((p) => !p.moving),
        ...s.world.moving.map((p) => ({
          x: p.sprite.body.x,
          y: p.sprite.body.y,
          w: p.sprite.body.width,
        })),
      ],
      enemies: s.enemies.group
        .getChildren()
        .filter((e) => e.active)
        .map((e) => ({ x: e.x, y: e.y })),
      boss: s.boss
        ? {
            x: s.boss.sprite.x,
            y: s.boss.sprite.y,
            health: s.boss.health,
            active: s.boss.active,
            phase: s.boss.phase,
          }
        : null,
    };
  });
}
async function drive(hero, level) {
  const start = Date.now();
  let lastX = 0,
    lastProgress = Date.now(),
    deaths = 0,
    health = 3,
    lastLog = 0,
    jumpAt = 0,
    wallChecked = false,
    retryChecked = false,
    bossStarChecked = false,
    sawGrowth = false,
    sawStar = false;
  while (Date.now() - start < 140000) {
    const s = await snapshot();
    if (!s) break;
    sawGrowth ||= s.grown;
    sawStar ||= s.star;
    if (process.env.NO_POWER && (s.grown || s.star))
      throw new Error(
        `Unexpected pickup in no-power route ${hero}/${level} at x=${s.x}, y=${s.y}, grown=${s.grown}, star=${s.star}`,
      );
    if (s.paused) {
      await page.getByRole('button', { name: 'Resume adventure' }).click();
      continue;
    }
    if (s.complete) {
      await page.getByRole('heading', { name: /mass finish|legendary finish/ }).waitFor();
      break;
    }
    if (s.health === 0 && health > 0) deaths++;
    health = s.health;
    if (s.health === 0) {
      await key('ArrowRight', false);
      await key('ArrowLeft', false);
      await page.waitForTimeout(60);
      continue;
    }
    if (process.env.VERIFY_RETRY && !retryChecked && level === 1 && s.x > 2028) {
      await key('ArrowRight', false);
      await key('ArrowLeft', false);
      await page.waitForFunction(
        () => {
          const s = window.__MASS_QUEST__?.scene.getScene('play');
          return s.now - s.escapeStart > 11000;
        },
        undefined,
        { timeout: 20000 },
      );
      await key('ArrowRight', true);
      await page.waitForFunction(
        () => window.__MASS_QUEST__.scene.getScene('play').player.sprite.x >= 2048,
      );
      await key('ArrowRight', false);
      if (!(await snapshot()).star)
        throw new Error('Expected star protection before escape deadline');
      await page.waitForFunction(
        () => window.__MASS_QUEST__?.scene.getScene('play')?.message.startsWith('Time’s up'),
        {},
        { timeout: 40000 },
      );
      await page.waitForFunction(
        () => {
          const s = window.__MASS_QUEST__?.scene.getScene('play');
          return s?.player.combat.health === 3 && Math.abs(s.player.sprite.x - 2016) < 3;
        },
        {},
        { timeout: 3000 },
      );
      const retried = await snapshot();
      if (retried.coins < s.coins)
        throw new Error(`Escape retry lost collected coins: ${s.coins} -> ${retried.coins}`);
      retryChecked = true;
      lastProgress = Date.now();
      lastX = retried.x;
      console.log('PASS escape countdown retry');
      continue;
    }
    if (
      process.env.VERIFY_RETRY &&
      !retryChecked &&
      level === 4 &&
      s.boss?.active &&
      s.boss.health <= 4
    ) {
      // Walk into contact damage until defeat, then verify the arena resets through normal gameplay.
      for (let attempt = 0; attempt < 160; attempt++) {
        const fight = await snapshot();
        if (fight.health === 0) break;
        await key('ArrowRight', fight.x < fight.boss.x);
        await key('ArrowLeft', fight.x >= fight.boss.x);
        await page.waitForTimeout(45);
      }
      await key('ArrowRight', false);
      await key('ArrowLeft', false);
      await page.waitForTimeout(600);
      const retried = await snapshot();
      if (retried.health !== 3 || retried.boss.health !== 6 || Math.abs(retried.x - 1824) > 3)
        throw new Error('Boss retry did not reset arena');
      retryChecked = true;
      deaths++;
      lastProgress = Date.now();
      lastX = retried.x;
      console.log('PASS boss defeat and checkpoint reset');
      continue;
    }
    if (
      process.env.NO_POWER &&
      s.vy > 0 &&
      !s.grounded &&
      s.pickups.some((p) => p.y > 155 && p.x - s.x > 22 && p.x - s.x < 70)
    ) {
      // Land before a ground pickup, then jump over it; do not drift into it during a drop.
      await key('ArrowRight', false);
      await key('ArrowLeft', false);
      await page.waitForTimeout(45);
      continue;
    }
    if (
      process.env.STAR_BOSS &&
      !bossStarChecked &&
      s.boss?.active &&
      s.boss.phase === 'WINDUP' &&
      s.star &&
      Math.abs(s.x - s.boss.x) < 70
    ) {
      const health = s.health,
        bossHealth = s.boss.health;
      await key('ArrowRight', true);
      await key('ArrowLeft', false);
      await page.waitForFunction(
        () => {
          const s = window.__MASS_QUEST__.scene.getScene('play');
          return s.physics.overlap(s.player.sprite, s.boss.sprite);
        },
        undefined,
        { timeout: 1600 },
      );
      await key('ArrowRight', false);
      const contact = await snapshot();
      if (contact.health !== health || contact.boss.health !== bossHealth || !contact.star)
        throw new Error('Star bypassed invulnerable boss rules');
      bossStarChecked = true;
      console.log('PASS star contact does not damage invulnerable boss');
    }
    if (Math.abs(s.x - lastX) > 18) {
      lastX = s.x;
      lastProgress = Date.now();
    }
    if (s.now - lastLog > 8000) {
      console.log(hero, level, {
        x: Math.round(s.x),
        y: Math.round(s.y),
        health: s.health,
        boss: s.boss?.health,
        phase: s.boss?.phase,
        facing: s.facing,
        active: Math.round(s.skillActive - s.now),
        ready: Math.round(s.readyAt - s.now),
        bossY: s.boss?.y,
      });
      lastLog = s.now;
    }
    if (Date.now() - lastProgress > 16000 && !s.boss?.active)
      throw new Error(`Stuck ${hero}/${level} at ${s.x},${s.y}`);
    if (hero === 'pk' && level === 0 && !wallChecked && s.x > 2005) {
      // Approach and dash into the real solid obstacle, without moving the player through test APIs.
      await key('ArrowRight', false);
      await page.waitForTimeout(Math.max(100, s.readyAt - s.now + 80));
      await key('ArrowRight', true);
      for (let i = 0; i < 30; i++) {
        if ((await snapshot()).x >= 2040) break;
        await page.waitForTimeout(35);
      }
      await key('ArrowRight', false);
      await pulse('x');
      await page.waitForTimeout(310);
      const stopped = await snapshot();
      if (stopped.right > 2080.5 || stopped.right < 2076)
        throw new Error(`Dash did not stop at obstacle: ${stopped.right}`);
      wallChecked = true;
      console.log('PASS dash obstacle', {
        physicsFps: process.env.PHYSICS_FPS ?? 60,
        x: stopped.x,
      });
    }
    let right = true,
      left = false,
      jump,
      skill;
    if (s.boss?.active && s.boss.health > 0) {
      const side = s.x < s.boss.x ? -1 : 1;
      const target = s.boss.x + side * (s.boss.phase === 'VULNERABLE' ? 35 : 62);
      right = s.x < target - 3;
      left = s.x > target + 3;
      if (!right && !left && s.boss.phase === 'VULNERABLE') {
        // Face the boss with a brief real input, then stop.
        await key('ArrowRight', false);
        await key('ArrowLeft', false);
        await pulse(side < 0 ? 'ArrowRight' : 'ArrowLeft');
      }
      jump = s.grounded && s.boss.phase === 'ATTACK';
      skill =
        s.ready &&
        s.boss.phase === 'VULNERABLE' &&
        Math.abs(s.x - s.boss.x) < (hero === 'balayya' ? 65 : 43);
    } else {
      const surfaces = [...s.grounds.map(([x, w]) => ({ x, y: 192, w })), ...s.platforms];
      const support = surfaces.find(
        (r) => Math.abs(r.y - s.bottom) < 4 && s.x > r.x - 2 && s.x < r.x + r.w + 2,
      );
      const upcoming = s.platforms.find(
        (p) => p.x - s.x > 0 && p.x - s.x < 55 && p.y < s.bottom - 12 && p.y > s.bottom - 58,
      );
      const edge =
        support &&
        support.x + support.w - s.x < 25 &&
        !surfaces.some(
          (r) =>
            r !== support &&
            r.x <= support.x + support.w + 5 &&
            r.x + r.w > s.x + 30 &&
            r.y >= support.y &&
            r.y < support.y + 70,
        );
      const threat = s.enemies.find(
        (e) => e.x > s.x - 10 && e.x - s.x < 64 && Math.abs(e.y - s.y) < 40,
      );
      const powerAhead = s.pickups.find((p) => p.y > 155 && p.x - s.x > 25 && p.x - s.x < 44);
      const avoidUpperPower =
        process.env.NO_POWER &&
        s.pickups.some((p) => p.y < 155 && p.x - s.x > -40 && p.x - s.x < 110);
      const optionalPowerPlatform =
        upcoming &&
        s.pickups.some((p) => p.y < 155 && p.x >= upcoming.x && p.x <= upcoming.x + upcoming.w);
      jump =
        s.grounded &&
        !!(
          edge ||
          (upcoming && !(process.env.NO_POWER && optionalPowerPlatform)) ||
          (threat && !avoidUpperPower) ||
          (process.env.NO_POWER && powerAhead)
        );
      skill =
        s.ready &&
        !!s.enemies.find((e) => e.x > s.x - 5 && e.x - s.x < 55 && Math.abs(e.y - s.y) < 32);
    }
    await key('ArrowRight', right);
    await key('ArrowLeft', left);
    if (jump && s.now - jumpAt > 100) {
      await pulse('Space');
      jumpAt = s.now;
    }
    if (skill && !(process.env.NO_POWER && hero === 'pk' && !s.boss?.active && level !== 4))
      await pulse('KeyX');
    await page.waitForTimeout(48);
  }
  await key('ArrowRight', false);
  await key('ArrowLeft', false);
  if (process.env.STAR_BOSS && !bossStarChecked)
    throw new Error('Star/boss probe was not exercised');
  if (!(await page.getByRole('heading', { name: /mass finish|legendary finish/ }).isVisible())) {
    await page.screenshot({
      path: `test-results/fail-${hero}-${level}.png`,
      fullPage: true,
    });
    throw new Error(`Did not complete ${hero}/${level}`);
  }
  reports.push({
    hero,
    level: level + 1,
    completed: true,
    deaths,
    sawGrowth,
    sawStar,
    noPower: !!process.env.NO_POWER,
    retryVerified: retryChecked,
    starBossVerified: bossStarChecked,
    dashObstacleVerified: wallChecked,
    wallSeconds: Math.round((Date.now() - start) / 1000),
  });
  console.log('PASS', reports.at(-1));
  await page.screenshot({
    path: `test-results/complete-${hero}-${level}.png`,
    fullPage: true,
  });
}
try {
  await mkdir('test-results', { recursive: true });
  for (const hero of process.env.HERO ? [process.env.HERO] : ['balayya', 'chiru', 'pk']) {
    await page.goto('http://127.0.0.1:5173');
    // Fresh local profile for each hero; unlocks must come from actual completion.
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    if (process.env.START_LEVEL) {
      await page.evaluate(() => {
        const p = JSON.parse(localStorage.getItem('mass-quest.v2') ?? 'null');
        const v = p ?? {
          version: 2,
          unlocked: [
            'festival-run',
            'rooftop-chase',
            'papikondalu-trail',
            'studio-showdown',
            'fortress-finale',
          ],
          best: Object.fromEntries(
            [
              'festival-run',
              'rooftop-chase',
              'papikondalu-trail',
              'studio-showdown',
              'fortress-finale',
            ].map((id) => [id, 500]),
          ),
          coins: 0,
          owned: ['balayya-default', 'chiru-default', 'pk-default'],
          equipped: { balayya: 'balayya-default', chiru: 'chiru-default', pk: 'pk-default' },
          lastHero: 'balayya',
          muted: true,
          lastReward: null,
        };
        v.unlocked = Object.keys(v.best);

        localStorage.setItem('mass-quest.v2', JSON.stringify(v));
      });
      await page.reload();
      await page.locator('.level-card').nth(Number(process.env.START_LEVEL)).click();
    }
    await page.getByRole('button', { name: new RegExp(`Select ${hero}\\.`, 'i') }).click();
    await page.getByRole('button', { name: 'Start adventure' }).click();
    for (
      let level = Number(process.env.START_LEVEL ?? 0);
      level < Number(process.env.CAMPAIGN_LEVELS ?? campaign.length);
      level++
    ) {
      await page.waitForFunction(() => !!window.__MASS_QUEST__?.scene.getScene('play')?.player);
      if (process.env.STAR_BOSS)
        await page.evaluate(() => {
          const s = window.__MASS_QUEST__.scene.getScene('play'),
            p = { id: 'star-boss-fixture', kind: 'star', x: 2160, y: 177 };
          s.level.pickups.push(p);
          s.pickups.sprites.push(s.add.image(p.x, p.y, p.kind).setDepth(7));
        });
      if (process.env.PHYSICS_FPS)
        await page.evaluate(
          (fps) => window.__MASS_QUEST__.scene.getScene('play').physics.world.setFPS(fps),
          Number(process.env.PHYSICS_FPS),
        );
      await drive(hero, level);
      if (
        level <
        Math.min(campaign.length - 1, Number(process.env.CAMPAIGN_LEVELS ?? campaign.length) - 1)
      )
        await page.getByRole('button', { name: 'Next act' }).click();
    }
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mass-quest.v2')));
    if (
      !process.env.CAMPAIGN_LEVELS &&
      !process.env.START_LEVEL &&
      (saved.unlocked.length !== campaign.length || !Object.values(saved.best).every((n) => n > 0))
    )
      throw new Error('Campaign progress not saved');
  }
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  await writeFile(
    `test-results/campaign${process.env.STAR_BOSS ? '-star-boss' : process.env.NO_POWER ? `-no-power${process.env.HERO ? '-' + process.env.HERO : ''}` : process.env.VERIFY_RETRY ? `-retries-${process.env.START_LEVEL ?? 0}` : process.env.PHYSICS_FPS ? '-' + process.env.PHYSICS_FPS : process.env.HERO ? '-' + process.env.HERO : ''}.json`,
    JSON.stringify({ reports, errors }, null, 2),
  );
  await browser.close();
}
