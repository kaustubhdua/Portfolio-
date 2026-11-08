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
    contribution: 'Multi-contributor prototype. The case study covers the shared product; the repository history shows who built what.',
    evidence: [{"label":"Project README","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/README.md"},{"label":"Product release roadmap","url":"https://github.com/kaustubhdua/nihdhoom/blob/main/docs/PRODUCT-RELEASE-ROADMAP.md"},{"label":"CI workflow","url":"https://github.com/kaustubhdua/nihdhoom/actions/workflows/ci.yml"}],
    badges: ['PWA', 'PostGIS + RLS', 'Offline evidence queue'],
    biome: 'crimson',
    kind: 'Multi-contributor prototype',
    image: 'img/projects/nirdhoom.png',
    summary:
      'A field-first web app that connects farmers, field records, machine operators, dispatch, verification and residue buyers in one workflow.',
    stack: ['React 19', 'Vite', 'Supabase', 'PostgreSQL', 'PostGIS', 'OR-Tools', 'Leaflet'],
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
  },
{
    id: 'saathi',
    flagship: true,
    stage: 'MVP',
    name: 'Saathi',
    tagline: 'Voice-first multilingual assistance',
    contribution: 'Multi-contributor MVP. The case study covers the shared product and architecture; the repository history shows individual contributions.',
    evidence: [{"label":"Project README","url":"https://github.com/kaustubhdua/Saathi/blob/main/README.md"},{"label":"Evaluation methodology","url":"https://github.com/kaustubhdua/Saathi/blob/main/docs/EVALUATION.md"},{"label":"GitHub Actions","url":"https://github.com/kaustubhdua/Saathi/actions"}],
    badges: ['120-case synthetic benchmark', 'Hindi + Hinglish', 'Human escalation'],
    biome: 'crimson',
    kind: 'Multi-contributor MVP',
    image: 'img/projects/saathi.png',
    summary:
      'A Hindi-first, voice-first assistance platform with source-aware answers, consent-based workflows and human escalation.',
    stack: ['Next.js', 'React', 'FastAPI', 'Python', 'Speech APIs', 'GitHub Actions'],
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
  },
{
    id: 'patchpilot',
    flagship: true,
    stage: 'Early-stage',
    name: 'PatchPilot',
    tagline: 'Explainable pull-request risk triage',
    contribution: 'Personal project. It does deterministic diff triage today; precision and recall in production are not established, and it is not a formal security audit.',
    evidence: [{"label":"README and quick start","url":"https://github.com/kaustubhdua/PatchPilot/blob/main/README.md"},{"label":"Benchmark methodology","url":"https://github.com/kaustubhdua/PatchPilot/blob/main/docs/benchmark-methodology.md"},{"label":"Roadmap and release gate","url":"https://github.com/kaustubhdua/PatchPilot/blob/main/ROADMAP.md"},{"label":"CI workflow","url":"https://github.com/kaustubhdua/PatchPilot/actions/workflows/ci.yml"}],
    badges: ['0-100 risk score', 'Rate-limited API', 'Non-root Docker'],
    biome: 'soul',
    kind: 'Personal project',
    image: 'img/projects/patchpilot.png',
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
    status:
      'Early-stage tool with tests and CI. No live demo exists, and no accuracy figures are claimed.',
  },
{
    id: 'smartwaste',
    flagship: true,
    stage: 'Prototype',
    name: 'Smart Waste',
    tagline: 'Predict, prioritise and route waste collection',
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
      'A full-stack waste-operations prototype connecting device telemetry, authenticated operator and driver workflows, collection prioritisation and capacity-aware route dispatch.',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'PostGIS', 'OR-Tools', 'React', 'Random Forest'],
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
  },
{
    id: 'rideforge',
    flagship: true,
    stage: 'Portfolio MVP',
    name: 'RideForge',
    tagline: 'Bike-taxi dispatch and routing platform',
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
    summary: 'A full-stack bike-taxi MVP with persisted ride bookings, driver offers, cancellation and route planning across passenger, driver and admin workspaces.',
    stack: ['C++17', 'Boost.Beast', 'PostgreSQL', 'React', 'TypeScript', 'Leaflet'],
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
  }
];
