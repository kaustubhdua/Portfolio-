/**
 * Browser tests against a running preview server (npm run preview) of the production build.
 *
 *   npm run build && npm run preview &
 *   npm run test:e2e
 *
 * BASE_URL        page to test (default http://localhost:4173/)
 * PLAYWRIGHT_MODULE / PW_CHROMIUM  optional overrides for non-standard installs
 */
import { profile } from '../src/data/profile.js';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
// Software WebGL (SwiftShader) lets the 3D world run on machines without a GPU, such as CI.
const glBrowser = await chromium.launch({
  ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
// The rest of the suite runs on a normal browser: forcing software rendering slows the CSS scenes down.
const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
// Chrome's own notes about software rendering are not site problems.
const GL_NOISE = /GL Driver Message|GroupMarkerNotSet|software WebGL|GPU stall/;
const results = [];
const errors = [];
const ok = (name, pass, detail = '') => results.push({ pass: Boolean(pass), name, detail });

async function plainContext(opts) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => localStorage.setItem('portfolio-3d', 'off'));
  return ctx;
}

async function open({ threed = false, ...opts } = {}) {
  // Software WebGL is slow and would starve the timing-based tests below, so only the 3D tests turn it on.
  const ctx = threed ? await glBrowser.newContext({ viewport: { width: 1440, height: 900 }, ...opts }) : await plainContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type()) && !GL_NOISE.test(m.text())) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
  await page.goto(BASE);
  return [ctx, page];
}

