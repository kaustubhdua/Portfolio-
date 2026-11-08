# Project research and case-study evidence

Last reviewed: 8 November 2026

This index translates the public repository documentation into recruiter-facing project stories. It deliberately separates implemented behavior from prototypes, synthetic evaluation, external integrations and production claims. The linked repository README and release documents remain the source of truth; re-check them before quoting any metric or deployment status.

## The five featured case studies

### 1. NIRDHOOM — crop-residue coordination
**Core story:** a multi-party operational workflow, not a generic agriculture dashboard.

- **Problem:** crop-residue clearance spans farmers, machine operators, dispatchers, verifiers, transport and downstream buyers.
- **Engineering:** React 19/Vite product shell; Supabase/PostgreSQL with PostGIS and RLS; field and job records; device GPS; private evidence uploads with SHA-256; offline evidence queue; OR-Tools dispatch service with a local heuristic fallback; PWA support.
- **Distinctive design decisions:** machine capacity is time-bound; residue lots retain quantity, quality, custody and destination; solver output requires human review; satellite detections are supporting context, never proof of a specific field event.
- **Evidence to open:** [README](https://github.com/kaustubhdua/nihdhoom/blob/main/README.md) · [release roadmap](https://github.com/kaustubhdua/nihdhoom/blob/main/docs/PRODUCT-RELEASE-ROADMAP.md) · [connected Supabase notes](https://github.com/kaustubhdua/nihdhoom/blob/main/docs/CONNECTED-SUPABASE.md) · [CI](https://github.com/kaustubhdua/nihdhoom/actions/workflows/ci.yml)
- **Status boundary:** prototype/integration foundation. Seeded and indicative records are not field-pilot outcomes; phone OTP/consent, authoritative land boundaries, real-device offline sync and low-end Android validation remain gates. Payments are not live.
- **Best recruiter angle:** operational data modelling, geospatial workflows, evidence provenance, role-aware workflows and human-in-the-loop optimisation.

### 2. Saathi — voice-first multilingual assistance
**Core story:** source-backed assistance with deterministic control and local-first speech options.

- **Problem:** people need to reach information and services through familiar languages and voice, while factual answers and consent must remain dependable.
- **Engineering:** FastAPI/Python backend and React/Next.js interfaces; deterministic Hindi/Hinglish intent routing; Open-Meteo and configurable government mandi adapters; local Ollama tool selection, Vosk STT and eSpeak NG TTS defaults; optional Sarvam integrations; Tesseract OCR; Exotel AgentStream WebSocket path; rate limits, correlation IDs and capability-aware readiness.
- **Distinctive design decisions:** the LLM is not the source of truth; provider adapters are replaceable; results carry provenance and retrieval time; demo data is labelled; memory and outbound calls require explicit consent.
- **Evidence to open:** [README](https://github.com/kaustubhdua/Saathi/blob/main/README.md) · [evaluation](https://github.com/kaustubhdua/Saathi/blob/main/docs/EVALUATION.md) · [voice runtime](https://github.com/kaustubhdua/Saathi/blob/main/docs/VOICE_RUNTIME.md) · [open-source-first architecture](https://github.com/kaustubhdua/Saathi/blob/main/docs/OPEN_SOURCE_FIRST.md)
- **Status boundary:** MVP/prototype. The 120-case synthetic intent suite is not real-world speech accuracy. Durable household persistence, live provider validation, low-latency phone transport and real Hindi/Hinglish/Haryanvi latency/accuracy benchmarks remain release gates.
- **Best recruiter angle:** API design, deterministic orchestration, provider boundaries, privacy/consent and graceful degradation.

### 3. PatchPilot — explainable pull-request risk triage
**Core story:** safe, evidence-linked analysis of untrusted diffs.

- **Problem:** reviewers need help finding risky changes in large pull requests without trusting an opaque score.
- **Engineering:** Python 3.11+, FastAPI and CLI; unified-diff parsing; file/path/dependency/test signals; bounded input and strict schemas; readiness/health endpoints; rate limiting; pytest/Ruff CI; non-root Docker image.
- **Distinctive design decisions:** submitted diffs are treated as untrusted text; no repository cloning, dependency installation, code execution or LLM call; malformed hunks are surfaced and incomplete analysis is explicitly marked; findings carry file/line evidence.
- **Evidence to open:** [README](https://github.com/kaustubhdua/PatchPilot/blob/main/README.md) · [architecture](https://github.com/kaustubhdua/PatchPilot/blob/main/docs/architecture.md) · [benchmark methodology](https://github.com/kaustubhdua/PatchPilot/blob/main/docs/benchmark-methodology.md) · [roadmap](https://github.com/kaustubhdua/PatchPilot/blob/main/ROADMAP.md) · [CI](https://github.com/kaustubhdua/PatchPilot/actions/workflows/ci.yml)
- **Status boundary:** early MVP, no hosted public demo. The 0–100 score is a heuristic, not defect probability or merge advice; the small synthetic labelled corpus does not establish production precision/recall.
- **Best recruiter angle:** secure input handling, parser integrity, explainability, API hardening and testable deterministic logic.

### 4. Smart Waste — collection operations and fleet optimisation
**Core story:** a complete operational loop from telemetry to verified collection.

- **Problem:** static collection schedules can send vehicles to bins that do not need service and miss urgent collection needs.
- **Engineering:** FastAPI, SQLAlchemy/Alembic, PostgreSQL/PostGIS; per-device credentials and bin-scoped telemetry; freshness and idempotency checks; explicit live/imported/demo provenance; collection job lifecycle; Sugeno fuzzy prioritisation; OSRM road-distance matrices; OR-Tools capacity-constrained vehicle routing; transactional dispatch; optional timestamp-aware Random Forest next-observation forecast; operator and driver workspaces.
- **Distinctive design decisions:** synthetic readings cannot masquerade as live sensors; dispatch is limited to approved jobs and capacity-checked vehicles; route plans and assignments are persisted; forecasting is evaluated chronologically and rejects cadence/schema mismatches.
- **Evidence to open:** [README](https://github.com/kaustubhdua/smart_waste_project/blob/main/README.md) · [release checklist](https://github.com/kaustubhdua/smart_waste_project/blob/main/docs/RELEASE_CHECKLIST.md) · [security threat model](https://github.com/kaustubhdua/smart_waste_project/blob/main/docs/SECURITY_THREAT_MODEL.md) · [CI and browser tests](https://github.com/kaustubhdua/smart_waste_project/actions)
- **Status boundary:** engineering prototype using synthetic/demo data. No physical sensor calibration, municipal field pilot, production restore drill or measured operational savings is established.
- **Best recruiter angle:** end-to-end backend workflows, geospatial querying, optimisation, data provenance and operational state machines.

### 5. RideForge — bike-taxi booking and dispatch
**Core story:** transactional ride lifecycle and durable driver dispatch in a multi-role system.

- **Problem:** ride booking requires consistent state across quotes, passenger bookings, driver eligibility, offer expiry, cancellation, redispatch and support.
- **Engineering:** C++17/Boost.Beast API; PostgreSQL-backed quotes and bookings; React/TypeScript workspaces; Leaflet, Nominatim and OSRM mapping/routing; shortest-path logic; durable 45-second driver offers with expiry and sequential redispatch; admin and support workflows; release-readiness automation across C++, API, migrations, web, accessibility and containers.
- **Distinctive design decisions:** offers expire and are redispatched instead of remaining stale; booking/dispatch state is persisted; deterministic tie and failure cases are tested; release evidence is tied to a specific commit.
- **Evidence to open:** [README](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/README.md) · [release-readiness evidence](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/docs/RELEASE_READINESS_EVIDENCE.md) · [deep improvement research](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/docs/DEEP_IMPROVEMENT_RESEARCH.md) · [OpenAPI contract](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/backend/openapi.yaml)
- **Status boundary:** portfolio MVP in progress. Passing CI on a tested revision is not proof of a live commercial service or production deployment.
- **Best recruiter angle:** systems programming, transactional data, distributed workflow thinking, algorithmic routing and broad test automation.

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
