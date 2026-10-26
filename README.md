# Kaustubh Dua · Nether Portfolio

A Minecraft Nether-themed developer portfolio. React 19 and esbuild, no router, no animation library. The hero environment, project thumbnails, sprites, pixel font and social card are generated in-house by scripts in `scripts/`, so no third-party art ships.

## The 3D world

Behind the page is a small WebGL 2 voxel engine written for this site (`src/lib/voxel/`): generated 16x16 textures in a texture array, chunked meshing with baked ambient occlusion and light, a sky shader with blocky clouds, and instanced animated creatures. No 3D library is used. Scrolling walks the camera along a spline through a village (day, the Overworld) or a fortress bridge over lava (night, the Nether); each section is a stop on the path.

- Click a creature to make it react; click bare ground to dig a block out (it grows back).
- The moon/sun button plays a portal trip between the two worlds.
- **Quick view** (hero button or command palette) turns the scenery off for a plain, fast read.
- Without WebGL 2, on a very slow device, or with reduced motion, the site falls back to still pictures or a static scene.
- The creatures are original blocky designs, not Mojang assets. This is a fan-style tribute and is not affiliated with Mojang or Microsoft.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173, rebuilds on save
```

## Production build and verification

```bash
npm run verify     # lint + production build + static checks + offline voxel-world tests
npm run test:e2e   # browser tests against a running production preview
npm run audit      # performance and accessibility audit against a running preview
npm run check:links # check project and profile links (requires network access)
npm run preview    # serves dist/ at http://localhost:4173
```

For browser tests and the audit, build first and keep the preview server running:

```bash
npm run build
npm run preview
# In another terminal:
npm run test:e2e
npm run audit
```

Set `SITE_URL` at build time so canonical and social-card URLs are absolute:

```bash
SITE_URL=https://example.com npm run build
```

All asset URLs are relative, so `dist/` can be hosted at a domain root or under a sub-path (GitHub Pages, Netlify, Vercel, any static host).

## The blog (coming soon)

The blog is built but switched off: `blogEnabled` in `src/data/profile.js` is `false`, so the site shows "Blog: coming soon" and ships no `/blog/` pages. Set it to `true` (and rebuild) to publish; `BLOG_PREVIEW=1 npm run build` builds it for a private look without switching it on.

Posts are Markdown files in `content/blog/`, one file per post. The build turns each into a static page
at `/blog/<file-name>/`, builds the list at `/blog/`, adds them to `sitemap.xml` and writes an RSS feed
(`/blog/feed.xml`) when `SITE_URL` is set. The pages need no JavaScript and follow the visitor's day or
night world.

```md
---
title: My post title
date: 2026-11-02
summary: One or two sentences shown on the list page and in link previews.
tags: Java, Backend
draft: true        # optional: hidden from the build until you remove it (BLOG_DRAFTS=1 shows drafts)
---

## A heading

