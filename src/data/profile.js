/**
 * Identity and copy. Everything here comes from the public GitHub profile and
 * profile README of kaustubhdua, the owner's public LinkedIn posts and certificates, and
 * facts the owner stated directly (graduation year 2029, club roles, WhatsApp number).
 * Nothing is invented: when something is not published (grades, scores, rankings) it is left out.
 */
export const profile = {
  // Four edited posts are ready; expose the static blog and its RSS feed.
  blogEnabled: true,
  name: 'Kaustubh Dua',
  kicker: 'ECM student · JIIT Noida',
  role: 'Software Engineering Student · Full-Stack & Applied AI',
  intro:
    'I build practical software across full-stack product engineering, applied AI and data systems—from field-first workflows and multilingual assistance to developer tools. I care about usable interfaces, clear system boundaries and tests that cover failure paths.',
  stack: ['Python', 'TypeScript', 'React', 'FastAPI', 'PostgreSQL', 'OR-Tools'],
  program: 'Electronics & Computer Engineering (ECM)',
  institution: 'Jaypee Institute of Information Technology (JIIT), Noida',
  graduation: '2029',
  year: '2nd year of a 4-year course',
  /** What the owner is looking for. Chosen from the public profile: backend and full-stack work with AI and data. */
  openTo: 'Software engineering internships in full-stack, backend and applied AI or data work.',
  about: [
    'I am an Electronics & Computer Engineering student at JIIT Noida, focused on software engineering and full-stack product development.',
    'I enjoy turning complex workflows into usable products, with careful API design, clear data boundaries and reliable testing.',
    'Alongside my Web Development internship at Pinnacle Labs, I build applied AI, data and systems projects and represent Nexus Spring of Code as a campus ambassador.',
  ],
  motto: 'Build thoughtfully. Verify everything.',
  /** Selected campus leadership roles most relevant to software engineering and open source. */
  roles: [
    {
      org: 'Nexus Spring of Code (NSoC)',
      full: 'Open-source program',
      role: 'Campus Ambassador · 2026–Present',
      note: 'Representing the program at JIIT Noida and helping students discover open-source contribution opportunities.',
      url: 'https://www.nsoc.in/',
    },
    {
      org: 'JIIT Youth Club (JYC) · Tech Vertical',
      full: 'JIIT Noida',
      role: 'Member, Tech and Management team',
      note: 'Built and iterated the club’s public website for its clubs, events, gallery and recruitment experience.',
      url: 'https://github.com/kaustubhdua/JYC-Website',
    },
  ],
  experience: [
    {
      org: 'Pinnacle Labs',
      role: 'Web Development Intern',
      period: '2026',
      note: 'Built a real-time weather dashboard with asynchronous Fetch API updates, and a browser-based task manager with persistent local storage, priority labels and All/Active/Completed filters.',
      stack: ['HTML5', 'CSS3', 'JavaScript', 'Fetch API', 'localStorage'],
      projects: [
        { label: 'Weather Core Matrix', url: 'https://github.com/kaustubhdua/weather-core-matrix' },
        { label: 'Nord Studio Task Manager', url: 'https://github.com/kaustubhdua/nord-studio-task-manager' },
      ],
    },
  ],
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
    // wa.me opens the WhatsApp chat directly (country code 91 for India, no + or spaces)
  },
};

/** Navigation and section registry. `label` is the thematic name, `hint` the plain-language one. */
export const sections = [
  { id: 'spawn', label: 'Home', short: 'Home', hint: 'Spawn Point', sprite: 'torch' },
  { id: 'profile', label: 'About', short: 'About', hint: 'Character Profile', sprite: 'head' },
  { id: 'inventory', label: 'Skills', short: 'Skills', hint: 'Inventory', sprite: 'chest' },
  { id: 'forge', label: 'Projects', short: 'Projects', hint: 'The Forge', sprite: 'anvil' },
  { id: 'advancements', label: 'Experience', short: 'Experience', hint: 'Highlights', sprite: 'star' },
  { id: 'world', label: 'Focus', short: 'Focus', hint: 'World Map', sprite: 'map' },
  { id: 'contact', label: 'Contact', short: 'Contact', hint: 'Ender Chest', sprite: 'ender' },
];
