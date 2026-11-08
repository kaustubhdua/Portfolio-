const STACK_GROUPS = [
  { id: 'languages', title: 'Languages', items: ['Python', 'TypeScript', 'C++17', 'JavaScript', 'SQL'] },
  { id: 'frontend', title: 'Frontend', items: ['React 19', 'React DOM', 'Next.js 16', 'Vite 8', 'Vite 6', 'Tailwind CSS 4', 'Leaflet', 'Three.js', 'Motion', 'OGL', 'Streamlit', 'Folium', 'Streamlit-Folium', 'Vanilla HTML/CSS/JavaScript', 'lucide-react', 'Hugeicons', 'canvas-confetti'] },
  { id: 'backend', title: 'Backend', items: ['FastAPI', 'Starlette', 'Uvicorn', 'Boost.Beast', 'Supabase JS', 'Supabase SSR', 'Ollama', 'Vosk', 'Exotel AgentStream', 'Tesseract OCR', 'eSpeak NG', 'FFmpeg', 'Pydantic', 'Pydantic Settings', 'HTTPX', 'WebSockets', 'python-dotenv', 'python-multipart'] },
  { id: 'data', title: 'Data & Systems', items: ['PostgreSQL', 'PostgreSQL/libpq', 'PostGIS', 'SQLAlchemy', 'Psycopg 3', 'Alembic', 'OR-Tools', 'OSRM', 'Nominatim', 'pandas', 'NumPy', 'scikit-learn', 'Random Forest', 'joblib'] },
  { id: 'tools', title: 'Tools & Quality', items: ['PWA / Service Worker', 'Vercel Functions', 'pytest', 'Ruff', 'Docker', 'Docker Compose', 'GitHub Actions', 'Playwright', '@playwright/test', 'axe-core', 'CMake', 'libcurl', 'OpenSSL', 'nlohmann/json', 'GSAP', 'Sharp', 'Oxlint', 'Hatchling', 'Node.js', 'CodeQL', 'npm audit', 'ESLint'] },
  { id: 'design', title: 'Experience & Design', items: ['React Router', 'GSAP', 'React Icons', 'Sharp', 'OGL/WebGL'] },
  { id: 'security', title: 'Security & Testing', items: ['PyJWT', 'OpenCV', 'PDF.js', 'jsQR', 'ReportLab', 'Android ADB', 'Android Emulator', 'Appium', 'PostgreSQL 17'] },
];

/** Group project technologies by evidence-backed role; keep the core skills list intentionally curated. */
export const getProjectStackGroups = (stack = []) => STACK_GROUPS
  .map((group) => ({ ...group, items: stack.filter((technology) => group.items.includes(technology)) }))
  .filter((group) => group.items.length > 0);

/**
 * Featured projects. Every statement is taken from the project's public README or
 * GitHub page. Limits are listed honestly, and no measured results are claimed
 * because none of these READMEs publish any.
 */

