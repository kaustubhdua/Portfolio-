/**
 * Checks every external link in the site data and prints the ones that fail.
 * Needs network access, so it is not part of `npm run verify`:  npm run check:links
 */
import { projects, explored } from '../src/data/projects.js';
import { profile } from '../src/data/profile.js';

const urls = new Map();
const add = (label, url) => {
  if (url && /^https?:/.test(url)) urls.set(url, [...(urls.get(url) ?? []), label]);
};
for (const p of [...projects, ...explored]) {
  add(`${p.name} repo`, p.repo);
  add(`${p.name} live`, p.live);
  for (const item of p.evidence ?? []) add(`${p.name} evidence: ${item.label}`, item.url);
}
for (const [k, v] of Object.entries(profile.links)) add(`profile ${k}`, v);

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
