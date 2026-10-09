import { useEffect, useState } from 'react';
import { Section } from './ui.jsx';
import Sprite from './Sprite.jsx';
import { advancements } from '../data/advancements.js';
import { sections } from '../data/profile.js';
import { useInView } from '../hooks/useInView.js';

const meta = sections.find((s) => s.id === 'advancements');

export default function Advancements() {
  const [ref, seen] = useInView({ threshold: 0.25 });
  const [toast, setToast] = useState(false);

  // One small notification when the page is first unlocked, then it leaves.
  useEffect(() => {
    if (!seen) return undefined;
    setToast(true);
    const t = setTimeout(() => setToast(false), 4200);
    return () => clearTimeout(t);
  }, [seen]);

  return (
    <Section id="advancements" {...meta} title="Advancements" lead="Milestones that can be checked in the public repositories. Nothing here is padded.">
      <ul ref={ref} className={`adv-grid${seen ? ' unlocked' : ''}`}>
        {advancements.map((a, i) => (
          <li key={a.id} className="adv" style={{ '--i': i }}>
            <div className="adv-icon"><Sprite name={a.sprite} size={36} /></div>
            <div>
              <p className="adv-cat pixel">{a.category}</p>
              <h3 className="adv-title pixel">{a.title}</h3>
              <p className="adv-text">{a.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className={`toast${toast ? ' show' : ''}`} role="status">
        {toast && (
          <>
            <Sprite name="star" size={28} />
            <div>
              <p className="pixel toast-h">Advancement Made!</p>
              <p className="toast-t">{advancements.length} milestones unlocked</p>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
