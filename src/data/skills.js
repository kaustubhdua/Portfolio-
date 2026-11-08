/**
 * Fifteen core skills with direct repository evidence. The inventory is curated,
 * not a dump of every library or language encountered in side projects.
 */
export const skillGroups = [
  {
    id: 'languages',
    title: 'Languages',
    items: [
      { id: 'python', name: 'Python', icon: 'SiPython', used: 'Data preparation and prediction in Smart Waste, plus the Saathi API and NIRDHOOM dispatch services.', evidence: [{ label: 'Smart Waste model', url: 'https://github.com/kaustubhdua/smart_waste_project/blob/main/person2_ml_prediction.py' }, { label: 'Saathi API', url: 'https://github.com/kaustubhdua/Saathi/blob/main/backend/app/main.py' }] },
      { id: 'typescript', name: 'TypeScript', icon: 'SiTypescript', used: 'Typed application and dispatch code in NIRDHOOM; the source shows project use, not sole authorship.', evidence: [{ label: 'NIRDHOOM application', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/src/App.tsx' }, { label: 'NIRDHOOM dispatch API', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/api/dispatch.ts' }] },
      { id: 'javascript', name: 'JavaScript', icon: 'SiJavascript', used: 'The portfolio UI, NIRDHOOM and the JYC Website.', evidence: [{ label: 'JYC editorial UI', url: 'https://github.com/kaustubhdua/JYC-Website2/blob/main/src/jyc-editorial-home.jsx' }, { label: 'NIRDHOOM offline queue tests', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/tests/offline-evidence-queue.test.mjs' }] },
      { id: 'cpp', name: 'C++', icon: 'SiCplusplus', used: 'The RideForge backend API and routing implementation.', evidence: [{ label: 'RideForge application', url: 'https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/main.cpp' }, { label: 'RideForge tests', url: 'https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/tests.cpp' }] },
      { id: 'sql', name: 'SQL', glyph: 'SQL', used: 'Versioned relational schemas and access-control policies in NIRDHOOM and PostgreSQL-backed services.', evidence: [{ label: 'NIRDHOOM core migration', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/supabase/migrations/202609270001_nirdhoom_core.sql' }, { label: 'RLS role matrix tests', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/tests/rls_role_matrix.sql' }] },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    items: [
      { id: 'react', name: 'React', icon: 'SiReact', used: 'React interfaces in NIRDHOOM and the JYC Website.', evidence: [{ label: 'JYC React entry', url: 'https://github.com/kaustubhdua/JYC-Website2/blob/main/src/main.jsx' }, { label: 'NIRDHOOM React app', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/src/App.tsx' }] },
      { id: 'nextjs', name: 'Next.js', icon: 'SiNextdotjs', used: 'The Saathi interface and operator workspace.', evidence: [{ label: 'Saathi page entry', url: 'https://github.com/kaustubhdua/Saathi/blob/main/frontend/app/page.tsx' }, { label: 'Saathi Next.js config', url: 'https://github.com/kaustubhdua/Saathi/blob/main/frontend/next.config.ts' }] },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    items: [
      { id: 'fastapi', name: 'FastAPI', icon: 'SiFastapi', used: 'Saathi API routes and the backend service in PatchPilot.', evidence: [{ label: 'Saathi API entry', url: 'https://github.com/kaustubhdua/Saathi/blob/main/backend/app/main.py' }, { label: 'PatchPilot API', url: 'https://github.com/kaustubhdua/PatchPilot/blob/main/src/patchpilot/api.py' }] },
      { id: 'supabase', name: 'Supabase', icon: 'SiSupabase', used: 'Authentication, row-level security and edge functions in selected product work.', evidence: [{ label: 'NIRDHOOM auth guards', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/supabase/migrations/202610110001_nirdhoom_security_definer_auth_guards.sql' }, { label: 'NIRDHOOM RLS role matrix', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/docs/RLS-ROLE-MATRIX.md' }] },
    ],
  },
  {
    id: 'data',
    title: 'Data & Systems',
    items: [
      { id: 'postgres', name: 'PostgreSQL', icon: 'SiPostgresql', used: 'Relational persistence and versioned migrations in NIRDHOOM and RideForge.', evidence: [{ label: 'NIRDHOOM core migration', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/supabase/migrations/202609270001_nirdhoom_core.sql' }, { label: 'RideForge release evidence', url: 'https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/docs/RELEASE_READINESS_EVIDENCE.md' }] },
      { id: 'ortools', name: 'OR-Tools', glyph: 'OR', used: 'Vehicle routing and dispatch optimisation in Smart Waste and NIRDHOOM.', evidence: [{ label: 'NIRDHOOM dispatch service', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/services/dispatch-ortools/main.py' }, { label: 'Smart Waste optimisation tests', url: 'https://github.com/kaustubhdua/smart_waste_project/blob/main/tests/test_optimization.py' }] },
      { id: 'webgl', name: 'WebGL', glyph: 'GL', used: 'The custom voxel renderer, lighting and shader pipeline that power this portfolio.', evidence: [{ label: 'Portfolio renderer', url: 'https://github.com/kaustubhdua/Portfolio-/blob/main/src/lib/voxel/renderer.js' }, { label: 'Portfolio shaders', url: 'https://github.com/kaustubhdua/Portfolio-/blob/main/src/lib/voxel/shaders.js' }] },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    items: [
      { id: 'github', name: 'GitHub Actions', icon: 'SiGithubactions', used: 'Build, test and security workflows across the selected repositories.', evidence: [{ label: 'Saathi CI workflow', url: 'https://github.com/kaustubhdua/Saathi/blob/main/.github/workflows/ci.yml' }, { label: 'JYC CI workflow', url: 'https://github.com/kaustubhdua/JYC-Website2/blob/main/.github/workflows/ci.yml' }] },
      { id: 'playwright', name: 'Playwright', glyph: 'PW', used: 'Browser regression and responsive interaction checks in this portfolio and the JYC Website.', evidence: [{ label: 'Portfolio browser suite', url: 'https://github.com/kaustubhdua/Portfolio-/blob/main/tests/e2e.mjs' }, { label: 'JYC visual route matrix', url: 'https://github.com/kaustubhdua/JYC-Website2/blob/main/scripts/visual-route-matrix.spec.js' }] },
      { id: 'docker', name: 'Docker', icon: 'SiDocker', used: 'Containerised local development and service delivery in PatchPilot and RideForge.', evidence: [{ label: 'PatchPilot Dockerfile', url: 'https://github.com/kaustubhdua/PatchPilot/blob/main/Dockerfile' }, { label: 'RideForge Dockerfile', url: 'https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/Dockerfile' }] },
    ],
  },
];
