import { build, context } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const dist = path.join(root, 'dist');

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * One tiny page per project at /projects/<id>/ so a shared link shows that project's title,
 * summary and picture. The page sends people straight to the case study in the main app;
 * crawlers and link-preview bots read the tags and do not run the redirect.
 */
async function writeSharePages(siteUrl) {
  const { projects } = await import(pathToFileURL(path.join(root, 'src/data/projects.js')).href);
  for (const p of projects) {
    const title = `${p.name}: ${p.tagline} · Kaustubh Dua`;
    const url = siteUrl ? `${siteUrl}/projects/${p.id}/` : '';
    const image = siteUrl && p.image ? `${siteUrl}/${p.image}` : '';
    const target = `../../#project/${p.id}`;
    const tags = [
      `<meta property="og:type" content="article" />`,
      `<meta property="og:title" content="${esc(title)}" />`,
      `<meta property="og:description" content="${esc(p.summary)}" />`,
      url && `<meta property="og:url" content="${url}" />`,
      image && `<meta property="og:image" content="${image}" />`,
      `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
      image && `<meta name="twitter:image" content="${image}" />`,
      url && `<link rel="canonical" href="${url}" />`,
    ].filter(Boolean);
    const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(p.summary)}" />
    ${tags.join('\n    ')}
    <meta http-equiv="refresh" content="0; url=${target}" />
    <meta name="robots" content="noindex" />
    <meta name="color-scheme" content="dark" />
  </head>
  <body style="background:#0b0610;color:#eee;font-family:system-ui,sans-serif;padding:2rem">
    <p>Opening <a href="${target}" style="color:#ffb347">${esc(p.name)}</a>…</p>
    <script>location.replace(${JSON.stringify(target)});</script>
  </body>
</html>
`;
    await mkdir(path.join(dist, 'projects', p.id), { recursive: true });
    await writeFile(path.join(dist, 'projects', p.id, 'index.html'), page);
  }
}

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
        await writeSharePages(siteUrl);
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
