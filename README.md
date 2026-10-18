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

## Production build

```bash
npm run verify     # lint + production build + static dist checks
npm run test:world # offline checks of both 3D worlds
npm run audit      # load timings, layout shift and accessibility checks (needs a preview server)
npm run preview    # serves dist/ at http://localhost:4173
```

Set `SITE_URL` at build time so canonical and social-card URLs are absolute:

```bash
SITE_URL=https://example.com npm run build
```

All asset URLs are relative, so `dist/` can be hosted at a domain root or under a sub-path (GitHub Pages, Netlify, Vercel, any static host).

## The blog

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
| `src/styles/` | Theme tokens, base, nav, hero, shared UI and per-section CSS. |
| `scripts/` | Build, dev server, preview server, static check, asset and font generators. |
| `public/` | Generated hero layers, textures, thumbnails, font, favicon, social card. |

`npm run assets` regenerates the raster art (hero layers per biome, thumbnails, social card); `scripts/build-font.py` rebuilds the pixel font.

## Content policy

Everything in `src/data/` comes from the public GitHub profile and project READMEs. Awards, certifications and metrics are intentionally absent because none are published. Prototype, simulated and demo status is stated on each project.

## Credits

The cursor spotlight, card tilt, count-up stats and scrolling technology strip follow patterns popularised by [React Bits](https://github.com/DavidHDev/react-bits) (MIT with Commons Clause). They are small re-implementations in this codebase with no extra dependencies, not copies of its source. Technology logos come from `react-icons` (Simple Icons).

## Loading, tests and CI

- **Loading screens:** `index.html` contains a static boot screen that paints before any JavaScript runs. Once the app mounts, `Loader.jsx` takes over and its bar follows the real loading of the hero art. It is skippable and skipped for reduced-motion users and repeat visits.
- **Tests:** `npm run build && npm run preview &` then `npm run test:e2e` runs the browser suite (navigation, dialogs, keyboard, reduced motion, responsive checks, console errors).
- **CI:** `.github/workflows/ci.yml` runs lint, build, the static check and the browser tests on every push.
- **Deploy:** `vercel.json` makes Vercel zero-config. `SITE_URL` (or Vercel's production URL) sets canonical links, the social card, `sitemap.xml` and `robots.txt`.
