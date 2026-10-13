import { useEffect, useMemo, useRef, useState } from 'react';
import { projects } from '../data/projects.js';
import { profile, sections } from '../data/profile.js';

/**
 * Ctrl/Cmd + K opens a keyboard-first launcher, like the command menus in professional tools:
 * jump to a section, open a case study, grab a link, copy the email, switch world or toggle sound.
 */
export default function CommandPalette({ onGo, onOpenProject, onTravel, onSound, soundOn, world, onQuick, quick }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [note, setNote] = useState('');

  const items = useMemo(() => {
    const open = (url) => () => window.open(url, '_blank', 'noopener,noreferrer');
    return [
      ...sections.map((s) => ({ id: `go-${s.id}`, group: 'Go to', label: `${s.label} (${s.hint})`, run: () => onGo(s.id) })),
      ...projects.map((p) => ({ id: `p-${p.id}`, group: 'Projects', label: `${p.name}: ${p.tagline}`, run: () => onOpenProject(p.id) })),
      { id: 'gh', group: 'Links', label: 'GitHub profile', run: open(profile.links.github) },
      { id: 'li', group: 'Links', label: 'LinkedIn profile', run: open(profile.links.linkedin) },
      { id: 'cv', group: 'Links', label: 'Download résumé (PDF)', run: () => window.open(profile.links.resume, '_blank') },
      { id: 'mail', group: 'Links', label: `Send an email to ${profile.links.email}`, run: () => (window.location.href = `mailto:${profile.links.email}`) },
      {
        id: 'copy',
        group: 'Actions',
        label: 'Copy email address',
        keep: true,
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.links.email);
            setNote('Email address copied.');
          } catch {
            setNote(`Copy failed. Address: ${profile.links.email}`);
          }
        },
      },
      { id: 'world', group: 'Actions', label: world === 'overworld' ? 'Travel to the Nether (night mode)' : 'Travel to the Overworld (day mode)', run: onTravel },
      { id: 'quick', group: 'Actions', label: quick ? 'Turn 3D scenery back on' : 'Quick view: turn 3D scenery off', run: onQuick },
      { id: 'sound', group: 'Actions', label: soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on', run: onSound },
    ];
  }, [onGo, onOpenProject, onTravel, onSound, soundOn, world, onQuick, quick]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => `${i.group} ${i.label}`.toLowerCase().includes(q)) : items;
  }, [items, query]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialog.open) dialog.close();
        else {
          setQuery('');
          setCursor(0);
          setNote('');
          dialog.showModal();
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const run = (item) => {
    if (!item) return;
    if (!item.keep) dialogRef.current.close();
    item.run();
  };

  const onInputKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(shown.length - 1, c + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(shown[cursor]);
    }
  };

  useEffect(() => {
    document.getElementById(`cmd-${shown[cursor]?.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor, shown]);

  return (
    <dialog ref={dialogRef} className="palette" aria-label="Command palette" onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}>
      <div className="palette-box">
        <input
          ref={inputRef}
          className="palette-input"
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={shown[cursor] ? `cmd-${shown[cursor].id}` : undefined}
          aria-label="Type a command or search"
          placeholder="Type a command or search…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCursor(0);
          }}
          onKeyDown={onInputKey}
          autoComplete="off"
          spellCheck="false"
        />
        <ul id="cmd-list" role="listbox" className="palette-list">
          {shown.map((item, i) => (
            <li
              key={item.id}
              id={`cmd-${item.id}`}
              role="option"
              aria-selected={i === cursor}
              className={i === cursor ? 'is-on' : ''}
              onMouseMove={() => setCursor(i)}
              onClick={() => run(item)}
            >
              <span className="palette-group pixel">{item.group}</span>
              {item.label}
            </li>
          ))}
          {!shown.length && <li className="palette-empty">Nothing matches “{query}”.</li>}
        </ul>
        <p className="palette-foot" role="status">{note || 'Up and down to move, Enter to run, Esc to close.'}</p>
      </div>
    </dialog>
  );
}
