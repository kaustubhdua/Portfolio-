import { useCallback, useEffect, useMemo, useState } from 'react';
import Loader from './components/Loader.jsx';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Stats from './components/Stats.jsx';
import Profile from './components/Profile.jsx';
import Inventory from './components/Inventory.jsx';
import Forge from './components/Forge.jsx';
import ProjectDialog from './components/ProjectDialog.jsx';
import Advancements from './components/Advancements.jsx';
import WorldMap from './components/WorldMap.jsx';
import Contact from './components/Contact.jsx';
import { PortalRule } from './components/ui.jsx';
import { sections, profile } from './data/profile.js';
import { projects } from './data/projects.js';
import { useActiveSection } from './hooks/useActiveSection.js';
import { useReducedMotion } from './hooks/useMedia.js';
import { usePointerFx } from './hooks/usePointerFx.js';
import { setAmbient } from './lib/audio.js';

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
  const [intro, setIntro] = useState(() => !introAlreadySeen() && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [openId, setOpenId] = useState(null);
  const [soundOn, setSoundOn] = useState(false);
  const [warp, setWarp] = useState(0);

  const finishIntro = useCallback(() => {
    setIntro(false);
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

  // Honour a hash in the URL after the first paint.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id && document.getElementById(id)) requestAnimationFrame(() => document.getElementById(id).scrollIntoView());
  }, []);

  const project = projects.find((p) => p.id === openId) ?? null;

  return (
    <>
      <a className="skip-link" href="#profile" onClick={(e) => navigate(e, 'profile')}>Skip to content</a>
      {intro && <Loader onDone={finishIntro} />}
      <Nav active={active} onNavigate={navigate} soundOn={soundOn} onToggleSound={toggleSound} />
      <main>
        <Hero ready={!intro} onNavigate={navigate} />
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
          &copy; {new Date().getFullYear()} {profile.name} · Pixel art and font generated in-house · Not affiliated with Mojang or Microsoft
        </p>
      </footer>
      <ProjectDialog project={project} onClose={() => setOpenId(null)} />
      <div key={warp} className={`warp${warp ? ' go' : ''}`} aria-hidden="true" />
    </>
  );
}
