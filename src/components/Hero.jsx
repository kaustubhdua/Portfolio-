import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { FaEnvelope, FaGithub, FaLinkedinIn } from 'react-icons/fa6';
import Embers from './Embers.jsx';
import Sprite from './Sprite.jsx';
import { profile } from '../data/profile.js';
import { heroBiomes, splashes } from '../data/biomes.js';
import { useReducedMotion } from '../hooks/useMedia.js';

const LAYERS = [
  { name: 'sky', depth: 4 },
  { name: 'far', depth: 10 },
  { name: 'lava', depth: 16 },
  { name: 'mid', depth: 26 },
  { name: 'near', depth: 42 },
];

const BIOME_LAYERS = ['sky', 'far', 'mid', 'near', 'fore'];

/** Loads every layer of a biome so switching never shows a half-painted scene. */
function preloadBiome(id) {
  return Promise.all(
    BIOME_LAYERS.map(
      (name) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = `img/hero/${id}/${name}.png`;
        }),
    ),
  );
}

// Words stay unbreakable; `index` keeps the stagger running across the whole name.
let letterIndex = 0;
const NAME_WORDS = profile.name.split(' ').map((word) => ({
  word,
  letters: [...word].map((ch) => ({ ch, index: letterIndex++ })),
}));

export default function Hero({ ready, onNavigate }) {
  const heroRef = useRef(null);
  const reduced = useReducedMotion();
  const [biomeId, setBiomeId] = useState(heroBiomes[0].id);
  const [splash] = useState(() => splashes[Math.floor(Math.random() * splashes.length)]);
  const biome = heroBiomes.find((b) => b.id === biomeId);

  const chooseBiome = useCallback(
    async (id) => {
      if (id === biomeId) return;
      await preloadBiome(id);
      setBiomeId(id);
    },
    [biomeId],
  );

  // Pointer and scroll parallax. Only two CSS variables change per frame, and updates stop
  // while the hero is off screen.
  useEffect(() => {
    const hero = heroRef.current;
    if (reduced) {
      hero.style.setProperty('--px', '0');
      hero.style.setProperty('--sy', '0');
      return undefined;
    }
    let raf = 0;
    let px = 0;
    let target = 0;
    let visible = true;
    const apply = () => {
      raf = 0;
      px += (target - px) * 0.12;
      const sy = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
      hero.style.setProperty('--px', px.toFixed(3));
      hero.style.setProperty('--sy', sy.toFixed(3));
      if (visible && Math.abs(target - px) > 0.002) raf = requestAnimationFrame(apply);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(apply);
    };
    const onPointer = (e) => {
      target = (e.clientX / window.innerWidth - 0.5) * 2;
      kick();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      hero.dataset.away = String(!visible);
      kick();
    });
    io.observe(hero);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', kick, { passive: true });
    kick();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', kick);
    };
  }, [reduced]);

  const creatureLayer = biome.creature === 'ghast' ? 'sky' : 'lava';
  const renderLayer = (l) => (
    <div key={l.name} className={`layer layer-${l.name}`} style={{ '--depth': l.depth }}>
      {l.name === creatureLayer && <Sprite name={biome.creature} size={64} className={`critter critter-${biome.creature}`} />}
    </div>
  );

  return (
    <section
      id="spawn"
      ref={heroRef}
      className={`hero${ready ? ' is-ready' : ''}`}
      data-biome={biome.id}
      aria-labelledby="hero-title"
      tabIndex={-1}
    >
      <div className="stage" aria-hidden="true">
        <div className="scene" key={biome.id}>
          {LAYERS.slice(0, 3).map(renderLayer)}
          <div className="layer-portal-wrap" style={{ '--depth': 22 }}>
            <div className="portal-glow" />
            <div className="portal">
              <div className="portal-surface" />
            </div>
          </div>
          {LAYERS.slice(3).map(renderLayer)}
          <div className="layer layer-fore" style={{ '--depth': 64 }} />
        </div>
        <div className="fog fog-a" />
        <div className="fog fog-b" />
        <div className="lava-glow" />
        <Embers key={biome.id} palette={biome.particles} />
      </div>
      <div className="hero-scrim" aria-hidden="true" />

      <div className="hero-content">
        <p className="hero-kicker pixel">{profile.kicker}</p>
        <h1 id="hero-title" className="hero-name pixel">
          <span className="sr-only">{profile.name}</span>
          <span aria-hidden="true" className="hero-letters">
            {NAME_WORDS.map(({ word, letters }, w) => (
              <Fragment key={word}>
                <span className="word">
                  {letters.map(({ ch, index }) => (
                    <span key={index} className="letter" style={{ '--i': index }}>
                      {ch}
                    </span>
                  ))}
                </span>
                {w < NAME_WORDS.length - 1 && ' '}
              </Fragment>
            ))}
            <span className="hero-splash">{splash}</span>
          </span>
        </h1>
        <p className="hero-role">{profile.role}</p>
        <p className="hero-intro">{profile.intro}</p>
        <div className="hero-actions">
          <a className="btn btn-primary pixel" href="#profile" onClick={(e) => onNavigate(e, 'profile')}>
            Explore My World
          </a>
          <a className="btn btn-secondary pixel" href="#forge" onClick={(e) => onNavigate(e, 'forge')}>
            View Projects
          </a>
          <a className="icon-btn" href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile (opens in a new tab)">
            <FaGithub aria-hidden="true" />
          </a>
          <a className="icon-btn" href={`mailto:${profile.links.email}`} aria-label="Send an email">
            <FaEnvelope aria-hidden="true" />
          </a>
          <a className="icon-btn" href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile (opens in a new tab)">
            <FaLinkedinIn aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="biome-picker" role="group" aria-label="Choose a Nether biome for the background">
        <ul>
          {heroBiomes.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className={`biome-btn pixel${b.id === biome.id ? ' is-on' : ''}`}
                aria-pressed={b.id === biome.id}
                onClick={() => chooseBiome(b.id)}
                onPointerEnter={() => preloadBiome(b.id)}
                onFocus={() => preloadBiome(b.id)}
              >
                {b.name}
              </button>
            </li>
          ))}
        </ul>
        <p className="biome-caption" aria-live="polite">{biome.caption}</p>
      </div>
    </section>
  );
}
