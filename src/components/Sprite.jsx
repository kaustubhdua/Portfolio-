import { memo } from 'react';
import data from '../data/sprites.json';

/** Renders a pixel sprite (8 wide, 8 or more tall) as crisp inline SVG. */
function Sprite({ name, size = 32, className = '' }) {
  const rows = data.sprites[name];
  if (!rows) return null;
  const cols = rows[0].length;
  const height = Math.round((size * rows.length) / cols);
  const rects = [];
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const fill = data.palette[ch];
      if (ch !== '.' && fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />);
    });
  });
  return (
    <svg
      className={`sprite ${className}`}
      width={size}
      height={height}
      viewBox={`0 0 ${cols} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {rects}
    </svg>
  );
}

export default memo(Sprite);
