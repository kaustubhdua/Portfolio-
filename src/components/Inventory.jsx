import { useState } from 'react';
import { Section, Reveal } from './ui.jsx';
import TechIcon from './TechIcon.jsx';
import { skillGroups } from '../data/skills.js';
import { sections } from '../data/profile.js';

const meta = sections.find((s) => s.id === 'inventory');
const all = skillGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));

export default function Inventory() {
  const [selectedId, setSelectedId] = useState(all[0].id);
  const selected = all.find((i) => i.id === selectedId);
  // On phones the description is shortened to two lines so the sticky panel never hides the grid;
  // "More" shows all of it. (The full text stays in the page for screen readers either way.)
  const [more, setMore] = useState(false);

  return (
    <Section id="inventory" {...meta} title="Inventory" lead="Tools I have actually used. Select a slot to see where.">
      <div className="inventory">
        <Reveal className={`panel info${more ? ' is-more' : ''}`} aria-live="polite">
          <div className="info-icon"><TechIcon item={selected} size={44} /></div>
          <p className="info-group pixel">{selected.group}</p>
          <h3 className="info-name pixel">{selected.name}</h3>
          <p className="info-used">{selected.used}</p>
          <button type="button" className="info-more pixel" aria-expanded={more} onClick={() => setMore((m) => !m)}>
            {more ? 'Less' : 'More'}
          </button>
        </Reveal>

        <div className="slots-wrap">
          {skillGroups.map((g, gi) => (
            <Reveal key={g.id} delay={gi * 50} as="section" aria-labelledby={`grp-${g.id}`} className="panel slot-group">
              <h3 id={`grp-${g.id}`} className="slot-group-title pixel">{g.title}</h3>
              <ul className="slots">
                {g.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`slot${item.id === selectedId ? ' is-selected' : ''}`}
                      aria-pressed={item.id === selectedId}
                      onClick={() => {
                        setSelectedId(item.id);
                        setMore(false);
                      }}
                    >
                      <TechIcon item={item} size={26} />
                      <span className="slot-name">{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
