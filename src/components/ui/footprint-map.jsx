import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/land-110m.json';

/**
 * Footprint Map — A presence/location panel showing real geography.
 *
 * Renders an ACCURATE world map from Natural Earth land-110m TopoJSON
 * via topojson-client + d3-geo's geoNaturalEarth1 projection. Continents
 * read correctly (Americas, Europe/Africa, Asia, Australia in their real
 * shapes and positions). City pins are projected from real [lng, lat].
 *
 * Pins:
 * - Hangzhou (30.27°N, 120.15°E) — base, terracotta, pulses
 * - Singapore (1.35°N, 103.82°E) — remote
 * - Sydney (33.87°S, 151.21°E) — remote
 *
 * Route: a subtle terracotta dashed path connecting base -> remotes -> base.
 * Respects prefers-reduced-motion: static land + pins + route, no animation.
 */
const VIEWBOX_WIDTH = 600;
const VIEWBOX_HEIGHT = 300;

const CITIES = [
  {
    name: 'Hangzhou',
    coord: [120.15, 30.27],
    label: '30.27°N',
    type: 'base',
  },
  {
    name: 'Singapore',
    coord: [103.82, 1.35],
    label: '1.35°N',
    type: 'remote',
  },
  {
    name: 'Sydney',
    coord: [151.21, -33.87],
    label: '33.87°S',
    type: 'remote',
  },
];

export default function FootprintMap({ className = '', compact = false }) {
  const prefersReducedMotion = useReducedMotion();

  // Build projection + path generators once. geoNaturalEarth1 produces a
  // recognizable, distortion-balanced world map. fitSize to the viewBox
  // ensures the entire globe spans the panel regardless of aspect.
  const { landPath, routeD, projectedCities } = useMemo(() => {
    const geojson = feature(world, world.objects.land);
    const projection = geoNaturalEarth1()
      .fitSize(
        [VIEWBOX_WIDTH - 40, VIEWBOX_HEIGHT - 40],
        { type: 'Sphere' },
      );
    const path = geoPath(projection);
    const land = path(geojson) || '';

    const cities = CITIES.map((c) => {
      const xy = projection(c.coord);
      return { ...c, x: xy ? xy[0] : 0, y: xy ? xy[1] : 0 };
    });

    // Route arc through projected points: base -> remote -> remote -> base.
    const pts = [cities[0], cities[1], cities[2], cities[0]]
      .map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
    // Quadratic smoothing through midpoints for a soft travel arc.
    const d = pts.reduce((acc, point, i) => {
      if (i === 0) return `M ${point}`;
      const prev = pts[i - 1].split(' ');
      const [px, py] = prev;
      const [x, y] = point.split(' ');
      const mx = (parseFloat(px) + parseFloat(x)) / 2;
      const my = (parseFloat(py) + parseFloat(y)) / 2;
      return `${acc} Q ${parseFloat(px).toFixed(2)} ${parseFloat(py).toFixed(
        2,
      )} ${mx.toFixed(2)} ${my.toFixed(2)}`;
    }, '');
    // Final line segment closes to the starting point.
    const closed = `${d} T ${pts[0]}`;

    return { landPath: land, routeD: closed, projectedCities: cities };
  }, []);

  const routeId = 'footprint-route';

  return (
    <div
      className={`relative bg-[var(--surface)] ${className}`}
      role="img"
      aria-label="World map showing presence: Hangzhou base, plus Singapore and Sydney; a route links them."
    >
      <div className="relative aspect-[600/300] w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="h-full w-full"
          aria-hidden="true"
        >
          {/* Ocean / panel background */}
          <rect
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT}
            fill="var(--surface)"
          />

          {/* Subtle dotted grid for editorial texture */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="var(--line)" opacity="0.18" />
            </pattern>
            {/* Reusable route path for animateMotion (mpath) */}
            <path id={routeId} d={routeD} fill="none" />
          </defs>
          <rect
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT}
            fill="url(#grid)"
          />

          {/* Real world land (Natural Earth 110m, geoNaturalEarth1) */}
          <path
            d={landPath}
            fill="var(--surface-soft, var(--surface))"
            stroke="var(--line)"
            strokeWidth="0.6"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Route (terracotta dashed). Animated draw-in unless reduced motion. */}
          {prefersReducedMotion ? (
            <path
              d={routeD}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3 4"
              opacity="0.55"
            />
          ) : (
            <motion.path
              d={routeD}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3 4"
              opacity="0.55"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 2.2, ease: 'easeInOut' }}
            />
          )}

          {/* Travelling dot along the route (hidden under reduced motion) */}
          {!prefersReducedMotion && (
            <circle r="2.5" fill="var(--primary)">
              <animateMotion dur="9s" repeatCount="indefinite" rotate="auto">
                <mpath href={`#${routeId}`} />
              </animateMotion>
            </circle>
          )}

          {/* City pins */}
          {projectedCities.map((loc) => {
            const isBase = loc.type === 'base';
            return (
              <g key={loc.name}>
                <line
                  x1={loc.x}
                  y1={loc.y + 8}
                  x2={loc.x}
                  y2={loc.y - 5}
                  stroke="var(--line)"
                  strokeWidth="1"
                  opacity="0.4"
                />
                {isBase && !prefersReducedMotion ? (
                  <motion.circle
                    cx={loc.x}
                    cy={loc.y}
                    r="6"
                    fill="var(--primary)"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: [1, 1.18, 1], opacity: [1, 0.55, 1] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    style={{ transformOrigin: `${loc.x}px ${loc.y}px` }}
                  />
                ) : (
                  <circle
                    cx={loc.x}
                    cy={loc.y}
                    r={isBase ? '6' : '4'}
                    fill={isBase ? 'var(--primary)' : 'var(--line)'}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Caption overlay (hidden in compact mode — footer carries its own presence text) */}
        {!compact && (
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--primary)' }}
            />
            <span className="text-[var(--text-primary)] font-medium">
              Hangzhou · {CITIES[0].label} · base
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--line)]" />
            <span className="text-[var(--text-muted)]">global · remote</span>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
