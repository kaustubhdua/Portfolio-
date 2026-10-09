import { useEffect, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa6';
import TechIcon from './TechIcon.jsx';
import { Reveal } from './ui.jsx';
import { projects } from '../data/projects.js';
import { skillGroups } from '../data/skills.js';
import { useInView } from '../hooks/useInView.js';
import { useReducedMotion } from '../hooks/useMedia.js';

const items = skillGroups.flatMap((g) => g.items);

// Every figure is derived from the data files, except the benchmark size that Saathi's README states.
const stats = [
  { id: 'projects', value: projects.length, label: 'Featured projects' },
  { id: 'live', value: projects.filter((p) => p.live).length, label: 'Live demos' },
  { id: 'tools', value: items.length, label: 'Tools in the inventory' },
  { id: 'bench', value: 120, label: 'Synthetic benchmark cases in Saathi' },
];

/** Counts up from zero once visible; shows the final number immediately for reduced motion. */
function CountUp({ to, run, duration = 1100 }) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!run) return undefined;
    if (reduced) {
      setN(to);
      return undefined;
    }
    let raf = 0;
    let start = null;
    const tick = (t) => {
      start ??= t;
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to, duration, reduced]);

  return (
    <>
      <span className="sr-only">{to}</span>
      <span aria-hidden="true">{n}</span>
    </>
  );
}

export default function Stats() {
  const [ref, seen] = useInView({ threshold: 0.4 });
  const [paused, setPaused] = useState(false);

  return (
    <section className="glance" aria-label="At a glance">
      <div className="wrap">
        <ul ref={ref} className="stats">
          {stats.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 70} className="stat">
              <strong className="stat-num pixel">
                <CountUp to={s.value} run={seen} />
              </strong>
              <span className="stat-label">{s.label}</span>
            </Reveal>
          ))}
        </ul>

        <div className={`marquee${paused ? ' is-paused' : ''}`}>
          <ul className="marquee-track" aria-label="Technologies I have used">
            {[...items, ...items].map((item, i) => (
              <li key={`${item.id}-${i}`} aria-hidden={i >= items.length ? 'true' : undefined}>
                <TechIcon item={item} size={20} />
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="marquee-toggle"
            aria-pressed={paused}
            aria-label={paused ? 'Resume scrolling technology list' : 'Pause scrolling technology list'}
            onClick={() => setPaused((p) => !p)}
          >
            {paused ? <FaPlay aria-hidden="true" /> : <FaPause aria-hidden="true" />}
          </button>
        </div>
      </div>
    </section>
  );
}
