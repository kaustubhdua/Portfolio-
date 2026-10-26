/**
 * Skills are derived from the technology lists of the featured projects
 * (src/data/projects.js) and the public GitHub profile. `used` names the evidence.
 */
export const skillGroups = [
  {
    id: 'languages',
    title: 'Languages',
    items: [
      { id: 'python', name: 'Python', icon: 'SiPython', used: 'Smart Waste pipeline, the Saathi FastAPI back end and the NIRDHOOM OR-Tools dispatch service.', evidence: [{"label":"Smart Waste model","url":"https://github.com/kaustubhdua/smart_waste_project/blob/main/person2_ml_prediction.py"},{"label":"Saathi API","url":"https://github.com/kaustubhdua/Saathi/blob/main/backend/app/main.py"}] },
      { id: 'typescript', name: 'TypeScript', icon: 'SiTypescript', used: 'TypeScript source is visible in NIRDHOOM (App.tsx and api/dispatch.ts). That proves the project uses TypeScript; review the commit/PR history to attribute individual implementation work.', evidence: [{"label":"NIRDHOOM application","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/src/App.tsx"},{"label":"NIRDHOOM dispatch API","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/api/dispatch.ts"}] },
      { id: 'javascript', name: 'JavaScript', icon: 'SiJavascript', used: 'The React front ends of NIRDHOOM and the JYC Website, and part of the Adapt AI stack.', evidence: [{"label":"JYC editorial UI","url":"https://github.com/kaustubhdua/JYC-Website/blob/main/src/jyc-editorial-home.jsx"},{"label":"NIRDHOOM offline queue test","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/tests/offline-evidence-queue.test.mjs"}] },
      { id: 'cpp', name: 'C++', icon: 'SiCplusplus', used: 'The language of the Smart Bike Taxi Platform repository on my GitHub.', evidence: [{"label":"C++ application","url":"https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/main.cpp"},{"label":"C++ tests","url":"https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/tests.cpp"}] },
      { id: 'sql', name: 'SQL', glyph: 'SQL', used: 'Versioned SQL migrations behind NIRDHOOM, on Supabase and PostgreSQL.', evidence: [{"label":"NIRDHOOM schema migration","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/supabase/migrations/202609270001_nirdhoom_core.sql"},{"label":"RLS role matrix tests","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/tests/rls_role_matrix.sql"}] },
      { id: 'htmlcss', name: 'HTML & CSS', icon: 'SiHtml5', used: 'Hand-written markup and styles in this portfolio, and the JYC Website, whose repository is mostly CSS.', evidence: [{"label":"JYC editorial styles","url":"https://github.com/kaustubhdua/JYC-Website/blob/main/src/jyc-editorial-home.css"},{"label":"JYC editorial UI","url":"https://github.com/kaustubhdua/JYC-Website/blob/main/src/jyc-editorial-home.jsx"}] },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    items: [
      { id: 'react', name: 'React', icon: 'SiReact', used: 'React 19 in NIRDHOOM and the JYC Website, with lazy-loaded heavy screens.', evidence: [{"label":"JYC React entry","url":"https://github.com/kaustubhdua/JYC-Website/blob/main/src/main.jsx"},{"label":"NIRDHOOM React app","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/src/App.tsx"}] },
      { id: 'nextjs', name: 'Next.js', icon: 'SiNextdotjs', used: 'The Saathi interface and its operator command centre.', evidence: [{"label":"Saathi page entry","url":"https://github.com/kaustubhdua/Saathi/blob/main/frontend/app/page.tsx"},{"label":"Next.js config","url":"https://github.com/kaustubhdua/Saathi/blob/main/frontend/next.config.ts"}] },
      { id: 'vite', name: 'Vite', icon: 'SiVite', used: 'The build tool of NIRDHOOM and the JYC Website.', evidence: [{"label":"JYC Vite config","url":"https://github.com/kaustubhdua/JYC-Website/blob/main/vite.config.js"},{"label":"NIRDHOOM entry","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/src/main.jsx"}] },
      { id: 'router', name: 'React Router', icon: 'SiReactrouter', used: 'Public section routing in the JYC Website.', evidence: [{"label":"JYC routing entry","url":"https://github.com/kaustubhdua/JYC-Website/blob/main/src/main.jsx"},{"label":"JYC site README","url":"https://github.com/kaustubhdua/JYC-Website/blob/main/README.md"}] },
      { id: 'leaflet', name: 'Leaflet', icon: 'SiLeaflet', used: 'Field and dispatch maps in NIRDHOOM, loaded only when tracking opens.', evidence: [{"label":"NIRDHOOM operations map","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/src/components/OpsConsole/OpsMap.tsx"},{"label":"Map and remote-sensing notes","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/docs/MAP-AND-REMOTE-SENSING.md"}] },
      { id: 'gsap', name: 'GSAP', glyph: 'GS', used: 'Scroll and entrance animation in the JYC Website, alongside Motion and OGL for WebGL effects.', evidence: [{"label": "JYC dependencies", "url": "https://github.com/kaustubhdua/jyc-website/blob/main/package.json"}] },
      { id: 'tailwind', name: 'Tailwind CSS', glyph: 'TW', used: 'Styling for NIRDHOOM through the Tailwind Vite plugin.', evidence: [{"label": "NIRDHOOM dependencies", "url": "https://github.com/kaustubhdua/nihdhoom/blob/main/package.json"}] },
      { id: 'threejs', name: 'Three.js', icon: 'SiThreedotjs', used: 'The 3D workspaces of NIRDHOOM, kept behind lazy loading.', evidence: [{"label":"NIRDHOOM 3D baler","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/src/components/ThreeD/BalerModel3D.tsx"},{"label":"NIRDHOOM README","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/README.md"}] },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    items: [
      { id: 'fastapi', name: 'FastAPI', icon: 'SiFastapi', used: 'Saathi agent orchestration with rate limiting and correlation IDs, and the Adapt AI service.', evidence: [{"label":"Saathi API entry","url":"https://github.com/kaustubhdua/Saathi/blob/main/backend/app/main.py"},{"label":"Saathi API tests","url":"https://github.com/kaustubhdua/Saathi/blob/main/backend/tests/test_api.py"}] },
      { id: 'sqlalchemy', name: 'SQLAlchemy', glyph: 'SA', used: 'ORM and Alembic migrations behind the Smart Waste platform API on PostgreSQL.', evidence: [{"label": "Smart Waste backend requirements", "url": "https://github.com/kaustubhdua/smart_waste_project/blob/main/backend/requirements.txt"}] },
      { id: 'supabase', name: 'Supabase', icon: 'SiSupabase', used: 'Row Level Security in NIRDHOOM and Edge Functions in the JYC Website.', evidence: [{"label":"NIRDHOOM auth guards migration","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/supabase/migrations/202610110001_nirdhoom_security_definer_auth_guards.sql"},{"label":"NIRDHOOM RLS role matrix","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/docs/RLS-ROLE-MATRIX.md"}] },
      { id: 'rest', name: 'REST APIs', glyph: 'API', used: 'Saathi’s FastAPI endpoints, PatchPilot’s POST /v1/analyze and the server routes in NIRDHOOM.', evidence: [{"label":"PatchPilot API","url":"https://github.com/kaustubhdua/PatchPilot/blob/main/src/patchpilot/api.py"},{"label":"Saathi API","url":"https://github.com/kaustubhdua/Saathi/blob/main/backend/app/main.py"}] },
      { id: 'vercel', name: 'Vercel', icon: 'SiVercel', used: 'Hosts the NIRDHOOM, Saathi and JYC demos, plus server routes in NIRDHOOM.', evidence: [{"label":"NIRDHOOM dispatch route","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/api/dispatch.ts"},{"label":"NIRDHOOM README","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/README.md"}] },
    ],
  },
  {
    id: 'data',
    title: 'Data & AI',
    items: [
      { id: 'postgres', name: 'PostgreSQL', icon: 'SiPostgresql', used: 'Versioned SQL migrations behind NIRDHOOM, with PostGIS for field geometry.', evidence: [{"label":"NIRDHOOM core migration","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/supabase/migrations/202609270001_nirdhoom_core.sql"},{"label":"RLS role matrix tests","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/tests/rls_role_matrix.sql"}] },
      { id: 'ortools', name: 'OR-Tools', glyph: 'OR', used: 'Capacitated vehicle routing in Smart Waste and dispatch in NIRDHOOM.', evidence: [{"label":"NIRDHOOM OR-Tools service","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/services/dispatch-ortools/main.py"},{"label":"Smart Waste optimisation tests","url":"https://github.com/kaustubhdua/smart_waste_project/blob/main/tests/test_optimization.py"}] },
      { id: 'forest', name: 'Random Forest', glyph: 'RF', used: 'Predicts future bin fill levels in Smart Waste.', evidence: [{"label":"Random Forest model and baseline","url":"https://github.com/kaustubhdua/smart_waste_project/blob/main/person2_ml_prediction.py"},{"label":"Data and model notes","url":"https://github.com/kaustubhdua/smart_waste_project/blob/main/docs/DATA_AND_MODEL_NOTES.md"}] },
      { id: 'streamlit', name: 'Streamlit', icon: 'SiStreamlit', used: 'The Smart Waste dashboard and the SATARK triage workspace.', evidence: [{"label":"Smart Waste app","url":"https://github.com/kaustubhdua/smart_waste_project/blob/main/app.py"},{"label":"SATARK README","url":"https://github.com/kaustubhdua/Satark/blob/main/README.md"}] },
      { id: 'sqlite', name: 'SQLite', icon: 'SiSqlite', used: 'Run metadata and log analyses persisted by the BharatSim FastAPI back end.', evidence: [{"label": "BharatSim API", "url": "https://github.com/kaustubhdua/bharat-sim/blob/main/backend/app/main.py"}] },
      { id: 'pytorch', name: 'PyTorch', icon: 'SiPytorch', used: 'A pretrained Torchvision Faster R-CNN person detector in CrickVision, an experimental prototype.', evidence: [{"label": "CrickVision detector", "url": "https://github.com/kaustubhdua/CrickVision-/blob/main/crickvision/detector.py"}, {"label": "CrickVision README", "url": "https://github.com/kaustubhdua/CrickVision-/blob/main/README.md"}] },
      { id: 'opencv', name: 'OpenCV', icon: 'SiOpencv', used: 'Video frame handling and shot-cut detection in CrickVision.', evidence: [{"label": "CrickVision shot detection", "url": "https://github.com/kaustubhdua/CrickVision-/blob/main/crickvision/shot.py"}] },
      { id: 'ollama', name: 'Ollama', icon: 'SiOllama', used: 'Local inference behind Adapt AI, a team project.', evidence: [{"label":"Adapt AI implementation","url":"https://github.com/kaustubhdua/adapt-ai/blob/master/app.py"},{"label":"Adapt AI README","url":"https://github.com/kaustubhdua/adapt-ai/blob/master/README.md"}] },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    items: [
      { id: 'github', name: 'GitHub Actions', icon: 'SiGithubactions', used: 'Tests, builds, dependency audits and CodeQL in Saathi and the JYC Website.', evidence: [{"label":"Saathi CI workflow","url":"https://github.com/kaustubhdua/Saathi/blob/main/.github/workflows/ci.yml"},{"label":"JYC CI workflow","url":"https://github.com/kaustubhdua/JYC-Website/blob/main/.github/workflows/ci.yml"}] },
      { id: 'playwright', name: 'Playwright', glyph: 'PW', used: 'Browser QA in the JYC Website.', evidence: [{"label":"JYC visual route matrix","url":"https://github.com/kaustubhdua/JYC-Website/blob/main/scripts/visual-route-matrix.spec.js"},{"label":"JYC browser workflow","url":"https://github.com/kaustubhdua/JYC-Website/blob/main/.github/workflows/jyc-browser.yml"}] },
      { id: 'appium', name: 'Appium', icon: 'SiAppium', used: 'A UiAutomator2 UI journey that runs against an Android emulator in BharatSim CI.', evidence: [{"label": "BharatSim Appium journey", "url": "https://github.com/kaustubhdua/bharat-sim/blob/main/worker/tests/appium_smoke_journey.py"}, {"label": "Emulator smoke workflow", "url": "https://github.com/kaustubhdua/bharat-sim/blob/main/.github/workflows/android-emulator-smoke.yml"}] },
      { id: 'docker', name: 'Docker', icon: 'SiDocker', used: 'A non-root image with a health check for PatchPilot.', evidence: [{"label":"PatchPilot Dockerfile","url":"https://github.com/kaustubhdua/PatchPilot/blob/main/Dockerfile"},{"label":"Saathi Dockerfile","url":"https://github.com/kaustubhdua/Saathi/blob/main/Dockerfile"}] },
      { id: 'pytest', name: 'pytest', icon: 'SiPytest', used: 'Regression tests in PatchPilot and backend tests in Saathi.', evidence: [{"label":"PatchPilot analyzer tests","url":"https://github.com/kaustubhdua/PatchPilot/blob/main/tests/test_analyzer.py"},{"label":"Saathi evaluation tests","url":"https://github.com/kaustubhdua/Saathi/blob/main/backend/tests/test_evaluation.py"}] },
      { id: 'esbuild', name: 'esbuild', icon: 'SiEsbuild', used: 'Bundles this portfolio. The build configuration is in the private Portfolio- repository, so public visitors cannot inspect that source without access.', evidenceNote: 'Implementation evidence is in the private Portfolio- repository; the repository visibility decision is still open.' },
      { id: 'git', name: 'Git', icon: 'SiGit', used: 'Every project lives in a public repository on GitHub.', evidence: [{"label":"NIRDHOOM shared commit history","url":"https://github.com/kaustubhdua/nihdhoom/commits/main"},{"label":"Saathi shared commit history","url":"https://github.com/kaustubhdua/Saathi/commits/main"}] },
    ],
  },
];
