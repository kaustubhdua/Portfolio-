import { useEffect, useRef } from 'react';
import { FaGithub, FaArrowUpRightFromSquare, FaXmark } from 'react-icons/fa6';
import { getProjectStackGroups, projectImage } from '../data/projects.js';
import { useWorld } from '../hooks/useTheme.js';

/** A concise case study: role, proof and engineering choices before exhaustive implementation detail. */
export default function ProjectDialog({ project, onClose }) {
  const world = useWorld();
  const ref = useRef(null);
  const stackGroups = project ? getProjectStackGroups(project.stack) : [];

  useEffect(() => {
    const dialog = ref.current;
    if (!project) return undefined;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [project]);

  if (!project) return <dialog ref={ref} className="dialog" />;

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="case-title"
      aria-describedby="case-summary"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <div className="dialog-inner">
        <button type="button" className="dialog-close" aria-label="Close case study" onClick={() => ref.current.close()}>
          <FaXmark aria-hidden="true" />
        </button>
        <img className="dialog-img" src={projectImage(project, world)} alt="" width="320" height="180" />
        <div className="dialog-body">
          <p className="card-kind pixel">{project.stage} · {project.kind}</p>
          <h2 id="case-title" className="pixel dialog-title">{project.name}</h2>
          <p id="case-summary" className="dialog-tag">{project.summary}</p>
          {project.workflow && <p className="case-workflow"><strong className="pixel">WORKFLOW</strong> {project.workflow}</p>}

          <div className="dialog-actions">
            <a className="btn btn-primary btn-sm pixel" href={project.repo} target="_blank" rel="noopener noreferrer">
              <FaGithub aria-hidden="true" /> Source code<span className="sr-only"> (opens in a new tab)</span>
            </a>
            {project.live && (
              <a className="btn btn-secondary btn-sm pixel" href={project.live} target="_blank" rel="noopener noreferrer">
                <FaArrowUpRightFromSquare aria-hidden="true" /> {project.liveLabel ?? 'Project preview'}<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>

          <h3 className="pixel case-h">The problem</h3>
          <p>{project.problem}</p>

          <h3 className="pixel case-h">My role & contribution</h3>
          <p>{project.contribution ?? 'Individual contribution is not yet documented; review the repository history before attributing implementation work.'}</p>

          <h3 className="pixel case-h">What it does</h3>
          <ul className="bullets">{project.features.map((f) => <li key={f}>{f}</li>)}</ul>

          <h3 className="pixel case-h">System design</h3>
          <dl className="arch">
            {project.architecture.map((a) => (
              <div key={a.title}><dt className="pixel">{a.title}</dt><dd>{a.text}</dd></div>
            ))}
          </dl>

          <h3 className="pixel case-h">Key engineering decisions</h3>
          <ul className="bullets">{project.decisions.map((d) => <li key={d}>{d}</li>)}</ul>

          {project.evidence?.length > 0 && (
            <>
              <h3 className="pixel case-h">Evidence & source trail</h3>
              <ul className="bullets">
                {project.evidence.map((item) => (
                  <li key={item.url}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.label}<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          {project.research?.length > 0 && (
            <>
              <h3 className="pixel case-h">Research-backed design</h3>
              <ul className="bullets">{project.research.map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          )}

          <h3 className="pixel case-h">Current boundaries</h3>
          <ul className="bullets">{project.limits.map((l) => <li key={l}>{l}</li>)}</ul>
          <p className="status"><strong className="pixel">Current status</strong> {project.status}</p>

          <h3 className="pixel case-h">Technology stack</h3>
          <dl className="arch stack-arch">
            {stackGroups.map((group) => (
              <div key={group.id}>
                <dt className="pixel">{group.title}</dt>
                <dd><ul className="chips">{group.items.map((technology) => <li key={technology}>{technology}</li>)}</ul></dd>
              </div>
            ))}
          </dl>
          <p className="case-note">This inventory includes application technologies and supporting tools. Optional integrations and external providers are distinguished in the <a href="https://github.com/kaustubhdua/Portfolio-/blob/main/docs/PROJECT_TECHNOLOGY_AUDIT.md" target="_blank" rel="noopener noreferrer">full project technology audit<span className="sr-only"> (opens in a new tab)</span></a>.</p>
        </div>
      </div>
    </dialog>
  );
}
