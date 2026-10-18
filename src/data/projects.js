/**
 * Featured projects. Every statement is taken from the project's public README or
 * GitHub page. Limits are listed honestly, and no measured results are claimed
 * because none of these READMEs publish any.
 */

export const biomes = {
  crimson: { name: 'Crimson Forest', dayName: 'Sunny Meadow', note: 'Full-stack platforms' },
  basalt: { name: 'Basalt Deltas', dayName: 'Stone Highlands', note: 'Data and optimisation' },
  wastes: { name: 'Nether Wastes', dayName: 'Golden Hour', note: 'Local AI' },
  soul: { name: 'Soul Sand Valley', dayName: 'Pine Woods', note: 'Security and trust' },
};

/** Biome label for the current world (Nether names at night, Overworld names by day). */
export const biomeName = (id, world) => (world === 'overworld' ? biomes[id].dayName : biomes[id].name);

/** Day-mode card art lives next to the night art, under img/projects/day/. */
export const projectImage = (project, world) =>
  world === 'overworld' ? project.image.replace('img/projects/', 'img/projects/day/') : project.image;

export const projects = [
  {
    id: 'nirdhoom',
    flagship: true,
    stage: 'Prototype',
    name: 'NIRDHOOM',
    tagline: 'Crop-residue coordination system',
    contribution: 'Multi-contributor prototype. This case study summarizes the product and integration surface; review commits and pull requests authored by me to attribute individual implementation work before treating a feature as solely mine.',
    evidence: [{ label: 'Project README', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/README.md' }, { label: 'Product release roadmap', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/docs/PRODUCT-RELEASE-ROADMAP.md' }, { label: 'CI workflow', url: 'https://github.com/kaustubhdua/nihdhoom/actions/workflows/ci.yml' }],
    badges: ['PWA', 'PostGIS + RLS', 'Offline evidence queue'],
    biome: 'crimson',
    kind: 'Own repository',
    image: 'img/projects/nirdhoom.png',
    contribution: 'Multi-contributor prototype. This case study summarizes the product and integration surface; review commits and pull requests authored by me to attribute individual implementation work before treating a feature as solely mine.',
    evidence: [{ label: 'Project README', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/README.md' }, { label: 'Product release roadmap', url: 'https://github.com/kaustubhdua/nihdhoom/blob/main/docs/PRODUCT-RELEASE-ROADMAP.md' }, { label: 'CI workflow', url: 'https://github.com/kaustubhdua/nihdhoom/actions/workflows/ci.yml' }],
    summary:
      'A field-first web app that connects farmers, field records, machine operators, dispatch, verification and residue buyers in one workflow.',
    stack: ['React 19', 'Vite', 'Supabase', 'PostgreSQL', 'PostGIS', 'OR-Tools', 'Leaflet'],
    repo: 'https://github.com/kaustubhdua/nihdhoom',
    live: 'https://nihdhoom-9qiu.vercel.app/',
    problem:
      'Clearing crop residue involves several parties: farmers, machine operators, dispatchers and residue buyers. NIRDHOOM models the whole path from a field request to verified lots a buyer can see.',
    features: [
      'Farmer field view, booking flow and residue pathways',
      'Field mapping on an OpenStreetMap basemap with a boundary-drawing prototype',
      'Operator workflow with assigned jobs, device GPS telemetry, private evidence upload, SHA-256 hashing and an offline evidence queue',
      'Authenticated dispatch endpoint where a human reviews the solver output',
      'Residue network with verified-lot pools, buyer demand and offers',
      'PWA manifest and service worker',
    ],
    architecture: [
      { title: 'Front end', text: 'React 19 and Vite 8 with a modular app shell and feature components for booking, field jobs, operators, dispatch map, residue pooling and verification.' },
      { title: 'Server routes', text: 'Vercel-style API routes mediate external services and privileged operations, so service keys never reach the browser.' },
      { title: 'Data', text: 'Supabase with PostgreSQL, PostGIS and Row Level Security. Schema changes live in versioned SQL migrations.' },
      { title: 'Dispatch', text: 'A separately deployed Python OR-Tools service, with a local heuristic fallback when it is unavailable.' },
    ],
    decisions: [
      'Heavy screens load lazily, and Leaflet only loads when tracking opens. Three.js stays behind the 3D workspaces.',
      'Frequently used workspaces prefetch on pointer or focus intent.',
      'Only browser-safe values reach the client. Service-role and provider keys stay server-side.',
      'Remote-sensing data is treated as supporting evidence, not as proof of what happened in a field.',
      'Payments are demo-only; real payment or payout integration is explicitly out of scope.',
    ],
    limits: [
      'Real-provider phone OTP and consent verification are still needed.',
      'No authoritative land-boundary source is connected yet.',
      'GPS validation, offline sync on real devices and low-end Android testing remain pilot gates.',
      'No browser end-to-end test harness in the current release.',
    ],
    contribution: "Multi-contributor prototype. This case study summarizes the product and integration surface; review commits and pull requests authored by me to attribute individual implementation work before treating a feature as solely mine.",
    evidence: [
      { label: "Project README", url: "https://github.com/kaustubhdua/nihdhoom/blob/main/README.md" },
      { label: "Product release roadmap", url: "https://github.com/kaustubhdua/nihdhoom/blob/main/docs/PRODUCT-RELEASE-ROADMAP.md" },
      { label: "CI workflow", url: "https://github.com/kaustubhdua/nihdhoom/actions/workflows/ci.yml" },
    ],
    status:
      'Prototype and integration foundation. Seeded records and indicative planning values are kept separate from live records, and no performance figures are claimed.',
  },
  {
    id: 'saathi',
    flagship: true,
    stage: 'MVP',
    name: 'Saathi',
    tagline: 'Voice-first multilingual assistance',
    contribution: 'Multi-contributor MVP. This summary describes the shared product and architecture, not sole authorship; use commits and pull requests to substantiate individual implementation claims.',
    evidence: [{ label: 'Project README', url: 'https://github.com/kaustubhdua/Saathi/blob/main/README.md' }, { label: 'Evaluation methodology', url: 'https://github.com/kaustubhdua/Saathi/blob/main/docs/EVALUATION.md' }, { label: 'GitHub Actions', url: 'https://github.com/kaustubhdua/Saathi/actions' }],
    badges: ['120-case benchmark', 'Hindi + Hinglish', 'Human escalation'],
    biome: 'crimson',
    kind: 'Own repository',
    image: 'img/projects/saathi.png',
    contribution: 'Multi-contributor MVP. This summary describes the shared product and architecture, not sole authorship; use commits and pull requests to substantiate individual implementation claims.',
    evidence: [{ label: 'Project README', url: 'https://github.com/kaustubhdua/Saathi/blob/main/README.md' }, { label: 'Evaluation methodology', url: 'https://github.com/kaustubhdua/Saathi/blob/main/docs/EVALUATION.md' }, { label: 'GitHub Actions', url: 'https://github.com/kaustubhdua/Saathi/actions' }],
    summary:
      'A Hindi-first, voice-first assistance platform with source-aware answers, consent-based workflows and human escalation.',
    stack: ['Next.js', 'React', 'FastAPI', 'Python', 'Speech APIs', 'GitHub Actions'],
    repo: 'https://github.com/kaustubhdua/Saathi',
    live: 'https://saathi-two-pi.vercel.app',
    problem:
      'Information and service workflows are hard to reach for people who prefer speaking in their own language. Saathi aims at field-ready workflows rather than disconnected AI demos.',
    features: [
      'Responsive landing page and an operator command centre at /dashboard',
      'Deterministic Hindi and Hinglish intent routing with a 120-case synthetic benchmark',
      'Source provenance on every factual result, with demo and live data labelled',
      'Weather and government mandi-price adapters',
      'Provider-gated speech-to-text and text-to-speech, plus a phone-call WebSocket endpoint',
      'Consent and human-escalation UI; rate limiting and correlation IDs on the API',
    ],
    architecture: [
      { title: 'Front end', text: 'Next.js and React interface plus an operator control room.' },
      { title: 'Back end', text: 'FastAPI service with agent orchestration and provider boundaries.' },
      { title: 'Delivery', text: 'GitHub Actions run backend tests, front-end checks and builds, and dependency audits.' },
      { title: 'Docs', text: 'Architecture, API contracts, voice contract, evaluation and release gates are written down in the repository.' },
    ],
    decisions: [
      'Intent routing is deterministic: the language model is not the source of truth.',
      'External providers sit behind replaceable adapters, and no provider secrets are hard-coded.',
      'Every factual tool result carries its provenance and retrieval time.',
      'A capability is called live only after its real provider path has been exercised.',
      'Explicit consent is required before storing memory or making outbound calls.',
    ],
    limits: [
      'Persistent memory, durable webhook storage and human case persistence are still ahead.',
      'Low-latency real-time phone transport is not finished.',
      'Healthcare is informational and navigation support only in the MVP.',
    ],
    contribution: "Multi-contributor MVP. This summary describes the shared product and architecture, not sole authorship; use commits and pull requests to substantiate individual implementation claims.",
    evidence: [
      { label: "Project README", url: "https://github.com/kaustubhdua/Saathi/blob/main/README.md" },
      { label: "Evaluation methodology", url: "https://github.com/kaustubhdua/Saathi/blob/main/docs/EVALUATION.md" },
      { label: "GitHub Actions", url: "https://github.com/kaustubhdua/Saathi/actions" },
    ],
    status:
      'MVP with a hosted demo. The next milestone in the README is a measured, provider-backed voice slice; no accuracy or performance numbers are claimed.',
  },
  {
    id: 'patchpilot',
    flagship: true,
    stage: 'Early-stage',
    name: 'PatchPilot',
    tagline: 'Explainable pull-request risk triage',
    contribution: 'Personal project maintained in this repository. The current scope is deterministic diff triage; production precision and recall have not been established, and this is not a formal security audit.',
    evidence: [{ label: 'README and quick start', url: 'https://github.com/kaustubhdua/PatchPilot/blob/main/README.md' }, { label: 'Benchmark methodology', url: 'https://github.com/kaustubhdua/PatchPilot/blob/main/docs/benchmark-methodology.md' }, { label: 'Roadmap and release gate', url: 'https://github.com/kaustubhdua/PatchPilot/blob/main/ROADMAP.md' }, { label: 'CI workflow', url: 'https://github.com/kaustubhdua/PatchPilot/actions/workflows/ci.yml' }],
    badges: ['0-100 risk score', 'Rate-limited API', 'Non-root Docker'],
    biome: 'soul',
    kind: 'Own repository',
    image: 'img/projects/patchpilot.png',
    contribution: 'Personal project maintained in this repository. The current scope is deterministic diff triage; production precision and recall have not been established, and this is not a formal security audit.',
    evidence: [{ label: 'README and quick start', url: 'https://github.com/kaustubhdua/PatchPilot/blob/main/README.md' }, { label: 'Benchmark methodology', url: 'https://github.com/kaustubhdua/PatchPilot/blob/main/docs/benchmark-methodology.md' }, { label: 'Roadmap and release gate', url: 'https://github.com/kaustubhdua/PatchPilot/blob/main/ROADMAP.md' }, { label: 'CI workflow', url: 'https://github.com/kaustubhdua/PatchPilot/actions/workflows/ci.yml' }],
    summary:
      'An early-stage service that reads a unified diff and returns changed-file statistics, evidence-backed risk signals, a coarse 0-100 score and test suggestions.',
    stack: ['Python', 'FastAPI', 'pytest', 'Ruff', 'Docker', 'GitHub Actions'],
    repo: 'https://github.com/kaustubhdua/PatchPilot',
    live: null,
    problem:
      'Reviewers skim large diffs and can miss risky changes. PatchPilot points at the lines and files that deserve a closer look, and says why.',
    features: [
      'Command-line analyser for a patch from a file or stdin, with JSON output',
      'HTTP API with health and readiness probes and a POST /v1/analyze endpoint',
      'Heuristics for sensitive auth and security paths, dependency and lockfile changes, very large diffs, risky added lines and production changes without matching tests',
      'Input limits and unknown-field rejection, plus a per-client rate limit that returns HTTP 429 with Retry-After',
    ],
    architecture: [
      { title: 'Analysis', text: 'Deterministic diff parsing and rule-based signals. It never clones or executes repository code.' },
      { title: 'API', text: 'FastAPI service with request validation, rate limiting and a readiness probe.' },
      { title: 'Delivery', text: 'Regression tests, Ruff linting, GitHub Actions CI and a non-root Docker image with a health check.' },
    ],
    decisions: [
      'Every signal carries its evidence, so the score can be explained rather than trusted blindly.',
      'The score is described as coarse triage, not a defect probability or a merge recommendation.',
      'Untrusted input is bounded: size limits, strict schemas and no execution of the analysed code.',
    ],
    limits: [
      'Not a hosted service and not an autonomous code-fixing agent.',
      'GitHub App integration, syntax-aware parsing, persistent history and measured false-positive benchmarks are still ahead.',
      'Heuristics are not semantic analysis; binary files are counted but not analysed.',
    ],
    contribution: "Personal project maintained in this repository. The current scope is deterministic diff triage; the README says production precision and recall have not been established and this is not a formal security audit.",
    evidence: [
      { label: "README and quick start", url: "https://github.com/kaustubhdua/PatchPilot/blob/main/README.md" },
      { label: "Benchmark methodology", url: "https://github.com/kaustubhdua/PatchPilot/blob/main/docs/benchmark-methodology.md" },
      { label: "Roadmap and release gate", url: "https://github.com/kaustubhdua/PatchPilot/blob/main/ROADMAP.md" },
      { label: "CI workflow", url: "https://github.com/kaustubhdua/PatchPilot/actions/workflows/ci.yml" },
    ],
    status:
      'Early-stage tool with tests and CI. No live demo exists, and no accuracy figures are claimed.',
  },
  {
    id: 'smartwaste',
    stage: 'Prototype',
    name: 'Smart Waste',
    tagline: 'Predict, prioritise and route waste collection',
    contribution: 'Synthetic-data engineering prototype. This case study summarizes the repository pipeline; identify individual implementation ownership from commits and source files before claiming all work as solely authored.',
    evidence: [{ label: 'Project README', url: 'https://github.com/kaustubhdua/smart_waste_project/blob/main/README.md' }, { label: 'Repository and source', url: 'https://github.com/kaustubhdua/smart_waste_project' }],
    badges: ['0-100 priority score', 'OR-Tools routing', 'Synthetic data'],
    biome: 'basalt',
    kind: 'Own repository',
    image: 'img/projects/smartwaste.png',
    contribution: 'Synthetic-data engineering prototype. This case study summarizes the repository pipeline; identify individual implementation ownership from commits and source files before claiming all work as solely authored.',
    evidence: [{ label: 'Project README', url: 'https://github.com/kaustubhdua/smart_waste_project/blob/main/README.md' }, { label: 'Repository and source', url: 'https://github.com/kaustubhdua/smart_waste_project' }],
    summary:
      'An end-to-end pipeline that predicts bin fill levels, scores collection priority from 0 to 100 and optimises truck routes with Google OR-Tools.',
    stack: ['Python', 'Random Forest', 'OR-Tools', 'Streamlit', 'Folium'],
    repo: 'https://github.com/kaustubhdua/smart_waste_project',
    live: 'https://smartwasteproject-glmvz89ttkxfktcssfdfuc.streamlit.app/',
    problem:
      'Collection trucks waste distance on bins that are not full yet. This prototype shows how predicted fill levels and a priority score can drive a capacity-aware routing plan.',
    features: [
      'Synthetic IoT-style time series with lag features and rolling averages',
      'Random Forest regressor that predicts future fill levels',
      'Priority score from 0 to 100 built from fill level, elapsed time and bin criticality',
      'Capacitated vehicle routing solved with OR-Tools within truck capacity limits',
      'Streamlit and Folium dashboard with adjustable thresholds and route maps',
    ],
    architecture: [
      { title: 'Preprocessing', text: 'Generates synthetic bin data and engineers the time-series features.' },
      { title: 'Prediction', text: 'Trains and persists the Random Forest model.' },
      { title: 'Priority engine', text: 'Fuzzy-style membership curves turn raw signals into a single score.' },
      { title: 'Optimisation', text: 'An OR-Tools vehicle routing solver minimises travel distance.' },
    ],
    decisions: [
      'The pipeline is split into four separable stages, each in its own module.',
      'Priority is a normalised score rather than a hard threshold, so the dashboard can tune it live.',
      'The README states plainly that the data is synthetic and the routing environment is simulated.',
    ],
    limits: [
      'Data is synthetic and the routing environment is simulated.',
      'It is not evidence of a live municipal deployment.',
    ],
    contribution: "Synthetic-data engineering prototype. This case study summarizes the repository pipeline; identify individual implementation ownership from commits and source files before claiming all work as solely authored.",
    evidence: [
      { label: "Project README", url: "https://github.com/kaustubhdua/smart_waste_project/blob/main/README.md" },
      { label: "Repository and source", url: "https://github.com/kaustubhdua/smart_waste_project" },
    ],
    status:
      'Engineering prototype with a hosted dashboard. Model accuracy, route quality and savings are treated as experiments, so no results are claimed.',
  },
  {
    id: 'jyc',
    stage: 'Live site',
    name: 'JYC Website',
    tagline: 'Public website for JIIT Youth Club',
    contribution: 'Multi-contributor public-facing club website. This case study summarizes the shared product and quality workflow; use commits and pull requests for personal attribution. Production QA must be green before describing a release as fully verified.',
    evidence: [{ label: 'Project README', url: 'https://github.com/kaustubhdua/JYC-Website/blob/main/README.md' }, { label: 'GitHub Actions', url: 'https://github.com/kaustubhdua/JYC-Website/actions' }, { label: 'Visual route matrix test', url: 'https://github.com/kaustubhdua/JYC-Website/blob/main/scripts/visual-route-matrix.spec.js' }],
    badges: ['CodeQL', 'Playwright QA', 'PWA shell'],
    biome: 'crimson',
    kind: 'Own repository',
    image: 'img/projects/jyc.png',
    contribution: 'Multi-contributor public-facing club website. This case study summarizes the shared product and quality workflow; use commits and pull requests for personal attribution. Production QA must be green before describing a release as fully verified.',
    evidence: [{ label: 'Project README', url: 'https://github.com/kaustubhdua/JYC-Website/blob/main/README.md' }, { label: 'GitHub Actions', url: 'https://github.com/kaustubhdua/JYC-Website/actions' }, { label: 'Visual route matrix test', url: 'https://github.com/kaustubhdua/JYC-Website/blob/main/scripts/visual-route-matrix.spec.js' }],
    summary:
      'The public website for JIIT Youth Club (JYC) at the Sector 128 campus: events, clubs, gallery, archive, announcements and recruitment.',
    stack: ['React 19', 'Vite', 'React Router', 'Supabase', 'Playwright', 'GitHub Actions'],
    repo: 'https://github.com/kaustubhdua/JYC-Website',
    live: 'https://jyc-website-eight.vercel.app',
    problem:
      'JYC coordinates major college events and fests and needs one public home for them. The site is deliberately not a student portal or social network.',
    features: [
      'Public sections for home, about, history, clubs and hubs, events, fests, gallery, archive, team, achievements and contact',
      'Event lifecycle from draft and review through registration to results and archive',
      'Supabase-backed content and Edge Functions',
      'PWA shell with a service worker',
    ],
    architecture: [
      { title: 'Front end', text: 'React 19, Vite 8 and React Router with a CSS-first interaction layer.' },
      { title: 'Content', text: 'Supabase-backed records for clubs, events and gallery items.' },
      { title: 'Quality gates', text: 'Static QA covers source integrity, security, SEO, accessibility and media; Playwright runs browser QA.' },
      { title: 'CI', text: 'GitHub Actions workflows including CodeQL.' },
    ],
    decisions: [
      'Historical material is treated as source material, not automatic proof of current clubs or office holders.',
      'Unknown social handles are left blank instead of guessed.',
      'Out-of-scope features (accounts, attendance, public AI chat, social feeds) are explicitly excluded.',
    ],
    limits: [
      'The README lists running the browser suite against the deployed site and verifying the production deployment as remaining work.',
    ],
    contribution: "Multi-contributor public-facing club website. This case study summarizes the shared product and quality workflow; use commits and pull requests for personal attribution. Production QA must be green before describing a release as fully verified.",
    evidence: [
      { label: "Project README", url: "https://github.com/kaustubhdua/JYC-Website/blob/main/README.md" },
      { label: "GitHub Actions", url: "https://github.com/kaustubhdua/JYC-Website/actions" },
      { label: "Visual route matrix test", url: "https://github.com/kaustubhdua/JYC-Website/blob/main/scripts/visual-route-matrix.spec.js" },
    ],
    status: 'Live public site with automated quality gates.',
  },
  {
    id: 'adaptai',
    stage: 'Team project',
    name: 'Adapt AI',
    tagline: 'Hardware-aware local AI assistant',
    contribution: 'Contributor in a team project; this repository is a fork. The README does not itemize individual contributions, so use commits and pull requests under my account to support specific implementation claims.',
    evidence: [{ label: 'Fork repository', url: 'https://github.com/kaustubhdua/adapt-ai' }, { label: 'Upstream project', url: 'https://github.com/ManOfDiamond/adapt-ai' }],
    badges: ['Ollama', 'Local inference', 'Team project'],
    biome: 'wastes',
    kind: 'Team project · contributor',
    image: 'img/projects/adaptai.png',
    contribution: 'Contributor in a team project; this repository is a fork. The README does not itemize individual contributions, so use commits and pull requests under my account to support specific implementation claims.',
    evidence: [{ label: 'Fork repository', url: 'https://github.com/kaustubhdua/adapt-ai' }, { label: 'Upstream project', url: 'https://github.com/ManOfDiamond/adapt-ai' }],
    summary:
      'A team-built local assistant, which I contributed to, that recommends an Ollama model based on the machine’s RAM and VRAM, for on-device chat, file and Python workflows.',
    stack: ['FastAPI', 'Ollama', 'Local inference', 'JavaScript'],
    repo: 'https://github.com/kaustubhdua/adapt-ai',
    live: null,
    problem:
      'Choosing a local model that actually fits your hardware is trial and error. Adapt AI inspects the available memory and recommends one.',
    features: [
      'Model recommendation based on available RAM and VRAM',
      'On-device chat, file and Python workflows through Ollama',
    ],
    architecture: [
      { title: 'API', text: 'FastAPI service in front of local inference.' },
      { title: 'Inference', text: 'Ollama runs the recommended model on the user’s own machine.' },
    ],
    decisions: ['Inference stays local, so conversations and files never leave the device.'],
    limits: [
      'The upstream repository is owned by a teammate (ManOfDiamond) and the link here is my fork. The README does not itemise individual contributions.',
    ],
    contribution: "Contributor in a team project; this repository is a fork. The README does not itemize individual contributions, so use commits and pull requests under my account to support specific implementation claims.",
    evidence: [
      { label: "Fork repository", url: "https://github.com/kaustubhdua/adapt-ai" },
      { label: "Upstream project", url: "https://github.com/ManOfDiamond/adapt-ai" },
    ],
    status: 'Team project I contributed to. No performance figures are claimed.',
  },
];

/** Forks and smaller prototypes. Shown separately and labelled honestly. */
export const explored = [
  {
    name: 'GitGlobe',
    kind: 'Fork of ydabas-hue/GitGlobe',
    text: 'An interactive 3D globe that places GitHub repositories by what they do, using embeddings, Three.js and a FastAPI search API.',
    repo: 'https://github.com/kaustubhdua/GitGlobe',
    live: 'https://gitglobe-yd-mj.vercel.app',
  },
  {
    name: 'SATARK',
    kind: 'Fork of harshilgupta926/Satark',
    text: 'A Streamlit workspace for triaging suspicious messages, links, images, QR codes and PDFs. A learning aid, not an antivirus.',
    repo: 'https://github.com/kaustubhdua/Satark',
    live: 'https://satark-32uppvjxwmderrchbhj7gj.streamlit.app/',
  },
  {
    name: 'AkashChalak',
    kind: 'Prototype',
    text: 'A satellite-assisted air-quality and hotspot decision-support prototype for India.',
    repo: 'https://github.com/kaustubhdua/Akash-Chalak',
    live: null,
  },
  {
    name: 'Smart Bike Taxi',
    kind: 'Academic simulation · C++17',
    text: 'A terminal ride-booking simulation on a small Noida road network: Dijkstra shortest paths, a FIFO request queue, nearest-driver dispatch, fare estimates and local persistence. Not connected to real riders, maps or payments.',
    repo: 'https://github.com/kaustubhdua/Smart_bike_taxi_platform',
    live: null,
  },
  {
    name: 'JIIT Toppers',
    kind: 'Foundation prototype · Next.js',
    text: 'A student-first workspace idea for JIIT: academics, study resources, exam prep and campus info. Currently a UI scaffold with local attendance and SGPA estimators; there is no database, login or official JIIT data.',
    repo: 'https://github.com/kaustubhdua/Jiit-toppers-',
    live: null,
  },
  {
    name: 'Weather Core Matrix',
    kind: 'Small project · vanilla JS',
    text: 'A lightweight weather dashboard: search a city and see current conditions. Plain HTML, CSS and JavaScript with no build step.',
    repo: 'https://github.com/kaustubhdua/weather-core-matrix',
    live: null,
  },
  {
    name: 'Nord Studio Task Manager',
    kind: 'Small project · vanilla JS',
    text: 'A compact task manager with priorities, all/active/completed filters and a remaining-tasks counter. No framework or build step.',
    repo: 'https://github.com/kaustubhdua/nord-studio-task-manager',
    live: null,
  },
];
