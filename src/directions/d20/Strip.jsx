import { useId } from 'react';
import { GLYPH, tallyMarks } from './strip.js';

// The DOM twin of the unfolded die, drawn from the same layout numbers as the WebGL faces.
// Borders are 1.5 px inside each tile (a 3 px stroke clipped to the tile), like the shader's.
export default function Strip({ ref, layout, rolls }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const marks = tallyMarks(layout, rolls);
  const label = `Tally of 20 rolls: ${layout.tris
    .map((tri) => `${tri.v}: ${rolls.filter((v) => v === tri.v).length}`)
    .join(', ')}`;
  return (
    <svg
      ref={ref}
      className="d20-strip"
      viewBox={`0 0 ${layout.vbW} ${layout.vbH}`}
      style={{ aspectRatio: `${layout.vbW} / ${layout.vbH}` }}
      role="img"
      aria-label={label}
    >
      <defs>
        {layout.tris.map((tri) => (
          <clipPath key={tri.v} id={`${uid}t${tri.v}`}>
            <polygon points={tri.pts.join(' ')} />
          </clipPath>
        ))}
      </defs>
      {layout.tris.map((tri) => {
        const size = GLYPH.size * tri.rho;
        const base = tri.cy + GLYPH.base * size;
        const one = tri.v === 1;
        return (
          <g key={tri.v}>
            <polygon
              points={tri.pts.join(' ')}
              className={one ? 'd20-tile is-one' : 'd20-tile'}
              clipPath={`url(#${uid}t${tri.v})`}
            />
            <text
              x={tri.cx}
              y={base}
              fontSize={size}
              className={one ? 'd20-num is-one' : 'd20-num'}
              style={{ fontFamily: GLYPH.font, fontWeight: GLYPH.weight, fontStretch: GLYPH.stretch }}
            >
              {tri.v}
            </text>
            {(tri.v === 6 || tri.v === 9) && (
              <rect
                className="d20-bar"
                x={tri.cx - (GLYPH.barW * size) / 2}
                y={base + GLYPH.barY * size}
                width={GLYPH.barW * size}
                height={GLYPH.barH * size}
              />
            )}
            {!rolls.includes(tri.v) && (
              <line className="d20-zero" x1={tri.cx - 6} x2={tri.cx + 6} y1={tri.tallyBase} y2={tri.tallyBase} />
            )}
          </g>
        );
      })}
      {marks.map((m) => (
        <line
          key={m.k}
          data-k={m.k}
          className={m.v === 1 ? 'd20-mark is-one' : 'd20-mark'}
          x1={m.x1}
          y1={m.y1}
          x2={m.x2}
          y2={m.y2}
        />
      ))}
    </svg>
  );
}
