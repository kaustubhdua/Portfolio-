/**
 * Renders still images of the 3D worlds, one per stop of the scroll journey, for visitors whose
 * browser cannot run WebGL 2. The page cross-fades between them as you scroll, so even the 2D
 * fallback "moves through" the village or the fortress.
 *
 *   node scripts/render-posters.mjs      (needs playwright; uses software WebGL, takes a few minutes)
 */
import { build } from 'esbuild';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = await mkdtemp(path.join(os.tmpdir(), 'posters-'));
const ids = ['spawn', 'profile', 'inventory', 'forge', 'advancements', 'world', 'contact'];

await writeFile(
  path.join(tmp, 'entry.js'),
  `import { createWorldRenderer } from ${JSON.stringify(path.join(root, 'src/lib/voxel/renderer.js'))};
const r = createWorldRenderer(document.getElementById('c'), { sections: ${JSON.stringify(ids)}, reduced: true });
window.R = r;
r.setWorld(new URLSearchParams(location.search).get('w'));
r.start();`,
);
await build({ entryPoints: [path.join(tmp, 'entry.js')], bundle: true, format: 'iife', outfile: path.join(tmp, 'out.js'), logLevel: 'error' });
await writeFile(
  path.join(tmp, 'index.html'),
  `<!doctype html><body style="margin:0"><canvas id="c" style="position:fixed;inset:0;width:100vw;height:100vh"></canvas>${ids.map((i) => `<div id="${i}" style="height:100vh"></div>`).join('')}<script src="out.js"></script>`,
);

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const out = path.join(root, 'public/img/world');
await mkdir(out, { recursive: true });
for (const world of ['overworld', 'nether']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`file://${tmp}/index.html?w=${world}`);
  await page.waitForFunction(() => document.getElementById('c').dataset.built === 'yes', null, { timeout: 120000 });
  for (let i = 0; i < ids.length; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 720);
    await page.waitForFunction((n) => Math.abs(Number(document.getElementById('c').dataset.progress) - n) < 0.01, i, { timeout: 30000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(out, `${world}-${i}.jpg`), type: 'jpeg', quality: 74 });
    console.log('wrote', `${world}-${i}.jpg`);
  }
  await page.close();
}
await browser.close();
await rm(tmp, { recursive: true, force: true });
