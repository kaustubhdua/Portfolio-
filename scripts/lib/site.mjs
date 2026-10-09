import { build, context } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const dist = path.join(root, 'dist');

/** Rewrites index.html with the hashed bundle names after every esbuild run. */
function htmlPlugin() {
  return {
    name: 'write-html',
    setup(b) {
      b.onEnd(async (result) => {
        if (!result.metafile) return;
        const outputs = Object.keys(result.metafile.outputs);
        const js = outputs.find((f) => f.endsWith('.js'));
        const css = outputs.find((f) => f.endsWith('.css'));
        if (!js || !css) throw new Error('Expected one JS and one CSS output from esbuild.');

        const siteUrl = (process.env.SITE_URL ?? '').replace(/\/+$/, '');
        let html = await readFile(path.join(root, 'index.html'), 'utf8');
        html = html
          .replaceAll('%SITE_URL%', siteUrl)
          .replace('<!--@STYLES-->', `<link rel="stylesheet" href="./${path.basename(css)}" />`)
          .replace('<!--@SCRIPTS-->', `<script type="module" src="./${path.basename(js)}"></script>`);
        await writeFile(path.join(dist, 'index.html'), html);
      });
    },
  };
}

export function options(mode) {
  const production = mode === 'production';
  return {
    entryPoints: [path.join(root, 'src/main.jsx')],
    bundle: true,
    format: 'esm',
    target: ['es2022', 'chrome110', 'safari16', 'firefox110'],
    outdir: dist,
    entryNames: '[name]-[hash]',
    metafile: true,
    jsx: 'automatic',
    minify: production,
    sourcemap: !production,
    define: { 'process.env.NODE_ENV': JSON.stringify(mode) },
    // Images and fonts live in /public and are referenced by stable relative URLs.
    external: ['*.png', '*.woff', '*.woff2'],
    legalComments: 'none',
    logLevel: 'info',
    plugins: [htmlPlugin()],
  };
}

export async function prepareDist() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(path.join(root, 'public'), dist, { recursive: true });
}

export async function buildSite(mode = 'production') {
  await prepareDist();
  return build(options(mode));
}

export async function watchSite() {
  await prepareDist();
  const ctx = await context(options('development'));
  await ctx.watch();
  return ctx;
}
