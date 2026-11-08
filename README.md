# Kaustubh Dua — Developer Portfolio

**Live portfolio:** [kaustubhdua.vercel.app](https://kaustubhdua.vercel.app)  
**Owner:** [Kaustubh Dua](https://github.com/kaustubhdua) · Electronics & Computer Engineering, JIIT Noida

A recruiter-facing portfolio presented as an interactive voxel world. The visual layer is memorable, but the underlying experience stays straightforward: a short introduction, a curated set of case studies, selected engineering evidence and clear contact paths.

## What the portfolio is designed to show

- **A clear engineering identity:** full-stack product engineering, backend reliability and applied AI.
- **Selected work, not a repository dump:** five case studies chosen for distinct engineering problems and evidence.
- **Honest project status:** team contributions, prototypes, MVPs, synthetic data and unavailable demos are labelled clearly.
- **Evidence over claims:** project source, architecture decisions, current limitations and upstream pull requests are linked.
- **Two visual worlds:** a Nether/night environment and an Overworld/day environment, each with its own palette and atmosphere.
- **Progressive 3D:** normal visits open directly on readable portfolio content; the immersive experience is optional.
- **Accessible alternatives:** semantic content, keyboard navigation, reduced-motion support, quick view and a non-3D path.
- **Responsive interaction:** desktop keyboard/pointer controls and touch-first mobile free-roam controls.
- **Resume status:** resume actions consistently show a coming-soon notice; no downloadable resume is exposed.

## Selected projects

These five projects are the main portfolio shortlist. Other experiments remain discoverable from the [GitHub repositories page](https://github.com/kaustubhdua?tab=repositories), rather than competing for attention on the homepage.

| Project | What it demonstrates | Current status |
| --- | --- | --- |
| [NIRDHOOM](https://github.com/kaustubhdua/nihdhoom) | Field-first crop-residue workflows connecting farmer records, machinery, dispatch, verification and residue offtake | Hosted prototype |
| [Saathi](https://github.com/kaustubhdua/Saathi) | Hindi/Hinglish assistance, deterministic intent routing, source provenance and consent-aware escalation | MVP; provider and persistence release gates remain |
| [PatchPilot](https://github.com/kaustubhdua/PatchPilot) | Explainable pull-request diff triage with deterministic, evidence-backed findings and safe defaults | Early MVP; no hosted public demo |
| [Smart Waste](https://github.com/kaustubhdua/smart_waste_project) | Waste-collection prioritisation, forecasting experiments and OR-Tools route planning | Prototype using synthetic/demo data |
| [RideForge](https://github.com/kaustubhdua/Smart_bike_taxi_platform) | C++17 API, PostgreSQL-backed bookings, driver dispatch and web workspaces | Portfolio MVP; no live commercial service |

Every case study separates the problem, contribution, implementation choices, evidence and current boundaries. A project is not described as production-ready simply because its code or a preview exists.

## Profile and engineering evidence

The site presents a short profile, selected campus roles and three representative upstream contributions. Six merged pull requests to [Lemma Platform](https://github.com/lemma-work/lemma-platform) remain available through the linked contribution archive.

Structured technical learning is kept separate from employment and project claims. The site does not publish academic scores or unverified experience.

## Technology

- **UI:** React 19, JavaScript, CSS
- **Rendering:** custom WebGL renderer, GLSL shaders, voxel meshes, lighting and world generation
- **Build:** Node.js, esbuild
- **Quality:** ESLint, Playwright, custom world tests, static distribution checks and external-link verification
- **Hosting:** Vercel

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm ci
npm run dev
```

The development server is started by the project script in `scripts/dev.mjs`.

## Verification

```bash
npm ci
npm run lint
npm run build
npm run check
npm run test:world
```

For browser and accessibility checks, start the production preview in one terminal:

```bash
npm run preview
```

Then run:

```bash
npm run test:e2e
npm run audit
npm run check:links
```

The GitHub Actions workflow runs the clean install, lint, production build, static checks, offline world tests, Chromium browser suite, performance/accessibility audit and external-link check on pull requests and pushes.

## Release discipline

A production release is only considered after all checks pass on the exact candidate commit. A Vercel preview being ready is not the same as a production release. The production deployment should be smoke-tested against the verified commit after it is promoted.

## Repository layout

- `src/components/` — portfolio sections, dialogs, navigation and interaction UI
- `src/data/` — profile, selected projects, skills, milestones and world content
- `src/lib/voxel/` — custom WebGL world renderer and supporting systems
- `src/styles/` — responsive layout, theme tokens and world-specific styles
- `tests/` — browser and voxel-world regression suites
- `scripts/` — build, static checks, audits, asset generation and link verification
- `content/blog/` — technical notes and project write-ups

---

Built to make the work easy to understand before asking anyone to explore the world.
