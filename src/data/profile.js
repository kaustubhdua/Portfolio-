/**
 * Identity and copy. Everything here comes from the public GitHub profile and
 * profile README of kaustubhdua. Nothing is invented: when something is not
 * published (awards, certifications, grades) it is left out. The graduation year (2029) was
 * given directly by the owner.
 */
export const profile = {
  name: 'Kaustubh Dua',
  kicker: 'ECM student · JIIT Noida',
  role: 'Software developer building AI, data and systems products',
  intro:
    'I build practical software at the intersection of AI, data, systems and product engineering, from route optimisation and voice-first assistants to decision-support workflows.',
  stack: ['Python', 'TypeScript', 'React', 'Next.js', 'FastAPI', 'PostgreSQL'],
  program: 'Electronics & Computer Engineering (ECM)',
  institution: 'Jaypee Institute of Information Technology (JIIT), Noida',
  graduation: '2029',
  about: [
    'I am an Electronics & Computer Engineering (ECM) student at the Jaypee Institute of Information Technology, Noida, interested in software engineering and problem-solving.',
    'I like turning complex workflows into useful tools, with clear system boundaries, careful validation and thoughtful UX.',
    'My projects span OR-Tools route optimisation, voice-first multilingual assistance, crop-residue coordination, local AI and a public website for the JIIT Youth Club.',
  ],
  motto: 'Build thoughtfully. Verify everything.',
  workflow: [
    { step: 'Discover', note: 'Understand the real workflow and its constraints.' },
    { step: 'Model', note: 'Draw clear system boundaries before writing code.' },
    { step: 'Build', note: 'Ship interfaces people can actually use.' },
    { step: 'Test', note: 'Cover the failure paths, not only the happy path.' },
    { step: 'Verify', note: 'Check every claim against evidence.' },
    { step: 'Ship', note: 'Release with honest status labels.' },
  ],
  principles: [
    {
      title: 'Honest status labels',
      text: 'Prototype, simulated and live data are labelled as such. Smart Waste states that its data is synthetic, and Saathi labels demo and live results.',
    },
    {
      title: 'Failure-path testing',
      text: 'Projects run quality gates in CI. The JYC Website combines GitHub Actions, CodeQL and Playwright browser checks.',
    },
    {
      title: 'Clear system boundaries',
      text: 'External providers sit behind replaceable adapters, and secrets stay server-side, as in Saathi and NIRDHOOM.',
    },
  ],
  links: {
    github: 'https://github.com/kaustubhdua',
    email: 'kaustubhdua1991@gmail.com',
    resume: 'Kaustubh-Dua-Resume.pdf',
    linkedin: 'https://www.linkedin.com/in/kaustubh-dua-2b5a76416',
  },
};

/** Navigation and section registry. `label` is the thematic name, `hint` the plain-language one. */
export const sections = [
  { id: 'spawn', label: 'Spawn Point', short: 'Spawn', hint: 'Home', sprite: 'torch' },
  { id: 'profile', label: 'Character Profile', short: 'Profile', hint: 'About', sprite: 'head' },
  { id: 'inventory', label: 'Inventory', short: 'Inventory', hint: 'Skills', sprite: 'chest' },
  { id: 'forge', label: 'The Forge', short: 'Forge', hint: 'Projects', sprite: 'anvil' },
  { id: 'advancements', label: 'Advancements', short: 'Advances', hint: 'Highlights', sprite: 'star' },
  { id: 'world', label: 'World Map', short: 'World Map', hint: 'Domains', sprite: 'map' },
  { id: 'contact', label: 'Ender Chest', short: 'Ender Chest', hint: 'Contact', sprite: 'ender' },
];
