import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Pause, Play, RotateCcw } from 'lucide-react';
import { projects } from '../data/projects';
import { posts } from '../data/posts';
import './robot-portfolio.css';

const selectedWork = projects.filter((project) => project.featured).slice(0, 4);
const channels = [
  ['GitHub', 'https://github.com/Damon-GSY'],
  ['YouTube', 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA'],
  ['Bilibili', 'https://space.bilibili.com/358541297'],
];

const clamp = (value) => Math.max(0, Math.min(1, value));
const easeOut = (value) => 1 - (1 - clamp(value)) ** 4;
const panelMotion = [
  ['.rp-rear-left', 100, 1000, -125, -58, -12, -56, -24, -8, 3],
  ['.rp-rear-right', 100, 1000, 125, -58, 12, 56, -24, 8, 3],
  ['.rp-ear-left', 300, 880, -185, 0, -5, -100, 6, -3, 9],
  ['.rp-ear-right', 300, 880, 185, 0, 5, 100, 6, 3, 9],
  ['.rp-jaw-left', 470, 920, -95, 110, -10, -62, 52, -8, 6],
  ['.rp-jaw-right', 470, 920, 95, 110, 10, 62, 52, 8, 6],
  ['.rp-jaw-center', 650, 980, 0, 140, 0, 0, 106, 0, 8],
  ['.rp-visor', 820, 1050, 0, 42, 0, 0, 8, 0, 18],
  ['.rp-crown-fin', 1050, 1050, 0, -145, 0, 0, -86, 0, 12],
  ['.rp-seams', 1400, 650, 0, 28, 0, 0, 76, 0, 8],
  ['.rp-face-details', 1560, 680, 0, 0, 0, 0, 12, 0, 24],
];

function useRobotMotion(rootRef, reducedMotion, paused, replayVersion) {
  const controller = useRef(null);
  const pausePreference = useRef(paused);
  pausePreference.current = paused;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
    const hero = root.querySelector('.rp-hero');
    const scene = root.querySelector('.rp-hero-scene');
    const mascot = root.querySelector('.rp-mascot');
    const stage = root.querySelector('.rp-robot-stage');
    const depth = root.querySelector('.rp-robot-depth');
    const about = root.querySelector('.rp-about');
    const mark = root.querySelector('.rp-research-mark');
    const pieces = panelMotion.map(([selector, ...motion]) => ({ element: root.querySelector(selector), motion }));
    const intros = [...root.querySelectorAll('[data-rp-intro]')];
    const reveals = [...root.querySelectorAll('[data-rp-reveal]')].map((element) => ({ element, top: 0 }));
    const rows = [...root.querySelectorAll('.rp-project')].map((element) => ({ element, top: 0 }));
    const notes = [...root.querySelectorAll('.rp-note')].map((element, index) => ({ element, index, top: 0 }));
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let request = 0;
    let lastTime = 0;
    let elapsed = 0;
    let isPaused = pausePreference.current;
    let heroVisible = true;
    let heroTop = 0;
    let heroHeight = 1;
    let aboutTop = 0;
    let aboutHeight = 1;
    let viewportHeight = window.innerHeight;
    let explosionStart = 0;
    let explosionDistance = 1;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;
    let explosion = 0;

    const value = (element, property, number) => element.style.setProperty(property, number.toFixed(4));
    const showContent = () => {
      intros.forEach((element) => value(element, '--rp-enter', 1));
      reveals.forEach(({ element }) => value(element, '--rp-reveal', 1));
      rows.forEach(({ element }) => value(element, '--rp-row', 1));
      notes.forEach(({ element }) => value(element, '--rp-note', 1));
      value(mark, '--rp-orbit', 1);
    };
    const measure = () => {
      viewportHeight = window.innerHeight;
      heroTop = hero.getBoundingClientRect().top + window.scrollY;
      heroHeight = hero.offsetHeight;
      const hasStickyScene = window.getComputedStyle(scene).position === 'sticky';
      explosionStart = hasStickyScene ? heroTop + 35 : Math.max(heroTop, mascot.getBoundingClientRect().top + window.scrollY - viewportHeight * .58);
      explosionDistance = hasStickyScene ? Math.max(180, (heroHeight - scene.offsetHeight) * .76) : Math.max(120, viewportHeight * .24);
      aboutTop = about.getBoundingClientRect().top + window.scrollY;
      aboutHeight = about.offsetHeight;
      [...reveals, ...rows, ...notes].forEach((item) => {
        item.top = item.element.getBoundingClientRect().top + window.scrollY;
      });
    };
    const render = (now) => {
      request = 0;
      if (isPaused || document.hidden) return;
      const delta = lastTime ? Math.min(now - lastTime, 48) : 16;
      lastTime = now;
      const scroll = window.scrollY;
      heroVisible = scroll < heroTop + heroHeight && scroll + viewportHeight > heroTop;
      if (heroVisible) elapsed += delta;
      if (scroll > heroTop + heroHeight * .24) elapsed = Math.max(elapsed, 2700);
      pointerX += (targetX - pointerX) * .1;
      pointerY += (targetY - pointerY) * .1;
      const targetExplosion = clamp((scroll - explosionStart) / explosionDistance);
      explosion += (targetExplosion - explosion) * .14;
      if (heroVisible) {
        pieces.forEach(({ element, motion }) => {
          const [delay, duration, fromX, fromY, fromAngle, outX, outY, outAngle, depthWeight] = motion;
          const progress = clamp((elapsed - delay) / duration);
          const arrival = 1 - easeOut(progress);
          const x = fromX * arrival + outX * explosion + pointerX * depthWeight;
          const y = fromY * arrival + outY * explosion + pointerY * depthWeight * .7;
          const rotation = fromAngle * arrival + outAngle * explosion;
          element.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rotation.toFixed(2)}deg) scale(${(1 - arrival * .04).toFixed(4)})`;
          element.style.opacity = easeOut(progress * 3).toFixed(3);
        });
        depth.style.transform = `perspective(1000px) rotateX(${(-pointerY * 6).toFixed(2)}deg) rotateY(${(pointerX * 9).toFixed(2)}deg) translateY(${(explosion * 20).toFixed(2)}px)`;
        value(stage, '--rp-explode', explosion);
        value(mascot, '--rp-explode', explosion);
        stage.dataset.assembly = Math.min(1, elapsed / 2240).toFixed(3);
        stage.dataset.explosion = explosion.toFixed(3);
        intros.forEach((element) => value(element, '--rp-enter', easeOut((elapsed - Number(element.dataset.rpIntro)) / 1000)));
      }
      reveals.forEach(({ element, top }) => value(element, '--rp-reveal', easeOut((viewportHeight * .92 - (top - scroll)) / (viewportHeight * .3))));
      rows.forEach(({ element, top }) => value(element, '--rp-row', easeOut((viewportHeight * .9 - (top - scroll)) / (viewportHeight * .36))));
      notes.forEach(({ element, top, index }) => value(element, '--rp-note', easeOut((viewportHeight * .93 - (top - scroll) - (viewportHeight > 650 && window.innerWidth > 700 ? index * 34 : 0)) / (viewportHeight * .34))));
      const orbit = clamp((viewportHeight * .82 - (aboutTop - scroll)) / (viewportHeight * .8 + aboutHeight * .4));
      value(mark, '--rp-orbit', orbit);
      if (heroVisible && (elapsed < 2700 || Math.abs(targetX - pointerX) + Math.abs(targetY - pointerY) > .002 || Math.abs(targetExplosion - explosion) > .001)) {
        request = window.requestAnimationFrame(render);
      }
    };
    const schedule = () => {
      if (!request && !isPaused && !document.hidden) request = window.requestAnimationFrame(render);
    };
    const resize = () => { measure(); schedule(); };
    const pointerMove = (event) => {
      if (!finePointer.matches || event.pointerType === 'touch' || isPaused) return;
      const bounds = hero.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
      targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
      schedule();
    };
    const pointerLeave = () => { targetX = 0; targetY = 0; schedule(); };
    const visibility = () => {
      window.cancelAnimationFrame(request);
      request = 0;
      lastTime = 0;
      if (!document.hidden) schedule();
    };
    const replay = () => {
      window.scrollTo({ top: heroTop, behavior: 'instant' });
      elapsed = 0;
      lastTime = 0;
      explosion = 0;
      pointerX = 0;
      pointerY = 0;
      targetX = 0;
      targetY = 0;
      stage.dataset.assembly = '0';
      schedule();
    };
    controller.current = {
      replay,
      setPaused: (next) => {
        isPaused = next;
        window.cancelAnimationFrame(request);
        request = 0;
        lastTime = 0;
        if (next) showContent();
        else schedule();
      },
    };
    const onRestore = (event) => { if (event.persisted) { measure(); schedule(); } };
    root.classList.add('rp-motion-ready');
    measure();
    if (isPaused) showContent();
    else render(performance.now());
    hero.addEventListener('pointermove', pointerMove);
    hero.addEventListener('pointerleave', pointerLeave);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('pageshow', onRestore);
    document.addEventListener('visibilitychange', visibility);
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    return () => {
      window.cancelAnimationFrame(request);
      observer.disconnect();
      hero.removeEventListener('pointermove', pointerMove);
      hero.removeEventListener('pointerleave', pointerLeave);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pageshow', onRestore);
      document.removeEventListener('visibilitychange', visibility);
      root.classList.remove('rp-motion-ready');
      [...intros, ...reveals.map(({ element }) => element), ...rows.map(({ element }) => element), ...notes.map(({ element }) => element), mark, mascot, stage, depth, ...pieces.map(({ element }) => element)].forEach((element) => element.removeAttribute('style'));
      stage.removeAttribute('data-assembly');
      stage.removeAttribute('data-explosion');
      controller.current = null;
    };
  }, [rootRef, reducedMotion]);

  useEffect(() => { controller.current?.setPaused(paused); }, [paused]);
  useEffect(() => { if (replayVersion) controller.current?.replay(); }, [replayVersion]);
}

function RobotHelmet() {
  return (
    <svg className="rp-robot" viewBox="0 0 660 680" role="img" aria-labelledby="rp-robot-title rp-robot-description">
      <title id="rp-robot-title">An agent, coming together</title>
      <desc id="rp-robot-description">White helmet panels assemble around a navy visor, a visual companion to Damon's work on agent systems.</desc>
      <defs>
        <linearGradient id="rp-shell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.56" stopColor="#fbfbfb" />
          <stop offset="1" stopColor="#f0f1f2" />
        </linearGradient>
        <linearGradient id="rp-visor" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#0c2b4e" />
          <stop offset="1" stopColor="#071d35" />
        </linearGradient>
        <filter id="rp-soft-edge" x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.15" result="blur" />
          <feOffset dy="1" result="offset" />
          <feColorMatrix in="offset" type="matrix" values="0 0 0 0 0.02 0 0 0 0 0.17 0 0 0 0 0.39 0 0 0 .14 0" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g filter="url(#rp-soft-edge)">
        <path className="rp-piece rp-rear-left" fill="url(#rp-shell)" d="M72 256c-9-36-5-55 10-76l47-63c15-14 35-20 59-12l49-15 31 152-4 46-177 12z" />
        <path className="rp-piece rp-rear-right" fill="url(#rp-shell)" d="M588 256c9-36 5-55-10-76l-47-63c-15-14-35-20-59-12l-49-15-31 152 4 46 177 12z" />
        <g className="rp-piece rp-ear-left">
          <path fill="url(#rp-shell)" d="M63 251c-19 6-40 20-51 37C4 300 0 314 0 330v108c0 26 13 47 36 60l25 14 10-50 7-87z" />
          <path fill="#0864d9" d="M14 322c0-8 5-14 10-14s10 6 10 14v101c0 8-5 14-10 14s-10-6-10-14z" />
        </g>
        <g className="rp-piece rp-ear-right">
          <path fill="url(#rp-shell)" d="M597 251c19 6 40 20 51 37 8 12 12 26 12 42v108c0 26-13 47-36 60l-25 14-10-50-7-87z" />
          <path fill="#0864d9" d="M626 322c0-8 5-14 10-14s10 6 10 14v101c0 8-5 14-10 14s-10-6-10-14z" />
        </g>
        <path className="rp-piece rp-jaw-left" fill="url(#rp-shell)" d="M69 385l82 61 48 178-101-65c-22-14-33-35-35-63z" />
        <path className="rp-piece rp-jaw-right" fill="url(#rp-shell)" d="M591 385l-82 61-48 178 101-65c22-14 33-35 35-63z" />
        <path className="rp-piece rp-jaw-center" fill="url(#rp-shell)" d="M151 437l45 27 24 170 30 28q7 11 20 11h120q13 0 20-11l30-28 24-170 45-27-6-34-88 38H265l-108-38z" />
        <g className="rp-piece rp-seams">
          <path fill="#0763d9" d="M70 407l91 61 54 166-10-7-53-153-82-55z" />
          <path fill="#0763d9" d="M590 407l-91 61-54 166 10-7 53-153 82-55z" />
        </g>
        <path className="rp-piece rp-visor" fill="url(#rp-visor)" d="M91 227c-18-4-30 8-28 28l15 111c2 14 8 24 20 32l73 45c5 4 12 6 19 6h280c7 0 14-2 19-6l73-45c12-8 18-18 20-32l15-111c2-20-10-32-28-28l-145 31c-35 7-60 11-94 11s-59-4-94-11z" />
        <g className="rp-piece rp-crown-fin">
          <g transform="translate(26.4 0) scale(.92 1)">
            <path fill="url(#rp-shell)" stroke="#0763d9" strokeWidth="7" strokeLinejoin="round" d="M309 0h42c14 0 23 7 29 20l34 70c5 10 6 18 4 30l-28 141c-3 15-10 20-24 20h-72c-14 0-21-5-24-20l-28-141c-2-12-1-20 4-30l34-70c6-13 15-20 29-20z" />
            <path fill="#0763d9" d="M309 0h42v201c0 14-9 23-21 23s-21-9-21-23z" />
          </g>
        </g>
        <g className="rp-piece rp-face-details">
          <path fill="#ffffff" d="M151 354h109v20H151z" />
          <path fill="#ffffff" d="M399 360l105-28 5 20-105 28z" />
          <rect x="276" y="522" width="108" height="18" rx="9" fill="url(#rp-visor)" />
          <rect x="276" y="549" width="108" height="18" rx="9" fill="url(#rp-visor)" />
        </g>
      </g>
    </svg>
  );
}

function ResearchMark() {
  return (
    <svg className="rp-research-mark" viewBox="0 0 360 360" fill="none" aria-hidden="true">
      <circle className="rp-orbit-line" pathLength="1" cx="180" cy="180" r="150" stroke="currentColor" strokeOpacity=".3" />
      <ellipse className="rp-orbit-line" pathLength="1" cx="180" cy="180" rx="68" ry="150" stroke="currentColor" strokeOpacity=".7" transform="rotate(35 180 180)" />
      <ellipse className="rp-orbit-line" pathLength="1" cx="180" cy="180" rx="68" ry="150" stroke="currentColor" strokeOpacity=".7" transform="rotate(-35 180 180)" />
      <path d="M30 180h300M180 30v300" stroke="currentColor" strokeOpacity=".3" strokeDasharray="3 6" />
      <circle className="rp-orbit-core" cx="180" cy="180" r="24" fill="currentColor" />
      <g className="rp-orbit-node rp-orbit-node-one"><circle cx="280" cy="68" r="8" fill="currentColor" /></g>
      <g className="rp-orbit-node rp-orbit-node-two"><circle cx="77" cy="287" r="5" fill="currentColor" /></g>
    </svg>
  );
}

export default function RobotPortfolio() {
  const root = useRef(null);
  const [replayVersion, setReplayVersion] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useRobotMotion(root, reducedMotion, paused, replayVersion);

  useEffect(() => {
    const title = document.title;
    const description = document.querySelector('meta[name="description"]');
    const oldDescription = description?.getAttribute('content');
    const theme = document.querySelector('meta[name="theme-color"]');
    const oldTheme = theme?.getAttribute('content');
    document.title = 'Damon Guo-Siyi — Agent systems, from research to reality';
    description?.setAttribute('content', 'Damon Guo-Siyi is an AI researcher and LLM engineer at Alibaba in Hangzhou, working on agentic RL, post-training, and evaluation.');
    theme?.setAttribute('content', '#055bd3');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = (event) => setReducedMotion(event.matches);
    const onRestore = (event) => {
      if (event.persisted && !preference.matches) {
        setReplayVersion((current) => current + 1);
      }
    };
    preference.addEventListener('change', onPreference);
    window.addEventListener('pageshow', onRestore);
    return () => {
      document.title = title;
      if (oldDescription !== null && oldDescription !== undefined) description?.setAttribute('content', oldDescription);
      if (oldTheme !== null && oldTheme !== undefined) theme?.setAttribute('content', oldTheme);
      preference.removeEventListener('change', onPreference);
      window.removeEventListener('pageshow', onRestore);
    };
  }, []);

  const replayAssembly = () => {
    if (reducedMotion) return;
    setPaused(false);
    setReplayVersion((current) => current + 1);
  };

  return (
    <main className="robot-portfolio" id="rp-top" ref={root} data-motion={reducedMotion ? 'reduced' : paused ? 'paused' : 'active'}>
      <a className="rp-skip" href="#rp-work">Skip to selected work</a>
      <div className="rp-motion-controls" role="group" aria-label="Page animation controls">
        <button type="button" className="rp-motion-toggle" onClick={() => setPaused((current) => !current)} disabled={reducedMotion} aria-pressed={paused || reducedMotion} aria-label={reducedMotion ? 'Animation disabled by reduced motion preference' : paused ? 'Resume page animations' : 'Pause page animations'}>
          {paused || reducedMotion ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
          {reducedMotion ? 'Motion off' : paused ? 'Resume motion' : 'Pause motion'}
        </button>
        <button className="rp-replay" type="button" onClick={replayAssembly} disabled={reducedMotion} aria-label="Return to top and replay robot assembly"><RotateCcw size={12} aria-hidden="true" /><span>Replay</span></button>
      </div>
      <section className="rp-hero" aria-labelledby="rp-name">
        <div className="rp-hero-scene">
        <header className="rp-header">
          <a className="rp-wordmark" href="#rp-top" aria-label="Damon Guo-Siyi, back to top">Damon<span aria-hidden="true">✳</span></a>
          <nav aria-label="Portfolio navigation">
            <a href="#rp-work">Work</a><a href="#rp-about">About</a><a href="#rp-notes">Notes</a><a href="#rp-contact">Contact <ArrowUpRight aria-hidden="true" /></a>
          </nav>
          <span className="rp-location"><i aria-hidden="true" /> Hangzhou, China</span>
        </header>

        <div className="rp-hero-content">
          <div className="rp-introduction">
            <p className="rp-eyebrow rp-hero-eyebrow" data-rp-intro="60">AI researcher / LLM engineer</p>
            <h1 id="rp-name"><span className="rp-name-line" data-rp-intro="120">Damon</span><span className="rp-name-line" data-rp-intro="260">Guo-Siyi<span className="rp-name-dot">.</span></span></h1>
            <p className="rp-hero-description" data-rp-intro="420">I build agent systems that turn<br className="rp-desktop-break" /> research into real-world capability.</p>
            <a className="rp-primary-link" data-rp-intro="560" href="#rp-work">Explore my work <ArrowDown size={19} aria-hidden="true" /></a>
          </div>

          <div className="rp-mascot">
            <span className="rp-mascot-caption rp-eyebrow">The pieces. The system.</span>
            <div className="rp-robot-stage">
              <div className="rp-robot-depth">
                <svg className="rp-diagram" viewBox="0 0 660 680" fill="none" aria-hidden="true"><path pathLength="1" d="M330 18V-14H545M40 330H-28V226H60M520 542H653V608H570" /><circle cx="330" cy="18" r="4" /><circle cx="40" cy="330" r="4" /><circle cx="520" cy="542" r="4" /></svg>
                <RobotHelmet />
              </div>
              <span className="rp-diagram-label rp-diagram-plan" aria-hidden="true"><b>01 / PLAN</b><span>Reason. Set a course.</span></span>
              <span className="rp-diagram-label rp-diagram-tool" aria-hidden="true"><b>02 / USE TOOLS</b><span>Turn intent into action.</span></span>
              <span className="rp-diagram-label rp-diagram-evaluate" aria-hidden="true"><b>03 / EVALUATE</b><span>Learn from the outcome.</span></span>
            </div>
            <p className="rp-mascot-instruction" data-rp-intro="1650"><span className="rp-pointer-instruction">Move to explore <span aria-hidden="true">/</span> </span>Scroll to see the system <ArrowDown size={11} aria-hidden="true" /></p>
          </div>
        </div>

        <div className="rp-hero-bottom">
          <div className="rp-current"><span className="rp-eyebrow">Currently at</span><p>Alibaba <ArrowUpRight size={14} aria-hidden="true" /></p></div>
          <p className="rp-hero-tagline" data-rp-intro="1080">Intelligence,<br /><em>put to work.</em></p>
          <a className="rp-scroll" href="#rp-work" aria-label="Scroll to selected work"><ArrowDown aria-hidden="true" /></a>
        </div>
        </div>
      </section>

      <section className="rp-work rp-section" id="rp-work" aria-labelledby="rp-work-title">
        <div className="rp-section-bar" data-rp-reveal=""><p className="rp-eyebrow"><span>01</span> Selected work</p><Link to="/projects">All projects <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
        <div className="rp-section-heading">
          <h2 id="rp-work-title" data-rp-reveal="">From possibility<br />to <em>practice.</em></h2>
          <p>Research, training, and evaluation belong in the same loop. A selection of the systems and ideas I work on.</p>
        </div>
        <div className="rp-projects">
          {selectedWork.map((project, index) => (
            <Link className="rp-project" key={project.id} to={`/projects#${project.id}`}>
              <span className="rp-project-number" aria-hidden="true">0{index + 1}</span>
              <div className="rp-project-copy"><p className="rp-eyebrow">{project.kicker}</p><h3>{project.title}</h3><p className="rp-project-description">{project.description}</p></div>
              <div className="rp-project-meta"><span>{project.stage} / {project.year}</span><p>{project.tags.join(' · ')}</p></div>
              <ArrowUpRight className="rp-project-arrow" strokeWidth={1.3} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="rp-about rp-section" id="rp-about" aria-labelledby="rp-about-title">
        <div className="rp-section-bar" data-rp-reveal=""><p className="rp-eyebrow"><span>02</span> About / Approach</p><span className="rp-eyebrow">Curiosity → capability</span></div>
        <div className="rp-about-grid">
          <div className="rp-about-statement"><h2 id="rp-about-title" data-rp-reveal="">A better answer<br />is only<br /><em>the start.</em></h2><ResearchMark /></div>
          <div className="rp-about-copy" data-rp-reveal="">
            <p className="rp-about-lead">I’m Damon, an AI researcher and LLM engineer at Alibaba.</p>
            <p>Based in Hangzhou, I work on agentic reinforcement learning, post-training, and evaluation. I’m interested in what happens after a model gives an answer: how it plans, uses tools, learns from feedback, and gets useful work done.</p>
            <p>My education took me through NUS and UNSW. Today, I connect research with the practical demands of building agent systems in production.</p>
            <dl className="rp-research-areas">
              <div><dt>Agentic RL</dt><dd>Learning better decisions, one step at a time.</dd></div>
              <div><dt>Post-training</dt><dd>Turning model capability into useful behavior.</dd></div>
              <div><dt>Evaluation</dt><dd>Understanding the whole trajectory, not just the answer.</dd></div>
            </dl>
            <Link className="rp-text-link" to="/about">More about me <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="rp-notes rp-section" id="rp-notes" aria-labelledby="rp-notes-title">
        <div className="rp-section-bar" data-rp-reveal=""><p className="rp-eyebrow"><span>03</span> Notes from the work</p><Link to="/blog">All writing <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
        <div className="rp-section-heading"><h2 id="rp-notes-title" data-rp-reveal="">Thinking<br /><em>out loud.</em></h2><p>Ideas, observations, and lessons from building AI. Written to make the next question a little clearer.</p></div>
        <div className="rp-notes-grid">
          {posts.slice(0, 3).map((post) => (
            <Link className="rp-note" key={post.slug} to={`/blog/${post.slug}`}>
              <div className="rp-note-top"><span className="rp-eyebrow">{post.category}</span><ArrowUpRight size={22} strokeWidth={1.3} aria-hidden="true" /></div>
              <h3>{post.title}</h3><p>{post.excerpt}</p><span className="rp-note-date"><time dateTime={post.date}>{new Date(`${post.date}T00:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time><span>{post.readingTime}</span></span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="rp-contact rp-section" id="rp-contact" aria-labelledby="rp-contact-title">
        <div className="rp-section-bar" data-rp-reveal=""><p className="rp-eyebrow"><span>04</span> Start a conversation</p><span className="rp-eyebrow">Hangzhou / Everywhere</span></div>
        <div className="rp-contact-main"><h2 id="rp-contact-title"><span className="rp-contact-line" data-rp-reveal="">Let’s make</span><span className="rp-contact-line" data-rp-reveal="">it <em>useful.</em></span></h2><div className="rp-contact-copy" data-rp-reveal=""><p>Working on agents, evaluation, or an interesting research question? I’d love to hear about it.</p><a className="rp-contact-email" href="mailto:hello@damon.ai">hello@damon.ai <ArrowUpRight size={28} strokeWidth={1.5} aria-hidden="true" /></a></div></div>
        <div className="rp-footer-bottom" data-rp-reveal=""><span>Damon Guo-Siyi</span><nav aria-label="Find Damon online">{channels.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer">{label} <ArrowUpRight size={13} aria-hidden="true" /></a>)}</nav><a href="#rp-top">Back to top <ArrowUpRight size={14} aria-hidden="true" /></a></div>
      </footer>
    </main>
  );
}
