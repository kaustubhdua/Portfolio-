# Project technology audit

> Scope: the six featured builds and ten additional projects currently shown in the public GitHub profile README, plus the portfolio application itself. The portfolio website retains its separately curated five detailed case studies; JIIT Youth Club is covered here because it is one of the six profile features. This is a source-backed inventory, not a list of technologies inferred from project titles.

## How to read this inventory

- **Core/runtime** means a language, framework, service, database, or library directly used by the current implementation.
- **Build/quality** means a direct development, test, packaging, static-analysis, or CI dependency. It is not presented as a production runtime dependency.
- **Optional / integration** means the code or configuration supports the technology, but it is gated, locally installed, or not required for the default path.
- **External service** means a provider or protocol the application calls; it is not a library dependency.
- Transitive packages are intentionally omitted. A dependency appearing in a manifest does not by itself prove a production deployment or live provider integration.

## Featured projects

### 1. JIIT Youth Club — [repository](https://github.com/kaustubhdua/JYC-Website)

**Core/runtime**
- JavaScript, React 19/React DOM, React Router 7 and Vite 8.
- Supabase JavaScript client for cloud data/auth and Edge Function integration; PostgreSQL with Row Level Security is the data platform.
- OGL/WebGL for GPU-accelerated visual effects, GSAP and Motion for animation, @hugeicons/react plus @hugeicons/core-free-icons for interface iconography.
- lucide-react and canvas-confetti are used in selected project interfaces.

**Build/quality**
- Sharp for responsive image derivatives and media optimisation.
- Playwright for browser and visual-route QA; GitHub Actions for CI, CodeQL and release-quality workflows.

