/**
 * Browser tests against a running preview server (npm run preview) of the production build.
 *
 *   npm run build && npm run preview &
 *   npm run test:e2e
 *
 * BASE_URL        page to test (default http://localhost:4173/)
 * PLAYWRIGHT_MODULE / PW_CHROMIUM  optional overrides for non-standard installs
 */
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const results = [];
const errors = [];
const ok = (name, pass, detail = '') => results.push({ pass: Boolean(pass), name, detail });

async function open(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
  await page.goto(BASE);
  return [ctx, page];
}

// First visit: boot screen, entry loader, skip.
{
  const [ctx, page] = await open();
  await page.waitForSelector('#root > *', { timeout: 10000 });
  ok('static boot screen is removed once the app mounts', (await page.locator('#boot').count()) === 0);
  ok('entry loader shows on first visit', (await page.locator('.loader').count()) === 1);
  await page.keyboard.press('Escape');
  await page.waitForSelector('.loader', { state: 'detached', timeout: 3000 });
  ok('entry loader skips with Escape', true);
  await page.waitForTimeout(1800);
  ok('hero name revealed', await page.evaluate(() => getComputedStyle(document.querySelector('.letter')).opacity === '1'));

  for (const link of await page.locator('.nav-link').all()) {
    const href = await link.getAttribute('href');
    const id = href.slice(1);
    await link.click();
    await page.waitForTimeout(1300);
    const top = await page.evaluate((i) => Math.round(document.getElementById(i).getBoundingClientRect().top), id);
    const current = await page.locator('.nav-link[aria-current="location"]').getAttribute('href');
    ok(`nav ${id}: section in place and marked current`, Math.abs(top) < 90 && current === href, `top=${top}`);
  }

  const trigger = page.getByRole('button', { name: 'Case study: NIRDHOOM' });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.waitForTimeout(600);
  ok('case study dialog opens', await page.evaluate(() => document.querySelector('dialog.dialog').open));
  ok('dialog locks body scroll', await page.evaluate(() => document.body.classList.contains('modal-open')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  ok('Escape closes dialog', !(await page.evaluate(() => document.querySelector('dialog.dialog').open)));
  ok('focus returns to the trigger', await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Case study: NIRDHOOM'));

  await page.locator('.filters').getByRole('button', { name: 'Basalt Deltas' }).click();
  await page.waitForTimeout(300);
  ok('biome filter narrows the cards', (await page.locator('.card').count()) === 1);
  await page.locator('.filters').getByRole('button', { name: 'All biomes' }).click();
  await page.waitForTimeout(300);
  ok('all six projects shown again', (await page.locator('.card').count()) === 6);
  ok('three flagship projects are marked', (await page.locator('.flagship-tag').count()) === 3);

  await page.getByRole('button', { name: 'FastAPI' }).click();
  ok('inventory info panel updates', (await page.locator('.info-name').innerText()).toUpperCase() === 'FASTAPI');

  ok('email link present', (await page.locator('a[href^="mailto:"]').count()) >= 1);
  ok('resume download link present', (await page.locator('a[download][href$=".pdf"]').count()) >= 1);
  const pdf = await page.request.get(new URL('Kaustubh-Dua-Resume.pdf', BASE).href);
  ok('resume PDF is served', pdf.ok() && (pdf.headers()['content-type'] ?? '').includes('pdf'));

  const sound = page.locator('.sound-toggle');
  ok('ambient sound is off by default', (await sound.getAttribute('aria-pressed')) === 'false');

  const badImages = await page.evaluate(async () => {
    const imgs = [...document.images];
    await Promise.all(imgs.map((i) => i.decode().catch(() => {})));
    return imgs.filter((i) => !i.naturalWidth).map((i) => i.src);
  });
  ok('all images load', badImages.length === 0, badImages.join(','));
  const links = await page.evaluate(() => [...document.querySelectorAll('a[href^="http"]')].map((a) => ({ t: a.target, r: a.rel })));
  ok('external links open safely', links.every((l) => l.t === '_blank' && /noopener/.test(l.r)), `${links.length} links`);
  ok('no unnamed links or buttons', await page.evaluate(() => [...document.querySelectorAll('a,button')].every((e) => (e.innerText || '').trim() || e.getAttribute('aria-label'))));
  const dupes = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    return ids.filter((x, i) => ids.indexOf(x) !== i);
  });
  ok('no duplicate ids', dupes.length === 0, dupes.join(','));
  const seo = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length,
    jsonld: document.querySelectorAll('script[type="application/ld+json"]').length,
    desc: Boolean(document.querySelector('meta[name=description]')),
  }));
  ok('one h1, meta description and structured data', seo.h1 === 1 && seo.desc && seo.jsonld === 1, JSON.stringify(seo));
  await ctx.close();
}

// Reduced motion: no intro, content visible, animations shortened, keyboard skip link works.
{
  const [ctx, page] = await open({ reducedMotion: 'reduce' });
  await page.waitForSelector('#root > *');
  ok('no entry loader with reduced motion', (await page.locator('.loader').count()) === 0);
  ok('hero name visible immediately', await page.evaluate(() => getComputedStyle(document.querySelector('.letter')).opacity === '1'));
  await page.keyboard.press('Tab');
  ok('first Tab focuses the skip link', await page.evaluate(() => document.activeElement.classList.contains('skip-link')));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ok('skip link moves focus to the profile', await page.evaluate(() => document.activeElement.id === 'profile'));
  await ctx.close();
}

// Responsive sweep.
for (const w of [320, 360, 390, 768, 899, 900, 1024, 1280, 1920, 2560]) {
  const [ctx, page] = await open({ viewport: { width: w, height: w < 900 ? 800 : 900 }, reducedMotion: 'reduce' });
  await page.waitForSelector('#root > *');
  const m = await page.evaluate(() => {
    const d = document.documentElement;
    const nav = document.querySelector('.nav-list');
    const small = [...document.querySelectorAll('a,button')]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height < 40 && getComputedStyle(e).display !== 'inline' && !e.classList.contains('skip-link');
      })
      .map((e) => `${e.className}:${Math.round(e.getBoundingClientRect().height)}`);
    return { over: d.scrollWidth - d.clientWidth, navFits: nav.scrollWidth <= nav.parentElement.clientWidth + 1, small };
  });
  ok(`${w}px: no horizontal overflow`, m.over <= 0, `over=${m.over}`);
  ok(`${w}px: navigation fits`, m.navFits);
  ok(`${w}px: touch targets are at least 40px`, m.small.length === 0, m.small.slice(0, 3).join(' '));
  await ctx.close();
}

await browser.close();

ok('no console errors or warnings', errors.length === 0, errors.slice(0, 3).join(' | '));
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'} | ${r.name}${r.detail && !r.pass ? ` | ${r.detail}` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
