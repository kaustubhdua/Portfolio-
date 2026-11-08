import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const productionUrl = process.env.PROD_URL || 'https://kaustubhdua.vercel.app';
const expectedSha = process.env.EXPECTED_SHA || '';
if (expectedSha !== 'not-attested') assert.match(expectedSha, /^[a-f0-9]{40}$/i, 'Expected a full deployed commit SHA');

const expectedProjects = ['NIRDHOOM', 'Saathi', 'PatchPilot', 'Smart Waste', 'RideForge'];
const pageErrors = [];
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    globalThis.localStorage.setItem('portfolio-3d', 'off');
  });

  const response = await page.goto(productionUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  assert.ok(response, 'Production navigation returned a response');
  assert.equal(response.status(), 200, 'Canonical production URL returns HTTP 200');
  await page.locator('#forge .card').first().waitFor({ state: 'visible', timeout: 30_000 });

  assert.ok((await page.title()).trim().length > 0, 'Document title is present');
  assert.equal(await page.locator('h1').count(), 1, 'Page exposes one primary heading');

  const cards = page.locator('#forge .card');
  assert.equal(await cards.count(), expectedProjects.length, 'Exactly five curated project cards render');
  const titles = (await page.locator('#forge .card-title').allTextContents()).map((title) => title.trim());
  for (const name of expectedProjects) {
    assert.ok(titles.includes(name), `Expected project card: ${name}`);
  }
  assert.equal(await page.locator('#forge .explored-grid').count(), 0, 'Uncurated second project grid is absent');

  const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  for (const excluded of ['CGPA', 'Pinnacle Labs', 'GitGlobe']) {
    assert.ok(!bodyText.includes(excluded), `Excluded portfolio content is absent: ${excluded}`);
  }
  assert.ok(await page.locator('a[href*="linkedin.com/in/kaustubh-dua"]').count() > 0, 'LinkedIn profile link is present');
  assert.ok(await page.locator('a[href="https://github.com/kaustubhdua"]').count() > 0, 'GitHub profile link is present');

  for (let index = 0; index < expectedProjects.length; index += 1) {
    const card = cards.nth(index);
    const name = titles[index];
    await card.scrollIntoViewIfNeeded();

    const image = card.locator('img').first();
    if (await image.count()) {
      await image.waitFor({ state: 'visible', timeout: 15_000 });
      await page.waitForFunction(
        (element) => element.complete && element.naturalWidth > 0,
        await image.elementHandle(),
        { timeout: 15_000 },
      );
    }

    await card.click();
    const dialog = page.locator('dialog.dialog');
    await page.waitForFunction(
      () => globalThis.document.querySelector('dialog.dialog')?.open === true,
      null,
      { timeout: 10_000 },
    );
    const dialogText = await dialog.innerText();
    assert.ok(dialogText.toLowerCase().includes(name.toLowerCase()), `Case study opens for ${name}`);
    await page.keyboard.press('Escape');
    await page.waitForFunction(
      () => !globalThis.document.querySelector('dialog.dialog')?.open,
      null,
      { timeout: 10_000 },
    );
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(250);
  const hasHorizontalOverflow = await page.evaluate(
    () => globalThis.document.documentElement.scrollWidth > globalThis.window.innerWidth + 1,
  );
  assert.equal(hasHorizontalOverflow, false, 'Mobile production layout has no horizontal overflow');
  assert.deepEqual(pageErrors, [], 'Production page has no uncaught JavaScript errors');

  process.stdout.write(
    `PASS production smoke | commit=${expectedSha} | url=${productionUrl} | projects=${titles.join(', ')}\n`,
  );
} finally {
  await browser.close();
}
