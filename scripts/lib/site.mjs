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
        const js = outputs.find((f) => f.endsWith('.js') && result.metafile.outputs[f].entryPoint);
        const css = outputs.find((f) => f.endsWith('.css'));
        if (!js || !css) throw new Error('Expected one JS and one CSS output from esbuild.');

        // SITE_URL wins; on Vercel the production domain is used automatically so link previews just work.
        const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
        const siteUrl = (process.env.SITE_URL ?? (vercelHost ? `https://${vercelHost}` : '')).replace(/\/+$/, '');
        let html = await readFile(path.join(root, 'index.html'), 'utf8');
        html = html
          .replaceAll('%SITE_URL%', siteUrl)
          .replace('<!--@STYLES-->', `<link rel="stylesheet" href="./${path.basename(css)}" />`)
          .replace('<!--@SCRIPTS-->', `<script type="module" src="./${path.basename(js)}"></script>`);
        await writeFile(path.join(dist, 'index.html'), html);
        // Crawlers need absolute URLs, so the sitemap and robots.txt sitemap line exist only when the site URL is known.
        if (siteUrl) {
          await writeFile(
            path.join(dist, 'sitemap.xml'),
            `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url></urlset>\n`,
          );
          await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
        }
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
    splitting: true,
    chunkNames: 'chunk-[hash]',
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
