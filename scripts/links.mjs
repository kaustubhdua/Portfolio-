/**
 * Checks every authored external destination in project, profile and blog data.
 * Needs network access, so it is not part of `npm run verify`: npm run check:links
 */
import { readdir, readFile } from 'node:fs/promises';
import { projects } from '../src/data/projects.js';
import { profile } from '../src/data/profile.js';
import { advancements } from '../src/data/advancements.js';

const urls = new Map();
const add = (label, url) => {
  if (url && /^https?:\/\//i.test(url)) urls.set(url, [...(urls.get(url) ?? []), label]);
};

for (const p of projects) {
  add(`${p.name} repo`, p.repo);
  add(`${p.name} live`, p.live);
  for (const item of p.evidence ?? []) add(`${p.name} evidence: ${item.label}`, item.url);
}
for (const [k, v] of Object.entries(profile.links)) add(`profile ${k}`, v);
for (const role of profile.roles ?? []) add(`role: ${role.org}`, role.url);
for (const item of profile.openSource ?? []) add(`upstream PR #${item.number}`, item.url);
for (const item of advancements) {
  for (const link of item.links ?? []) add(`${item.title}: ${link.label}`, link.url);
}

// Blog articles are authored content too, so verify their Markdown destinations.
const blogDir = new URL('../content/blog/', import.meta.url);
for (const file of await readdir(blogDir)) {
  if (!file.endsWith('.md')) continue;
  const markdown = await readFile(new URL(file, blogDir), 'utf8');
  for (const match of markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) {
    add(`blog ${file}: ${match[1]}`, match[2]);
  }
}

let failed = 0;
let uncertain = 0;
await Promise.all(
  [...urls].map(async ([url, labels]) => {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'portfolio-link-check' } });
      const finalHost = new URL(res.url).hostname;
      // A Vercel login redirect means the deployment is protected and visitors cannot open it.
      if (res.status === 404 || res.status === 410 || finalHost === 'vercel.com') throw new Error(`HTTP ${res.status}${finalHost === 'vercel.com' ? ' (Vercel login wall)' : ''}`);
      if (res.status >= 400) {
        uncertain++;
        console.log(`WARN  ${url}  [${labels.join(', ')}]  HTTP ${res.status}; automated access was refused or unavailable, so verify manually`);
        return;
      }
      const finalUrl = new URL(res.url).href;
      if (finalUrl !== url) console.log(`REDIRECT ${url} -> ${finalUrl} [${labels.join(', ')}]`);
      else console.log(`ok    ${url}`);
    } catch (err) {
      if (/HTTP (404|410)|Vercel login wall/.test(err.message)) {
        failed++;
        console.log(`FAIL  ${url}  [${labels.join(', ')}]  ${err.message}`);
      } else {
        uncertain++;
        console.log(`WARN  ${url}  [${labels.join(', ')}]  could not confirm automatically: ${err.message}`);
      }
    }
  }),
);
console.log(failed ? `\n${failed} confirmed broken link(s); ${uncertain} additional link(s) need manual verification.` : uncertain ? `\nNo confirmed broken links. ${uncertain} link(s) need manual verification because the destination blocked or did not answer the automated check.` : '\nAll links responded.');
process.exitCode = failed ? 1 : 0;
