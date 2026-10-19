import { useEffect, useRef, useState } from 'react';
import Sprite from './Sprite.jsx';
import { sections } from '../data/profile.js';
import { advancementSound } from '../lib/audio.js';

// Which kind of advancement each section counts as, so the header and colour match the game's:
// plain "task" frames, a "goal" for the main work, and a "challenge" for reaching the Ender Chest.
const FRAME = { profile: 'task', inventory: 'task', forge: 'goal', advancements: 'goal', world: 'task', contact: 'challenge' };
const HEAD = { task: 'Advancement Made!', goal: 'Goal Reached!', challenge: 'Challenge Complete!' };

/**
 * A small notification from the top right, the first time a section is reached in a visit.
 * It never repeats for a section, waits while the intro or free roam is up, and leaves by itself.
 */
export default function Toasts({ active, paused }) {
  const [toast, setToast] = useState(null);
  const seen = useRef(new Set(['spawn']));

  useEffect(() => {
    if (paused || seen.current.has(active) || !FRAME[active]) return undefined;
    seen.current.add(active);
    const s = sections.find((x) => x.id === active);
    setToast({ frame: FRAME[active], title: s.label, hint: s.hint, sprite: s.sprite });
    advancementSound();
    const t = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(t);
  }, [active, paused]);

  return (
    <div className={`toast${toast ? ' show' : ''}`} data-frame={toast?.frame} role="status">
      {toast && (
        <>
          <Sprite name={toast.sprite} size={28} />
          <div>
            <p className="pixel toast-h">{HEAD[toast.frame]}</p>
            <p className="toast-t">{toast.title}: {toast.hint}</p>
          </div>
        </>
      )}
    </div>
  );
}
