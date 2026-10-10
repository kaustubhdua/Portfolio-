import { useState } from 'react';
import { FaGithub, FaArrowUpRightFromSquare } from 'react-icons/fa6';
import { Section, Reveal } from './ui.jsx';
import { biomes, projects, explored } from '../data/projects.js';
import { sections } from '../data/profile.js';

const meta = sections.find((s) => s.id === 'forge');
const COUNT_WORDS = { 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight' };

export function ProjectCard({ project, onOpen, delay }) {
  const extra = project.stack.length - 4;
  return (
    <Reveal as="article" delay={delay} className={`card biome-${project.biome}`}>
      <div className="card-media">
        <img src={project.image} alt={`${project.name} pixel-art cover`} width="320" height="180" loading="lazy" decoding="async" />
        <span className="biome-tag pixel">{biomes[project.biome].name}</span>
      </div>
      <div className="card-body">
        <p className="card-kind pixel">{project.kind}</p>
        <h3 className="card-title pixel">{project.name}</h3>
        <p className="card-tagline">{project.tagline}</p>
        <p className="card-summary">{project.summary}</p>
        <ul className="badges" aria-label="Highlights">
          {project.badges.map((b) => <li key={b}>{b}</li>)}
        </ul>
        <ul className="chips" aria-label="Technologies">
          {project.stack.slice(0, 4).map((t) => <li key={t}>{t}</li>)}
          {extra > 0 && <li className="chip-more">+{extra}</li>}
        </ul>
      </div>
      <div className="card-actions">
        <button type="button" className="btn btn-primary btn-sm pixel" onClick={() => onOpen(project.id)} aria-label={`Case study: ${project.name}`}>
          Case study
        </button>
        <a className="icon-btn icon-btn-sm" href={project.repo} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} on GitHub (opens in a new tab)`}>
          <FaGithub aria-hidden="true" />
        </a>
        {project.live && (
          <a className="icon-btn icon-btn-sm" href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} live demo (opens in a new tab)`}>
            <FaArrowUpRightFromSquare aria-hidden="true" />
          </a>
        )}
      </div>
    </Reveal>
  );
}

export default function Forge({ onOpen }) {
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? projects : projects.filter((p) => p.biome === filter);
  const present = [...new Set(projects.map((p) => p.biome))];

  return (
    <Section id="forge" {...meta} title="Featured Projects" lead={`${COUNT_WORDS[projects.length] ?? projects.length} builds, each with a case study covering architecture, decisions and honest limits.`}>
      <div className="filters" role="group" aria-label="Filter projects by biome">
        {[['all', 'All biomes'], ...present.map((b) => [b, biomes[b].name])].map(([id, name]) => (
          <button key={id} type="button" className={`filter pixel${filter === id ? ' is-on' : ''}`} aria-pressed={filter === id} onClick={() => setFilter(id)}>
            {name}
          </button>
        ))}
      </div>
      <div className="cards" aria-live="polite">
        {shown.map((p, i) => (
          <ProjectCard key={p.id} project={p} onOpen={onOpen} delay={i * 70} />
        ))}
      </div>

      <Reveal className="explored">
        <h3 className="sub-title pixel">Side quests · forks and prototypes</h3>
        <ul className="explored-grid">
          {explored.map((e) => (
            <li key={e.name} className="panel explored-item">
              <p className="card-kind pixel">{e.kind}</p>
              <h4 className="pixel">{e.name}</h4>
              <p>{e.text}</p>
              <p className="explored-links">
                <a href={e.repo} target="_blank" rel="noopener noreferrer">GitHub<span className="sr-only"> (opens in a new tab)</span></a>
                {e.live && (
                  <a href={e.live} target="_blank" rel="noopener noreferrer">Live demo<span className="sr-only"> (opens in a new tab)</span></a>
                )}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