Plain paragraphs, **bold**, *italic*, `code`, [links](https://example.com), lists, quotes and
fenced code blocks all work.
```

Preview with `npm run build && npm run preview`, then open `/blog/`. The three starter posts are drawn
only from public LinkedIn posts and certificates; read and edit them in your own voice before publishing.

## Features worth knowing

- **Chat:** press `/` or use the speech-bubble button. It is an offline command box (`/help`, `/projects`, `/project <name>`, `/skills`, `/skill <name>`, `/contact`) that answers from `src/data/` through `src/lib/chat.js`. It uses no AI model and sends nothing anywhere.
- **Sound:** every effect, voice and the ambient score is synthesised in the browser, so no audio file ships and nothing is copied from any game. It stays off until the visitor presses the speaker button. To use recordings you have the rights to instead, see `public/sounds/README.md`.
- **Contact:** the WhatsApp links use `wa.me`, so a tap opens the chat directly. The number lives in `src/data/profile.js` (`links.whatsapp`).
- **Avatar:** `public/img/avatar.png` is an original pixel portrait drawn by `scripts/build-avatar.py` (needs Pillow). Edit the script to change hair, glasses or clothes, then run it.
- **Free roam:** "Explore freely" hides all text and lets you walk the world (WASD, mouse, or a touch joystick), dig and place blocks. Esc or the Leave button returns to the page.
- **Title-screen touches:** a yellow splash text beside the name and a "Did you know?" tip on the loading screen, all drawn from real project facts.

## Layout

| Path | Purpose |
| --- | --- |
| `src/data/` | All copy: profile, skills, projects, advancements. Edit content here. |
| `src/components/` | One component per section, plus `Hero`, `Nav`, `Embers`, `Loader`, `ProjectDialog`. |
| `src/lib/voxel/` | WebGL renderer, world generation, lighting, meshing, shaders, camera path and free-roam physics. |
| `src/styles/` | Theme tokens, base, nav, hero, shared UI and per-section CSS. |
| `scripts/` | Build, dev server, preview server, static check, asset and font generators. |
| `public/` | Generated hero layers, textures, thumbnails, font, favicon, social card. |

`npm run assets` regenerates the raster art (hero layers per biome, thumbnails, social card); `scripts/build-font.py` rebuilds the pixel font.

## Content policy

Content is based on repository documentation. Awards, certifications and metrics are omitted unless verifiable. Each case study now distinguishes the shared project from personal authorship and links to README, evaluation, roadmap, or CI evidence where available. Check commit/PR history for exact individual attribution; no benchmark values are invented.

## Credits

The cursor spotlight, card tilt, count-up stats and scrolling technology strip follow patterns popularised by [React Bits](https://github.com/DavidHDev/react-bits) (MIT with Commons Clause). They are small re-implementations in this codebase with no extra dependencies, not copies of its source. Technology logos come from `react-icons` (Simple Icons).

## Loading, tests and CI

- **Loading screens:** `index.html` contains a static boot screen that paints before any JavaScript runs. Once the app mounts, `Loader.jsx` takes over and its bar follows the real loading of the hero art. It is skippable and skipped for reduced-motion users and repeat visits.
- **Offline world tests:** `npm run test:world` checks both generated worlds, camera collisions, lighting, and free-roam movement. It is included in `npm run verify`.
- **Browser tests:** `npm run test:e2e` covers navigation, dialogs, keyboard behaviour, reduced motion, responsive widths, images, and other core interactions.
- **Performance and accessibility:** `npm run audit` measures page-load timings and layout shift and checks common accessibility and console/network issues on desktop, mobile, and 3D views.
- **CI:** `.github/workflows/ci.yml` runs lint, build, static checks, offline world tests, browser tests, and the performance/accessibility audit on pushes and pull requests. A separate non-blocking job reports dead or authentication-walled project links.
- **Dependency reproducibility:** a lockfile is not yet committed, so CI currently uses `npm install`. Generate `package-lock.json` with a network-enabled npm install in the supported Node/npm environment, commit the actual resolver output, then switch both CI jobs to `npm ci`.
- **Deploy:** `vercel.json` makes Vercel zero-config. `SITE_URL` (or Vercel's production URL) sets canonical links, the social card, `sitemap.xml` and `robots.txt`.


## Current release verification snapshot

This section records the current verification boundary for this maintenance branch; it is not a substitute for a passing CI run.

- **Workflow run:** [CI on the maintenance branch](https://github.com/kaustubhdua/Portfolio-/actions/workflows/ci.yml) is currently failing before any job steps execute: recent runs report zero steps and no runner details. This points to a runner/Actions execution or repository billing/availability problem rather than a demonstrated lint/build/test failure. Check repository Actions settings and billing/runner availability first; then inspect the newly separated step logs. The code is not considered verified until jobs actually execute.
- **Dependency lock:** `package-lock.json` is not committed. The execution environment here cannot reach the npm registry, and the repository's Actions jobs have not started, so a genuine resolver-generated lockfile could not be obtained. Do not hand-author one. Generate it with npm in a working network-enabled checkout, commit it, and switch CI to `npm ci`.
- **Portfolio browser/performance checks:** E2E and performance/a11y checks are configured in CI but have not been independently verified as passing on this branch.
- **External project links:** the network checker is configured as a non-blocking job. Inspect every reported redirect, authentication wall, or failed URL in a run with retrievable logs.
- **Deployment parity:** the production URL and deployed commit still need an explicit smoke-check record. A successful source build alone does not prove that the live deployment matches this branch.

## Release checklist

Before describing a release as production-ready:

1. Run `npm run verify` from a clean checkout.
2. Run `npm run test:e2e` and `npm run audit` against the production build.
3. Run `npm run check:links` and review every reported URL.
4. Check the live deployment on a real phone and desktop, with 3D enabled and quick view enabled.
5. Confirm all case-study statuses, demos, repository links, and technical claims match the current implementation.
6. Review repository visibility and ensure no secrets, private data, or unlicensed assets are published.

## Copyright and reuse

© 2026 Kaustubh Dua. All rights reserved. See [LICENSE](LICENSE): the code, design, artwork and text may not be copied, modified or redistributed without written permission. This repository is private. A public website's HTML, CSS and JavaScript can always be downloaded by a browser, so the protection here is legal (copyright and licence) plus minified, source-map-free production builds, not technical.
