/**
 * Offline "chat" that answers from this site's own data files. There is no language model and
 * no network call: commands and keywords are matched deterministically, in the same spirit as
 * the intent router described in the Saathi README. A reply is a list of lines, and each line
 * is a list of parts: plain strings or { href, label } links.
 */
import { profile } from '../data/profile.js';
import { projects, explored } from '../data/projects.js';
import { skillGroups } from '../data/skills.js';
import { advancements } from '../data/advancements.js';

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export const WELCOME = [
  ['Welcome to the Nether chat. Answers come from this site’s own data. No AI model is involved.'],
  ['Type /help, or tap a suggestion below.'],
];

export const SUGGESTIONS = ['/projects', '/skills', '/about', '/contact', '/help'];

const link = (href, label) => ({ href, label });

function findProject(query) {
  const q = norm(query);
  if (!q) return null;
  return projects.find((p) => norm(p.name) === q || p.id === q) ?? projects.find((p) => norm(p.name).includes(q) || q.includes(p.id));
}

function findSkill(query) {
  const q = norm(query);
  if (!q) return null;
  const items = skillGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));
  return items.find((i) => norm(i.name) === q || i.id === q) ?? items.find((i) => q.length > 2 && (norm(i.name).includes(q) || q.includes(i.id)));
}

function projectLines(p) {
  const out = [[`${p.name}: ${p.tagline}.`], [p.summary], [`Stack: ${p.stack.join(', ')}.`], [`Status: ${p.status}`]];
  const links = [link(p.repo, 'GitHub')];
  if (p.live) links.push(' · ', link(p.live, 'Live demo'));
  out.push(links);
  return out;
}

function skillLines(item) {
  return [[`${item.name} (${item.group}): ${item.used}`]];
}

const commands = {
  help: () => [
    ['/about  who I am'],
    ['/projects  featured builds'],
    ['/project <name>  details, e.g. /project patchpilot'],
    ['/skills  the inventory'],
    ['/skill <name>  where I used it, e.g. /skill docker'],
    ['/advancements  certificates, hackathons and milestones'],
    ['/roles  clubs, teams and volunteering'],
    ['/blog  writing'],
    ['/technoblade  the monument at the end of the road'],
    ['/contact  email, WhatsApp and links'],
    ['/clear  empty the chat'],
  ],
  about: () => [
    [`${profile.name}: ${profile.program} student at ${profile.institution}.`],
    [profile.about[1]],
    ...[...profile.roles, ...profile.volunteering].map((r) => [`${r.org}: ${r.role}.`]),
    [`Looking for: ${profile.openTo}`],
    [`Motto: ${profile.motto}`],
  ],
  roles: () => [...profile.roles, ...profile.volunteering].map((r) => [`${r.org} (${r.full}): ${r.role}. ${r.note}`]),
  technoblade: () => [
    ['At the end of the road, in the village and in the Nether, a stone obelisk with a glowing crown stands for Technoblade, my favourite YouTuber.'],
    ['Technoblade never dies.'],
  ],
  blog: () => [['Notes on what I build and learn: ', link('blog/', 'open the blog')]],
  projects: () => [
    ...projects.map((p) => [`${p.name}: ${p.tagline}`]),
    ['Type /project <name> for details.'],
    [`Also on GitHub: ${explored.map((e) => e.name).join(', ')}.`],
  ],
  skills: () => [...skillGroups.map((g) => [`${g.title}: ${g.items.map((i) => i.name).join(', ')}`]), ['Type /skill <name> to see where I used one.']],
  advancements: () => advancements.map((a) => [`${a.title}: ${a.text}`]),
  contact: () => [
    [`Email: `, link(`mailto:${profile.links.email}`, profile.links.email)],
    ['WhatsApp: ', link(profile.links.whatsapp, profile.links.whatsappNumber)],
    ['GitHub: ', link(profile.links.github, 'github.com/kaustubhdua')],
    ['LinkedIn: ', link(profile.links.linkedin, 'linkedin.com/in/kaustubh-dua-2b5a76416')],
  ],
};

const UNKNOWN = [['I only know what is on this site. Try /help.']];

/** Returns { lines } for a reply, or { clear: true } for /clear. */
export function reply(input) {
  const text = input.trim();
  if (!text) return { lines: [] };

  if (text.startsWith('/')) {
    const [name, ...rest] = text.slice(1).split(/\s+/);
    const arg = rest.join(' ');
    const cmd = name.toLowerCase();
    if (cmd === 'clear') return { clear: true };
    if (cmd === 'project') {
      const p = findProject(arg);
      return { lines: p ? projectLines(p) : [[arg ? `No project called "${arg}". Try /projects.` : 'Usage: /project <name>']] };
    }
    if (cmd === 'skill') {
      const s = findSkill(arg);
      return { lines: s ? skillLines(s) : [[arg ? `No skill called "${arg}". Try /skills.` : 'Usage: /skill <name>']] };
    }
    if (commands[cmd]) return { lines: commands[cmd]() };
    return { lines: [[`Unknown command: /${cmd}. Try /help.`]] };
  }

  // Plain words: a project or skill name wins, then a few topic keywords.
  const words = text.toLowerCase();
  const project = findProject(text) ?? projects.find((p) => words.includes(p.name.toLowerCase()));
  if (project) return { lines: projectLines(project) };
  const skill = findSkill(text);
  if (skill) return { lines: skillLines(skill) };
  if (/(contact|email|mail|reach|hire|linkedin|github|whatsapp|phone|number)/.test(words)) return { lines: commands.contact() };
  if (/(blog|write|writing|article|post)/.test(words)) return { lines: commands.blog() };
  if (/(club|team|role|member|jyc|aiml|tronics|nss|volunteer)/.test(words)) return { lines: commands.roles() };
  if (/(project|built|build|work|portfolio)/.test(words)) return { lines: commands.projects() };
  if (/(skill|stack|tech|tool|language)/.test(words)) return { lines: commands.skills() };
  if (/(about|who|study|student|college|education|ecm|jiit)/.test(words)) return { lines: commands.about() };
  if (/(achievement|advancement|milestone|certificate|certification|hackathon|isro|jpmorgan|cs50)/.test(words)) return { lines: commands.advancements() };
  if (/(help|command)/.test(words)) return { lines: commands.help() };
  return { lines: UNKNOWN };
}
