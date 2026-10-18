/**
 * Skills are derived from the technology lists of the featured projects
 * (src/data/projects.js) and the public GitHub profile. `used` names the evidence.
 */
export const skillGroups = [
  {
    id: 'languages',
    title: 'Languages',
    items: [
      { id: 'python', name: 'Python', icon: 'SiPython', used: 'Smart Waste pipeline, the Saathi FastAPI back end and the NIRDHOOM OR-Tools dispatch service.' },
      { id: 'typescript', name: 'TypeScript', icon: 'SiTypescript', used: 'Listed on the GitHub profile stack, but this portfolio has not yet linked a concrete TypeScript implementation to a featured project. Treat it as profile-listed until a source file or contribution is documented.' },
      { id: 'javascript', name: 'JavaScript', icon: 'SiJavascript', used: 'The React front ends of NIRDHOOM and the JYC Website, and part of the Adapt AI stack.' },
      { id: 'cpp', name: 'C++', icon: 'SiCplusplus', used: 'The language of the Smart Bike Taxi Platform repository on my GitHub.' },
      { id: 'sql', name: 'SQL', glyph: 'SQL', used: 'Versioned SQL migrations behind NIRDHOOM, on Supabase and PostgreSQL.' },
      { id: 'htmlcss', name: 'HTML & CSS', icon: 'SiHtml5', used: 'Hand-written markup and styles in this portfolio, and the JYC Website, whose repository is mostly CSS.' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    items: [
      { id: 'react', name: 'React', icon: 'SiReact', used: 'React 19 in NIRDHOOM and the JYC Website, with lazy-loaded heavy screens.' },
      { id: 'nextjs', name: 'Next.js', icon: 'SiNextdotjs', used: 'The Saathi interface and its operator command centre.' },
      { id: 'vite', name: 'Vite', icon: 'SiVite', used: 'The build tool of NIRDHOOM and the JYC Website.' },
      { id: 'router', name: 'React Router', icon: 'SiReactrouter', used: 'Public section routing in the JYC Website.' },
      { id: 'leaflet', name: 'Leaflet', icon: 'SiLeaflet', used: 'Field and dispatch maps in NIRDHOOM, loaded only when tracking opens.' },
      { id: 'threejs', name: 'Three.js', icon: 'SiThreedotjs', used: 'The 3D workspaces of NIRDHOOM, kept behind lazy loading.' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    items: [
      { id: 'fastapi', name: 'FastAPI', icon: 'SiFastapi', used: 'Saathi agent orchestration with rate limiting and correlation IDs, and the Adapt AI service.' },
      { id: 'supabase', name: 'Supabase', icon: 'SiSupabase', used: 'Row Level Security in NIRDHOOM and Edge Functions in the JYC Website.' },
      { id: 'rest', name: 'REST APIs', glyph: 'API', used: 'Saathi’s FastAPI endpoints, PatchPilot’s POST /v1/analyze and the server routes in NIRDHOOM.' },
      { id: 'vercel', name: 'Vercel', icon: 'SiVercel', used: 'Hosts the NIRDHOOM, Saathi and JYC demos, plus server routes in NIRDHOOM.' },
    ],
  },
  {
    id: 'data',
    title: 'Data & AI',
    items: [
      { id: 'postgres', name: 'PostgreSQL', icon: 'SiPostgresql', used: 'Versioned SQL migrations behind NIRDHOOM, with PostGIS for field geometry.' },
      { id: 'ortools', name: 'OR-Tools', glyph: 'OR', used: 'Capacitated vehicle routing in Smart Waste and dispatch in NIRDHOOM.' },
      { id: 'forest', name: 'Random Forest', glyph: 'RF', used: 'Predicts future bin fill levels in Smart Waste.' },
      { id: 'streamlit', name: 'Streamlit', icon: 'SiStreamlit', used: 'The Smart Waste dashboard and the SATARK triage workspace.' },
      { id: 'ollama', name: 'Ollama', icon: 'SiOllama', used: 'Local inference behind Adapt AI, a team project.' },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    items: [
      { id: 'github', name: 'GitHub Actions', icon: 'SiGithubactions', used: 'Tests, builds, dependency audits and CodeQL in Saathi and the JYC Website.' },
      { id: 'playwright', name: 'Playwright', glyph: 'PW', used: 'Browser QA in the JYC Website.' },
      { id: 'docker', name: 'Docker', icon: 'SiDocker', used: 'A non-root image with a health check for PatchPilot.' },
      { id: 'pytest', name: 'pytest', icon: 'SiPytest', used: 'Regression tests in PatchPilot and backend tests in Saathi.' },
      { id: 'esbuild', name: 'esbuild', icon: 'SiEsbuild', used: 'Bundles this portfolio, with no framework tooling on top.' },
      { id: 'git', name: 'Git', icon: 'SiGit', used: 'Every project lives in a public repository on GitHub.' },
    ],
  },
];
