# Kaustubh Dua · Nether Portfolio

A Minecraft Nether-themed developer portfolio. React 19 and esbuild, no router, no animation library. The hero environment, project thumbnails, sprites, pixel font and social card are generated in-house by scripts in `scripts/`, so no third-party art ships.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173, rebuilds on save
```

## Production build

```bash
npm run verify     # lint + production build + static dist checks
npm run preview    # serves dist/ at http://localhost:4173
```

Set `SITE_URL` at build time so canonical and social-card URLs are absolute:

```bash
SITE_URL=https://example.com npm run build
```

All asset URLs are relative, so `dist/` can be hosted at a domain root or under a sub-path (GitHub Pages, Netlify, Vercel, any static host).

## Features worth knowing

- **Biome picker:** the hero switches between Crimson Forest, Basalt Deltas, Warped Forest and Soul Sand Valley. Fog colour, particles and creatures follow the game (ghasts in Basalt Deltas and Soul Sand Valley, striders on the lava sea). Each biome is about 28 kB and loads only when chosen.
- **Chat:** press `/` or use the speech-bubble button. It is an offline command box (`/help`, `/projects`, `/project <name>`, `/skills`, `/skill <name>`, `/contact`) that answers from `src/data/` through `src/lib/chat.js`. It uses no AI model and sends nothing anywhere.
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
