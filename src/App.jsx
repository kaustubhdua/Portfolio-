import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Loader from './components/Loader.jsx';
import Toasts from './components/Toasts.jsx';
import TitleScreen from './components/TitleScreen.jsx';
import PortalTravel from './components/PortalTravel.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import WorldBackdrop from './components/WorldBackdrop.jsx';
import FallbackBackdrop from './components/FallbackBackdrop.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import ExploreHud from './components/ExploreHud.jsx';
import Stats from './components/Stats.jsx';
import Hud from './components/Hud.jsx';
import Profile from './components/Profile.jsx';
import Inventory from './components/Inventory.jsx';
import Forge from './components/Forge.jsx';
import Advancements from './components/Advancements.jsx';
import WorldMap from './components/WorldMap.jsx';
import Contact from './components/Contact.jsx';
import { PortalRule } from './components/ui.jsx';
import { sections, profile } from './data/profile.js';
import { projects } from './data/projects.js';
import { useActiveSection } from './hooks/useActiveSection.js';
import { useReducedMotion } from './hooks/useMedia.js';
import { WorldContext, useTheme } from './hooks/useTheme.js';
import { usePointerFx } from './hooks/usePointerFx.js';
import { getExploreApi, getMode, subscribeMode, worldReact } from './lib/voxel/travel.js';
import { inventorySound, levelUpSound, setAmbient, setSoundWorld, soundWanted, uiClick } from './lib/audio.js';

// Rarely needed on first paint, so they ship as separate chunks.
const Chat = lazy(() => import('./components/Chat.jsx'));
const loadDialog = () => import('./components/ProjectDialog.jsx');
const ProjectDialog = lazy(loadDialog);

const SEEN_KEY = 'nether-intro-seen';

function introAlreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const reduced = useReducedMotion();
  usePointerFx();
  const ids = useMemo(() => sections.map((s) => s.id), []);
  const active = useActiveSection(ids);
  // 'title' (menu), then 'load' (world-loading screen), then false. Skipped when seen this session or with reduced motion.
  const [intro, setIntro] = useState(() => (!introAlreadySeen() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'title' : false));
  const afterIntro = useRef('play');
  const [openId, setOpenId] = useState(null);
  const [soundOn, setSoundOn] = useState(false);
  const [warp, setWarp] = useState(0);
  const [theme, setTheme] = useTheme();
  const [trip, setTrip] = useState(null); // the world being travelled to, while the portal animation runs
  const [announce, setAnnounce] = useState('');
  // Free roam: the text disappears and the visitor walks the 3D world.
  const worldMode = useSyncExternalStore(subscribeMode, getMode);
  const [exploring, setExploring] = useState(false);
  const enterExplore = useCallback(() => {
    const api = getExploreApi();
    if (!api) return;
    api.enter();
    document.documentElement.dataset.explore = 'on';
    setExploring(true);
    setAnnounce('Exploring the world freely. Press Escape to return to the page.');
  }, []);
  const leaveExplore = useCallback(() => {
    getExploreApi()?.leave();
    delete document.documentElement.dataset.explore;
    setExploring(false);
    setAnnounce('Back on the page.');
  }, []);
  const canExplore = worldMode === 'on' && !trip && !intro;
  const [wantExplore, setWantExplore] = useState(false);
  useEffect(() => {
    if (wantExplore && canExplore) {
      setWantExplore(false);
      enterExplore();
    }
  }, [wantExplore, canExplore, enterExplore]);
  // "Quick view" turns the 3D scenery off for visitors who just want the content.
  const [quick, setQuick] = useState(() => {
    try {
      return localStorage.getItem('portfolio-quick') === 'on';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.quick = quick ? 'on' : 'off';
    try {
      localStorage.setItem('portfolio-quick', quick ? 'on' : 'off');
    } catch {
      /* preference just will not be remembered */
    }
  }, [quick]);
  const toggleQuick = useCallback(() => {
    setQuick((q) => {
      setAnnounce(q ? '3D scenery turned on.' : 'Quick view on: 3D scenery turned off.');
      return !q;
    });
  }, []);

  const travel = useCallback(() => {
    if (trip) return;
    const next = theme === 'overworld' ? 'nether' : 'overworld';
    const message = next === 'overworld' ? 'You stepped through the portal into the Overworld: day mode.' : 'You stepped through the portal into the Nether: night mode.';
    if (reduced) {
      setTheme(next);
      setAnnounce(message);
      return;
    }
    setTrip(next);
  }, [trip, theme, reduced, setTheme]);

  const swapWorld = useCallback(() => {
    setTheme(trip);
    setAnnounce(trip === 'overworld' ? 'You stepped through the portal into the Overworld: day mode.' : 'You stepped through the portal into the Nether: night mode.');
  }, [trip, setTheme]);
  const endTrip = useCallback(() => setTrip(null), []);

  // While the title screen is up, the page content behind it is hidden so only the world shows through.
  useEffect(() => {
    if (intro === 'title') document.documentElement.dataset.title = 'on';
    else delete document.documentElement.dataset.title;
  }, [intro]);

  const chooseEntry = useCallback((what) => {
    afterIntro.current = what;
    setIntro('load');
  }, []);

  const finishIntro = useCallback(() => {
    setIntro(false);
    if (afterIntro.current === 'contact') requestAnimationFrame(() => document.getElementById('contact')?.scrollIntoView());
    if (afterIntro.current === 'explore') setWantExplore(true);
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* storage can be unavailable; the intro simply plays again next visit */
    }
  }, []);

  const navigate = useCallback(
    (event, id) => {
      event.preventDefault();
      const el = document.getElementById(id);
      if (!el) return;
      if (!reduced) setWarp((n) => n + 1);
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
      el.focus({ preventScroll: true });
    },
    [reduced],
  );

  const toggleSound = useCallback(async () => {
    setSoundOn(await setAmbient(!soundOn));
  }, [soundOn]);

  useEffect(() => () => void setAmbient(false), []);

  // Moving to another section: the people nearby look up and wave, and the level goes up with a chime
  // (the number on the experience bar is the section you are in).
  const prevActive = useRef(active);
  useEffect(() => {
    const before = ids.indexOf(prevActive.current);
    const now = ids.indexOf(active);
    prevActive.current = active;
    if (now === before || intro) return;
    worldReact('section');
    if (now > before) levelUpSound();
  }, [active, ids, intro]);

  // Opening a case study opens an inventory; closing it puts it away.
  const dialogOpen = useRef(false);
  useEffect(() => {
    const isOpen = Boolean(openId);
    if (isOpen === dialogOpen.current) return;
    dialogOpen.current = isOpen;
    if (!intro) inventorySound(isOpen);
  }, [openId, intro]);
  useEffect(() => setSoundWorld(theme), [theme]);

  // Button presses click like the game's menus; a remembered "sound on" starts at the first gesture.
  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest?.('button,a[href],summary,[role="button"]')) {
        uiClick();
        worldReact('click');
      }
    };
    document.addEventListener('click', onClick);
    let resume = null;
    if (soundWanted()) {
      resume = async () => {
        setSoundOn(await setAmbient(true));
        window.removeEventListener('pointerdown', resume);
        window.removeEventListener('keydown', resume);
      };
      window.addEventListener('pointerdown', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
    }
    return () => {
      document.removeEventListener('click', onClick);
      if (resume) {
        window.removeEventListener('pointerdown', resume);
        window.removeEventListener('keydown', resume);
      }
    };
  }, []);

  // The static boot screen in index.html has done its job once the app is running.
  useEffect(() => {
    document.getElementById('boot')?.remove();
  }, []);

  // Warm the case-study chunk shortly after load so the first click opens instantly.
  useEffect(() => {
    const t = setTimeout(loadDialog, 2500);
    return () => clearTimeout(t);
  }, []);

  // Honour a hash in the URL after the first paint. `#project/<id>` (used by the per-project
  // share pages) scrolls to the Forge and opens that case study.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    const shared = id.startsWith('project/') ? projects.find((p) => p.id === id.slice(8)) : null;
    if (shared) {
      requestAnimationFrame(() => {
        document.getElementById('forge')?.scrollIntoView();
        setOpenId(shared.id);
      });
    } else if (id && document.getElementById(id)) {
      requestAnimationFrame(() => document.getElementById(id).scrollIntoView());
    }
  }, []);

  // Back/forward buttons and pasted #project/... links work while the page is already open.
  useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.slice(1);
      const shared = id.startsWith('project/') ? projects.find((p) => p.id === id.slice(8)) : null;
      if (shared) setOpenId(shared.id);
      else if (id && document.getElementById(id)) document.getElementById(id).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [reduced]);

  // Keep the address bar shareable while a case study is open.
  useEffect(() => {
    if (openId) history.replaceState(null, '', `#project/${openId}`);
    else if (window.location.hash.startsWith('#project/')) history.replaceState(null, '', '#forge');
  }, [openId]);

  const project = projects.find((p) => p.id === openId) ?? null;

  return (
    <WorldContext.Provider value={theme}>
      <a className="skip-link" href="#profile" onClick={(e) => navigate(e, 'profile')}>Skip to content</a>
      {intro === 'title' && <TitleScreen onChoose={chooseEntry} soundOn={soundOn} onSound={toggleSound} quick={quick} onQuick={toggleQuick} />}
      {intro === 'load' && <Loader onDone={finishIntro} soundOn={soundOn} onSound={toggleSound} />}
      <Suspense fallback={null}>
        <Chat />
      </Suspense>
      <CommandPalette onGo={(id) => navigate({ preventDefault() {} }, id)} onOpenProject={setOpenId} onTravel={travel} onSound={toggleSound} soundOn={soundOn} world={theme} onQuick={toggleQuick} quick={quick} onExplore={canExplore ? enterExplore : null} />
      <Toasts active={active} paused={Boolean(intro) || exploring || Boolean(trip)} />
      <Hud active={active} />
      <Nav active={active} onNavigate={navigate} soundOn={soundOn} onToggleSound={toggleSound} theme={theme} onToggleTheme={travel} travelling={Boolean(trip)} />
      {exploring && <ExploreHud onExit={leaveExplore} />}
      <WorldBackdrop world={theme} sections={ids} reduced={reduced} disabled={quick} />
      <FallbackBackdrop world={theme} sections={ids} active={active} />
      <main>
        <Hero ready={!intro} onNavigate={navigate} theme={theme} quick={quick} onQuick={toggleQuick} canExplore={canExplore} onExplore={enterExplore} />
        <Stats />
        <PortalRule />
        <Profile />
        <PortalRule />
        <Inventory />
        <PortalRule />
        <Forge onOpen={setOpenId} />
        <PortalRule />
        <Advancements />
        <PortalRule />
        <WorldMap onOpen={setOpenId} />
        <PortalRule />
        <Contact />
      </main>
      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} {profile.name} · Pixel art and font generated in-house · Not affiliated with Mojang or Microsoft · <a href="blog/">Blog</a>
        </p>
        <details className="build-notes">
          <summary>How this site is built</summary>
          <ul>
            <li>React 19 bundled with esbuild: no router and no animation library, and the JavaScript is kept under a size budget that the build checks.</li>
            <li>The pixel font, the Nether scenes and every sprite are generated by scripts in this repository.</li>
            <li>The 3D village and Nether fortress are drawn by a small WebGL 2 engine written for this site (generated textures, baked lighting, no 3D library). Scrolling walks the camera along the road; the characters and creatures are original blocky designs, not Mojang assets. It loads after the page and falls back to the 2D scenes without WebGL.</li>
            <li>The gold trophy at the end of the road, in the village and in the Nether, is deliberately unnamed. It gets its name when I win something.</li>
            <li>The portal is plain CSS, with parallax driven by two CSS variables; animation pauses off screen and respects reduced-motion settings.</li>
            <li>Case studies use the native dialog element, and navigation works fully by keyboard.</li>
            <li>The blog is plain Markdown in <code>content/blog</code>, turned into static pages by the build, so adding a post means adding one file.</li>
            <li>The chat is a rule-based helper that runs in your browser. It uses no AI service and sends nothing anywhere.</li>
            <li>Press Ctrl or Cmd + K for a command menu: jump to a section, open a case study, copy the email address or switch worlds.</li>
            <li>Browser tests run on every push and check layout at ten screen widths, keyboard use and console errors.</li>
          </ul>
        </details>
      </footer>
      <Suspense fallback={null}>
        <ProjectDialog project={project} onClose={() => setOpenId(null)} />
      </Suspense>
      <div key={warp} className={`warp${warp ? ' go' : ''}`} aria-hidden="true" />
      {trip && <PortalTravel to={trip} onSwap={swapWorld} onDone={endTrip} />}
      <p className="sr-only" role="status">{announce}</p>
    </WorldContext.Provider>
  );
}
