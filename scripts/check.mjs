/**
 * Static integrity check of the production build in dist/.
 * - every local asset referenced by the HTML and CSS exists
 * - no unresolved %SITE_URL% placeholder or debug statements ship
 * - required metadata is present
 * - total JS and CSS stay inside a size budget
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { dist } from './lib/site.mjs';

const problems = [];
const fail = (msg) => problems.push(msg);

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html is missing. Run `npm run build` first.');
  process.exit(1);
}

const html = readFileSync(path.join(dist, 'index.html'), 'utf8');

for (const [name, re] of [
  ['title', /<title>[^<]+<\/title>/],
  ['description', /<meta\s+name="description"\s+content="[^"]{40,}"/],
  ['og:title', /property="og:title"/],
  ['og:image', /property="og:image" content="[^"]+og-image\.png"/],
  ['twitter:card', /name="twitter:card"/],
  ['favicon', /rel="icon"/],
  ['viewport', /name="viewport"/],
  ['lang', /<html lang="en">/],
]) {
  if (!re.test(html)) fail(`index.html is missing: ${name}`);
}
if (html.includes('%SITE_URL%')) fail('Unreplaced %SITE_URL% placeholder in index.html');
if (html.includes('<!--@')) fail('Unreplaced build marker in index.html');

const refs = new Set();
const collect = (text, re) => {
  for (const m of text.matchAll(re)) refs.add(m[1]);
};
collect(html, /(?:href|src)="(\.\/[^"]+)"/g);

const files = readdirSync(dist);
let jsBytes = 0;
let cssBytes = 0;
for (const f of files) {
  const full = path.join(dist, f);
  if (!statSync(full).isFile()) continue;
  const text = f.endsWith('.js') || f.endsWith('.css') ? readFileSync(full, 'utf8') : '';
  if (f.endsWith('.js')) {
    jsBytes += gzipSync(text).length;
    if (/\bdebugger\b/.test(text)) fail(`${f} contains a debugger statement`);
    if (/console\.(log|debug)\(/.test(text)) fail(`${f} contains console.log/debug calls`);
  }
  if (f.endsWith('.css')) {
    cssBytes += gzipSync(text).length;
    collect(text, /url\(["']?([^"')]+?)["']?\)/g);
  }
}

for (const ref of refs) {
  if (/^(data:|https?:|#)/.test(ref)) continue;
  const clean = ref.replace(/^\.\//, '').split(/[?#]/)[0];
  if (!existsSync(path.join(dist, clean))) fail(`Referenced file does not exist in dist: ${ref}`);
}

const budget = { js: 130 * 1024, css: 20 * 1024 };
if (jsBytes > budget.js) fail(`JS is ${(jsBytes / 1024).toFixed(1)} kB gzip, budget is ${budget.js / 1024} kB`);
if (cssBytes > budget.css) fail(`CSS is ${(cssBytes / 1024).toFixed(1)} kB gzip, budget is ${budget.css / 1024} kB`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`Static check passed: ${refs.size} references resolved, JS ${(jsBytes / 1024).toFixed(1)} kB gzip, CSS ${(cssBytes / 1024).toFixed(1)} kB gzip.`);
