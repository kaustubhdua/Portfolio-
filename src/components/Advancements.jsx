import { Section } from './ui.jsx';
import Sprite from './Sprite.jsx';
import { advancements } from '../data/advancements.js';
import { sections } from '../data/profile.js';
import { useInView } from '../hooks/useInView.js';

const meta = sections.find((s) => s.id === 'advancements');

export default function Advancements() {
  const [ref, seen] = useInView({ threshold: 0.25 });

  return (
    <Section id="advancements" {...meta} title="Advancements" lead="Projects, certificates and hackathons, each described as exactly what it was. Nothing here is padded.">
      <ul ref={ref} className={`adv-grid${seen ? ' unlocked' : ''}`}>
        {advancements.map((a, i) => (
          <li key={a.id} className="adv" style={{ '--i': i }}>
            <div className={`adv-icon frame-${a.frame}`}><Sprite name={a.sprite} size={36} /></div>
            <div>
              <p className="adv-cat pixel">{a.category}</p>
              <h3 className="adv-title pixel">{a.title}</h3>
              <p className="adv-text">{a.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
