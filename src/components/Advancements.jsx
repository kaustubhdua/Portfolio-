import { Section } from './ui.jsx';
import Sprite from './Sprite.jsx';
import { advancements } from '../data/advancements.js';
import { sections } from '../data/profile.js';
import { useInView } from '../hooks/useInView.js';

const meta = sections.find((s) => s.id === 'advancements');

const groups = [
  { id: 'experience', title: 'Professional Experience', description: 'Internship work backed by public project repositories.' },
  { id: 'programs', title: 'Technical Programs', description: 'Structured industry learning; simulations are not employment.' },
  { id: 'certifications', title: 'Coursework', description: 'Selected technical coursework with a completed final project.' },
];

export default function Advancements() {
  const [ref, seen] = useInView({ threshold: 0.12 });

  return (
    <Section id="advancements" {...meta} title="Experience & Learning" lead="A concise record of internship work and structured technical learning—not a list of every event, badge or course.">
      <div ref={ref} className={`adv-groups${seen ? ' unlocked' : ''}`}>
        {groups.map((group) => {
          const items = advancements.filter((item) => item.group === group.id);
          if (!items.length) return null;
          return (
            <section className="adv-group" key={group.id} aria-labelledby={`adv-heading-${group.id}`}>
              <header className="adv-group-head">
                <h3 id={`adv-heading-${group.id}`} className="adv-group-title pixel">{group.title}</h3>
                <p className="adv-group-description">{group.description}</p>
              </header>
              <ul className="adv-grid">
                {items.map((a, i) => (
                  <li key={a.id} className="adv" style={{ '--i': i }}>
                    <div className={`adv-icon frame-${a.frame}`}><Sprite name={a.sprite} size={36} /></div>
                    <div>
                      <p className="adv-cat pixel">{a.category}</p>
                      <h4 className="adv-title pixel">{a.title}</h4>
                      <p className="adv-text">{a.text}</p>
                      {a.links?.length > 0 && (
                        <ul className="adv-links" aria-label="Project evidence">
                          {a.links.map((link) => (
                            <li key={link.url}>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<span className="sr-only"> (opens in a new tab)</span></a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </Section>
  );
}
