/**
 * Identity and copy. Everything here comes from the public GitHub profile and
 * profile README of kaustubhdua, the owner's public LinkedIn posts and certificates, and
 * facts the owner stated directly (graduation year 2029 and campus roles).
 * Nothing is invented: when something is not published (grades, scores, rankings) it is left out.
 */
export const profile = {
  // Four edited posts are ready; expose the static blog and its RSS feed.
  blogEnabled: true,
  name: 'Kaustubh Dua',
  kicker: 'ECM student · JIIT Noida',
  role: 'Software Engineering Student · Full-Stack & Applied AI',
  intro:
    'I build full-stack software and applied-AI systems, with a focus on backend reliability, useful data workflows and interfaces people can actually use. I contribute to open-source infrastructure and care about clear system boundaries, honest product status and tests for failure paths.',
  stack: ['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'OR-Tools'],
  program: 'Electronics & Computer Engineering (ECM)',
  institution: 'Jaypee Institute of Information Technology (JIIT), Noida',
  graduation: '2029',
  year: '2nd year of a 4-year course',
  /** What the owner is looking for. Chosen from the public profile: backend and full-stack work with AI and data. */
  openTo: 'Software engineering internships in full-stack, backend and applied AI or data work.',
  about: [
    'I’m an Electronics & Computer Engineering student at JIIT Noida, focused on software engineering, full-stack product development and applied AI.',
    'I like turning messy workflows into dependable tools: clear APIs, careful data handling, usable interfaces and tests that cover failure paths.',
  ],
  motto: 'Build thoughtfully. Verify everything.',
  /** Selected campus leadership roles most relevant to software engineering and open source. */
  roles: [
    {
      org: 'Nexus Spring of Code (NSoC)',
      full: 'Open-source program',
      role: 'Campus Ambassador · Winter Edition 2026 · 15–30 Oct',
      note: 'Selected for the Outreach & Relations team of Nexus Spring of Code Winter Edition 2026. The offer letter lists a remote term from 15–30 October 2026; this entry does not imply an extension beyond that period.',
      url: 'https://www.nsoc.in/',
    },
    {
      org: 'JIIT Youth Club (JYC) · Tech Vertical',
      full: 'JIIT Noida',
      role: 'Member, Tech and Management team',
      note: 'Built and iterated the club’s public website for its clubs, events, gallery and recruitment experience.',
      url: 'https://github.com/kaustubhdua/JYC-Website2',
    },
  ],
  openSource: [
    { number: 1156, title: 'PostgreSQL 18 local volume compatibility', note: 'Aligned the managed local volume mount with the PostgreSQL 18 image contract and added regression coverage.', url: 'https://github.com/lemma-work/lemma-platform/pull/1156' },
    { number: 1136, title: 'GitHub webhook event identity and idempotency', note: 'Preserved push-event identity and distinguished check-suite rerequests from webhook redeliveries.', url: 'https://github.com/lemma-work/lemma-platform/pull/1136' },
    { number: 1128, title: 'Bundle sidecar path containment', note: 'Prevented file and JSON sidecar references from escaping their resource directory, including symlink paths.', url: 'https://github.com/lemma-work/lemma-platform/pull/1128' },
    { number: 1155, title: 'Podman function-sandbox tmpfs compatibility', note: 'Removed Docker-specific tmpfs ownership options rejected by Podman while preserving a writable private cache.', url: 'https://github.com/lemma-work/lemma-platform/pull/1155' },
    { number: 1125, title: 'Python SDK auth-refresh error handling', note: 'Handled malformed and non-object error payloads without leaking unhelpful exceptions.', url: 'https://github.com/lemma-work/lemma-platform/pull/1125' },
    { number: 1124, title: 'JSONC unterminated-comment diagnostics', note: 'Added location-aware parser errors and regression coverage for unterminated block comments.', url: 'https://github.com/lemma-work/lemma-platform/pull/1124' },
  ],
  openSourceArchive: 'https://github.com/lemma-work/lemma-platform/pulls?q=is%3Apr+is%3Amerged+author%3Akaustubhdua',
  links: {
    github: 'https://github.com/kaustubhdua',
    email: 'kaustubhdua1991@gmail.com',
    linkedin: 'https://www.linkedin.com/in/kaustubh-dua-2b5a76416',
  },
};

/** Navigation and section registry. `label` is the thematic name, `hint` the plain-language one. */
export const sections = [
  { id: 'spawn', label: 'Home', short: 'Home', hint: 'Spawn Point', sprite: 'torch' },
  { id: 'forge', label: 'Projects', short: 'Projects', hint: 'The Forge', sprite: 'anvil' },
  { id: 'profile', label: 'About', short: 'About', hint: 'Character Profile', sprite: 'head' },
  { id: 'inventory', label: 'Skills', short: 'Skills', hint: 'Inventory', sprite: 'chest' },
  { id: 'advancements', label: 'Highlights', short: 'Highlights', hint: 'Technical Milestones', sprite: 'star' },
  { id: 'world', label: 'Focus', short: 'Focus', hint: 'World Map', sprite: 'map' },
  { id: 'contact', label: 'Contact', short: 'Contact', hint: 'Ender Chest', sprite: 'ender' },
];
