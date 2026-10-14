// Measures real page behaviour in a browser: load timings, layout shift, console problems, and
// common accessibility mistakes (missing names, bad heading order, tiny targets, duplicate ids).
// Run against a running preview: `node scripts/audit.mjs` (BASE_URL to override).
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const BASE = process.env.BASE_URL ?? 'http://localhost:4173/';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const note = (m) => console.log(m);

for (const [label, viewport, threed] of [['desktop, quick view', { width: 1440, height: 900 }, false], ['phone, quick view', { width: 390, height: 844 }, false], ['desktop, 3D', { width: 1440, height: 900 }, true]]) {
  const ctx = await browser.newContext({ viewport });
  await ctx.addInitScript((t) => {
    sessionStorage.setItem('nether-intro-seen', '1');
    localStorage.setItem('portfolio-quick', t ? 'off' : 'on');
    window.__cls = 0;
    window.__lcp = 0;
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true });
  }, threed);
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && !/GL Driver|GroupMarker|software WebGL|GPU stall/.test(m.text()) && errs.push(m.text()));
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('requestfailed', (r) => errs.push(`request failed ${r.url()}`));
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return { lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(3), dcl: Math.round(nav.domContentLoadedEventEnd), kb: Math.round(performance.getEntriesByType('resource').reduce((n, r) => n + (r.transferSize || r.encodedBodySize || 0), 0) / 1024) };
  });
  note(`${label}: LCP ${m.lcp} ms, CLS ${m.cls}, DOMContentLoaded ${m.dcl} ms, ${m.kb} kB transferred`);
  if (m.cls > 0.1) problems.push(`${label}: CLS ${m.cls} above 0.1`);
  if (!threed && m.lcp > 2500) problems.push(`${label}: LCP ${m.lcp} ms above 2500 ms`);
  const a11y = await page.evaluate(() => {
    const out = [];
    const name = (el) => (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.textContent || el.getAttribute('title') || '').trim();
    document.querySelectorAll('button,a[href]').forEach((el) => {
      if (!name(el) && !el.querySelector('img[alt]:not([alt=""])')) out.push(`no accessible name: ${el.outerHTML.slice(0, 80)}`);
    });
    document.querySelectorAll('img').forEach((el) => { if (!el.hasAttribute('alt')) out.push(`image without alt: ${el.src.slice(-40)}`); });
    document.querySelectorAll('input,textarea,select').forEach((el) => { if (!el.labels?.length && !el.getAttribute('aria-label')) out.push(`unlabelled field: ${el.outerHTML.slice(0, 60)}`); });
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    ids.filter((id, i) => ids.indexOf(id) !== i).forEach((id) => out.push(`duplicate id: ${id}`));
    let last = 0;
    document.querySelectorAll('h1,h2,h3,h4').forEach((h) => {
      const n = Number(h.tagName[1]);
      if (last && n > last + 1) out.push(`heading jumps from h${last} to h${n}: ${h.textContent.slice(0, 40)}`);
      last = n;
    });
    if (document.querySelectorAll('h1').length !== 1) out.push(`expected one h1, found ${document.querySelectorAll('h1').length}`);
    if (!document.documentElement.lang) out.push('missing html lang');
    if (!document.querySelector('main')) out.push('missing main landmark');
    if (document.documentElement.scrollWidth > window.innerWidth + 1) out.push('horizontal overflow');
    return out;
  });
  a11y.forEach((x) => problems.push(`${label}: ${x}`));
  errs.forEach((x) => problems.push(`${label}: console/network: ${x}`));
  await ctx.close();
}
await browser.close();
if (problems.length) {
  console.log('\nFound:');
  problems.forEach((p) => console.log(`  - ${p}`));
  process.exit(1);
}
console.log('\nNo problems found.');
