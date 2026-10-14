import { useCallback, useEffect, useRef, useState } from 'react';
import { FaCommentDots, FaXmark } from 'react-icons/fa6';
import { reply, SUGGESTIONS, WELCOME } from '../lib/chat.js';

const asLine = (kind, parts) => ({ kind, parts });

/**
 * Minecraft-style chat window. Open with the button or the "/" key; Escape closes it.
 * Replies come from lib/chat.js, which reads the site's own data, so nothing is sent anywhere.
 */
export default function Chat() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState(() => WELCOME.map((p) => asLine('system', p)));
  const [draft, setDraft] = useState('');
  const toggleRef = useRef(null);
  const inputRef = useRef(null);
  const logRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const el = document.activeElement;
        const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
        if (typing || document.querySelector('dialog[open]')) return;
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines, open]);

  const send = useCallback((text) => {
    const value = text.trim();
    if (!value) return;
    const result = reply(value);
    if (result.clear) {
      setLines(WELCOME.map((p) => asLine('system', p)));
    } else {
      setLines((prev) => [...prev, asLine('user', [value]), ...result.lines.map((p) => asLine('bot', p))]);
    }
    setDraft('');
  }, []);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="chat-toggle"
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={open ? 'Close chat' : 'Open chat (shortcut: slash key)'}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <FaCommentDots aria-hidden="true" />
      </button>

      <section
        id="chat-panel"
        className="chat"
        aria-label="Chat about this portfolio"
        hidden={!open}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            close();
          }
        }}
      >
        <header className="chat-head">
          <span className="pixel">Chat</span>
          <button type="button" className="chat-close" aria-label="Close chat" onClick={close}>
            <FaXmark aria-hidden="true" />
          </button>
        </header>

        <div ref={logRef} className="chat-log" role="log" aria-live="polite" tabIndex={0} aria-label="Chat messages">
          {lines.map((line, i) => (
            <p key={i} className={`chat-line is-${line.kind}`}>
              {line.kind === 'user' && <span className="chat-who">&lt;You&gt; </span>}
              {line.parts.map((part, j) =>
                typeof part === 'string' ? (
                  <span key={j}>{part}</span>
                ) : (
                  <a key={j} href={part.href} {...(part.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {part.label}
                  </a>
                ),
              )}
            </p>
          ))}
        </div>

        <ul className="chat-suggest" aria-label="Suggested commands">
          {SUGGESTIONS.map((s) => (
            <li key={s}>
              <button type="button" onClick={() => send(s)}>{s}</button>
            </li>
          ))}
        </ul>

        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <label className="sr-only" htmlFor="chat-input">Type a command or a question</label>
          <input
            id="chat-input"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type /help"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            maxLength={120}
          />
          <button type="submit" className="btn btn-primary btn-sm pixel">Send</button>
        </form>
      </section>
    </>
  );
}
