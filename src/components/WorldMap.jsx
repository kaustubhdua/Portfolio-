import { Section, Reveal } from './ui.jsx';
import { domains } from '../data/world.js';
import { biomes, projects } from '../data/projects.js';
import { sections } from '../data/profile.js';

const meta = sections.find((s) => s.id === 'world');
const byId = Object.fromEntries(projects.map((p) => [p.id, p]));

export default function WorldMap({ onOpen }) {
  return (
    <Section id="world" {...meta} title="World Map" lead="The regions I have explored so far, and the projects that mark them.">
      <ul className="regions">
        {domains.map((d, i) => (
          <Reveal as="li" key={d.id} delay={(i % 3) * 70} className={`panel region biome-${d.biome}`}>
            <p className="region-biome pixel">{biomes[d.biome].name}</p>
            <h3 className="region-title pixel">{d.title}</h3>
            <p>{d.text}</p>
            <ul className="region-links" aria-label="Related projects">
              {d.projects.map((id) => (
                <li key={id}>
                  <button type="button" className="chip-btn" onClick={() => onOpen(id)}>{byId[id].name}</button>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
