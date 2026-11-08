import { Section, Reveal } from './ui.jsx';
import { profile, sections } from '../data/profile.js';

const meta = sections.find((s) => s.id === 'profile');

const facts = [
  ['Program', profile.program],
  ['Institution', profile.institution],
  ['Year', `${profile.year}, Class of ${profile.graduation}`],
  ['Looking for', profile.openTo],
];

export default function Profile() {
  const selectedContributions = profile.openSource.slice(0, 3);

  return (
    <Section id="profile" {...meta} title="About" lead="Software engineering student at JIIT Noida, building full-stack products and applied-AI systems.">
      <div className="profile-grid">
        <Reveal className="panel player-card">
          <div className="player-head">
            <div className="avatar">
              <img
                className="avatar-img"
                src="img/avatar.png"
                width="112"
                height="112"
                alt="Pixel-art portrait of Kaustubh: curly dark hair, black glasses and a navy blazer"
                decoding="async"
              />
            </div>
            <div>
              <h3 className="player-name pixel">{profile.name}</h3>
              <p className="player-class">Software Engineering · ECM</p>
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
          <Reveal delay={110} className="panel roles">
            <h3 className="pixel">Campus & Community Roles</h3>
            <ul>
              {profile.roles.map((r) => (
                <li key={r.org}>
                  <p className="role-org pixel">
                    {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer">{r.org}<span className="sr-only"> (opens in a new tab)</span></a> : r.org}
                  </p>
                  <p className="role-title">{r.role}</p>
                  <p className="role-note">{r.note}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <Reveal delay={140} className="panel open-source-panel">
        <div className="open-source-heading">
          <div>
            <h3 className="pixel">Upstream Open Source</h3>
            <p className="role-note">Six merged pull requests in Lemma Platform. Three representative changes are shown here; the full contribution history stays one click away.</p>
          </div>
          <span className="open-source-count pixel">06 MERGED</span>
        </div>
        <ul>
          {selectedContributions.map((item) => (
            <li key={item.number}>
              <p className="role-org pixel">
                <a href={item.url} target="_blank" rel="noopener noreferrer">PR #{item.number} · {item.title}<span className="sr-only"> (opens in a new tab)</span></a>
              </p>
              <p className="role-note">{item.note}</p>
            </li>
          ))}
        </ul>
        <a className="btn btn-secondary btn-sm pixel" href="https://github.com/pulls?q=is%3Apr+is%3Amerged+author%3Akaustubhdua" target="_blank" rel="noopener noreferrer">
          View all merged PRs<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </Reveal>
    </Section>
  );
}