export const biomes = {
  crimson: { name: 'Crimson Forest', dayName: 'Sunny Meadow', note: 'Full-stack platforms' },
  basalt: { name: 'Basalt Deltas', dayName: 'Stone Highlands', note: 'Data and optimisation' },
  wastes: { name: 'Nether Wastes', dayName: 'Golden Hour', note: 'Applied AI' },
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
    workflow: 'Field request → machine slot → dispatch → verified lot',
    flagship: false,
    stage: 'Prototype',
    name: 'NIRDHOOM',
    tagline: 'Field-to-offtake coordination with traceable evidence',
    contribution: 'Multi-contributor prototype. The case study covers the shared product; the repository history shows who built what.',
    evidence: [{"label":"Project README","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/README.md"},{"label":"Product release roadmap","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/docs/PRODUCT-RELEASE-ROADMAP.md"},{"label":"CI workflow","url":"https://github.com/kaustubhdua/nihdhoom/actions/workflows/ci.yml"}],
    badges: ['PWA', 'PostGIS + RLS', 'Offline evidence queue'],
    biome: 'crimson',
    kind: 'Multi-contributor prototype',
    image: 'img/projects/nirdhoom.png',
    summary:
      'A field-to-offtake workflow linking farmer requests, time-bound machine capacity, dispatch, operator evidence, verified residue lots and buyer demand.',
    stack: ['TypeScript', 'React 19', 'React DOM', 'Vite 8', 'Tailwind CSS 4', 'Supabase JS', 'PostgreSQL', 'PostGIS', 'Leaflet', 'Three.js', 'Python', 'FastAPI', 'OR-Tools', 'HTTPX', 'Motion', 'Vercel Functions', 'PWA / Service Worker', 'lucide-react', 'canvas-confetti', 'Hugeicons', 'Oxlint', 'GitHub Actions'],
    repo: 'https://github.com/kaustubhdua/nihdhoom',
    live: 'https://nihdhoom-9qiu.vercel.app/',
    liveLabel: 'Hosted prototype',
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
    status:
      'Prototype and integration foundation. Seeded records and indicative planning values are kept separate from live records, and no performance figures are claimed.',
    research: ["Demand-driven coordination matches field deadlines to time-bound machine capacity, rather than merely listing machinery.","Residue needs a traceable lifecycle linking source field, quantity, quality, custody, pickup and destination; buyer interest is not a contract.","Verification is layered: operator evidence, timestamps, field-boundary provenance and satellite observations answer different questions. A satellite fire point is not proof about an individual field.","Punjab's 2025 season-end fire count is public context, never an outcome attributable to this prototype."],
  },
{
    id: 'saathi',
    workflow: 'Intent → sourced tool → local voice → human escalation',
    flagship: true,
    stage: 'MVP',
    name: 'Saathi',
    tagline: 'Local-first Hindi/Hinglish voice assistance',
    contribution: 'Multi-contributor MVP. The case study covers the shared product and architecture; the repository history shows individual contributions.',
    evidence: [{"label":"Project README","url":"https://github.com/kaustubhdua/Saathi/blob/main/README.md"},{"label":"Evaluation methodology","url":"https://github.com/kaustubhdua/Saathi/blob/main/docs/EVALUATION.md"},{"label":"GitHub Actions","url":"https://github.com/kaustubhdua/Saathi/actions"}],
    badges: ['120-case synthetic benchmark', 'Hindi + Hinglish', 'Human escalation'],
    biome: 'crimson',
    kind: 'Multi-contributor MVP',
    image: 'img/projects/saathi.png',
    summary:
      'A Hindi/Hinglish assistance MVP combining deterministic intent routing, source-stamped tools, local speech defaults, document OCR and consent-aware human escalation.',
    stack: ['Python', 'FastAPI', 'Starlette', 'Uvicorn', 'Pydantic Settings', 'HTTPX', 'python-dotenv', 'python-multipart', 'WebSockets', 'Vosk', 'Next.js 16', 'React 19', 'React DOM', 'TypeScript', 'Motion', 'OGL', 'lucide-react', 'Supabase SSR', 'Supabase JS', 'Ollama', 'Tesseract OCR', 'eSpeak NG', 'FFmpeg', 'Streamlit', 'Exotel AgentStream', 'pytest', 'ESLint', 'Docker', 'GitHub Actions'],
    repo: 'https://github.com/kaustubhdua/Saathi',
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
    status:
      'MVP prototype. Its previously listed public demo URL no longer resolves, so no live demo is advertised until a working deployment is verified. The next milestone is a measured, provider-backed voice slice; no accuracy or performance numbers are claimed.',
    research: ["The strongest architecture choice is deterministic intent and tool policy around an assistant, rather than allowing an LLM to decide factual truth.","Factual answers need source provenance and retrieval time; partial provider failures and ambiguous records must be disclosed instead of guessed.","The 120-case intent and 40-field extraction suites are synthetic regression benchmarks, not real-world speech accuracy measurements.","Voice readiness is end-to-end: STT, tool execution, TTS, consent, provider failure handling and measured p50/p95 latency must all be demonstrated."],
  },
{
    id: 'patchpilot',
    workflow: 'Unified diff → integrity checks → evidence → review',
    flagship: false,
    stage: 'Early-stage',
    name: 'PatchPilot',
    tagline: 'Evidence-led triage for untrusted code diffs',
    contribution: 'Personal project. It does deterministic diff triage today; precision and recall in production are not established, and it is not a formal security audit.',
    evidence: [{"label":"README and quick start","url":"https://github.com/kaustubhdua/PatchPilot/blob/main/README.md"},{"label":"Benchmark methodology","url":"https://github.com/kaustubhdua/PatchPilot/blob/main/docs/benchmark-methodology.md"},{"label":"Roadmap and release gate","url":"https://github.com/kaustubhdua/PatchPilot/blob/main/ROADMAP.md"},{"label":"CI workflow","url":"https://github.com/kaustubhdua/PatchPilot/actions/workflows/ci.yml"}],
    badges: ['0-100 risk score', 'Rate-limited API', 'Non-root Docker'],
    biome: 'soul',
    kind: 'Personal project',
    image: 'img/projects/patchpilot.png',
    summary:
      'A deterministic diff-review tool that surfaces parser integrity, risky paths, evidence-linked findings and test suggestions—without cloning or executing submitted code.',
    stack: ['Python', 'FastAPI', 'Pydantic', 'Uvicorn', 'Vanilla HTML/CSS/JavaScript', 'HTTPX', 'Hatchling', 'pytest', 'Ruff', 'Docker', 'Node.js', 'GitHub Actions'],
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
    status:
      'Early-stage tool with tests and CI. No live demo exists, and no accuracy figures are claimed.',
    research: ["PatchPilot treats submitted unified diffs as untrusted text: bounded request size, strict schemas and no cloning or execution of the target repository.","Parser integrity is part of the result. Malformed or incomplete hunks are surfaced and analysis_complete becomes false so a partial low score cannot look reassuring.","Each finding carries matched evidence and file/line context; the 0–100 score is a coarse triage heuristic, not a defect probability or merge decision.","The current labelled corpus is small, synthetic and authored alongside the rules. Its scores are regression evidence, not production precision or recall."],
  },
{
    id: 'smartwaste',
    workflow: 'Telemetry → priority → approved jobs → optimized routes',
    flagship: false,
    stage: 'Prototype',
    name: 'Smart Waste',
    tagline: 'Telemetry-to-dispatch waste operations',
    contribution: "Engineering prototype on synthetic data. The case study describes the repository's pipeline; the commit history shows individual contributions.",
    evidence: [
      { label: 'Project README and current release boundary', url: 'https://github.com/kaustubhdua/smart_waste_project/blob/main/README.md' },
      { label: 'Release checklist', url: 'https://github.com/kaustubhdua/smart_waste_project/blob/main/docs/RELEASE_CHECKLIST.md' },
      { label: 'CI and browser QA', url: 'https://github.com/kaustubhdua/smart_waste_project/actions' },
    ],
    badges: ['Telemetry provenance', 'PostGIS + OR-Tools', 'Synthetic demo data'],
    biome: 'basalt',
    kind: 'Engineering prototype',
    image: 'img/projects/smartwaste.png',
    summary:
      'A full-stack operations loop: provenance-aware device telemetry, transparent prioritisation, approved collection jobs, PostGIS context, capacity-constrained routing and driver verification.',
    stack: ['Python', 'FastAPI', 'Uvicorn', 'SQLAlchemy', 'Psycopg 3', 'Pydantic Settings', 'HTTPX', 'python-multipart', 'PostgreSQL', 'PostGIS', 'Alembic', 'OR-Tools', 'OSRM', 'pandas', 'NumPy', 'scikit-learn', 'Random Forest', 'joblib', 'Streamlit', 'Folium', 'Streamlit-Folium', 'Vanilla HTML/CSS/JavaScript', 'Docker Compose', 'pytest', 'Playwright', 'GitHub Actions', 'CodeQL'],
    repo: 'https://github.com/kaustubhdua/smart_waste_project',
    demoNote: 'No verified public demo',
    problem:
      'Collection trucks waste distance on bins that are not full yet. This prototype shows how predicted fill levels and a priority score can drive a capacity-aware routing plan.',
    features: [
      'Per-device credentials, bin-scoped telemetry, timestamp/freshness checks, idempotency and explicit live/imported/demo provenance',
      'Persistent collection jobs with approval, assignment, lifecycle transitions, exception reporting and completed-work verification',
      'Transparent three-input prioritisation using fill level, time since verified emptying and bin criticality',
      'Road-distance routing with OSRM and OR-Tools capacity-constrained vehicle routing, persisted route plans and transactional dispatch',
      'Responsive operator and driver workspaces with named accounts, expiring sessions, role checks and security audit events',
      'Optional Random Forest next-observation forecasts with timestamp-aware features and chronological holdout evaluation',
    ],
    architecture: [
      { title: 'API & identity', text: 'FastAPI endpoints validate device and operator requests, enforce role boundaries, and expose collection, telemetry and dispatch workflows.' },
      { title: 'Persistence & geospatial', text: 'PostgreSQL/PostGIS with SQLAlchemy and Alembic migrations stores telemetry, bins, jobs, vehicles, service events and route plans.' },
      { title: 'Optimisation & ML', text: 'OSRM road-distance matrices feed an OR-Tools capacity-constrained route solver; a separate optional Random Forest path forecasts the next observed fill value.' },
    ],
    decisions: [
      'Every reading carries live, imported or demo provenance; synthetic records are never silently treated as real sensor data.',
      'Dispatch requires approved jobs and capacity-checked vehicles, with route plans and assignments persisted transactionally.',
      'The forecasting path checks timestamp cadence and model schema instead of trusting stale or incompatible artifacts.',
    ],
    limits: [
      'Demo records are synthetic; physical sensor calibration, a live field pilot and operational savings have not been validated.',
      'Production restore drills and local field calibration remain release gates; the prototype is not a proven municipal deployment.',
    ],
    status:
      'Full-stack engineering prototype with FastAPI, PostgreSQL/PostGIS, authenticated operator and driver workflows, CI, CodeQL and Playwright smoke coverage. No live municipal deployment, field-pilot outcome or operational-savings claim is made.',
    research: ["The core engineering story is the operations loop: authenticated device telemetry → prioritisation → approved jobs → capacity-aware routes → persisted dispatch → driver completion and verification.","Telemetry carries live/imported/demo provenance, timestamp freshness and idempotency. Synthetic seed data must never be mistaken for physical sensor evidence.","PostGIS supports indexed nearby-bin queries; OSRM road distances feed OR-Tools capacity-constrained routing, with route plans and assignments persisted transactionally.","The optional Random Forest forecast is timestamp-aware and guarded by chronological evaluation; no field calibration, municipal deployment or savings claim is established."],
  },
{
    id: 'rideforge',
    workflow: 'Quote → booking → driver offer → redispatch → trip',
    flagship: true,
    stage: 'Portfolio MVP',
    name: 'RideForge',
    tagline: 'Transactional bike-taxi booking and dispatch',
    contribution: 'Personal engineering project. The repository documents the implemented C++ API, PostgreSQL workflows, web workspaces and automated verification; no live commercial service or deployment is claimed.',
    evidence: [
      { label: 'Project README and release scope', url: 'https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/README.md' },
      { label: 'Release-readiness evidence', url: 'https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/docs/RELEASE_READINESS_EVIDENCE.md' },
      { label: 'Backend OpenAPI contract', url: 'https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/backend/openapi.yaml' },
      { label: 'Full release-readiness workflow', url: 'https://github.com/kaustubhdua/Smart_bike_taxi_platform/actions/workflows/release-readiness.yml' },
    ],
    badges: ['C++17 API', 'PostgreSQL bookings', 'Durable driver dispatch'],
    biome: 'basalt',
    kind: 'Personal project',
    image: 'img/projects/rideforge.svg',
    summary: 'A multi-role bike-taxi MVP built around persisted PostgreSQL bookings, expiring driver offers, sequential redispatch, cancellation and graph-based route planning.',
    stack: ['C++17', 'Boost.Beast', 'CMake', 'libcurl', 'PostgreSQL/libpq', 'OpenSSL', 'nlohmann/json', 'React 19', 'React DOM', 'TypeScript', 'Vite 6', 'Leaflet', 'Motion', 'lucide-react', 'Nominatim', 'OSRM', 'Docker', 'Playwright', '@playwright/test', 'axe-core', 'GitHub Actions', 'CodeQL', 'npm audit'],
    repo: 'https://github.com/kaustubhdua/Smart_bike_taxi_platform',
    live: null,
    demoNote: 'No live deployment claimed',
    problem: 'A ride request is more than a map pin: quotes, booking, driver eligibility, offer expiry, cancellation and status updates must remain consistent across several roles.',
    features: [
      'C++17 HTTP API with PostgreSQL-backed quotes, passenger registration, booking, cancellation and trip history',
      'Driver workspace with eligible ride queue, durable 45-second offers, expiry and sequential redispatch',
      'Admin workspace for driver approval, ride search and support-report triage',
      'Graph-based shortest-path routing with deterministic tie handling and edge-case tests',
      'Authenticated server-sent ride updates with reconnect and polling recovery',
    ],
    architecture: [
      { title: 'API', text: 'C++17 Boost.Beast service with bounded PostgreSQL connection pooling, request limits and readiness checks.' },
      { title: 'Persistence', text: 'Versioned PostgreSQL migrations for accounts, rides, quotes, driver offers, audit events and support reports.' },
      { title: 'Web', text: 'React and TypeScript workspaces with a lazy-loaded Leaflet map and same-origin API/SSE proxy.' },
    ],
    decisions: [
      'Booking and quote consumption are transactional and idempotent.',
      'Driver offers have explicit expiry and redispatch rather than relying on a browser timer.',
      'Route and dispatch edge cases are tested; benchmark claims are not made without reproducible samples.',
    ],
    limits: [
      'Portfolio MVP; no live deployment or commercial ride service is claimed.',
      'Payments, real identity/vehicle verification and safety operations are outside the current release scope.',
      'Realtime reconnect and external routing-provider behaviour still need broader production-like validation.',
    ],
    status: 'A tested portfolio MVP with C++/sanitizer, API, PostgreSQL migration, web/Playwright/accessibility and container release gates. The latest verified full-suite result applies to its recorded tested commit, not a live production deployment.',
    research: ["The differentiator is durable multi-role ride state, not just a map: quotes, bookings, driver offers, expiry, redispatch, cancellation and trip history share a transactional backend.","The C++17 Boost.Beast API and PostgreSQL layer use bounded connection handling, migrations and explicit request/readiness boundaries.","Driver offers are durable and time-limited, with sequential redispatch; SSE/outbox updates are paired with reconnect and polling recovery.","Current evidence supports a substantial portfolio MVP, not a commercial taxi service: public deployment, real two-device journeys, compliance and transport approvals remain unverified."],
  }

