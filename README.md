# Kaustubh Dua — Developer Portfolio

Live site: [kaustubhdua.vercel.app](https://kaustubhdua.vercel.app)  
Owner: [Kaustubh Dua](https://github.com/kaustubhdua) · JIIT Noida, Electronics & Computer Engineering

A recruiter-facing portfolio built as an interactive voxel world. It combines a custom WebGL scene with a clear, directly accessible portfolio: selected projects, open-source contributions, skills, a one-page resume and contact links.

## What it demonstrates

- **Custom WebGL rendering:** a voxel-style world built from project-owned renderer, mesh, shader, lighting, atlas and world-generation modules; no Three.js or external 3D engine dependency.
- **Two visual environments:** a night-world Nether theme and a daylight Overworld theme, each with its own palette and atmosphere.
- **Progressive experience:** the portfolio content loads directly on normal visits; the immersive title-screen experience is opt-in with `?immersive=1`.
- **Responsive UI:** project case studies, profile, experience, skills, focus areas and contact content adapt to desktop and mobile layouts.
- **Accessibility:** keyboard navigation, command palette (`Ctrl+K`), semantic content, reduced-motion handling and a non-3D fallback.
- **Honest project evidence:** flagship projects are curated, team work is labelled, demo availability is stated accurately, and job simulations or hackathon participation are not presented as employment or awards.
- **Resume generation:** the committed one-page ATS-readable PDF is generated from `scripts/build-resume.py`.

## Selected work featured on the site

- [NIRDHOOM](https://github.com/kaustubhdua/nihdhoom) — field-first crop-residue coordination prototype.
- [Saathi](https://github.com/kaustubhdua/Saathi) — Hindi/Hinglish assistant with deterministic intent routing and source provenance.
- [PatchPilot](https://github.com/kaustubhdua/PatchPilot) — evidence-backed pull-request diff triage; it does not execute repository code.
- [JIIT Youth Club Website 2](https://github.com/kaustubhdua/JYC-Website2) — campus-club website for societies, events, gallery and recruitment.

The profile also highlights six merged upstream contributions to [Lemma Platform](https://github.com/lemma-work/lemma-platform), the NSoC Campus Ambassador role.

## Tech stack

- **UI:** React 19, JavaScript, CSS
- **Rendering:** WebGL, GLSL shaders, custom voxel renderer
- **Build:** Node.js 20+, esbuild
- **Quality:** ESLint, Playwright, custom project/world checks and link verification
- **Hosting:** Vercel

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

The development server starts using the custom script in `scripts/dev.mjs`.

## Quality checks

```bash
npm run lint
npm run build
npm run check
npm run test:world
npm run test:e2e
npm run check:links
```

Or run the standard verification sequence:

```bash
npm run verify
```

`npm run verify` runs lint, production build, repository checks and world tests. The Playwright browser suite is available separately through `npm run test:e2e`.

## Regenerate the resume

The current PDF is committed at `public/Kaustubh-Dua-Resume.pdf`. To regenerate it after editing the source, install ReportLab in your Python environment and run:

```bash
python scripts/build-resume.py
```

## Repository layout

- `src/components/` — React sections and interactive UI.
- `src/data/` — profile, projects, skills, milestones, world content and splash/tip text.
- `src/lib/voxel/` — custom WebGL world renderer and supporting systems.
- `src/styles/` — responsive layout, theme tokens, world styles and interaction effects.
- `scripts/` — development/build/preview, asset generation, audits, link checks and resume generation.
- `tests/` — browser and world-behaviour checks.

---

This is a personal portfolio project. Team projects and prototypes are identified as such, and production or impact claims are only made where they can be verified.
