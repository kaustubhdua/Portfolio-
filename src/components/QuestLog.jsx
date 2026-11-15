import { Reveal } from './ui.jsx';
import { profile, questState } from '../data/profile.js';

const LABEL = { done: 'Cleared', active: 'In progress', locked: 'Locked', next: 'Open' };

/** A mine-rail timeline: cleared checkpoints, the one in progress, and the next open one. */
export default function QuestLog() {
  const now = new Date();
  return (
    <Reveal delay={125} className="panel quest-log">
      <h3 className="pixel">Quest Log</h3>
      <ol className="rail">
        {profile.questLog.map((item) => {
          const state = questState(item, now);
          return (
            <li key={item.id} className={`rail-stop is-${state}`}>
              <span className="rail-block" aria-hidden="true" />
              <p className="rail-when pixel">{item.when}<span className="rail-state"> · {LABEL[state]}</span></p>
              <p className="rail-title">{item.title}</p>
              <p className="role-note">{item.note}</p>
            </li>
          );
        })}
      </ol>
    </Reveal>
  );
}
