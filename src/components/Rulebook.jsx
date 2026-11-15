import { useEffect, useRef, useState } from 'react';

/** The pages of the "How to explore" book. Each spread is a left page and a right page. */
const SPREADS = [
  [
    { title: 'Moving', lines: ['W A S D or the arrow keys walk.', 'Space jumps.', 'Hold Shift to sprint.', 'On a phone, the left thumb moves.'] },
    { title: 'Looking', lines: ['Click once to capture the mouse, then move it to look around.', 'On a phone, drag the right side of the screen.', 'Esc leaves free roam.'] },
  ],
  [
    { title: 'Digging', lines: ['Click to dig the block under the crosshair.', 'Dug blocks grow back after a few seconds.'] },
    { title: 'Building', lines: ['Right-click, or press E or F, to place the chosen block.', 'Keys 1 to 4 pick planks, cobblestone, glass or a lamp.', 'Placed blocks fade after 45 seconds.'] },
  ],
  [
    { title: 'The portal', lines: ['Walk to the end of the road and into the glowing gateway.', 'It carries you between the Overworld and the Nether.'] },
    { title: 'The Wilds', lines: ['A generated land of meadow, forest, desert, snow and caves.', 'Press Ctrl+K and choose “Explore the Wilds”.'] },
  ],
];

/**
 * A rulebook that opens like a book: the cover swings open on its left hinge, then the spreads turn.
 * It is a modal dialog, so Esc and the backdrop close it, and reduced motion skips the swing.
 */
export default function Rulebook() {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [swung, setSwung] = useState(false);
  const [spread, setSpread] = useState(0);
  const [turning, setTurning] = useState(false);

  useEffect(() => {
    const show = () => {
      setSpread(0);
      setSwung(false);
      setOpen(true);
    };
    window.addEventListener('portfolio:rulebook', show);
    return () => window.removeEventListener('portfolio:rulebook', show);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    if (open && !dialog.open) {
      dialog.showModal();
      const t = setTimeout(() => setSwung(true), 120);
      return () => clearTimeout(t);
    }
    if (!open && dialog.open) dialog.close();
    return undefined;
  }, [open]);

  const close = () => setOpen(false);
  const go = (to) => {
    if (to < 0 || to >= SPREADS.length || turning) return;
    setTurning(true);
    setTimeout(() => {
      setSpread(to);
      setTurning(false);
    }, 180);
  };
  const [left, right] = SPREADS[spread];

  return (
    <dialog
      ref={dialogRef}
      className="rulebook"
      aria-labelledby="rulebook-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={() => setOpen(false)}
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
    >
      <div className={`book${swung ? ' is-open' : ''}`}>
        <h2 id="rulebook-title" className="book-title pixel">How to explore</h2>
        <div className="book-spread" aria-live="polite">
          <section className="book-page is-left" aria-label={left.title}>
            <h3 className="pixel">{left.title}</h3>
            <ul>{left.lines.map((l) => <li key={l}>{l}</li>)}</ul>
          </section>
          <section className={`book-page is-right${turning ? ' is-turning' : ''}`} aria-label={right.title}>
            <h3 className="pixel">{right.title}</h3>
            <ul>{right.lines.map((l) => <li key={l}>{l}</li>)}</ul>
            <p className="book-folio pixel" aria-hidden="true">{spread + 1} / {SPREADS.length}</p>
          </section>
        </div>
        <div className="book-cover" aria-hidden="true">
          <span className="pixel">How to</span>
          <span className="pixel">Explore</span>
          <small className="pixel">Open the book</small>
        </div>
        <div className="book-nav">
          <button type="button" className="btn pixel" onClick={() => go(spread - 1)} disabled={spread === 0}>Back</button>
          <button type="button" className="btn pixel" onClick={() => go(spread + 1)} disabled={spread === SPREADS.length - 1}>Next page</button>
          <button type="button" ref={closeRef} className="btn btn-primary pixel" onClick={close}>Close</button>
        </div>
      </div>
    </dialog>
  );
}
