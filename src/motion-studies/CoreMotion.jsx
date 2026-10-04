import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-react';
import { CORE_DURATION, createCoreScene } from './coreScene';
import './core-motion.css';

const CHAPTERS = ['Separate', 'Connect', 'Assemble', 'Activate'];

export default function CoreMotion() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const clockRef = useRef({ time: 0, playing: !window.matchMedia('(prefers-reduced-motion: reduce)').matches, visible: !document.hidden, exportMode: false });
  const [playing, setPlaying] = useState(clockRef.current.playing);
  const [time, setTime] = useState(0);
  const [status, setStatus] = useState('loading');
  const [reduced, setReduced] = useState(!clockRef.current.playing);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Inner workings — GDamon motion study';
    const clock = clockRef.current;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    let last = performance.now();
    let lastUI = 0;
    let scene;
    try {
      scene = createCoreScene(canvasRef.current);
      sceneRef.current = scene;
      setStatus('ready');
    } catch {
      setStatus('fallback');
      return () => { document.title = previousTitle; };
    }
    const resize = () => scene.resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvasRef.current);
    const onVisibility = () => { clock.visible = !document.hidden; last = performance.now(); };
    const onMotion = () => {
      setReduced(media.matches);
      if (media.matches) {
        clock.playing = false;
        setPlaying(false);
      }
    };
    media.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    const animate = (now) => {
      const delta = Math.max(0, Math.min((now - last) / 1000, .1));
      last = now;
      if (clock.playing && clock.visible && !clock.exportMode) {
        clock.time = (clock.time + delta) % CORE_DURATION;
        scene.renderAt(clock.time);
        if (now - lastUI > 90) {
          setTime(clock.time);
          lastUI = now;
        }
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    // Deterministic rendering produces the downloadable film from the same live geometry.
    window.GDamonCore = {
      duration: CORE_DURATION,
      renderAt: (seconds) => {
        clock.exportMode = true;
        clock.time = seconds;
        scene.renderAt(seconds);
        setTime(seconds);
      },
      capture: (seconds, width, height) => {
        clock.exportMode = true;
        return scene.capture(seconds, width, height);
      },
      beginCapture: (width, height) => {
        clock.exportMode = true;
        scene.beginCapture(width, height);
      },
      captureFrame: (seconds) => scene.captureFrame(seconds),
      endCapture: () => { scene.endCapture(); clock.exportMode = false; },
      resume: () => { clock.exportMode = false; },
      get playing() { return clock.playing; },
      get time() { return clock.time; },
    };
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
      delete window.GDamonCore;
      scene.dispose();
      sceneRef.current = null;
      document.title = previousTitle;
    };
  }, []);

  const toggle = () => {
    const next = !clockRef.current.playing;
    clockRef.current.playing = next;
    clockRef.current.exportMode = false;
    setPlaying(next);
  };
  const seek = (seconds) => {
    clockRef.current.time = seconds;
    sceneRef.current?.renderAt(seconds);
    setTime(seconds);
  };
  const replay = () => {
    seek(0);
    if (!reduced) {
      clockRef.current.playing = true;
      clockRef.current.exportMode = false;
      setPlaying(true);
    }
  };

  return (
    <main className="core-page" onPointerMove={(event) => {
      if (playing && !reduced) sceneRef.current?.setPointer(event.clientX / window.innerWidth - .5, event.clientY / window.innerHeight - .5);
    }}>
      <div className="core-atmosphere" aria-hidden="true" />
      <canvas ref={canvasRef} className="core-canvas" role="img" aria-label="A machined titanium core separates into orbiting layers, aligns, reassembles, and lights up in amber." />
      {status === 'fallback' && <img className="core-fallback" src="/motion-studies/core-film-poster.webp" alt="A titanium machine core with an amber inner light." />}
      <header className="core-header">
        <Link to="/" className="core-wordmark" aria-label="GDamon — all previews">gdamon<span><ArrowUpRight size={10} aria-hidden="true" /></span></Link>
        <span className="core-header-label">RESEARCH IN MOTION</span>
        <nav aria-label="Main navigation">
          <Link to="/">All previews <ArrowUpRight size={12} /></Link>
          <Link to="/projects">Work <ArrowUpRight size={12} /></Link>
          <a href="mailto:hello@damon.ai" className="core-contact">Let’s talk <ArrowUpRight size={13} /></a>
        </nav>
      </header>
      <section className="core-intro" aria-labelledby="core-title">
        <p className="core-eyebrow"><i /> MOTION STUDY <span>003 / INNER WORKINGS</span></p>
        <h1 id="core-title">Intelligence.<br /><span>In the</span><br /><em>making.</em></h1>
        <p className="core-description">Tools, memory, decisions.<br />Individual parts. One capable system.</p>
        <Link to="/projects" className="core-project">Explore my work <ArrowUpRight size={17} /></Link>
      </section>
      <div className="core-object-label" aria-hidden="true"><span>FIG. 03</span><span>MODULAR INTELLIGENCE</span><b>+</b></div>
      <aside className="core-technical"><span>GDAMON / MOTION LAB</span><p>From uncertainty<br />to working systems.</p></aside>
      <footer className="core-console" aria-label="Film controls">
        <div className="core-console-top">
          <span className="core-live"><i /> {status === 'ready' ? playing ? 'IN MOTION' : 'PAUSED' : status === 'loading' ? 'LOADING SCENE' : 'STILL FRAME'}</span>
          <div className="core-controls">
            <button onClick={toggle} disabled={status !== 'ready'} aria-label={playing ? 'Pause motion' : 'Play motion'}>{playing ? <Pause size={13} /> : <Play size={13} />}<span>{playing ? 'Pause' : 'Play'}</span></button>
            <button onClick={replay} disabled={status !== 'ready'} aria-label="Replay from beginning"><RotateCcw size={13} /><span>Replay</span></button>
            <a href="/motion-studies/core-film.mp4" download>Film <ArrowDown size={13} /></a>
          </div>
          <output aria-label="Film time" aria-live="off">{time.toFixed(1).padStart(4, '0')} <span>/ 18.0 S</span></output>
        </div>
        <input className="core-scrubber" type="range" min="0" max="17.99" step="0.01" value={Math.min(time, 17.99)} disabled={status !== 'ready'} aria-label="Motion timeline" onChange={(event) => {
          clockRef.current.playing = false;
          setPlaying(false);
          seek(Number(event.target.value));
        }} style={{ '--progress': `${time / CORE_DURATION * 100}%` }} />
        <div className="core-chapters">
          {CHAPTERS.map((chapter, index) => <button key={chapter} className={Math.floor(time / 4.5) === index ? 'is-active' : ''} onClick={() => seek(index * 4.5)} disabled={status !== 'ready'}><span>0{index + 1}</span>{chapter}<i /></button>)}
        </div>
        <div className="core-colophon"><span>DAMON GUO-SIYI <span>AI RESEARCHER & LLM ENGINEER</span></span><span>{reduced ? 'REDUCED MOTION · PLAY TO EXPLORE' : '18 SECONDS · ONE CONTINUOUS LOOP'}</span></div>
      </footer>
    </main>
  );
}
