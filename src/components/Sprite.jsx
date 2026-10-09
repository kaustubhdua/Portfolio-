import { memo } from 'react';
import data from '../data/sprites.json';

/** Renders one of the 8x8 pixel sprites as crisp inline SVG. */
function Sprite({ name, size = 32, className = '' }) {
  const rows = data.sprites[name];
  if (!rows) return null;
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
      height={size}
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {rects}
    </svg>
  );
}

export default memo(Sprite);
