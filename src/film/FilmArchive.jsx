import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowLeft, ArrowUpRight, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import '@fontsource/anton/latin-400.css';
import { createFilm } from './filmScene';
import './film-archive.css';

const DURATION = 18;
const FORMATS = {
  landscape: { label: '16:9 · Landscape', ratio: 16 / 9 },
  portrait: { label: '9:16 · Portrait', ratio: 9 / 16 },
  square: { label: '1:1 · Square', ratio: 1 },
};
const CHAPTERS = [
  { time: 0, name: 'Hello, human.', detail: 'Meet Damon' },
  { time: 6, name: 'Intelligence in motion.', detail: 'Plan · Act · Learn' },
  { time: 12, name: 'Make it useful.', detail: 'A signature in motion' },
];
const bounded = (time) => Math.max(0, Math.min(DURATION, Number(time) || 0));
const timestamp = (time) => `0:${String(Math.floor(time)).padStart(2, '0')}`;

export default function FilmArchive() {
  const [renderMode] = useState(() => new URLSearchParams(window.location.search).get('render') === '1');
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [status, setStatus] = useState('loading');
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [format, setFormat] = useState(() => !renderMode && window.innerWidth <= 600 ? 'portrait' : 'landscape');
  const [notice, setNotice] = useState('');
  const canvasRef = useRef(null);
  const areaRef = useRef(null);
  const screenRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const controlsRef = useRef(null);
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    const oldTitle = document.title;
    document.title = 'Make it useful. — A GDamon film';
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const audioElement = audioRef.current;
    delete window.GDamonFilmError;
    let disposed = false;
    let engine;
    let observer;
    let frame = 0;
    let last = 0;
    let lastDisplay = 0;
    let position = 0;
    let running = false;
    let silent = true;
    let failed = false;
    let api;

    const paint = () => {
      if (engine && !failed) {
        try {
          engine.seek(position);
          const robot = engine.getMetrics().robot;
          if (robot && robot.renderer !== 'three') throw new Error(robot.failure || 'The 3D scene is unavailable.');
        } catch (error) { fallback(error); }
      }
    };
    const syncAudio = (start = false) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (silent || !running || document.hidden || failed) { audio.pause(); return; }
      if (Number.isFinite(audio.duration) && Math.abs(audio.currentTime - position) > .2) audio.currentTime = position;
      if (start || audio.paused) {
        audio.play().catch(() => {
          if (!disposed && !silent) setNotice('Sound could not start. Try the sound button again.');
        });
      }
    };
    const tick = (now) => {
      frame = 0;
      if (disposed || !running || document.hidden || failed) return;
      if (last) position = bounded(position + (now - last) / 1000);
      last = now;
      paint();
      if (now - lastDisplay > 80 || position === DURATION) {
        setTime(position);
        lastDisplay = now;
      }
      if (position >= DURATION) {
        running = false;
        setPlaying(false);
        audioRef.current?.pause();
      } else if (!failed) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!frame && running && !document.hidden && !failed && !renderMode) frame = requestAnimationFrame(tick);
    };
    const pause = () => {
      running = false;
      last = 0;
      cancelAnimationFrame(frame);
      frame = 0;
      audioRef.current?.pause();
      videoRef.current?.pause();
      setPlaying(false);
    };
    const seek = (value) => {
      position = bounded(value);
      last = 0;
      setTime(position);
      if (failed) {
        const video = videoRef.current;
        if (video && Number.isFinite(video.duration)) video.currentTime = Math.min(position, video.duration);
      } else paint();
      syncAudio();
      return position;
    };
    const play = () => {
      if (position >= DURATION - .03) seek(0);
      running = true;
      last = 0;
      setPlaying(true);
      if (failed) {
        videoRef.current?.play().catch(() => {
          if (!disposed) { setPlaying(false); running = false; }
        });
      } else { syncAudio(true); schedule(); }
    };
    function fallback(error) {
      if (failed || disposed) return;
      pause();
      failed = true;
      window.GDamonFilmError = error instanceof Error ? error.message : 'The film could not be initialized.';
      setStatus('fallback');
      setNotice('The interactive film is unavailable here. Watch the video edition below.');
    }
    const fit = () => {
      if (renderMode || disposed) return;
      const area = areaRef.current;
      const screen = screenRef.current;
      if (!area || !screen) return;
      const ratio = FORMATS[formatRef.current].ratio;
      const width = Math.max(1, Math.floor(Math.min(area.clientWidth, area.clientHeight * ratio)));
      const height = Math.max(1, Math.round(width / ratio));
      screen.style.width = `${width}px`;
      screen.style.height = `${height}px`;
      if (engine && !failed) {
        const dpr = Math.min(devicePixelRatio || 1, 2);
        try { engine.setSize(Math.round(width * dpr), Math.round(height * dpr)); paint(); } catch (error) { fallback(error); }
      }
    };
    const visibility = () => {
      last = 0;
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        audioRef.current?.pause();
        if (failed && running) videoRef.current?.pause();
      } else { syncAudio(true); schedule(); }
    };
    const motionPreference = () => {
      setReduced(preference.matches);
      if (preference.matches) pause();
    };
    controlsRef.current = {
      play, pause, seek, resize: fit,
      toggle: () => running ? pause() : play(),
      replay: () => { seek(0); play(); },
      sound: () => {
        silent = !silent;
        setMuted(silent);
        setNotice('');
        if (videoRef.current) videoRef.current.muted = silent;
        syncAudio(true);
      },
      videoTime: (value) => { position = bounded(value); setTime(position); },
      videoState: (value) => { running = value; setPlaying(value); },
    };
    document.addEventListener('visibilitychange', visibility);
    preference.addEventListener('change', motionPreference);
    const audioReady = () => syncAudio();
    audioElement?.addEventListener('loadedmetadata', audioReady);
    if (!renderMode) {
      observer = new ResizeObserver(fit);
      observer.observe(areaRef.current);
      fit();
    }

    const start = async () => {
      try {
        await document.fonts.load('400 120px Anton');
        await document.fonts.ready;
        if (disposed) return;
        engine = createFilm(canvasRef.current);
        if (renderMode) engine.setSize(1280, 720);
        else fit();
        if (failed) return;
        paint();
        if (failed) return;
        api = {
          duration: DURATION,
          seek: (value) => { pause(); return seek(value); },
          setSize: (width, height) => { engine.setSize(width, height); paint(); },
          capture: (value = position) => {
            pause();
            position = bounded(value);
            setTime(position);
            return engine.capture(position);
          },
          getMetrics: () => ({ ...engine.getMetrics(), time: position, playing: running, muted: silent, format: formatRef.current }),
        };
        window.GDamonFilm = api;
        window.seek = api.seek;
        setStatus('ready');
        if (!preference.matches && !renderMode) play();
      } catch (error) { fallback(error); }
    };
    start();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      preference.removeEventListener('change', motionPreference);
      document.removeEventListener('visibilitychange', visibility);
      audioElement?.pause();
      audioElement?.removeEventListener('loadedmetadata', audioReady);
      engine?.dispose();
      controlsRef.current = null;
      if (window.GDamonFilm === api) delete window.GDamonFilm;
      if (window.seek === api?.seek) delete window.seek;
      delete window.GDamonFilmError;
      document.title = oldTitle;
    };
  }, [renderMode]);

  useEffect(() => { controlsRef.current?.resize(); }, [format]);

  const chapter = Math.min(2, Math.floor(time / 6));
  const available = status !== 'loading';
  const keyControl = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault(); controlsRef.current?.toggle();
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); controlsRef.current?.seek(time + (event.key === 'ArrowRight' ? .5 : -.5));
    }
  };

  return (
    <main className={`film-page${renderMode ? ' film-page--render' : ''}`} data-status={status} style={{ '--film-ratio': FORMATS[format].ratio }}>
      <header className="film-header">
        <Link className="film-brand" to="/" aria-label="GDamon — all studies">gdamon<span aria-hidden="true">✳</span></Link>
        <span className="film-edition">A film by Damon Guo-Siyi</span>
        <Link className="film-back" to="/"><ArrowLeft size={16} aria-hidden="true" />All studies</Link>
      </header>
      <div className="film-intro">
        <div><p className="film-eyebrow">From research to real work</p><h1>Make it useful.</h1></div>
        <p className="film-description">An eighteen-second introduction to the human,<br />the agent, and the work in between.</p>
      </div>
      <div className="film-screen-area" ref={areaRef}>
        <div className="film-screen" ref={screenRef} style={{ '--film-ratio': FORMATS[format].ratio }}>
          <canvas ref={canvasRef} className="film-canvas" width="1280" height="720" role="img" aria-label="GDamon film: expressive typography, a ceramic robot unfolding, and points forming GDAMON." hidden={status === 'fallback'} tabIndex={available && status !== 'fallback' ? 0 : -1} onKeyDown={keyControl} />
          {status === 'loading' && <div className="film-loading" role="status"><span>HELLO.</span><p>Getting the film ready</p></div>}
          {status === 'fallback' && <video key={format} ref={videoRef} className="film-video" src={`/films/gdamon-${format}.mp4`} poster={`/films/gdamon-${format}-poster.webp`} controls playsInline muted={muted} preload="metadata" aria-label="GDamon film, video edition" onTimeUpdate={(event) => controlsRef.current?.videoTime(event.currentTarget.currentTime)} onPlay={() => controlsRef.current?.videoState(true)} onPause={() => controlsRef.current?.videoState(false)} onEnded={() => controlsRef.current?.videoState(false)} onLoadedMetadata={(event) => { event.currentTarget.currentTime = Math.min(time, event.currentTarget.duration); if (playing && !document.hidden) event.currentTarget.play().catch(() => controlsRef.current?.videoState(false)); }} />}
        </div>
      </div>
      <section className="film-controls" aria-label="Film controls">
        <div className="film-transport">
          <button className="film-play" type="button" disabled={!available} onClick={() => controlsRef.current?.toggle()} aria-label={playing ? 'Pause film' : 'Play film'}>{playing ? <Pause size={19} fill="currentColor" aria-hidden="true" /> : <Play size={19} fill="currentColor" aria-hidden="true" />}<span>{playing ? 'Pause' : 'Play'}</span></button>
          <button className="film-icon-button" type="button" disabled={!available} onClick={() => controlsRef.current?.replay()} aria-label="Replay film"><RotateCcw size={18} aria-hidden="true" /></button>
          <div className="film-scrub"><label className="film-sr-only" htmlFor="film-progress">Film position</label><input id="film-progress" type="range" min="0" max={DURATION} step="0.05" value={time} disabled={!available} onChange={(event) => controlsRef.current?.seek(event.target.value)} aria-valuetext={`${time.toFixed(1)} seconds of 18 seconds`} style={{ '--film-progress': `${time / DURATION * 100}%` }} /><span className="film-time" aria-hidden="true">{timestamp(time)} <span>/ 0:18</span></span></div>
          <button className="film-sound" type="button" disabled={!available} aria-label={muted ? 'Turn sound on' : 'Mute sound'} aria-pressed={!muted} onClick={() => controlsRef.current?.sound()}>{muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}<span>Sound {muted ? 'off' : 'on'}</span></button>
        </div>
        <div className="film-options"><label className="film-sr-only" htmlFor="film-format">Film format</label><select id="film-format" value={format} onChange={(event) => setFormat(event.target.value)}>{Object.entries(FORMATS).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}</select><a className="film-download" href={`/films/gdamon-${format}.mp4`} download><ArrowDownToLine size={16} aria-hidden="true" /><span>Download MP4</span></a></div>
      </section>
      <nav className="film-chapters" aria-label="Film chapters">{CHAPTERS.map((item, index) => <button key={item.time} className={chapter === index ? 'is-active' : ''} type="button" disabled={!available} aria-current={chapter === index ? 'step' : undefined} onClick={() => controlsRef.current?.seek(item.time)}><span className="film-chapter-index">0{index + 1}</span><span className="film-chapter-copy"><strong>{item.name}</strong><span>{item.detail}</span></span><span className="film-chapter-time">{timestamp(item.time)}</span></button>)}</nav>
      <footer className="film-footer"><p role="status">{notice || (reduced && !playing ? 'Ready when you are. Press play to begin.' : 'Agentic RL · Post-training · Evaluation')}</p><Link to="/robot">Meet the agent<ArrowUpRight size={15} aria-hidden="true" /></Link></footer>
      <audio ref={audioRef} src="/films/gdamon-score.wav" preload="none" aria-hidden="true" />
    </main>
  );
}
