import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Asterisk } from 'lucide-react';
import { createMatterScene } from './matterScene';
import './matter.css';

const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };
const chapters = [
  { name: 'Form', title: ['INTELLIGENCE,', 'TAKING SHAPE.'], copy: 'I train supply-chain models around two things: what they know, and what they can do.', method: 'Benchmark → Pretrain → SFT + RL', proof: 'Knowledge QA + tool use', project: 'supply-chain-domain-llm', link: 'Explore domain model training' },
  { name: 'Connect', title: ['REASONING,', 'INTO ACTION.'], copy: 'I connect agents to a changing pool of tools, and train the decisions between one step and the next.', method: 'Register → Reason → Execute', proof: '100+ dynamically registered tools', project: 'dynamic-tool-resolution-agents', link: 'Explore dynamic tool agents' },
  { name: 'Evaluate', title: ['MAKE EVERY', 'STEP COUNT.'], copy: 'I evaluate planning, memory, and tool use across turns — including what happens when a plan fails.', method: 'Plan → Observe → Replan', proof: 'A taxonomy informed by ~250 papers', project: 'multi-turn-agent-evaluation', link: 'Explore agent evaluation' },
];

function useMatterMotion(storyRef, stageRef, canvasRef, videoRef) {
  const [status, setStatus] = useState('loading');
  const [phase, setPhase] = useState(0);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    const story = storyRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const source = innerWidth <= 700 ? 'mobile.mp4' : 'desktop.mp4';
    const cards = [...stage.querySelectorAll('.matter-chapter')];
    const state = { progress: 0, target: 0, frame: 0, targetFrame: 0, phase: 0, media: 'loading', status: reduced ? 'static' : 'loading', seeks: 0, visible: true, ready: false, disposed: false, failure: null };
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };
    let scene;
    let raf = 0;
    let last = 0;
    let mediaTimer;
    let seekStart = 0;
    let seekTimer;
    let blockedAtSeam = false;
    let phaseWasSelected = false;
    let resize;
    let observer;
    let initialPosition = true;
    const mediaEnd = 95 / 24;
    const active = () => state.ready && state.visible && !document.hidden && !state.disposed;
    const pending = () => Math.abs(state.progress - state.target) > .0001 || Math.abs(pointer.x - pointerTarget.x) > .0001 || Math.abs(pointer.y - pointerTarget.y) > .0001;
    const requestFrame = () => { if (active() && !raf) raf = requestAnimationFrame(tick); };
    const selectPhase = (next) => {
      if (!phaseWasSelected || state.phase !== next) { phaseWasSelected = true; state.phase = next; setPhase(next); }
    };
    const draw = () => {
      const p = state.progress;
      const handoff = smooth(.30, .42, p);
      stage.style.setProperty('--matter-image-opacity', String(1 - handoff));
      stage.style.setProperty('--matter-progress', String(p));
      stage.style.setProperty('--matter-glow', String(smooth(.35, .75, p)));
      const fades = [1 - smooth(.390, .435, p), smooth(.435, .480, p) * (1 - smooth(.740, .785, p)), smooth(.785, .830, p)];
      selectPhase(p < .435 ? 0 : p < .785 ? 1 : 2);
      cards.forEach((card, i) => {
        card.style.opacity = fades[i];
        card.style.transform = `translateY(${(1 - fades[i]) * 14}px)`;
      });
      state.targetFrame = Math.round(smooth(0, .30, p) * 95);
      if (state.media === 'ready' && !video.seeking && Math.abs(state.frame - state.targetFrame) >= 1) {
        const desiredTime = Math.min(mediaEnd, state.targetFrame / 24);
        if (Math.abs(video.currentTime - desiredTime) < 1 / 96) {
          state.frame = state.targetFrame;
          clearTimeout(seekTimer);
        } else {
          state.seeks++;
          seekStart = performance.now();
          try {
            video.currentTime = desiredTime;
            clearTimeout(seekTimer);
            seekTimer = setTimeout(failMedia, 2500);
          } catch { failMedia(); }
        }
      }
      scene?.render(p, pointer);
    };
    function tick(now) {
      raf = 0;
      if (!active()) return;
      const dt = Math.min(.05, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const next = state.progress + (state.target - state.progress) * (1 - Math.exp(-dt / .115));
      // Do not dissolve into a D while a slow decoder still displays the original chrome seed.
      blockedAtSeam = state.target > .32 && next > .32 && (state.media === 'loading' || (state.media === 'ready' && state.frame < 94));
      state.progress = blockedAtSeam ? Math.min(next, .32) : next;
      if (!blockedAtSeam && Math.abs(state.progress - state.target) < .0001) state.progress = state.target;
      pointer.x += (pointerTarget.x - pointer.x) * (1 - Math.exp(-dt / .09));
      pointer.y += (pointerTarget.y - pointer.y) * (1 - Math.exp(-dt / .09));
      draw();
      if (pending() && !blockedAtSeam) requestFrame();
      else last = 0;
    }
    const input = () => {
      if (!state.ready) return;
      const travel = Math.max(1, story.offsetHeight - stage.clientHeight);
      state.target = clamp(-story.getBoundingClientRect().top / travel);
      requestFrame();
    };
    const resetPointer = () => { pointerTarget.x = pointerTarget.y = 0; requestFrame(); };
    const movePointer = (event) => {
      if (event.pointerType !== 'mouse' || event.target.closest('a,button')) { resetPointer(); return; }
      const rect = stage.getBoundingClientRect();
      pointerTarget.x = clamp((event.clientX - rect.left) / rect.width) - .5;
      pointerTarget.y = clamp((event.clientY - rect.top) / rect.height) - .5;
      requestFrame();
    };
    const sync = () => {
      video.pause();
      if (!active()) { cancelAnimationFrame(raf); raf = 0; last = 0; }
      else { input(); requestFrame(); }
    };
    const seeked = () => {
      clearTimeout(seekTimer);
      state.frame = Math.max(0, Math.min(95, Math.round(video.currentTime * 24)));
      seekStart = 0;
      requestFrame();
    };
    function failMedia() {
      clearTimeout(mediaTimer);
      clearTimeout(seekTimer);
      state.media = 'poster';
      video.pause();
      video.removeAttribute('src');
      video.load();
      stage.dataset.media = 'poster';
      requestFrame();
    }
    const mediaReady = () => {
      if (state.media === 'poster' || state.media === 'ready' || !Number.isFinite(video.duration) || video.duration < mediaEnd || video.readyState < 2) return;
      clearTimeout(mediaTimer);
      state.media = 'ready';
      video.pause();
      stage.dataset.media = 'ready';
      requestFrame();
    };
    const contextLost = (event) => {
      event.preventDefault();
      state.failure = 'WebGL context unavailable';
      state.ready = false;
      state.status = 'error';
      state.media = 'poster';
      stage.dataset.media = 'poster';
      clearTimeout(mediaTimer);
      clearTimeout(seekTimer);
      cancelAnimationFrame(raf);
      raf = 0;
      video.pause();
      setStatus('error');
    };
    const api = {
      getMetrics: () => ({ id: 'matter', control: 'particle-scroll', status: state.status, progress: state.progress, targetProgress: state.target, phase: chapters[state.phase].name.toLowerCase(), targetFrame: state.targetFrame, currentFrame: state.frame, currentTime: video.currentTime, frameCount: 96, fps: 24, duration: video.duration || 0, mediaStatus: state.media, seeking: video.seeking, seekCount: state.seeks, seekMs: seekStart ? performance.now() - seekStart : 0, blockedAtSeam, animating: Boolean(raf), settled: state.ready && !raf && !pending() && !video.seeking, paused: video.paused, reduced, visible: state.visible, hidden: document.hidden, source, failure: state.failure, particle: scene?.getMetrics() || null }),
    };
    window.GDamonOil = api;
    delete stage.dataset.media;
    ['--matter-image-opacity', '--matter-progress', '--matter-glow'].forEach((name) => stage.style.removeProperty(name));
    ['--matter-image-width', '--matter-image-height'].forEach((name) => canvas.parentElement.style.removeProperty(name));
    cards.forEach((card) => { card.style.removeProperty('opacity'); card.style.removeProperty('transform'); });
    queueMicrotask(() => {
      if (state.disposed) return;
      setPhase(0);
      setStatus(reduced ? 'static' : 'loading');
    });
    if (reduced) {
      state.status = 'static';
      state.media = 'poster';
      stage.dataset.media = 'poster';
    } else {
      video.addEventListener('loadeddata', mediaReady);
      video.addEventListener('canplay', mediaReady);
      video.addEventListener('seeked', seeked);
      video.addEventListener('error', failMedia);
      canvas.addEventListener('webglcontextlost', contextLost);
      video.preload = 'auto';
      video.src = `/oil-lab/matter/${source}`;
      video.load();
      mediaTimer = setTimeout(failMedia, 12000);
      createMatterScene(canvas).then((result) => {
        if (state.disposed) { result.dispose(); return; }
        scene = result;
        state.ready = true;
        state.status = 'ready';
        setStatus('ready');
        observer = new IntersectionObserver((entries) => { state.visible = entries[0].isIntersecting; sync(); });
        observer.observe(stage);
        resize = new ResizeObserver(() => { scene.resize(); input(); });
        resize.observe(stage);
        resize.observe(canvas);
        window.addEventListener('scroll', input, { passive: true });
        window.addEventListener('resize', input);
        window.addEventListener('blur', resetPointer);
        stage.addEventListener('pointermove', movePointer, { passive: true });
        stage.addEventListener('pointerleave', resetPointer);
        document.addEventListener('visibilitychange', sync);
        requestAnimationFrame(() => {
          if (state.disposed) return;
          input();
          if (initialPosition) { initialPosition = false; draw(); }
        });
      }).catch((error) => {
        if (state.disposed) return;
        state.failure = error.message;
        state.status = 'error';
        state.media = 'poster';
        stage.dataset.media = 'poster';
        clearTimeout(mediaTimer);
        clearTimeout(seekTimer);
        video.pause();
        video.removeAttribute('src');
        video.load();
        setStatus('error');
      });
    }
    return () => {
      state.disposed = true;
      clearTimeout(mediaTimer);
      clearTimeout(seekTimer);
      cancelAnimationFrame(raf);
      scene?.dispose();
      resize?.disconnect();
      observer?.disconnect();
      window.removeEventListener('scroll', input);
      window.removeEventListener('resize', input);
      window.removeEventListener('blur', resetPointer);
      stage.removeEventListener('pointermove', movePointer);
      stage.removeEventListener('pointerleave', resetPointer);
      document.removeEventListener('visibilitychange', sync);
      video.removeEventListener('loadeddata', mediaReady);
      video.removeEventListener('canplay', mediaReady);
      video.removeEventListener('seeked', seeked);
      video.removeEventListener('error', failMedia);
      canvas.removeEventListener('webglcontextlost', contextLost);
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (window.GDamonOil === api) delete window.GDamonOil;
    };
  }, [canvasRef, reduced, stageRef, storyRef, videoRef]);
  return { status: reduced ? 'static' : status, phase, reduced };
}

