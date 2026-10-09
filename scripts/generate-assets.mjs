/**
 * Generates every raster asset of the site (hero layers, textures, project thumbnails,
 * social card) procedurally. No dependencies: PNG encoding is done with node:zlib.
 *
 *   npm run assets
 *
 * Output is committed under public/, so this only needs to run when the art changes.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Raster, encodePng, hex, lerpColor, shade } from './lib/raster.mjs';
import * as S from './lib/scene.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicPath = (rel) => path.join(root, 'public', rel);
const sprites = JSON.parse(await readFile(path.join(root, 'src/data/sprites.json'), 'utf8'));
const glyphs = JSON.parse(await readFile(path.join(root, 'scripts/lib/glyphs.json'), 'utf8'));

async function save(rel, raster) {
  const file = publicPath(rel);
  await mkdir(path.dirname(file), { recursive: true });
  const png = encodePng(raster);
  await writeFile(file, png);
  console.log(`  ${rel.padEnd(30)} ${raster.w}x${raster.h}  ${(png.length / 1024).toFixed(1)} kB`);
}

function spriteRaster(name) {
  const rows = sprites.sprites[name];
  const r = new Raster(8, 8);
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.') r.set(x, y, hex(sprites.palette[ch]));
    });
  });
  return r;
}

function blendRect(r, x, y, w, h, color, alpha, feather = 0) {
  const c = hex(color);
  for (let yy = y; yy < y + h; yy++) {
    const edge = feather ? Math.min(1, (yy - y) / feather, (y + h - 1 - yy) / feather) : 1;
    for (let xx = x; xx < x + w; xx++) {
      if (r.inside(xx, yy)) r.set(xx, yy, lerpColor(r.get(xx, yy), c, alpha * edge));
    }
  }
}

function textWidth(text, scale) {
  return (text.length * 6 - 1) * scale;
}

function drawText(r, text, x, y, scale, color, shadow) {
  const upper = text.toUpperCase();
  [...upper].forEach((ch, i) => {
    const rows = glyphs[ch] ?? glyphs[' '];
    rows.forEach((row, gy) => {
      [...row].forEach((cell, gx) => {
        if (cell !== '#') return;
        const px = x + (i * 6 + gx) * scale;
        const py = y + gy * scale;
        if (shadow) r.rect(px + scale, py + scale, scale, scale, hex(shadow));
        r.rect(px, py, scale, scale, hex(color));
      });
    });
  });
}

const crimson = S.BIOMES.crimson;
const tile = S.portalTile();
const obsidian = S.obsidianTile();

console.log('Hero layers');
await save('img/hero/sky.png', S.sky(crimson));
await save('img/hero/far.png', S.far(crimson));
await save('img/hero/lava.png', S.lava());
await save('img/hero/mid.png', S.mid(crimson));
await save('img/hero/near.png', S.near(crimson));
await save('img/hero/fore.png', S.fore());

console.log('Textures');
await save('img/tex/portal-tile.png', tile);
await save('img/tex/obsidian.png', obsidian);

console.log('Project thumbnails');
const thumbs = [
  { id: 'nirdhoom', biome: 'crimson', seed: 101, sprite: 'sprout' },
  { id: 'saathi', biome: 'crimson', seed: 207, sprite: 'speech' },
  { id: 'jyc', biome: 'crimson', seed: 313, sprite: 'banner' },
  { id: 'smartwaste', biome: 'basalt', seed: 419, sprite: 'bin' },
  { id: 'adaptai', biome: 'wastes', seed: 523, sprite: 'chip' },
  { id: 'patchpilot', biome: 'basalt', seed: 631, sprite: 'shield' },
];

for (const t of thumbs) {
  const b = S.BIOMES[t.biome];
  const r = new Raster(S.W, S.H);
  r.blit(S.sky(b, t.seed), 0, 0);
  r.blit(S.far(b, t.seed + 1), 0, 0);
  r.blit(S.lava(t.seed + 2), 0, 0);
  r.blit(S.mid(b, t.seed + 3), 0, 0);

  // Floating item above the platform: glow, outline, sprite and a contact shadow.
  const sprite = spriteRaster(t.sprite);
  const scale = 6;
  const size = 8 * scale;
  const ex = S.CX - size / 2;
  const ey = 90;
  S.glowDisc(r, S.CX, ey + size / 2, 54, b.accent, 0.75);
  for (const [ox, oy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, 2], [-2, 2], [2, -2]]) {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (sprite.isOpaque(x, y)) r.rect(ex + x * scale + ox, ey + y * scale + oy, scale, scale, hex('#0b0610'));
      }
    }
  }
  r.blit(sprite, ex, ey, scale);
  for (let x = -22; x <= 22; x++) {
    const h = Math.abs(x) < 14 ? 2 : 1;
    for (let k = 0; k < h; k++) r.set(S.CX + x, S.PLATFORM_Y - 1 + k, hex('#1a0a10'));
  }

  // Soft vignette so thumbnails sit comfortably on dark cards.
  for (let y = 0; y < S.H; y++) {
    for (let x = 0; x < S.W; x++) {
      const d = Math.hypot((x - S.CX) / 190, (y - 90) / 110);
      const f = 1 - Math.max(0, d - 0.6) * 0.75;
      const c = r.get(x, y);
      r.set(x, y, shade(c, Math.max(0.35, f)));
    }
  }
  await save(`img/projects/${t.id}.png`, r);
}

console.log('Social card');
{
  const scene = new Raster(S.W, S.H);
  scene.blit(S.sky(crimson), 0, 0);
  scene.blit(S.far(crimson), 0, 0);
  scene.blit(S.lava(), 0, 0);
  scene.blit(S.mid(crimson), 0, 0);
  S.drawPortal(scene, S.CX, S.PLATFORM_Y, tile, obsidian);
  scene.blit(S.near(crimson), 0, 0);
  scene.blit(S.fore(), 0, 0);

  const og = new Raster(1200, 630);
  og.blit(scene.scaled(4), -40, -90);
  blendRect(og, 0, 96, 1200, 330, '#0b0610', 0.62, 40);

  const title = 'KAUSTUBH DUA';
  drawText(og, title, Math.round((1200 - textWidth(title, 10)) / 2), 150, 10, '#f1e7ea', '#3d0a14');
  const sub = 'ECM STUDENT · JIIT NOIDA';
  drawText(og, sub, Math.round((1200 - textWidth(sub, 4)) / 2), 262, 4, '#ffb347', '#3d0a14');
  const tag = 'AI · DATA · SYSTEMS · PRODUCT';
  drawText(og, tag, Math.round((1200 - textWidth(tag, 3)) / 2), 322, 3, '#c9b8c0', '#1b0a10');
  await save('og-image.png', og);
}

console.log('Static files');
await writeFile(
  publicPath('favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">
  <rect x="3" y="1" width="10" height="14" fill="#1b1128"/>
  <rect x="3" y="1" width="10" height="1" fill="#2e1c47"/>
  <rect x="5" y="3" width="6" height="10" fill="#8b3dff"/>
  <rect x="5" y="3" width="6" height="1" fill="#c58bff"/>
  <rect x="7" y="5" width="2" height="2" fill="#c58bff"/>
  <rect x="6" y="9" width="2" height="2" fill="#5a22b8"/>
  <rect x="9" y="8" width="1" height="3" fill="#c58bff"/>
  <rect x="2" y="13" width="12" height="2" fill="#c22f43"/>
  <rect x="2" y="13" width="12" height="1" fill="#ff6a1a"/>
</svg>
`,
);
await writeFile(publicPath('robots.txt'), 'User-agent: *\nAllow: /\n');
console.log('Done.');