**Evidence:** [README architecture](https://github.com/kaustubhdua/JYC-Website#core-architecture), [package.json](https://github.com/kaustubhdua/JYC-Website/blob/main/package.json), [CI workflows](https://github.com/kaustubhdua/JYC-Website/tree/main/.github/workflows).

### 2. NIRDHOOM — [repository](https://github.com/kaustubhdua/nihdhoom)

**Core/runtime**
- TypeScript, React 19/React DOM, Vite 8 and Tailwind CSS 4.
- Supabase JS, PostgreSQL, PostGIS and Row Level Security for application data and access control.
- Leaflet for field maps; Three.js for selected 3D workspaces; Motion, lucide-react, Hugeicons and canvas-confetti for interface/interaction elements.
- Python FastAPI dispatch microservice, HTTPX and Google OR-Tools for vehicle/machine scheduling. The service has a deterministic local fallback.
- Vercel serverless API routes and PWA/service-worker support.

**Build/quality**
- TypeScript compiler, Oxlint, Node's built-in test runner and GitHub Actions.

**Evidence:** [package.json](https://github.com/kaustubhdua/nihdhoom/blob/main/package.json), [dispatch service requirements](https://github.com/kaustubhdua/nihdhoom/blob/main/services/dispatch-ortools/requirements.txt), [dispatch service README](https://github.com/kaustubhdua/nihdhoom/blob/main/services/dispatch-ortools/README.md), [CI](https://github.com/kaustubhdua/nihdhoom/blob/main/.github/workflows/ci.yml).

### 3. Saathi — [repository](https://github.com/kaustubhdua/Saathi)

**Core/runtime**
- Python 3.11, FastAPI, Starlette, Uvicorn, Pydantic Settings, HTTPX, python-dotenv, python-multipart, WebSockets and Vosk.
- Tesseract OCR (including Hindi/English language data), eSpeak NG and FFmpeg are installed as OS-level tools in the Docker image, not Python packages.
- Next.js 16, React 19/React DOM, TypeScript, Motion, OGL and lucide-react power the web interface.
- Streamlit for the separate judge/demo interface.
- Supabase SSR/JS packages are present for optional integration; persistent household memory and production persistence remain separately gated.

**Optional / integration**
- Ollama with the Qwen 2.5 7B model for local reasoning.
- Sarvam speech/document services and Exotel AgentStream telephony paths are provider-gated; they are not the API-key-free default.

**Build/quality**
- ESLint, TypeScript, pytest, Docker and GitHub Actions.

**Evidence:** [README and implementation boundaries](https://github.com/kaustubhdua/Saathi), [backend requirements](https://github.com/kaustubhdua/Saathi/blob/main/backend/requirements.txt), [frontend package.json](https://github.com/kaustubhdua/Saathi/blob/main/frontend/package.json), [local AI Compose file](https://github.com/kaustubhdua/Saathi/blob/main/docker-compose.local-ai.yml), [Dockerfile with OCR/audio tools](https://github.com/kaustubhdua/Saathi/blob/main/Dockerfile).

### 4. PatchPilot — [repository](https://github.com/kaustubhdua/PatchPilot)

**Core/runtime**
- Python 3.11+, FastAPI, Pydantic and Uvicorn.
- A lightweight vanilla HTML/CSS/JavaScript workbench; no React framework or LLM dependency is required for the deterministic MVP.
- Hatchling for Python package builds.

**Build/quality**
- HTTPX, pytest and Ruff; Docker for the container image; GitHub Actions for CI/security workflows; Node.js syntax validation for the browser workbench.

**Evidence:** [README](https://github.com/kaustubhdua/PatchPilot), [pyproject.toml](https://github.com/kaustubhdua/PatchPilot/blob/main/pyproject.toml), [Dockerfile](https://github.com/kaustubhdua/PatchPilot/blob/main/Dockerfile), [CI workflow](https://github.com/kaustubhdua/PatchPilot/blob/main/.github/workflows/ci.yml).

### 5. RideForge — [repository](https://github.com/kaustubhdua/Smart_bike_taxi_platform)

**Core/runtime**
- C++17 API and workers using Boost.Beast/Boost headers, libcurl, PostgreSQL libpq, OpenSSL, nlohmann/json and C++ threads.
- CMake for native builds; PostgreSQL for transactional booking, dispatch and event persistence.
- React 19/React DOM, TypeScript, Vite 6, Leaflet, Motion and lucide-react for passenger, driver and admin workspaces.
- Nominatim-compatible geocoding and OSRM-compatible road routing are external provider integrations, not bundled libraries.
- Docker/Compose deployment configuration and versioned PostgreSQL migrations.

**Build/quality**
- GCC/Clang warnings-as-errors and sanitizers, Playwright, axe-core, npm audit and GitHub Actions release-readiness workflows.

**Evidence:** [README architecture and verification](https://github.com/kaustubhdua/Smart_bike_taxi_platform), [backend CMake configuration](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/backend/CMakeLists.txt), [web package.json](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/web/package.json), [web README](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/web/README.md), [backend OpenAPI contract](https://github.com/kaustubhdua/Smart_bike_taxi_platform/blob/main/backend/openapi.yaml).

### 6. Smart Waste — [repository](https://github.com/kaustubhdua/smart_waste_project)

**Core/runtime**
- Python, FastAPI, Uvicorn, SQLAlchemy, Psycopg 3, Pydantic Settings, HTTPX and python-multipart.
- PostgreSQL/PostGIS, Alembic migrations and Google OR-Tools for capacity-constrained route optimisation; OSRM is the road-distance/geometry provider.
- pandas, NumPy, scikit-learn, Random Forest and joblib for time-aware feature preparation and the optional fill-level forecast.
- Streamlit, Folium and streamlit-folium for the standalone data/operations demo; HTTPX, python-multipart and Pydantic Settings support the API configuration/request layer.
- The operator/driver web views are plain HTML/CSS/JavaScript with service-worker support, not a React application.
- Docker Compose for local full-stack orchestration.

**Build/quality**
- pytest, Playwright browser tests, GitHub Actions and CodeQL.

**Evidence:** [README architecture](https://github.com/kaustubhdua/smart_waste_project), [backend requirements](https://github.com/kaustubhdua/smart_waste_project/blob/main/backend/requirements.txt), [Streamlit requirements](https://github.com/kaustubhdua/smart_waste_project/blob/main/requirements.txt), [web source directory](https://github.com/kaustubhdua/smart_waste_project/tree/main/web), [CI](https://github.com/kaustubhdua/smart_waste_project/tree/main/.github/workflows).

## Additional projects shown in the profile

### 7. SATARK Sentinel — [repository](https://github.com/kaustubhdua/Satark)

**Core/runtime:** Python, Streamlit, Next.js 15, React 19, TypeScript, Tailwind CSS 4, FastAPI local-analysis service, PDF.js, jsQR, PyPDF, Pillow, OpenCV and ReportLab.

**Optional/local tools:** Ollama for self-hosted text/vision assistance; faster-whisper for local video-audio transcription; FFmpeg for audio extraction. Deterministic analysis remains the default path without a hosted AI key.

**Build/quality:** Python tests, Playwright, axe-core, TypeScript, GitHub Actions and CodeQL.

**Evidence:** [README technology table and boundaries](https://github.com/kaustubhdua/Satark), [Python requirements](https://github.com/kaustubhdua/Satark/blob/main/requirements.txt), [local-AI requirements](https://github.com/kaustubhdua/Satark/blob/main/requirements-local-ai.txt), [web package.json](https://github.com/kaustubhdua/Satark/blob/main/web/package.json), [AI service requirements](https://github.com/kaustubhdua/Satark/blob/main/ai/requirements.txt).

### 8. Adapt AI — [repository](https://github.com/kaustubhdua/adapt-ai)

**Core/runtime:** Python, FastAPI, Uvicorn, Ollama Python client, psutil and GPUtil; nvidia-smi is used as a Linux NVIDIA telemetry fallback. The UI uses vanilla JavaScript, HTML/CSS, Tailwind via CDN and Chart.js.

**Runtime boundary:** model inference is local through Ollama; model weights are downloaded separately. The project README credits the team and identifies the multi-contributor nature of the work.

**Evidence:** [README stack and attribution](https://github.com/kaustubhdua/adapt-ai/blob/master/README.md), [requirements](https://github.com/kaustubhdua/adapt-ai/blob/master/requirements.txt).

### 9. Infracis — [repository](https://github.com/kaustubhdua/infracis)

**Active application:** Next.js 15, React 18, TypeScript, Tailwind CSS 3, Leaflet, react-markdown and remark-gfm. The current frontend API routes are the active API path.

**Prepared but not connected backend:** a separate FastAPI service with HTTPX, Pydantic, Pydantic Settings, Redis and Uvicorn exists in backend; it is not the active frontend backend and has not been deployed.

**External services / optional:** Nominatim, Overpass, Open-Meteo, NASA GIBS and optional server-side Groq interpretation. Vitest is used for tests.

**Evidence:** [README implementation status and proposed-vs-active boundary](https://github.com/kaustubhdua/infracis), [package.json](https://github.com/kaustubhdua/infracis/blob/main/package.json), [backend requirements](https://github.com/kaustubhdua/infracis/blob/main/backend/requirements.txt).

### 10. AkashChalak — [repository](https://github.com/kaustubhdua/Akash-Chalak)

**Core/runtime:** Python, FastAPI, Uvicorn, Pydantic, SQLAlchemy, Psycopg, NumPy, scikit-learn/DBSCAN, xarray, netCDF4, Rasterio, GeoPandas, Earth Engine API and CDS API. The README documents a React + Leaflet map interface.

**Optional/integration:** PostgreSQL/TimescaleDB persistence is optional. TensorFlow appears in backend requirements, but the README describes the active fallback as deterministic and the current hotspot path as scikit-learn DBSCAN; do not claim a trained TensorFlow model without implementation and test evidence.

**Evidence:** [README](https://github.com/kaustubhdua/Akash-Chalak), [backend requirements](https://github.com/kaustubhdua/Akash-Chalak/blob/main/backend/requirements.txt).

### 11. BharatSim — [repository](https://github.com/kaustubhdua/Bharat-Sim)

**Core/runtime:** Python, FastAPI, Uvicorn, Pydantic, python-multipart, Psycopg and PyJWT; React 19, TypeScript, Vite 8, React Router and lucide-react; PostgreSQL persistence and optional Supabase Auth integration.

**Device/worker tooling:** Android SDK platform-tools (adb), build-tools (aapt), Android Emulator/AVD and a Python polling/runner worker. The smoke app uses Gradle and Java 17; Appium is used in the documented test-fixture path, not the core web runtime.

**Build/quality:** Vitest, jsdom, Playwright, TypeScript, GitHub Actions and dependency audits.

**Evidence:** [README and release boundary](https://github.com/kaustubhdua/Bharat-Sim), [pyproject.toml](https://github.com/kaustubhdua/Bharat-Sim/blob/main/pyproject.toml), [frontend package.json](https://github.com/kaustubhdua/Bharat-Sim/blob/main/frontend/package.json), [worker guide](https://github.com/kaustubhdua/Bharat-Sim/blob/main/worker/README.md).

### 12. GenomeGuard — [repository](https://github.com/kaustubhdua/GenomeGuard)

**Core/runtime:** Python, Starlette, Uvicorn, NumPy, cryptography and Psycopg/PostgreSQL.

**Optional research/development:** msprime for synthetic population-genetics workflows; openpyxl for reference-data handling; pandas, scikit-learn and joblib for optional ML experiments; pytest, Ruff, HTTPX and jsonschema for development/validation.

**Interoperability:** FHIR R4 Consent resource exports and a Beacon v2-style endpoint are validation/interop experiments, not a claim of full conformance. The advisory planner is deterministic; no external LLM runtime is required.

**Evidence:** [README scope and limitations](https://github.com/kaustubhdua/GenomeGuard), [pyproject.toml](https://github.com/kaustubhdua/GenomeGuard/blob/main/pyproject.toml), [FHIR IG package](https://github.com/kaustubhdua/GenomeGuard/blob/main/fhir/ig/package/package.json).

### 13. CrickVision — [repository](https://github.com/kaustubhdua/CrickVision-)

**Core/runtime:** Python, PyTorch, Torchvision, OpenCV, Pillow and NumPy. The baseline uses a pretrained Faster R-CNN ResNet-50 FPN person detector; it is not a cricket-trained model.

**Optional/build/quality:** Streamlit dashboard, pytest, Ruff and mypy.

**Evidence:** [README current capabilities and limits](https://github.com/kaustubhdua/CrickVision-), [pyproject.toml](https://github.com/kaustubhdua/CrickVision-/blob/main/pyproject.toml), [requirements](https://github.com/kaustubhdua/CrickVision-/blob/main/requirements.txt).

### 14. JIIT Toppers — [repository](https://github.com/kaustubhdua/Jiit-toppers-)

**Core/runtime:** Next.js 16, React 19, TypeScript, Supabase SSR/Auth, Prisma 6, PostgreSQL and Zod validation.

**Build/quality:** Node.js built-in test runner, ESLint, TypeScript and Prisma schema validation.

**Evidence:** [README tech stack and release gates](https://github.com/kaustubhdua/Jiit-toppers-), [package.json](https://github.com/kaustubhdua/Jiit-toppers-/blob/main/package.json).

### 15. Weather Core Matrix — [repository](https://github.com/kaustubhdua/weather-core-matrix)

**Core/runtime:** Vanilla HTML, CSS and JavaScript; fetch against the public wttr.in service. No frontend framework, package manager or build step is required.

**Build/quality:** Node.js built-in test runner. Python's built-in HTTP server is only a local static-file serving option.

**Evidence:** [README](https://github.com/kaustubhdua/weather-core-matrix).

### 16. Nord Studio Task Manager — [repository](https://github.com/kaustubhdua/nord-studio-task-manager)

**Core/runtime:** Vanilla HTML, CSS and JavaScript; browser localStorage for device-local task persistence. No framework or build step is required.

**Build/quality:** Node.js built-in test runner. Python's built-in HTTP server is only a local static-file serving option.

**Evidence:** [README](https://github.com/kaustubhdua/nord-studio-task-manager).

## The portfolio application itself

The portfolio is a React 19 application with a custom Node/esbuild build pipeline, React Icons, custom WebGL shaders/voxel renderer, CSS-driven responsive worlds and animations, ESLint, Playwright browser tests and GitHub Actions verification. Its WebGL renderer is custom code; do not label it as Three.js unless a direct runtime dependency is added.

**Evidence:** [package.json](https://github.com/kaustubhdua/Portfolio-/blob/main/package.json), [voxel renderer](https://github.com/kaustubhdua/Portfolio-/blob/main/src/lib/voxel/renderer.js), [shader pipeline](https://github.com/kaustubhdua/Portfolio-/blob/main/src/lib/voxel/shaders.js), [browser tests](https://github.com/kaustubhdua/Portfolio-/blob/main/tests/e2e.mjs).

## Presentation rules

1. Keep the profile's recurring core toolkit concise; do not repeat every project dependency as a global skill.
2. Show the project-specific stack beside the project or in its case study, and link to this audit for the full evidence trail.
3. Keep optional, prepared, and externally hosted integrations labelled as such.
4. Do not turn build tools, CI actions, transitive packages, or external services into claims of production runtime expertise.
5. Update this ledger whenever a featured project's manifests or implementation change.


## Source verification record — 8 November 2026

The 16 project entries were cross-checked against current default-branch repository trees and direct manifests (package.json/package-lock.json, pyproject.toml, requirements files, CMake, Gradle and Docker/Compose files), then reconciled with project READMEs and implementation evidence. They correspond to the six featured builds and ten additional projects in the public profile README. The separate Portfolio application is inventoried below. This is a dependency-and-source audit, not a claim that every optional integration is deployed or every declared dependency is exercised at runtime.

A package in a manifest is not automatically a live integration: prepared backends, optional AI, external providers, local OS packages, demo/test-only tools and unverified deployment boundaries are called out where applicable.