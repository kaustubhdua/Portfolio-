import { useInView } from '../hooks/useInView.js';
import Sprite from './Sprite.jsx';

/** Fades and lifts its children in once, the first time they scroll into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, seen] = useInView({ threshold: 0.12 });
  return (
    <Tag ref={ref} className={`reveal${seen ? ' in' : ''} ${className}`} style={{ '--delay': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/** Shared section frame: anchor id, centred heading with sprite, and a content wrapper. */
export function Section({ id, label, hint, sprite, title, lead, children, className = '' }) {
  return (
    <section id={id} className={`section ${className}`} aria-labelledby={`${id}-title`} tabIndex={-1}>
      <div className="wrap">
        <Reveal as="header" className="section-head">
          <Sprite name={sprite} size={40} className="section-sprite" />
          <p className="section-kicker pixel">{label} · {hint}</p>
          <h2 id={`${id}-title`} className="section-title pixel">{title}</h2>
          {lead && <p className="section-lead">{lead}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/** Divider that frames the gap between sections like a small portal gate. */
export function PortalRule() {
  return (
    <div className="portal-rule" aria-hidden="true">
      <span />
    </div>
  );
}
