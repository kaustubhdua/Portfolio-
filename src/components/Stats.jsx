import { useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa6';
import TechIcon from './TechIcon.jsx';
import { Reveal } from './ui.jsx';
import { projects } from '../data/projects.js';
import { profile } from '../data/profile.js';
import { skillGroups } from '../data/skills.js';
import { useInView } from '../hooks/useInView.js';

const featuredSkillIds = new Set(['python', 'typescript', 'javascript', 'cpp', 'sql', 'react', 'nextjs', 'fastapi', 'postgres', 'supabase', 'ortools', 'ollama', 'github', 'playwright', 'docker']);
const items = skillGroups.flatMap((group) => group.items).filter((item) => featuredSkillIds.has(item.id));

// Keep the figures static: the final value is visible to crawlers, assistive technology and visitors
// from the first paint, rather than briefly exposing a duplicated screen-reader/count-up value.
const stats = [
  { id: 'projects', value: projects.filter((p) => p.flagship).length, label: 'Selected projects' },
  { id: 'previews', value: projects.filter((p) => p.flagship && p.live).length, label: 'Public project previews' },
  { id: 'opensource', value: profile.openSource.length, label: 'Merged upstream PRs' },
];

export default function Stats() {
  const [ref] = useInView({ threshold: 0.4 });
  const [paused, setPaused] = useState(false);

  return (
    <section className="glance" aria-label="At a glance">
      <div className="wrap">
        <ul ref={ref} className="stats">
          {stats.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 70} className="stat">
              <strong className="stat-num pixel">{s.value}</strong>
              <span className="stat-label">{s.label}</span>
            </Reveal>
          ))}
        </ul>

        <div className={`marquee${paused ? ' is-paused' : ''}`}>
          <ul className="marquee-track" aria-label="Core technologies used in selected projects">
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