// Additional flagship case studies selected for demonstrated engineering depth,
// real product context, and inspectable repository evidence.
const flagshipTemplate = projects.find((project) => project.id === 'rideforge');

projects.push(
  {
    ...flagshipTemplate,
    id: 'jyc',
    workflow: 'Discover campus → explore societies → follow events → connect',
    flagship: true,
    stage: 'Official platform',
    name: 'JIIT Youth Club 128',
    tagline: 'Official campus community and events platform',
    contribution: 'Technical-team contribution to an internal campus platform. Describe only the modules and changes attributable to your own commits; the case study does not claim sole authorship.',
    evidence: [
      { label: 'Official project repository', url: 'https://github.com/kaustubhdua/JYC-Website' },
      { label: 'Repository architecture and maintenance policy', url: 'https://github.com/kaustubhdua/JYC-Website#platform-overview' },
    ],
    badges: ['React 19', 'WebGL interactions', 'PWA + accessibility'],
    biome: 'crimson',
    kind: 'Technical-team platform',
    image: 'img/projects/jyc.svg',
    summary: 'The official JIIT Youth Club 128 platform for societies, events, leadership, announcements and campus media.',
    stack: ['TypeScript', 'React 19', 'React DOM', 'Vite 8', 'React Router', 'Supabase JS', 'PostgreSQL', 'OGL/WebGL', 'GSAP', 'Motion', 'Sharp', 'PWA / Service Worker', 'Playwright', 'GitHub Actions'],
    repo: 'https://github.com/kaustubhdua/JYC-Website',
    problem: 'Campus communities need a reliable public home for 23+ societies, major events, leadership information, announcements and a verified media archive.',
    features: [
      'Society and technical/cultural hub directory',
      'Campus events, fests and synchronized announcements/calendar',
      'Faculty advisory and student council information',
      'Responsive AVIF/WebP media pipeline',
      'Interactive WebGL canvas, particle motion and 3D tilt interactions',
      'Route-shell pre-rendering, PWA caching and semantic accessibility work',
    ],
    architecture: [
      { title: 'Application', text: 'React 19, Vite and React Router organise the public campus experience into route-level sections.' },
      { title: 'Experience', text: 'WebGL canvas effects, particle motion, 3D tilt and glass-like micro-interactions provide a distinctive visual layer.' },
      { title: 'Data and delivery', text: 'Supabase Cloud, Row Level Security and Edge Functions support managed data access; optimized media is delivered through a CDN pipeline.' },
      { title: 'Quality', text: 'Route-shell pre-rendering, PWA offline caching and semantic accessibility are part of the platform engineering scope.' },
    ],
    decisions: [
      'Treat the site as an official information surface, not a generic club landing page.',
      'Keep media derivatives optimized so high-resolution campus photography does not dominate transfer cost.',
      'Use semantic route structure and accessible interaction states alongside visual effects.',
    ],
    limits: [
      'The repository is closed to external contributions and maintained by the authorized technical team.',
      'The case study intentionally does not claim sole ownership of the platform or work outside your own verified contribution history.',
      'Do not disclose internal operational details or private user data in a public resume.',
    ],
    status: 'Official internal campus platform. Public repository documentation describes the platform architecture; attribute personal implementation scope from your own commit history.',
    research: [
      'This is the strongest real-world product-context story in the set: a campus platform with actual organizational stakeholders and information architecture.',
      'The technical narrative should emphasize the specific modules you personally implemented, reviewed or maintained—not the total feature inventory.',
      'Visual polish is valuable only when paired with route performance, media optimization, offline behavior and accessibility.',
    ],
  },
  {
    ...flagshipTemplate,
    id: 'bharatsim',
    workflow: 'Plan constrained tests → queue APK → run worker → inspect evidence',
    flagship: true,
    stage: 'Controlled-beta MVP',
    name: 'BharatSim',
    tagline: 'Evidence-driven Android resilience testing',
    contribution: 'Personal engineering project. The repository documents the implemented API, dashboard, worker protocol and fixture-based emulator path; production APK execution is intentionally gated.',
    evidence: [
      { label: 'Project README and current release status', url: 'https://github.com/kaustubhdua/Bharat-Sim/blob/main/README.md' },
      { label: 'Planner methodology', url: 'https://github.com/kaustubhdua/Bharat-Sim/blob/main/docs/PLANNER.md' },
      { label: 'Evidence synthesis', url: 'https://github.com/kaustubhdua/Bharat-Sim/blob/main/docs/EVIDENCE_SYNTHESIS.md' },
      { label: 'GitHub Actions', url: 'https://github.com/kaustubhdua/Bharat-Sim/actions' },
    ],
    badges: ['Android ADB + Appium', 'Lease-based worker', 'Evidence synthesis'],
    biome: 'basalt',
    kind: 'Personal engineering project',
    image: 'img/projects/bharatsim.svg',
    summary: 'An Android resilience-testing platform that plans risk-focused scenarios, queues APK jobs and correlates worker, emulator and logcat evidence.',
    stack: ['Python', 'FastAPI', 'React 19', 'React DOM', 'TypeScript', 'Vite 8', 'PostgreSQL 17', 'PyJWT', 'Android ADB', 'Android Emulator', 'Appium', 'Playwright', 'Docker Compose', 'pytest', 'GitHub Actions'],
    repo: 'https://github.com/kaustubhdua/Bharat-Sim',
    live: 'https://bharat-sim-81g2.vercel.app/',
    liveLabel: 'Guest preview',
    problem: 'Mobile teams need to test how apps behave under constrained device and network conditions, while distinguishing a proposed test from a test that actually ran and produced trustworthy evidence.',
    features: [
      'Deterministic risk-first planner with personas and editable critical user journeys',
      'APK upload validation, size bounds and SHA-256 fingerprinting',
      'Authenticated job claims, expiring leases, heartbeats and stale-result rejection',
      'ADB smoke worker and fixture-based Android emulator CI journey',
      'Line-addressable logcat signals for crashes, ANRs, OOM, network and storage',
      'Evidence synthesis across worker steps, condition readback and diagnostic markers',
    ],
    architecture: [
      { title: 'Planner and API', text: 'FastAPI provides risk planning, APK validation, run lifecycle and worker protocol endpoints.' },
      { title: 'Dashboard', text: 'React, TypeScript and Vite expose personas, plans, run history, capabilities and evidence reports.' },
      { title: 'Worker', text: 'A Python polling worker claims short-lived leases, verifies APK hashes, executes guarded ADB smoke steps and posts bounded results.' },
      { title: 'Persistence', text: 'SQLite supports local development; Docker Compose provisions PostgreSQL 17. Supabase-backed production persistence is separately gated.' },
    ],
    decisions: [
      'A test plan is never labelled as an executed test; the UI distinguishes planned, queued, running and completed evidence.',
      'Workers use expiring leases, heartbeat and stale-token rejection to make retries and crashes explicit.',
      'APK-derived inputs are bounded and validated before they reach shell-facing operations.',
      'The emulator network fixture preserves TLS through an allowlisted CONNECT proxy instead of trusting a public speed-test endpoint.',
    ],
    limits: [
      'Production APK execution remains disabled until a separately verified isolated worker host is provisioned.',
      'The live Vercel readiness endpoint remains fail-closed until production database and server-only storage credentials are configured.',
      'The emulator fixture proves only the source-built test APK path, not arbitrary uploaded APK compatibility or isolation.',
      'Packet loss and CPU throttling are not supported; RAM is report-only.',
    ],
    status: 'Controlled-beta MVP with a successful multi-job CI suite and a fixture-based Android emulator workflow. Production worker isolation and authenticated persistent production round trips remain open release gates.',
    research: [
      'The strongest differentiator is the evidence lifecycle: APK fingerprint → authenticated job lease → worker heartbeat → ADB execution → logcat observations → correlated report.',
      'Pairwise interaction planning is a prioritization aid, not proof that every combination was executed.',
      'Network-shaping measurements are fixture diagnostics and should be presented with their exact transfer size, proxy path and limitations.',
    ],
  },
  {
    ...flagshipTemplate,
    id: 'satark',
    workflow: 'Collect artifacts → validate integrity → correlate → human review',
    flagship: true,
    stage: 'Security prototype',
    name: 'SATARK Sentinel',
    tagline: 'Evidence-first incident investigation and threat triage',
    contribution: 'Personal engineering project. FIRSTLIGHT and deterministic local analysis are the core story; optional AI summaries and response adapters must not be presented as production-validated capabilities.',
    evidence: [
      { label: 'Project README and safety boundaries', url: 'https://github.com/kaustubhdua/Satark/blob/main/README.md' },
      { label: 'FIRSTLIGHT scope', url: 'https://github.com/kaustubhdua/Satark/blob/main/docs/FIRSTLIGHT.md' },
      { label: 'Native endpoint sensor guide', url: 'https://github.com/kaustubhdua/Satark/blob/main/docs/NATIVE_ENDPOINT_SENSOR.md' },
      { label: 'CI and security workflows', url: 'https://github.com/kaustubhdua/Satark/actions' },
    ],
    badges: ['SHA-256 evidence checks', 'Deterministic triage', 'Local-first AI'],
    biome: 'soul',
    kind: 'Personal security engineering project',
    image: 'img/projects/satark.svg',
    summary: 'A security investigation prototype that organizes suspicious artifacts, evidence integrity, deterministic findings, incident timelines and human-reviewed response decisions.',
    stack: ['Python', 'FastAPI', 'Next.js 15', 'React 19', 'Streamlit', 'Ollama', 'OpenCV', 'PDF.js', 'jsQR', 'ReportLab', 'Docker', 'pytest', 'GitHub Actions', 'CodeQL'],
    repo: 'https://github.com/kaustubhdua/Satark',
    live: 'https://satark-rose.vercel.app/',
    liveLabel: 'Deployment — verify current release health',
    problem: 'Security investigations often combine messages, URLs, documents, screenshots and event records. A risk score without source evidence, uncertainty and a human review path can mislead operators.',
    features: [
      'FIRSTLIGHT guided incident investigation using a repeatable synthetic scenario',
      'SHA-256 integrity verification and controlled tampering demonstration',
      'Evidence-linked deterministic findings, chronological timeline and evidence-gap reporting',
      'Session-based hash-chained review events and JSON report export',
      'Local deterministic suspicious-content checks with optional self-hosted Ollama assistance',
      'Native Linux sensor for bounded authentication-log collection and explicit-path file-integrity snapshots',
    ],
    architecture: [
      { title: 'Investigation engine', text: 'Deterministic rules correlate supported observations and evidence references; model output is kept separate from verified signals.' },
      { title: 'Web workspace', text: 'Next.js and React provide the incident command interface; Streamlit remains as a supporting legacy application.' },
      { title: 'Local analysis', text: 'Optional Ollama summaries and local processing paths avoid requiring a hosted AI API key for the default workflow.' },
      { title: 'Endpoint sensor', text: 'A standard-library Linux sensor emits normalized local observations with source digests and a hash-chained journal.' },
    ],
    decisions: [
      'Observations, AI interpretation, uncertainty and response decisions are separate concepts.',
      'Synthetic incident artifacts make the main investigation demo repeatable without real incident data.',
      'The default local path avoids sending submitted content to external threat-intelligence APIs.',
      'Response controls are simulation-only unless a separately validated target-bound adapter is configured.',
    ],
    limits: [
      'SATARK is not antivirus, certified forensics, a full EDR or proof that content is safe or malicious.',
      'The FIRSTLIGHT audit chain is session-based and is not independently anchored chain-of-custody evidence.',
      'Optional Microsoft Defender/Entra adapters are not live-validated; Wazuh is an external optional telemetry adapter.',
      'The production alias and runtime health must be rechecked before presenting it as a live deployment.',
    ],
    status: 'Security-awareness and incident-investigation prototype with deterministic local analysis, evidence-integrity demonstrations, tests and CI/CodeQL. No automated real-world containment or certified forensic claim is made.',
    research: [
      'A useful incident workflow must expose what is known, what is inferred, and what evidence is missing instead of collapsing everything into one risk score.',
      'A matching SHA-256 digest proves byte integrity relative to the recorded digest, not the provenance or truthfulness of the artifact.',
      'A human approval step is meaningful only when the proposed action, target and evidence are explicit; the current response controls remain simulated.',
    ],
  },
);

];
