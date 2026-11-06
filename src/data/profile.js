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
  role: 'Frontend Developer · Aspiring Software Engineer',
  intro:
    'I build interactive web experiences and practical software across AI, data and systems—from custom 3D interfaces and route optimisation to voice-first assistants and decision-support workflows.',
  stack: ['Python', 'TypeScript', 'React', 'Next.js', 'FastAPI', 'PostgreSQL'],
  program: 'Electronics & Computer Engineering (ECM)',
  institution: 'Jaypee Institute of Information Technology (JIIT), Noida',
  graduation: '2029',
  year: '2nd year of a 4-year course',
  /** What the owner is looking for. Chosen from the public profile: backend and full-stack work with AI and data. */
  openTo: 'Software engineering internships in backend, full-stack and applied AI or data work.',
  about: [
    'I am an Electronics & Computer Engineering (ECM) student at the Jaypee Institute of Information Technology, Noida, focused on frontend development and software engineering.',
    'I like turning complex workflows into useful tools, with clear system boundaries, careful validation and thoughtful UX.',
    'My work spans a Web Development internship at Pinnacle Labs, route optimisation, voice-first multilingual assistance, crop-residue coordination, local AI and data-governance tools.',
  ],
  motto: 'Build thoughtfully. Verify everything.',
  /** Volunteering. Roles are stated as the owner gave them; nothing is added about what the work involved. */
  volunteering: [
    {
      org: 'NSS',
      full: 'National Service Scheme',
      role: 'Volunteer, Cinematography and Management',
      note: 'Volunteers on the cinematography and management teams.',
    },
  ],
  /** Teams and clubs. Roles are stated exactly as the owner gave them. */
  roles: [
    {
      org: 'JYC Tech Vertical',
      full: 'JIIT Youth Club',
      role: 'Member, Tech and Management team',
      note: 'The technical arm of the club behind the campus events and fests. Built the club’s public website.',
    },
    {
      org: 'AIML and AI-Tronics Club',
      full: 'JIIT Noida',
      role: 'Member, Tech and Management team',
      note: 'The campus club for machine learning, AI and electronics projects.',
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
    whatsapp: 'https://wa.me/917419911991?text=Hi%20Kaustubh%2C%20I%20found%20your%20portfolio.',
    whatsappNumber: '+91 74199 11991',
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
