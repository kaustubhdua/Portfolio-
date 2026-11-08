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
import { pathToFileURL } from 'node:url';
import { dist } from './lib/site.mjs';

const { profile } = await import(pathToFileURL(path.resolve('src/data/profile.js')).href);
const { advancements } = await import(pathToFileURL(path.resolve('src/data/advancements.js')).href);
const { skillGroups } = await import(pathToFileURL(path.resolve('src/data/skills.js')).href);
const { projects, getProjectStackGroups } = await import(pathToFileURL(path.resolve('src/data/projects.js')).href);
const { tips, splashes } = await import(pathToFileURL(path.resolve('src/data/biomes.js')).href);

const problems = [];
const fail = (msg) => problems.push(msg);
const coreSkills = skillGroups.flatMap((group) => group.items);
if (coreSkills.length !== 15) fail(`Expected 15 curated core skills, found ${coreSkills.length}`);
if (new Set(coreSkills.map((skill) => skill.id)).size !== coreSkills.length) fail('Skill inventory contains duplicate IDs');
const featuredProjects = projects.filter((project) => project.flagship);
if (featuredProjects.length !== 5) fail(`Expected five selected case studies, found ${featuredProjects.length}`);
for (const project of featuredProjects) {
  const technologies = project.stack ?? [];
  const grouped = getProjectStackGroups(technologies).flatMap((group) => group.items);
  if (!technologies.length) fail(`Featured project "${project.name}" has no technology inventory`);
  if (new Set(technologies).size !== technologies.length) fail(`Featured project "${project.name}" repeats a technology`);
  if (grouped.length !== technologies.length || technologies.some((technology) => !grouped.includes(technology))) {
    fail(`Featured project "${project.name}" has technologies missing from the shared stack taxonomy`);
  }
}
const technologyAuditPath = path.resolve('docs/PROJECT_TECHNOLOGY_AUDIT.md');
if (!existsSync(technologyAuditPath)) fail('The complete project technology audit is missing');
else {
  const technologyAudit = readFileSync(technologyAuditPath, 'utf8');
  const auditedProjects = [...technologyAudit.matchAll(/^### (?:[0-9]+)\./gm)].length;
  if (auditedProjects !== 16) fail(`Expected a 16-project technology audit, found ${auditedProjects}`);
  if (!technologyAudit.includes('## The portfolio application itself')) fail('Technology audit is missing the portfolio application inventory');
  if (!technologyAudit.includes('## Source verification record')) fail('Technology audit is missing its source verification record');
}
const excludedProjectNames = ['AkashChalak', 'Adapt AI', 'GenomeGuard', 'JYC Website', 'GitGlobe', 'BharatSim', 'JIIT Toppers'];
for (const message of [...tips, ...splashes]) {
  for (const name of excludedProjectNames) {
    if (message.toLowerCase().includes(name.toLowerCase())) fail(`Immersive copy exposes an unselected project: ${name}`);
  }
}
for (const unusedArt of ['img/projects/adaptai.png', 'img/projects/day/adaptai.png', 'img/projects/jyc.png', 'img/projects/day/jyc.png']) {
  if (existsSync(path.join(dist, unusedArt))) fail(`Unselected project artwork still ships: ${unusedArt}`);
}

const allowedAdvancementGroups = new Set(['certifications', 'programs']);
for (const item of advancements) {
  if (!allowedAdvancementGroups.has(item.group)) fail(`Advancement "${item.id}" has no valid group`);
}
for (const item of advancements.filter((entry) => /hackathon|participat|certificate of merit/i.test(`${entry.category} ${entry.text}`))) {
  if (item.group === 'certifications') fail(`Participation item "${item.id}" must not be listed as a certification`);
}
for (const requiredGroup of ['certifications', 'programs']) {
  if (!advancements.some((item) => item.group === requiredGroup)) fail(`Experience section is missing group: ${requiredGroup}`);
}

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

// The blog: every page needs a title, description and h1, and every relative link or asset must exist.
const blogDir = path.join(dist, 'blog');
if (!profile.blogEnabled && process.env.BLOG_PREVIEW !== '1') {
  if (existsSync(blogDir)) fail('dist/blog exists while the blog is switched off (blogEnabled is false)');
} else if (!existsSync(path.join(blogDir, 'index.html'))) fail('dist/blog/index.html is missing');
else {
  const pages = [path.join(blogDir, 'index.html')];
  for (const d of readdirSync(blogDir)) {
    const f = path.join(blogDir, d, 'index.html');
    if (statSync(path.join(blogDir, d)).isDirectory() && existsSync(f)) pages.push(f);
  }
  for (const f of pages) {
    const page = readFileSync(f, 'utf8');
    const rel = path.relative(dist, f);
    if (!/<title>[^<]+<\/title>/.test(page)) fail(`${rel} has no title`);
    if (!/<meta\s+name="description"\s+content="[^"]{20,}"/.test(page)) fail(`${rel} has no description`);
    if ((page.match(/<h1[\s>]/g) ?? []).length !== 1) fail(`${rel} must have exactly one h1`);
    for (const m of page.matchAll(/(?:href|src)="(\.{1,2}\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
      const target = path.resolve(path.dirname(f), m[1]);
      const resolved = existsSync(target) && statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
      if (!existsSync(resolved)) fail(`${rel} links to a missing file: ${m[1]}`);
    }
  }
}

// Raised from 160 kB on purpose: the 3D engine and skills list left no headroom for new work.
const budget = { js: 180 * 1024, css: 20 * 1024 };
if (jsBytes > budget.js) fail(`JS is ${(jsBytes / 1024).toFixed(1)} kB gzip, budget is ${budget.js / 1024} kB`);
if (cssBytes > budget.css) fail(`CSS is ${(cssBytes / 1024).toFixed(1)} kB gzip, budget is ${budget.css / 1024} kB`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`Static check passed: ${refs.size} references resolved, JS ${(jsBytes / 1024).toFixed(1)} kB gzip, CSS ${(cssBytes / 1024).toFixed(1)} kB gzip.`);
