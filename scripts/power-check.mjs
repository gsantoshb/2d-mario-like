/** Isolated geometry fixture: adds/removes one ceiling; actor state changes only through play. */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [],
  reports = [];
page.on('pageerror', (e) => errors.push(e.message));
const scene = () =>
  page.evaluate(() => {
    const s = window.__MASS_QUEST__.scene.getScene('play'),
      p = s.player;
    return {
      x: p.sprite.x,
      health: p.combat.health,
      grown: p.combat.powers.grown,
      star: p.combat.powers.starUntil - s.now,
      width: p.body.width,
      height: p.body.height,
      bottom: p.body.bottom,
      coins: s.ledger.coins.size,
      consumed: s.pickups.consumed.size,
    };
  });
const wait = async (fn) => page.waitForFunction(fn, undefined, { timeout: 12000 });
try {
  await mkdir('test-results', { recursive: true });
  for (const hero of ['balayya', 'chiru', 'pk'])
    for (const alt of [false, true]) {
      await page.goto('http://127.0.0.1:5173');
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.getByRole('button', { name: new RegExp(`Select ${hero}\\.`, 'i') }).click();
      if (alt) {
        await page.evaluate((hero) => {
          const p = JSON.parse(localStorage.getItem('mass-quest.v2'));
          p.owned.push(`${hero}-alt`);
          p.equipped[hero] = `${hero}-alt`;
          localStorage.setItem('mass-quest.v2', JSON.stringify(p));
        }, hero);
        await page.reload();
      }
      await page.getByRole('button', { name: 'Start adventure' }).click();
      await wait(() => !!window.__MASS_QUEST__?.scene.getScene('play')?.player);
      await page.evaluate(() => {
        const s = window.__MASS_QUEST__.scene.getScene('play');
        const ceiling = s.add
          .tileSprite(112, 158, 96, 8, 'platform-village')
          .setOrigin(0)
          .setDepth(2);
        s.physics.add.existing(ceiling, true);
        s.world.terrain.add(ceiling);
        s.fixtureCeiling = ceiling;
      });
      await page.keyboard.down('ArrowRight');
      await wait(() => window.__MASS_QUEST__.scene.getScene('play').player.sprite.x >= 149);
      await page.keyboard.up('ArrowRight');
      const blocked = await scene();
      assert.equal(blocked.grown, false);
      assert.equal(blocked.consumed, 0);
      await page.evaluate(() =>
        window.__MASS_QUEST__.scene.getScene('play').fixtureCeiling.destroy(),
      );
      await wait(() => window.__MASS_QUEST__.scene.getScene('play').player.combat.powers.grown);
      const grown = await scene();
      assert.equal(grown.width, 17.5);
      assert.equal(grown.height, 32.5);
      assert.ok(Math.abs(grown.bottom - 192) < 1);
      await page.keyboard.down('ArrowRight');
      await wait(() => window.__MASS_QUEST__.scene.getScene('play').player.sprite.x >= 191);
      await page.keyboard.press('Space', { delay: 25 });
      await wait(() =>
        window.__MASS_QUEST__.scene
          .getScene('play')
          .player.combat.powers.starActive(window.__MASS_QUEST__.scene.getScene('play').now),
      );
      await page.keyboard.up('ArrowRight');
      await page.getByRole('button', { name: 'Pause', exact: true }).click();
      const frozen = await scene();
      await page.waitForTimeout(500);
      assert.equal((await scene()).star, frozen.star);
      await page.screenshot({
        path: `test-results/power-${hero}-${alt ? 'alt' : 'default'}-paused.png`,
        fullPage: true,
      });
      await page.getByRole('button', { name: 'Resume adventure' }).click();
      await page.screenshot({
        path: `test-results/power-${hero}-${alt ? 'alt' : 'default'}.png`,
        fullPage: true,
      });
      await page.keyboard.down('ArrowRight');
      await wait(() => window.__MASS_QUEST__.scene.getScene('play').player.sprite.x >= 320);
      await page.keyboard.up('ArrowRight');
      await wait(() => window.__MASS_QUEST__.scene.getScene('play').ledger.enemies.has('enemy-0'));
      assert.equal((await scene()).health, 3);
      assert.equal((await scene()).grown, true);
      if (!alt) {
        await page.keyboard.down('ArrowRight');
        await wait(() => {
          const s = window.__MASS_QUEST__.scene.getScene('play');
          return s.player.sprite.x < 70 && s.now > 4000;
        });
        await page.keyboard.up('ArrowRight');
        const reset = await scene();
        assert.equal(reset.health, 3);
        assert.equal(reset.grown, false);
        assert.ok(reset.star <= 0);
        assert.equal(reset.consumed, 0);
        const coins = reset.coins;
        await page.keyboard.down('ArrowRight');
        await wait(() => window.__MASS_QUEST__.scene.getScene('play').player.sprite.x >= 170);
        await page.keyboard.up('ArrowRight');
        assert.equal((await scene()).coins, coins);
        await page.keyboard.down('ArrowRight');
        await wait(() => {
          const s = window.__MASS_QUEST__.scene.getScene('play');
          return s.player.sprite.x > 250 && !s.player.combat.powers.grown;
        });
        await page.keyboard.up('ArrowRight');
        const shrunk = await scene();
        assert.equal(shrunk.health, 3);
        assert.equal(shrunk.width, 14);
        assert.equal(shrunk.height, 26);
      } else await page.keyboard.up('ArrowRight');
      reports.push({
        hero,
        skin: alt ? 'alternate' : 'default',
        clearance: true,
        growth: true,
        star: true,
        pause: true,
        contact: true,
        checkpointAndShrink: !alt,
      });
      console.log('PASS powers', hero, alt ? 'alternate' : 'default');
    }
  assert.equal(errors.length, 0, errors.join('\n'));
} finally {
  await writeFile('test-results/powers.json', JSON.stringify({ reports, errors }, null, 2));
  await browser.close();
}