// First visit: boot screen, entry loader, skip.
{
  const [ctx, page] = await open();
  await page.waitForSelector('#root > *', { state: 'attached', timeout: 10000 });
  // the static boot screen fades out for a few hundred ms after the app mounts, then leaves the DOM
  await page.waitForSelector('#boot', { state: 'detached', timeout: 3000 }).catch(() => {});
  ok('static boot screen is removed once the app mounts', (await page.locator('#boot').count()) === 0);
  ok('title screen shows on first visit', (await page.locator('.title-screen').count()) === 1);
  const splashText = (await page.locator('.title-splash').innerText()).trim();
  ok('title screen has a yellow splash line', splashText.length > 3 && (await page.locator('.title-splash').evaluate((e) => getComputedStyle(e).color)) === 'rgb(255, 255, 85)');
  ok('Play is focused first', await page.evaluate(() => document.activeElement?.textContent === 'Play'));
  await page.keyboard.press('ArrowDown');
  ok('arrow keys move through the menu', await page.evaluate(() => document.activeElement?.textContent === 'Free roam'));
  await page.locator('.title-menu .mc-button', { hasText: 'Play' }).click();
  await page.waitForSelector('.loader:not(.boot)', { timeout: 3000 });
  ok('entry loader follows the title screen', (await page.locator('.title-screen').count()) === 0);
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
  ok('all six projects shown again, plus the two coming-soon cards', (await page.locator('.card:not(.card-soon)').count()) === 6 && (await page.locator('.card-soon').count()) === 2);
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
  ok('no entry loader with reduced motion', (await page.locator('.loader:not(.boot)').count()) === 0);
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

// Contact links and the blog: WhatsApp opens a chat, the blog list and its posts render and link back.
{
  const [ctx, page] = await open();
  await page.waitForSelector('#root > *', { state: 'attached', timeout: 10000 });
  const wa = await page.locator('a[href^="https://wa.me/917419911991"]').count();
  ok('WhatsApp links go straight to the chat (hero, contact section, footer text)', wa >= 2, `${wa} links`);
  ok('every external link opens safely', await page.evaluate(() => [...document.querySelectorAll('a[target="_blank"]')].every((a) => /noopener/.test(a.rel))));
  ok('profile shows the pixel avatar', await page.evaluate(() => { const i = document.querySelector('.avatar-img'); return !!i && i.complete && i.naturalWidth > 0; }));
  ok('club roles and volunteering are listed', (await page.locator('.roles li').count()) === 3);
  if (!profile.blogEnabled) {
    ok('blog is not linked while it is coming soon', (await page.locator('a[href="blog/"]').count()) === 0);
    ok('contact shows "Blog: coming soon"', (await page.locator('.btn-soon', { hasText: 'coming soon' }).count()) === 1);
    ok('the Forge lists two coming-soon flagship cards', (await page.locator('.card-soon').count()) === 2);
  } else {
    await page.goto(`${BASE}blog/`);
    ok('blog list has one h1 and at least one post', (await page.locator('h1').count()) === 1 && (await page.locator('.cards .card').count()) >= 1);
    await page.locator('.cards .card h2 a').first().click();
    await page.waitForSelector('article.post');
    ok('a post opens with one h1 and readable text', (await page.locator('h1').count()) === 1 && (await page.locator('.prose p').count()) >= 3);
    ok('post links back to the blog and the portfolio', (await page.locator('a[href="../"]').count()) >= 1 && (await page.locator('a[href="../../"]').count()) >= 1);
    await page.setViewportSize({ width: 320, height: 640 });
    ok('post: no horizontal overflow at 320px', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

  }
  await ctx.close();
}

// Advancement toasts: a section reached for the first time pops one up from the top right.
{
  const ctx = await plainContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
  await page.addInitScript(() => sessionStorage.setItem('nether-intro-seen', '1'));
  await page.goto(BASE);
  await page.waitForTimeout(1000);
  ok('no toast before leaving the first section', (await page.locator('.toast.show').count()) === 0);
  await page.evaluate(() => document.getElementById('contact').scrollIntoView());
  await page.waitForSelector('.toast.show', { timeout: 4000 });
  ok('the toast uses a game-style header', /advancement made!|goal reached!|challenge complete!/i.test(await page.locator('.toast.show .toast-h').innerText()));
  await ctx.close();
}

// Day / night worlds: toggle, portal trip, persistence, phone reachability, reduced motion.
{
  const ctx = await plainContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
  await page.addInitScript(() => sessionStorage.setItem('nether-intro-seen', '1'));
  await page.goto(BASE);
  await page.waitForTimeout(1200);
  const toggle = page.locator('.theme-toggle');
  ok('starts in the Nether (night)', (await page.evaluate(() => document.documentElement.dataset.theme)) !== 'overworld');
  await toggle.click();
  await page.waitForSelector('.travel', { timeout: 2000 });
  ok('portal travel animation plays', true);
  ok('toggle is disabled during the trip', await toggle.isDisabled());
  await page.waitForSelector('.travel', { state: 'detached', timeout: 6000 });
  ok('day mode applied after the trip', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'overworld');
  ok('toggle label offers the way back', /Nether/.test(await toggle.getAttribute('aria-label')));
  ok('status message announces the new world', /Overworld/.test(await page.locator('[role="status"].sr-only').textContent()));
  await page.reload();
  ok('chosen world is remembered', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'overworld');
  await ctx.close();

  const phone = await plainContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const pp = await phone.newPage();
  await pp.addInitScript(() => sessionStorage.setItem('nether-intro-seen', '1'));
  await pp.goto(BASE);
  await pp.waitForTimeout(1000);
  await pp.evaluate(() => document.getElementById('forge').scrollIntoView({ behavior: 'instant' }));
  await pp.waitForTimeout(500);
  const box = await pp.locator('.theme-toggle').boundingBox();
  ok('phone: day/night button stays on screen after scrolling', box && box.y >= 0 && box.y + box.height <= 844 && box.x + box.width <= 390, JSON.stringify(box));
  const sbox = await pp.locator('.sound-toggle').boundingBox();
  ok('phone: sound button stays on screen after scrolling', sbox && sbox.y >= 0 && sbox.y < 100, JSON.stringify(sbox));
  await phone.close();

  const calm = await plainContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const cp = await calm.newPage();
  await cp.goto(BASE);
  await cp.waitForTimeout(800);
  await cp.locator('.theme-toggle').click();
  await cp.waitForTimeout(200);
  ok('reduced motion: world swaps instantly with no portal animation', (await cp.locator('.travel').count()) === 0 && (await cp.evaluate(() => document.documentElement.dataset.theme)) === 'overworld');
  await calm.close();
}

// Per-project share pages and deep links.
{
  const ctx = await plainContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
  await page.addInitScript(() => sessionStorage.setItem('nether-intro-seen', '1'));
  const share = new URL('projects/saathi/', BASE).href;
  const html = await (await ctx.request.get(share)).text();
  ok('share page carries the project title and description', /og:title" content="Saathi/.test(html) && /og:description/.test(html));
  await page.goto(share);
  await page.waitForFunction(() => location.hash === '#project/saathi' || document.querySelector('dialog.dialog')?.open, null, { timeout: 8000 });
  await page.waitForTimeout(1200);
  ok('share page opens the matching case study', await page.evaluate(() => document.querySelector('dialog.dialog')?.open && /Saathi/.test(document.querySelector('dialog.dialog h2, dialog.dialog h3')?.textContent ?? '')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.evaluate(() => { location.hash = '#project/nirdhoom'; });
  await page.waitForTimeout(900);
  ok('a #project link opens its case study on an already-open page', await page.evaluate(() => document.querySelector('dialog.dialog')?.open === true));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  ok('closing the case study resets the address', await page.evaluate(() => !location.hash.startsWith('#project/')));
  ok('footer build notes are present', (await page.locator('.build-notes li').count()) >= 4);
  await ctx.close();
}

// The 3D world: it must start, follow the scroll, and follow the day/night switch.
{
  const [ctx, page] = await open({ threed: true, viewport: { width: 1280, height: 720 } });
  await page.evaluate(() => sessionStorage.setItem('nether-intro-seen', '1'));
  await page.reload();
  await page.waitForFunction(() => document.documentElement.dataset.threed === 'on', null, { timeout: 60000 });
  const canvas = page.locator('canvas.world-canvas');
  ok('3D world starts and is hidden from assistive tech', (await canvas.getAttribute('aria-hidden')) === 'true' && (await canvas.getAttribute('data-state')) === 'ready');
  ok('3D world starts in the Nether fortress', (await canvas.getAttribute('data-world')) === 'nether');
  await page.waitForFunction(() => Number(document.querySelector('canvas.world-canvas').dataset.frames) > 3, null, { timeout: 20000 }).catch(() => {});
  ok('3D world draws frames', Number(await canvas.getAttribute('data-frames')) > 3);
  const stops = [['profile', 1], ['forge', 3], ['world', 5], ['contact', 6]];
  for (const [id, n] of stops) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
    await page.waitForFunction((n) => Math.abs(Number(document.querySelector('canvas.world-canvas').dataset.progress) - n) < 0.15, n, { timeout: 15000 }).catch(() => {});
    const p = Number(await canvas.getAttribute('data-progress'));
    ok(`camera reaches stop ${n} at the ${id} section`, Math.abs(p - n) < 0.25, `progress ${p}`);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => Number(document.querySelector('canvas.world-canvas').dataset.progress) < 0.1, null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);
  // villagers wander, and software rendering draws only a few frames a second: try a few spots of
  // bare ground and give each click time to be drawn before reading the result
  let dug = 0;
  for (const [cx, cy] of [[24, 640], [60, 700], [24, 560]]) {
    await page.mouse.click(cx, cy);
    await page.waitForFunction(() => Number(document.querySelector('canvas.world-canvas')?.dataset.dug ?? 0) >= 1, null, { timeout: 9000 }).catch(() => {});
    dug = Number((await canvas.getAttribute('data-dug')) ?? 0);
    if (dug >= 1) break;
  }
  ok('clicking bare ground digs a block out', dug >= 1, `dug ${dug}`);
  await page.getByRole('button', { name: /day|overworld|nether|night/i }).first().click();
  await page.waitForFunction(() => document.querySelector('canvas.world-canvas').dataset.world === 'overworld', null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('.explore-btn').click();
  await page.waitForTimeout(600);
  ok('Explore freely hides the page and shows the game HUD', await page.evaluate(() => document.documentElement.dataset.explore === 'on' && !!document.querySelector('.explore-hud .hotbar') && getComputedStyle(document.querySelector('main')).visibility === 'hidden'));
  const p0 = (await canvas.getAttribute('data-pos')) ?? '0,0,0';
  await page.keyboard.down('KeyW');
  // software rendering runs at a few frames a second, so wait for real movement rather than a fixed time
  // the camera can face any way after a portal trip, so measure distance walked, not one axis
  const [x0, , z0] = p0.split(',').map(Number);
  await page.waitForFunction(([x, z]) => {
    const [px, , pz] = (document.querySelector('canvas.world-canvas').dataset.pos ?? '0,0,0').split(',').map(Number);
    return Math.hypot(px - x, pz - z) > 1;
  }, [x0, z0], { timeout: 20000 }).catch(() => {});
  await page.keyboard.up('KeyW');
  const p1 = (await canvas.getAttribute('data-pos')) ?? '0,0,0';
  const [x1, , z1] = p1.split(',').map(Number);
  ok('W walks the player forward through the world', Math.hypot(x1 - x0, z1 - z0) > 1, `${p0} -> ${p1}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  ok('Escape returns to the page', await page.evaluate(() => document.documentElement.dataset.explore !== 'on' && getComputedStyle(document.querySelector('main')).visibility === 'visible'));
  await page.locator('.quick-btn').click();
  await page.waitForTimeout(500);
  ok('Quick view hides the 3D scenery and remembers the choice', await page.evaluate(() => document.documentElement.dataset.quick === 'on' && getComputedStyle(document.querySelector('canvas.world-canvas')).display === 'none' && localStorage.getItem('portfolio-quick') === 'on'));
  ok('Quick view leaves every section readable', (await page.locator('main section.section').count()) >= 5);
  await page.locator('.quick-btn').click();
  ok('3D view comes back', await page.evaluate(() => document.documentElement.dataset.quick === 'off'));
  // the canvas is rebuilt when 3D comes back, which software rendering does slowly
  await page.waitForFunction(() => document.querySelector('canvas.world-canvas')?.dataset.world === 'overworld', null, { timeout: 20000 }).catch(() => {});
  ok('3D world switches to the village after the portal trip', (await canvas.getAttribute('data-world')) === 'overworld', String(await canvas.getAttribute('data-world')));
  await ctx.close();
}

// Reduced motion still gets the 3D world, but it only redraws when the scroll position changes.
{
  const [ctx, page] = await open({ threed: true, viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.documentElement.dataset.threed === 'on', null, { timeout: 60000 });
  await page.waitForFunction(() => document.querySelector('canvas.world-canvas').dataset.built === 'yes', null, { timeout: 60000 });
  await page.waitForTimeout(600);
  const before = Number(await page.locator('canvas.world-canvas').getAttribute('data-frames'));
  await page.waitForTimeout(1500);
  const after = Number(await page.locator('canvas.world-canvas').getAttribute('data-frames'));
  ok('reduced motion: 3D world is static while idle', after - before <= 2, `${after - before} frames`);
  await ctx.close();
}

await browser.close();
await glBrowser.close();
ok('no console errors or warnings', errors.length === 0, errors.slice(0, 3).join(' | '));
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'} | ${r.name}${r.detail && !r.pass ? ` | ${r.detail}` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
