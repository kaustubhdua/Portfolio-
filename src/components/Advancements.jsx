import { Section } from './ui.jsx';
import Sprite from './Sprite.jsx';
import { advancements } from '../data/advancements.js';
import { sections } from '../data/profile.js';
import { useInView } from '../hooks/useInView.js';

const meta = sections.find((s) => s.id === 'advancements');

const groups = [
  { id: 'leadership', title: 'Leadership & Campus Roles', description: 'Organising, community-building and student leadership.' },
  { id: 'opensource', title: 'Open-source Contributions', description: 'Merged work in upstream projects, with contribution details.' },
  { id: 'participation', title: 'Hackathons & Technical Participation', description: 'Events and team projects. Participation is not presented as a certification, finalist position or award.' },
  { id: 'certifications', title: 'Certifications & Coursework', description: 'Formal course completion and credentials.' },
  { id: 'programs', title: 'Technical Programs & Simulations', description: 'Structured industry learning experiences; these are not employment.' },
];

export default function Advancements() {
  const [ref, seen] = useInView({ threshold: 0.12 });

  return (
    <Section id="advancements" {...meta} title="Experience, Contributions & Learning" lead="A clear record of leadership, upstream engineering, event participation and formal learning—with each type kept distinct.">
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
