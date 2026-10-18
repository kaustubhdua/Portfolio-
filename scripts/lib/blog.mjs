import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { esc, parseFrontMatter, render, wordCount } from './markdown.mjs';

/**
 * Builds the blog: every content/blog/*.md becomes /blog/<slug>/ and a list page at /blog/.
 * Pages are plain static HTML (no JavaScript needed to read them) in the same look as the site,
 * share public/blog.css, follow the visitor's day or night world, and carry the tags that link
 * previews and search engines read. Posts marked `draft: true` are left out unless BLOG_DRAFTS=1.
 *
 * Front matter: title, date (YYYY-MM-DD), summary, tags (comma list), draft.
 */

const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const THEME_SCRIPT = `try{if(localStorage.getItem('portfolio-world')==='overworld')document.documentElement.dataset.theme='overworld'}catch(e){}`;

export async function loadPosts(root) {
  const dir = path.join(root, 'content', 'blog');
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  const posts = [];
  for (const file of files) {
    const { meta, body } = parseFrontMatter(await readFile(path.join(dir, file), 'utf8'));
    const slug = file.replace(/\.md$/, '');
    if (!meta.title || !/^\d{4}-\d{2}-\d{2}$/.test(meta.date ?? '')) {
      throw new Error(`content/blog/${file} needs a title and a date: YYYY-MM-DD in its front matter.`);
    }
    if (meta.draft === 'true' && process.env.BLOG_DRAFTS !== '1') continue;
    posts.push({
      slug,
      title: meta.title,
      date: meta.date,
      summary: meta.summary ?? '',
      tags: meta.tags ?? [],
      minutes: Math.max(1, Math.round(wordCount(body) / 200)),
      html: render(body),
    });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

export async function writeBlog({ root, dist, siteUrl }) {
  const { profile } = await import(pathToFileURL(path.join(root, 'src/data/profile.js')).href);
  const posts = await loadPosts(root);
  const urls = [];

  const page = ({ base, title, description, canonical, type = 'website', body, jsonld, image }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    ${canonical ? `<meta property="og:url" content="${canonical}" />\n    <link rel="canonical" href="${canonical}" />` : ''}
    ${image ? `<meta property="og:image" content="${image}" />\n    <meta name="twitter:image" content="${image}" />` : ''}
    <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
    ${siteUrl ? `<link rel="alternate" type="application/rss+xml" title="Kaustubh Dua: blog" href="${siteUrl}/blog/feed.xml" />` : ''}
    <meta name="color-scheme" content="dark light" />
    <link rel="icon" href="${base}favicon.svg" type="image/svg+xml" />
    <link rel="preload" href="${base}fonts/nether-pixel.woff" as="font" type="font/woff" crossorigin />
    <link rel="stylesheet" href="${base}blog.css" />
    <script>${THEME_SCRIPT}</script>
    ${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
  </head>
  <body>
    <a class="skip" href="#main">Skip to the content</a>
    <header class="top">
      <a class="brand" href="${base}" aria-label="Back to the portfolio">
        <img src="${base}img/avatar-64.png" width="40" height="40" alt="" />
        <span class="pixel">Kaustubh Dua</span>
      </a>
      <nav aria-label="Site">
        <a href="${base}">Portfolio</a>
        <a href="${base}blog/" ${title.startsWith('Blog') ? 'aria-current="page"' : ''}>Blog</a>
        <a href="${base}#contact">Contact</a>
      </nav>
    </header>
    <main id="main" class="wrap">
${body}
    </main>
    <footer class="foot">
      <p>&copy; ${new Date().getFullYear()} ${esc(profile.name)} · Pixel art generated in-house · Not affiliated with Mojang or Microsoft</p>
      <p>
        <a href="${esc(profile.links.github)}" rel="noopener noreferrer">GitHub</a> ·
        <a href="${esc(profile.links.linkedin)}" rel="noopener noreferrer">LinkedIn</a> ·
        <a href="mailto:${esc(profile.links.email)}">Email</a> ·
        <a href="${esc(profile.links.whatsapp)}" rel="noopener noreferrer">WhatsApp</a>
      </p>
    </footer>
  </body>
</html>
`;

  const card = (p, base) => `        <li class="card">
          <p class="meta"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${p.minutes} min read</p>
          <h2><a href="${base}blog/${p.slug}/">${esc(p.title)}</a></h2>
          <p>${esc(p.summary)}</p>
          ${p.tags.length ? `<ul class="tags" aria-label="Tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
        </li>`;

  // ---- the list page
  const indexUrl = siteUrl ? `${siteUrl}/blog/` : '';
  const indexDescription = 'Notes from Kaustubh Dua on what he builds and learns: backend systems, data, local AI and hackathons.';
  await mkdir(path.join(dist, 'blog'), { recursive: true });
  await writeFile(
    path.join(dist, 'blog', 'index.html'),
    page({
      base: '../',
      title: 'Blog · Kaustubh Dua',
      description: indexDescription,
      canonical: indexUrl,
      image: siteUrl ? `${siteUrl}/og-image.png` : '',
      body: `      <header class="head">
        <p class="kicker pixel">The Library</p>
        <h1 class="pixel">Blog</h1>
        <p class="lead">Notes on what I build and learn: backend systems, data, local AI and hackathons.</p>
      </header>
      ${
        posts.length
          ? `<ul class="cards">\n${posts.map((p) => card(p, '../')).join('\n')}\n      </ul>`
          : '<p class="empty">The first post is on its way. Until then, the projects are on the <a href="../#forge">portfolio</a>.</p>'
      }`,
    }),
  );
  if (indexUrl) urls.push(indexUrl);

  // ---- one page per post
  for (const p of posts) {
    const url = siteUrl ? `${siteUrl}/blog/${p.slug}/` : '';
    const others = posts.filter((o) => o.slug !== p.slug).slice(0, 3);
    await mkdir(path.join(dist, 'blog', p.slug), { recursive: true });
    await writeFile(
      path.join(dist, 'blog', p.slug, 'index.html'),
      page({
        base: '../../',
        title: `${p.title} · Kaustubh Dua`,
        description: p.summary || indexDescription,
        canonical: url,
        type: 'article',
        image: siteUrl ? `${siteUrl}/og-image.png` : '',
        jsonld: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.summary,
          datePublished: p.date,
          author: { '@type': 'Person', name: profile.name, url: profile.links.github },
          ...(url ? { mainEntityOfPage: url } : {}),
        },
        body: `      <article class="post">
        <p class="back"><a href="../">&larr; All posts</a></p>
        <header class="head">
          <p class="meta"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${p.minutes} min read</p>
          <h1 class="pixel">${esc(p.title)}</h1>
          ${p.summary ? `<p class="lead">${esc(p.summary)}</p>` : ''}
          ${p.tags.length ? `<ul class="tags" aria-label="Tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
        </header>
        <div class="prose">
${p.html}
        </div>
        <aside class="author">
          <img src="../../img/avatar-64.png" width="64" height="64" alt="" />
          <div>
            <p class="pixel">${esc(profile.name)}</p>
            <p>${esc(profile.program)} student at JIIT Noida. Talk to me on <a href="${esc(profile.links.whatsapp)}" rel="noopener noreferrer">WhatsApp</a>, by <a href="mailto:${esc(profile.links.email)}">email</a> or on <a href="${esc(profile.links.linkedin)}" rel="noopener noreferrer">LinkedIn</a>.</p>
          </div>
        </aside>
      </article>
      ${
        others.length
          ? `<section class="more" aria-labelledby="more-h"><h2 id="more-h" class="pixel">More posts</h2><ul class="cards">\n${others.map((o) => card(o, '../../')).join('\n')}\n      </ul></section>`
          : ''
      }`,
      }),
    );
    if (url) urls.push(url);
  }

  // ---- RSS, only when absolute URLs are known
  if (siteUrl) {
    const items = posts
      .map(
        (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${siteUrl}/blog/${p.slug}/</link>
      <guid>${siteUrl}/blog/${p.slug}/</guid>
      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.summary)}</description>
    </item>`,
      )
      .join('\n');
    await writeFile(
      path.join(dist, 'blog', 'feed.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n    <title>Kaustubh Dua: blog</title>\n    <link>${siteUrl}/blog/</link>\n    <description>${esc(indexDescription)}</description>\n${items}\n</channel></rss>\n`,
    );
  }
  return { urls, count: posts.length };
}
