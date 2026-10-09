import { useEffect, useRef } from 'react';
import { FaGithub, FaArrowUpRightFromSquare, FaXmark } from 'react-icons/fa6';
import { biomes } from '../data/projects.js';

/** Case study in a native <dialog>: focus trap, Escape and focus restoration come from the platform. */
export default function ProjectDialog({ project, onClose }) {
  const ref = useRef(null);

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
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close();
      }}
    >
      <div className="dialog-inner">
        <button type="button" className="dialog-close" aria-label="Close case study" onClick={() => ref.current.close()}>
          <FaXmark aria-hidden="true" />
        </button>
        <img className="dialog-img" src={project.image} alt="" width="320" height="180" />
        <div className="dialog-body">
          <p className="card-kind pixel">{biomes[project.biome].name} · {project.kind}</p>
          <h2 id="case-title" className="pixel dialog-title">{project.name}</h2>
          <p className="dialog-tag">{project.tagline}</p>

          <div className="dialog-actions">
            <a className="btn btn-primary btn-sm pixel" href={project.repo} target="_blank" rel="noopener noreferrer">
              <FaGithub aria-hidden="true" /> GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
            {project.live && (
              <a className="btn btn-secondary btn-sm pixel" href={project.live} target="_blank" rel="noopener noreferrer">
                <FaArrowUpRightFromSquare aria-hidden="true" /> Live demo<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>

          <h3 className="pixel case-h">The problem</h3>
          <p>{project.problem}</p>

          <h3 className="pixel case-h">Key functionality</h3>
          <ul className="bullets">{project.features.map((f) => <li key={f}>{f}</li>)}</ul>

          <h3 className="pixel case-h">Architecture</h3>
          <dl className="arch">
            {project.architecture.map((a) => (
              <div key={a.title}><dt className="pixel">{a.title}</dt><dd>{a.text}</dd></div>
            ))}
          </dl>

          <h3 className="pixel case-h">Engineering decisions</h3>
          <ul className="bullets">{project.decisions.map((d) => <li key={d}>{d}</li>)}</ul>

          <h3 className="pixel case-h">Known limits</h3>
          <ul className="bullets">{project.limits.map((l) => <li key={l}>{l}</li>)}</ul>

          <p className="status"><strong className="pixel">Status</strong> {project.status}</p>

          <h3 className="pixel case-h">Stack</h3>
          <ul className="chips">{project.stack.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      </div>
    </dialog>
  );
}
