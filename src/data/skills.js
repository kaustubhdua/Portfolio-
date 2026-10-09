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
      { id: 'typescript', name: 'TypeScript', icon: 'SiTypescript', used: 'Listed as a primary language on my GitHub profile.' },
      { id: 'javascript', name: 'JavaScript', icon: 'SiJavascript', used: 'The React front ends of NIRDHOOM and the JYC Website, and part of the Adapt AI stack.' },
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
      { id: 'git', name: 'Git', icon: 'SiGit', used: 'Every project lives in a public repository on GitHub.' },
    ],
  },
];
