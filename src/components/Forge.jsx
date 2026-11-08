import { useState } from 'react';
import { Section, Reveal } from './ui.jsx';
import { biomeName, biomes, projectImage, projects, explored } from '../data/projects.js';
import { useWorld } from '../hooks/useTheme.js';
import { profile, sections } from '../data/profile.js';

const meta = sections.find((s) => s.id === 'forge');
const featuredProjects = projects.filter((project) => project.flagship);
const COUNT_WORDS = { 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight' };

export function ProjectCard({ project, onOpen, delay }) {
  const world = useWorld();
  const extra = project.stack.length - 4;
  return (
    <Reveal as="article" delay={delay} className={`card biome-${project.biome}`}>
      <div className="card-media">
        <img src={projectImage(project, world)} alt={`${project.name} pixel-art cover`} width="320" height="180" loading="lazy" decoding="async" />
        <span className="biome-tag pixel">{biomeName(project.biome, world)}</span>
        {project.flagship && <span className="flagship-tag pixel">Flagship</span>}
        <span className={`stage-tag pixel${project.live ? ' is-live' : ''}`}>{project.live && project.stage !== 'Live site' ? `${project.stage} · Live` : project.stage}</span>
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
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.98 1.9 3.05 1.35.1-.72.39-1.2.7-1.48-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.06 1.15a10.6 10.6 0 0 1 5.57 0c2.12-1.45 3.06-1.15 3.06-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.62 5.25-5.11 5.52.4.35.75 1.03.75 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>
        </a>
        {!project.live && <span className="demo-soon pixel">{project.demoNote || 'Demo: coming soon'}</span>}
        {project.live && (
          <a className="icon-btn icon-btn-sm" href={project.live} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} ${project.liveLabel ?? 'live demo'} (opens in a new tab)`}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M14 3h7v7M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </a>
        )}
      </div>
    </Reveal>
  );
}

export default function Forge({ onOpen }) {
  const world = useWorld();
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? featuredProjects : featuredProjects.filter((p) => p.biome === filter);
  const present = [...new Set(featuredProjects.map((p) => p.biome))];

  return (
    <Section id="forge" {...meta} title="Selected Projects" lead={`${COUNT_WORDS[featuredProjects.length] ?? featuredProjects.length} case studies. Start with the engineering area most relevant to the role, then open a case study for architecture, decisions, contribution and known limits.`}>
      <div className="filters" role="group" aria-label="Filter projects by engineering focus">
        {[['all', 'All projects'], ...present.map((b) => [b, biomes[b].note])].map(([id, name]) => (
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
        <h3 className="sub-title pixel">Selected Additional Work</h3>
        <ul className="explored-grid">
          {explored.map((e) => (
            <li key={e.name} className="panel explored-item">
              <p className="card-kind pixel">{e.kind}</p>
              <h4 className="pixel">{e.name}</h4>
              <p>{e.text}</p>
              <p className="explored-links">
                <a href={e.repo} target="_blank" rel="noopener noreferrer">GitHub<span className="sr-only"> (opens in a new tab)</span></a>
                {e.live && (
                  <a href={e.live} target="_blank" rel="noopener noreferrer">{e.liveLabel ?? 'Live demo'}<span className="sr-only"> (opens in a new tab)</span></a>
                )}
              </p>
            </li>
          ))}
        </ul>
        <p className="explored-more">
          <a className="btn btn-secondary btn-sm pixel" href={profile.links.github + '?tab=repositories'} target="_blank" rel="noopener noreferrer">
            All repositories on GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </Reveal>
    </Section>
  );
}
