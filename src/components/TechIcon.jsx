import { techIcons } from './techIcons.js';

/** Technology logo, or a short pixel glyph for tools without a brand icon. */
export default function TechIcon({ item, size }) {
  const C = item.icon ? techIcons[item.icon] : null;
  return C ? <C size={size} aria-hidden="true" /> : <span className="glyph pixel" aria-hidden="true">{item.glyph}</span>;
}
