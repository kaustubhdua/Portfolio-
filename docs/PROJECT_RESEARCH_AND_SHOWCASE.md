# Project research and case-study evidence

Last reviewed: 8 November 2026

This index translates the public repository documentation into recruiter-facing project stories. It deliberately separates implemented behavior from prototypes, synthetic evaluation, external integrations and production claims. The linked repository README and release documents remain the source of truth; re-check them before quoting any metric or deployment status.

## The five featured case studies

The featured set is now selected for resume strength and engineering diversity: one real stakeholder-facing platform, one systems/backend product, one Android testing platform, one security investigation workflow, and one local-first AI product. The profile repository separately features six builds; Smart Waste remains a prominent secondary project there.

### 1. JIIT Youth Club 128 — official campus platform
**Core story:** a real stakeholder-facing platform with public information architecture, rich interaction and performance/accessibility constraints.

- **Problem:** students need a dependable official surface for 23+ societies, campus events, leadership, announcements and media.
- **Engineering:** React 19, Vite, React Router, Supabase Cloud, PostgreSQL/RLS, Edge Functions, WebGL/OGL interactions, GSAP/Motion, Sharp image derivatives, route-shell pre-rendering and PWA caching.
- **Evidence:** [repository README](https://github.com/kaustubhdua/JYC-Website) · [platform overview](https://github.com/kaustubhdua/JYC-Website#platform-overview)
- **Status boundary:** official internal campus platform. Repository is closed to outside contributions. This is technical-team work; resume bullets must be limited to the modules and changes attributable to your own commits. Do not imply sole ownership.
- **Best recruiter angle:** shipping and maintaining a stakeholder-facing React platform; media optimization, interaction engineering, route performance and accessibility.

### 2. RideForge — transactional bike-taxi booking and dispatch
**Core story:** a systems-oriented multi-role backend with durable booking and driver-offer state.

- **Problem:** quotes, bookings, driver eligibility, offer expiry, cancellation, redispatch and support need consistent state across several actors.
- **Engineering:** C++17/Boost.Beast API, PostgreSQL transactions and migrations, React/TypeScript workspaces, Leaflet, Nominatim/OSRM provider integrations, shortest-path routing, durable 45-second driver offers, expiry and sequential redispatch.
- **Evidence:** [README](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/README.md) · [release-readiness evidence](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/docs/RELEASE_READINESS_EVIDENCE.md) · [OpenAPI contract](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/backend/openapi.yaml) · [release workflow](https://github.com/kaustubhdua/Smart_bike_taxi_platform/actions/workflows/release-readiness.yml)
- **Status boundary:** portfolio MVP, not a live commercial taxi service. Payments, real identity/vehicle checks and transport operations are outside current scope.
- **Best recruiter angle:** C++ backend engineering, transactional workflows, state machines, routing algorithms and full-stack release verification.

### 3. BharatSim — Android resilience testing
**Core story:** a test orchestration and evidence pipeline that distinguishes a proposed plan from an executed device test.

- **Problem:** mobile teams need risk-focused test planning and trustworthy execution evidence under constrained Android device/network conditions.
- **Engineering:** FastAPI, React/TypeScript/Vite, PostgreSQL, APK validation and SHA-256 fingerprints, lease-based worker queue, heartbeats, guarded ADB runner, Android Emulator/Appium fixture workflow, logcat signal analysis and cross-source evidence synthesis.
- **Evidence:** [README and current release status](https://github.com/kaustubhdua/Bharat-Sim/blob/main/README.md) · [planner methodology](https://github.com/kaustubhdua/Bharat-Sim/blob/main/docs/PLANNER.md) · [evidence synthesis](https://github.com/kaustubhdua/Bharat-Sim/blob/main/docs/EVIDENCE_SYNTHESIS.md) · [CI](https://github.com/kaustubhdua/Bharat-Sim/actions)
- **Status boundary:** controlled-beta MVP. The fixture-based CI journey proves the source-built APK path only. Production APK execution remains gated on an independently verified isolated worker host; live Vercel database/storage round trips are not yet accepted.
- **Best recruiter angle:** backend job orchestration, worker leases, Android tooling, test automation, artifact integrity and fail-closed production boundaries.

### 4. SATARK Sentinel — evidence-first incident investigation
**Core story:** deterministic security triage with explicit evidence integrity, uncertainty and human review.

- **Problem:** suspicious messages, links, attachments and event records are fragmented; an unexplained risk score can encourage unsafe conclusions.
- **Engineering:** Python/FastAPI, Next.js/React, Streamlit legacy UI, deterministic FIRSTLIGHT investigation, SHA-256 artifact checks, evidence-linked findings, timelines, gap reporting, JSON export, local Linux endpoint sensor and optional self-hosted Ollama summaries.
- **Evidence:** [README and safety boundaries](https://github.com/kaustubhdua/Satark/blob/main/README.md) · [FIRSTLIGHT scope](https://github.com/kaustubhdua/Satark/blob/main/docs/FIRSTLIGHT.md) · [native endpoint sensor guide](https://github.com/kaustubhdua/Satark/blob/main/docs/NATIVE_ENDPOINT_SENSOR.md) · [CI/security workflows](https://github.com/kaustubhdua/Satark/actions)
- **Status boundary:** security-awareness and investigation prototype, not antivirus, full EDR, certified forensics or automatic containment. The FIRSTLIGHT audit chain is session-based; optional Defender/Entra adapters are not live-validated.
- **Best recruiter angle:** security-minded backend engineering, safe input handling, evidence integrity, deterministic analysis and human-in-the-loop workflows.

### 5. Saathi — local-first Hindi/Hinglish voice assistance
**Core story:** a multilingual assistant architecture with deterministic control, source provenance and replaceable provider adapters.

- **Problem:** people should be able to reach information through familiar language and voice without losing factual provenance or consent.
- **Engineering:** FastAPI/Python, Next.js/React/TypeScript, deterministic intent routing, local Vosk STT, eSpeak NG TTS, Tesseract OCR, Ollama optional local reasoning, weather/mandi adapters, WebSockets and Exotel AgentStream integration.
- **Evidence:** [README](https://github.com/kaustubhdua/Saathi/blob/main/README.md) · [evaluation methodology](https://github.com/kaustubhdua/Saathi/blob/main/docs/EVALUATION.md) · [voice runtime](https://github.com/kaustubhdua/Saathi/blob/main/docs/VOICE_RUNTIME.md) · [open-source-first architecture](https://github.com/kaustubhdua/Saathi/blob/main/docs/OPEN_SOURCE_FIRST.md)
- **Status boundary:** multi-contributor MVP. The 120-case synthetic intent suite is not real-world speech accuracy. Persistent memory, provider-backed voice latency/accuracy and durable human case workflows remain gates. Attribute personal work from commit history.
- **Best recruiter angle:** applied AI architecture, deterministic orchestration, local inference, speech integration, API design and privacy/consent.

### Secondary projects retained in the profile

- **Smart Waste:** strong data/optimization secondary project—FastAPI, PostGIS, OR-Tools/OSRM, telemetry provenance and dispatch. It remains an engineering prototype on synthetic/demo data; no physical sensor calibration, municipal pilot or measured savings are claimed.
- **NIRDHOOM:** multi-party field workflow prototype; useful for geospatial product design, evidence provenance and human-reviewed optimization, but not presented as a validated field deployment.
- **PatchPilot:** personal early MVP for safe, explainable diff triage; useful for secure parsing and deterministic analysis, but its heuristic score is not a defect probability and production precision/recall are unestablished.
- **CrickVision, GenomeGuard, AkashChalak, Infracis, JIIT Toppers and Adapt AI:** retain as specialist/research builds in the expanded profile list; their own READMEs and release gates define what can be claimed.

## Resume-ready project phrasing

Use these as starting points, not as claims to copy blindly. For team projects, keep only the verbs and modules supported by your own merged commits/PRs. Add measured outcomes only after you have reproducible measurements.

- **JIIT Youth Club 128:** Contributed to the React 19/Vite campus platform for societies, events and student governance, working across interactive UI, optimized media delivery and accessibility/performance improvements. Replace the broad scope with the exact modules you personally shipped.
- **RideForge:** Built a C++17/Boost.Beast ride-booking API backed by PostgreSQL, implementing transactional booking state and durable, expiring driver offers with sequential redispatch; verified the workflow through API, migration, web and container test suites.
- **BharatSim:** Engineered a FastAPI-based Android test-orchestration workflow with APK integrity checks, lease-based worker jobs and ADB/Appium fixture execution; correlated logcat and worker evidence while keeping production APK execution fail-closed pending isolated infrastructure.
- **SATARK Sentinel:** Developed an evidence-first incident-investigation prototype with deterministic findings, SHA-256 integrity checks, timeline reconstruction and human-reviewed response simulation; separated observed signals from optional model interpretation.
- **Saathi:** Co-developed a local-first Hindi/Hinglish assistant using deterministic intent routing, source-stamped tools and local speech/OCR components; maintained explicit consent and provider-readiness boundaries.

## Complete technology inventory

The five featured case studies below show their full direct stack in the portfolio UI. The profile README features the same top engineering stories plus Smart Waste as a sixth project; secondary experiments remain discoverable without competing for flagship attention. For the wider project collection, see the [source-backed 16-project technology audit](PROJECT_TECHNOLOGY_AUDIT.md). That ledger separates runtime dependencies, build/test tooling, optional integrations and external providers; it also covers JIIT Youth Club and the Portfolio application itself.

## Display guidance

1. Lead with the five projects above; they demonstrate different engineering problems rather than five variants of the same app.
2. Use one shared stack taxonomy everywhere: **Languages**, **Frontend**, **Backend**, **Data & Systems**, and **Tools**. The project cards show three primary technologies; the full case study shows every evidenced technology grouped under these same labels.
3. Keep the fifteen-item Technical Skills inventory curated. Project-only libraries and infrastructure belong in their case study, not in the recurring-core list.
4. Each case-study preview should expose one differentiator and one maturity label before opening the full dialog.
5. Keep the detail order: problem → contribution → implemented workflow → architecture/decisions → evidence links → limitations → grouped stack.
6. Show repository and working demo separately. Do not show a demo CTA when a URL is absent or unverified.
7. Prefer a small number of concrete workflow diagrams/screenshots over generic AI art. Label authored illustrations as illustrations, not product screenshots.
8. Attribute multi-contributor work carefully. Do not imply sole authorship where the repository is a team project.
9. Never publish synthetic benchmark results, seeded data, CI pass rates, or planned integrations as real-world product impact.

## Research sources

All project-specific statements above are grounded in the linked first-party repositories and their documentation as of the review date. NIRDHOOM's public project context is also described in its [Devpost submission](https://devpost.com/software/nirdhoom-k4gfzm); that submission describes the problem and intended product, not independent evidence of field outcomes.