export default function MatterStory() {
  const storyRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const { status, phase, reduced } = useMatterMotion(storyRef, stageRef, canvasRef, videoRef);
  const staticMode = reduced || status === 'error';
  useEffect(() => {
    const previous = document.title;
    document.title = 'GDamon — Intelligence, taking shape.';
    return () => { document.title = previous; };
  }, []);
  const goTo = (index) => {
    const travel = storyRef.current.offsetHeight - stageRef.current.clientHeight;
    if (staticMode) stageRef.current.querySelectorAll('.matter-chapter')[index].scrollIntoView({ block: 'center' });
    else window.scrollTo({ top: storyRef.current.offsetTop + [0, .69, 1][index] * travel, behavior: 'smooth' });
  };
  return <section className={`matter-story${staticMode ? ' matter-story--static' : ''}`} data-status={status} ref={storyRef} aria-label="From model training to useful agent systems">
    <div className="matter-stage" ref={stageRef}>
      <header className="oil-header"><Link to="/" className="oil-brand" aria-label="GDamon home">gdamon<Asterisk aria-hidden="true" /></Link><span className="oil-header-note">Damon Guo-Siyi · AI researcher at Alibaba</span><nav aria-label="Main navigation"><a href="#oil-work">Work</a><a href="#oil-about">About</a><a href="#oil-contact">Contact<ArrowUpRight size={14} aria-hidden="true" /></a></nav></header>
      <div className="matter-identity">Damon Guo-Siyi / AI researcher & LLM engineer</div>
      <div className="matter-art" aria-hidden="true"><div className="matter-plate"><img className="matter-poster" src="/oil-lab/matter/poster.webp" width="1280" height="720" alt="" /><img className="matter-last" src="/oil-lab/matter/K1.png" width="1536" height="864" alt="" /><video ref={videoRef} muted playsInline preload="none" disablePictureInPicture tabIndex={-1} /></div><canvas ref={canvasRef} /></div>
      <div className="matter-chapters">{chapters.map((chapter, index) => <article key={chapter.name} className={`matter-chapter${phase === index ? ' is-current' : ''}`} aria-hidden={!staticMode && phase !== index} inert={!staticMode && phase !== index}>
        <p className="matter-eyebrow">0{index + 1} / {chapter.name}</p>
        {index === 0 ? <h1>{chapter.title.map((line) => <span key={line}>{line}</span>)}</h1> : <h2>{chapter.title.map((line) => <span key={line}>{line}</span>)}</h2>}
        <p className="matter-copy">{chapter.copy}</p><p className="matter-method">{chapter.method}</p>
        <div className="matter-proof"><p>{chapter.proof}</p><Link to={`/projects#${chapter.project}`}>{chapter.link}<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </article>)}</div>
      <div className="matter-bottom"><nav className="matter-index" aria-label="Story chapters">{chapters.map((chapter, index) => <button key={chapter.name} onClick={() => goTo(index)} aria-current={phase === index ? 'step' : undefined}><span>0{index + 1}</span>{chapter.name}</button>)}</nav><p>Scroll to connect the dots<ArrowDown size={14} aria-hidden="true" /></p><span className="matter-track" aria-hidden="true" /></div>
    </div>
  </section>;
}
