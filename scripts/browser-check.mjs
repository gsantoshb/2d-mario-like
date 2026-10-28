import assert from 'node:assert/strict';
import { chromium, firefox } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.GAME_URL ?? 'http://127.0.0.1:5173';
const names = process.env.BROWSER ? [process.env.BROWSER] : ['chrome', 'firefox'];
const reports = [];
await mkdir('test-results', { recursive: true });
for (const name of names) {
  const browser =
    name === 'firefox'
      ? await firefox.launch({ headless: true })
      : await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(base);
    await page.getByRole('heading', { name: 'Choose your legend.' }).waitFor();
    assert.equal(await page.locator('.hero-card').count(), 3);
    assert.equal(await page.locator('.level-card:disabled').count(), 4);
    await page.screenshot({ path: `test-results/${name}-home.png`, fullPage: true });

    // Native buttons work with keyboard navigation, including hero choice and start.
    await page.getByRole('button', { name: /Select PK\./ }).focus();
    await page.keyboard.press('Enter');
    assert.equal(
      await page.getByRole('button', { name: /Select PK\./ }).getAttribute('aria-pressed'),
      'true',
    );
    await page.getByRole('button', { name: 'Start adventure' }).focus();
    await page.keyboard.press('Enter');
    await page.waitForSelector('canvas');
    await page.waitForTimeout(500);
    assert.equal(await page.locator('canvas').count(), 1);
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(1900);
    await page.keyboard.up('ArrowRight');
    const coins = await page.locator('.hud > span:nth-child(3)').innerText();
    assert.ok(Number.parseInt(coins.trim()) > 0, 'Moving collected coins');
    await page.keyboard.press('x', { delay: 40 });
    await page.keyboard.press('Escape', { delay: 50 });
    await page.getByRole('heading', { name: 'Even legends pause.' }).waitFor();
    const time = await page.locator('.hud-time').innerText();
    const cooldown = await page.locator('.hud-skill b').innerText();
    await page.waitForTimeout(1250);
    assert.equal(await page.locator('.hud-time').innerText(), time);
    assert.equal(await page.locator('.hud-skill b').innerText(), cooldown);
    await page.keyboard.press('Tab');
    assert.match(await page.locator(':focus').innerText(), /Leave run/);
    await page.keyboard.press('Tab');
    assert.match(await page.locator(':focus').innerText(), /Resume adventure/);
    await page.screenshot({ path: `test-results/${name}-pause.png`, fullPage: true });
    await page.getByRole('button', { name: 'Resume adventure' }).click();
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.getByRole('heading', { name: 'Even legends pause.' }).waitFor();
    await page.getByRole('button', { name: /Leave run/ }).click();
    assert.equal(await page.locator('canvas').count(), 0);
    const unfinished = await page.evaluate(() => JSON.parse(localStorage.getItem('mass-quest.v2')));
    assert.equal(unfinished.coins, 0, 'Unfinished coins are not banked');
    assert.deepEqual(unfinished.unlocked, ['festival-run']);

    // Repeat starts exercise cleanup independently of StrictMode.
    for (let i = 0; i < 2; i++) {
      await page.getByRole('button', { name: 'Start adventure' }).click();
      await page.waitForSelector('canvas');
      await page.waitForTimeout(200);
      assert.equal(await page.locator('canvas').count(), 1);
      await page.getByRole('button', { name: 'Pause', exact: true }).click();
      await page.getByRole('button', { name: /Leave run/ }).click();
      assert.equal(await page.locator('canvas').count(), 0);
    }

    // A completed-save fixture isolates the commerce UI from campaign tests.
    await page.evaluate(() => {
      const p = JSON.parse(localStorage.getItem('mass-quest.v2'));
      p.coins = 80;
      p.best = Object.fromEntries(Object.keys(p.best).map((id) => [id, 500]));
      p.unlocked = Object.keys(p.best);
      localStorage.setItem('mass-quest.v2', JSON.stringify(p));
    });
    await page.reload();
    await page.getByRole('button', { name: /Wardrobe/ }).click();
    const skin = page.locator('.shop-card').filter({ hasText: 'Electric Blue' });
    await skin.getByRole('button').click();
    await skin.getByRole('button', { name: 'Equip outfit' }).click();
    assert.equal(await skin.getByRole('button', { name: 'Equipped' }).isDisabled(), true);
    await page.reload();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mass-quest.v2')));
    assert.equal(saved.coins, 50);
    assert.equal(saved.equipped.pk, 'pk-alt');
    await page.getByRole('button', { name: 'Mute sound', exact: true }).click();
    await page.reload();
    assert.equal(await page.getByRole('button', { name: 'Unmute sound' }).isVisible(), true);
    await page.getByRole('button', { name: /Wardrobe/ }).click();
    await page.screenshot({ path: `test-results/${name}-wardrobe.png`, fullPage: true });
    await page.setViewportSize({ width: 900, height: 800 });
    await page.screenshot({ path: `test-results/${name}-900.png`, fullPage: true });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    await page.getByRole('button', { name: 'Start adventure' }).click();
    await page.getByText('For the best experience, play on a desktop with a keyboard.').waitFor();
    await page.screenshot({ path: `test-results/${name}-small.png`, fullPage: true });
    const isProduction = base.includes('4173');
    if (isProduction) assert.equal(await page.evaluate(() => '__MASS_QUEST__' in window), false);

    await page.goto(base);
    await page.evaluate(() => localStorage.setItem('mass-quest.v2', '{bad-json'));
    await page.reload();
    await page
      .getByRole('status')
      .filter({ hasText: /could not be restored/ })
      .waitFor();
    assert.equal(await page.locator('.level-card:disabled').count(), 4);
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem(
        'mass-quest.v1',
        JSON.stringify({
          version: 1,
          unlocked: 2,
          best: [100, 200, 0],
          coins: 47,
          owned: ['balayya-default', 'chiru-default', 'pk-default', 'pk-alt'],
          equipped: { balayya: 'balayya-default', chiru: 'chiru-default', pk: 'pk-alt' },
          lastHero: 'pk',
          muted: true,
          lastReward: 'legacy-run',
        }),
      );
    });
    await page.reload();
    const migrated = await page.evaluate(() => ({
      old: localStorage.getItem('mass-quest.v1'),
      current: JSON.parse(localStorage.getItem('mass-quest.v2')),
    }));
    assert.ok(migrated.old);
    assert.equal(migrated.current.coins, 47);
    assert.equal(migrated.current.best['rooftop-chase'], 200);
    assert.equal(migrated.current.best['papikondalu-trail'], 0);
    assert.equal(migrated.current.equipped.pk, 'pk-alt');
    assert.equal(await page.locator('.level-card:disabled').count(), 1);
    await page.reload();
    assert.equal(
      await page.evaluate(() => JSON.parse(localStorage.getItem('mass-quest.v2')).coins),
      47,
    );
    await page.setViewportSize({ width: 900, height: 800 });
    await page.screenshot({ path: `test-results/${name}-campaign-migrated.png`, fullPage: true });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
    assert.equal(errors.length, 0, errors.join('\n'));
    reports.push({ browser: name, base, passed: true, errors });
    console.log('PASS', name, 'keyboard, controls, pause, lifecycle, shop, saves, resizing');
  } finally {
    await context.close();
    await browser.close();
  }
}
await writeFile('test-results/browser.json', JSON.stringify(reports, null, 2));
