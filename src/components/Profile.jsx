import { Section, Reveal } from './ui.jsx';
import Sprite from './Sprite.jsx';
import { profile, sections } from '../data/profile.js';

const meta = sections.find((s) => s.id === 'profile');

const facts = [
  ['Program', profile.program],
  ['Institution', profile.institution],
  ['Graduating', `Class of ${profile.graduation}`],
  ['Focus', 'AI, data, systems and product engineering'],
  ['Working with', profile.stack.join(', ')],
];

export default function Profile() {
  return (
    <Section id="profile" {...meta} title="Player Profile" lead="A student developer who likes real workflows, clear boundaries and honest status labels.">
      <div className="profile-grid">
        <Reveal className="panel player-card">
          <div className="player-head">
            <div className="avatar">
              <Sprite name="head" size={88} />
            </div>
            <div>
              <h3 className="player-name pixel">{profile.name}</h3>
              <p className="player-class">ECM student</p>
            </div>
          </div>
          <dl className="facts">
            {facts.map(([k, v]) => (
              <div key={k} className="fact">
                <dt className="pixel">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="profile-story">
          <Reveal delay={80}>
            {profile.about.map((p) => (
              <p key={p} className="about-p">{p}</p>
            ))}
            <blockquote className="motto pixel">{profile.motto}</blockquote>
          </Reveal>
          <Reveal delay={140} className="panel quest">
            <h3 className="pixel">Quest log</h3>
            <ul>
              <li>Exploring software engineering and problem-solving as an ECM student.</li>
              <li>Saathi&rsquo;s next milestone: a measured, provider-backed voice slice.</li>
              <li>NIRDHOOM&rsquo;s pilot gates: real-device GPS validation and offline sync testing.</li>
            </ul>
          </Reveal>
        </div>
      </div>

      <Reveal className="workflow" aria-label="How I build">
        <h3 className="sub-title pixel">The Hotbar · How I Build</h3>
        <ol className="hotbar-flow">
          {profile.workflow.map((w, i) => (
            <li key={w.step} className="slot-step">
              <span className="slot-num pixel">{i + 1}</span>
              <strong className="pixel">{w.step}</strong>
              <span>{w.note}</span>
            </li>
          ))}
        </ol>
      </Reveal>

      <div className="principles">
        {profile.principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 80} className="panel principle">
            <h3 className="pixel">{p.title}</h3>
            <p>{p.text}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
