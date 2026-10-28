import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const reports = [];
const ids = [
  'festival-run',
  'rooftop-chase',
  'papikondalu-trail',
  'studio-showdown',
  'fortress-finale',
];
try {
  await mkdir('test-results', { recursive: true });
  await page.goto('http://127.0.0.1:5173');
  // A completed-save fixture is used only to select scenes for art inspection.
  await page.getByRole('button', { name: /Select Balayya\./i }).click();
  await page.evaluate((ids) => {
    const p = JSON.parse(localStorage.getItem('mass-quest.v2'));
    p.unlocked = ids;
    p.best = Object.fromEntries(ids.map((id) => [id, 500]));
    localStorage.setItem('mass-quest.v2', JSON.stringify(p));
  }, ids);
  for (let index = 0; index < ids.length; index++) {
    await page.goto('http://127.0.0.1:5173');
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('.level-card').nth(index).click();
    await page.getByRole('button', { name: 'Start adventure' }).click();
    await page.waitForFunction(() => !!window.__MASS_QUEST__?.scene.getScene('play')?.player);
    for (const [scale, size] of [
      [1, { width: 900, height: 650 }],
      [2, { width: 1280, height: 900 }],
    ]) {
      await page.setViewportSize(size);
      await page.waitForTimeout(100);
      const box = await page.locator('canvas').boundingBox();
      assert.equal(box.width, 384 * scale);
      assert.equal(box.height, 216 * scale);
      await page
        .locator('.game-frame')
        .screenshot({ path: `test-results/${ids[index]}-${scale}x.png` });
      await page.locator('.game-frame').evaluate((el) => (el.style.filter = 'grayscale(1)'));
      await page
        .locator('.game-frame')
        .screenshot({ path: `test-results/${ids[index]}-${scale}x-gray.png` });
      await page.locator('.game-frame').evaluate((el) => (el.style.filter = ''));
    }
    reports.push({ level: ids[index], scales: [1, 2], grayscale: true });
  }
  console.log('PASS visual scales and grayscale for five themes');
} finally {
  await writeFile('test-results/visual.json', JSON.stringify(reports, null, 2));
  await browser.close();
}
