import { useEffect, useState } from 'react';
import { FaMoon, FaSun, FaVolumeHigh, FaVolumeXmark } from 'react-icons/fa6';
import Sprite from './Sprite.jsx';
import { sections } from '../data/profile.js';

export default function Nav({ active, onNavigate, soundOn, onToggleSound, theme, onToggleTheme, travelling }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const current = sections.find((s) => s.id === active) ?? sections[0];

  return (
    <header className={`topbar${scrolled ? ' is-solid' : ''}`}>
      <nav className="nav" aria-label="Sections">
        <a className="nav-brand pixel" href="#spawn" onClick={(e) => onNavigate(e, 'spawn')} aria-label="Kaustubh Dua, back to top">
          <Sprite name="torch" size={22} />
          <span>KD</span>
        </a>
        <ul className="nav-list">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`nav-link${s.id === active ? ' is-active' : ''}`}
                aria-current={s.id === active ? 'location' : undefined}
                aria-label={`${s.label}, ${s.hint}`}
                onClick={(e) => onNavigate(e, s.id)}
              >
                <Sprite name={s.sprite} size={22} />
                <span className="nav-text pixel" aria-hidden="true">{s.short}</span>
              </a>
            </li>
          ))}
        </ul>
        <span className="nav-tip pixel" aria-hidden="true">{current.label}</span>
      </nav>
      <button
        type="button"
        className="theme-toggle"
        data-world={theme}
        aria-label={theme === 'overworld' ? 'Travel to the Nether (night mode)' : 'Travel to the Overworld (day mode)'}
        disabled={travelling}
        onClick={onToggleTheme}
      >
        {theme === 'overworld' ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
        <span className="theme-toggle-tip pixel" aria-hidden="true">{theme === 'overworld' ? 'Day' : 'Night'}</span>
      </button>
      <button
        type="button"
        className="sound-toggle"
        aria-pressed={soundOn}
        aria-label={soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on'}
        onClick={onToggleSound}
      >
        {soundOn ? <FaVolumeHigh aria-hidden="true" /> : <FaVolumeXmark aria-hidden="true" />}
      </button>
    </header>
  );
}
