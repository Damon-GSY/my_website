import { useEffect, useRef, useState } from 'react';
import { createStage } from './stage.js';
import { createTimeline } from './timeline.js';

// Wires a canvas and a scroll track to a film: build(stage, root) -> { frame(p), resize?(), dispose?() }.
// Falls back to 'static' with reduced motion or without WebGL.
export function useFilm(build) {
  const root = useRef(null);
  const canvas = useRef(null);
  const track = useRef(null);
  const [mode, setMode] = useState('film');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('static');
      return undefined;
    }
    let stage;
    try {
      stage = createStage(canvas.current);
    } catch {
      setMode('static');
      return undefined;
    }
    let dead = false;
    let stop;
    let film;
    Promise.resolve(build(stage, root.current))
      .then((built) => {
        if (dead) {
          built.dispose?.();
          return;
        }
        film = built;
        let last = 0;
        const frame = (p) => {
          last = p;
          film.frame(p);
          stage.render();
        };
        const onResize = () => {
          stage.resize();
          film.resize?.();
          frame(last);
        };
        window.addEventListener('resize', onResize);
        const stopTimeline = createTimeline(track.current, frame);
        stop = () => {
          stopTimeline();
          window.removeEventListener('resize', onResize);
        };
        root.current.dataset.ready = 'true';
      })
      .catch((error) => {
        console.error(error);
        setMode('static');
      });
    return () => {
      dead = true;
      stop?.();
      film?.dispose?.();
      stage.renderer.dispose();
    };
  }, [build]);

  return { root, canvas, track, mode };
}
