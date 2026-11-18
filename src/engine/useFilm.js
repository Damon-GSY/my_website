import { useEffect, useRef, useState } from 'react';
import { createStage } from './stage.js';
import { createTimeline } from './timeline.js';
import { hasWebGL2 } from './webgl.js';
import { claimGL, onScreen } from './gl.js';

// Wires a canvas and a scroll track to a film: build(stage, root) -> { frame(p), resize?(), dispose?() }.
// Falls back to 'static' with reduced motion or without WebGL.
//
// `share: { until }` (the home page): the film holds a WebGL context only while the page's one-context
// arbiter (gl.js) gives it one: from its track entering the screen to `until` of its travel (after that
// the film rests on its DOM). The timeline keeps running asleep, so the DOM and the scene graph are always
// at the current frame, and waking draws it at once.
export function useFilm(build, share = null) {
  const root = useRef(null);
  const canvas = useRef(null);
  const track = useRef(null);
  const [mode, setMode] = useState('film');
  const until = share?.until;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !hasWebGL2()) {
      setMode('static');
      return undefined;
    }
    let stage;
    try {
      stage = createStage(canvas.current, { asleep: Boolean(share) });
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
        const release = share
          ? claimGL({
              range: () => onScreen(track.current, until),
              wake: () => {
                try {
                  stage.wake();
                } catch {
                  setMode('static');
                  return false;
                }
                stage.render();
                return true;
              },
              sleep: () => {
                stopTimeline.settle();
                stage.sleep();
              },
            })
          : null;
        stop = () => {
          release?.();
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
      stage.sleep();
    };
    // `share` is a constant per call site; `until` stands for it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [build, until]);

  return { root, canvas, track, mode };
}
