import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Asterisk, CornerDownRight, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import '@fontsource/anton/latin-400.css';
import { projects } from '../data/projects';
import { posts } from '../data/posts';
import { createRobotScene } from './robotScene';
import './robot-portfolio.css';

const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => { const t = clamp(x); return t * t * (3 - 2 * t); };
const work = projects.filter((project) => project.featured).slice(0, 4);
const workDetails = [
  ['12', 'REAL-WORLD SCENARIOS', 'A decision framework for supply-chain work, from routine execution to exception handoff.'],
  ['100+', 'TOOLS, ONE AGENT', 'Training agents to choose and use tools as the environment changes.'],
  ['SFT + RL', 'FROM KNOWLEDGE TO CAPABILITY', 'Domain training grounded in benchmarks for knowledge and tool use.'],
  ['~250', 'PAPERS REVIEWED', 'A taxonomy for evaluating planning, memory, and decisions across turns.'],
];
const systems = [
  ['PLAN', 'Make the next decision.', 'Reason across turns, adapt when intent changes, and recover when a step fails.'],
  ['ACT', 'Give intelligence tools.', 'Connect decisions to a changing pool of tools, with clear boundaries for real workflows.'],
  ['LEARN', 'Close the loop.', 'Evaluate the full trajectory. Use feedback and post-training to improve what the agent does next.'],
];
const channels = [['GitHub', 'https://github.com/Damon-GSY'], ['YouTube', 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA'], ['Bilibili', 'https://space.bilibili.com/358541297']];

function useCharacter({ root, sceneHost, canvas, settings, onChapter, onStatus }) {
  useEffect(() => {
    const stage = sceneHost.current;
    const page = root.current;
    const element = canvas.current;
    const story = page.querySelector('.rb-story');
    let scene;
    let request = 0;
    let last = 0;
    let elapsed = 0;
    let explosion = 0;
    let scrollProgress = 0;
    let progress = 0;
    let handoff = 0;
    let opening = 0;
    let closing = 0;
    let viewport = true;
    let chapter = 'hello';
    let pointerX = 0, pointerY = 0;
    let pointerTargetX = 0, pointerTargetY = 0;
    let dirty = true;
    let needsMeasure = true;
    let snapProgress = true;
    let lastGesture = -1;
    let removed = false;
    const measure = () => {
      const rect = story.getBoundingClientRect();
      const distance = Math.max(1, rect.height - stage.offsetHeight);
      scrollProgress = clamp(-rect.top / distance);
      needsMeasure = false;
    };
    try {
      scene = createRobotScene(element, { onReady: () => onStatus('ready') });
      onStatus('ready');
    } catch (error) {
      console.warn('Robot sculpture uses its rendered fallback.', error);
      onStatus('fallback');
    }
    const render = (now) => {
      request = 0;
      if (removed || document.hidden || !viewport) { last = 0; return; }
      if (needsMeasure) measure();
      const { paused, reduced, gesture } = settings.current;
      const wallDelta = last ? Math.max(0, (now - last) / 1000) : 0;
      last = now;
      const moving = !paused && !reduced;
      if (moving) elapsed += wallDelta;
      const response = 1 - Math.exp(-wallDelta * 11);
      progress = !moving || snapProgress ? scrollProgress : progress + (scrollProgress - progress) * response;
      snapProgress = false;
      if (Math.abs(progress - scrollProgress) < .0001) progress = scrollProgress;
      if (moving) {
        const gazeResponse = 1 - Math.exp(-wallDelta * 9);
        pointerX += (pointerTargetX - pointerX) * gazeResponse;
        pointerY += (pointerTargetY - pointerY) * gazeResponse;
      }
      opening = smooth((progress - .10) / .28);
      closing = smooth((progress - .67) / .20);
      explosion = opening * (1 - closing);
      handoff = smooth((progress - .82) / .18);
      const paper = smooth((progress - .14) / .14);
      const hello = 1 - smooth((progress - .10) / .14);
      const insideEnter = smooth((progress - .25) / .12);
      const insideExit = smooth((progress - .65) / .12);
      const inside = insideEnter * (1 - insideExit);
      const outro = smooth((progress - .75) / .12);
      const nextChapter = progress < .26 ? 'hello' : progress < .79 ? 'inspection' : 'handoff';
      if (reduced) {
        explosion = nextChapter === 'inspection' ? 1 : 0;
        handoff = nextChapter === 'handoff' ? 1 : 0;
      }
      if (nextChapter !== chapter) { chapter = nextChapter; onChapter(chapter); }
      if (moving || dirty || lastGesture !== gesture) {
        const paperAmount = reduced ? (nextChapter === 'hello' ? 0 : 1) : paper;
        const values = {
          '--rb-inspect': explosion,
          '--rb-paper-progress': paperAmount,
          '--rb-handoff': handoff,
          '--rb-hello': reduced ? Number(nextChapter === 'hello') : hello,
          '--rb-inside': reduced ? Number(nextChapter === 'inspection') : inside,
          '--rb-inside-y': `${(1 - insideEnter) * 24 - insideExit * 20}px`,
          '--rb-outro': reduced ? Number(nextChapter === 'handoff') : outro,
          '--rb-details': reduced ? Number(nextChapter === 'inspection') : inside * smooth((opening - .55) / .35),
        };
        for (const [name, value] of Object.entries(values)) stage.style.setProperty(name, String(value));
        stage.style.setProperty('--rb-chrome', paperAmount < .2 ? 'var(--rb-paper)' : paperAmount < .8 ? 'var(--rb-dark)' : 'var(--rb-blue)');
        stage.dataset.explosion = explosion.toFixed(3);
        stage.dataset.progress = progress.toFixed(4);
        stage.dataset.handoff = handoff.toFixed(3);
        scene?.update({ time: elapsed, pointerX, pointerY, explosion, paused, reduced, gesture });
        dirty = false;
        lastGesture = gesture;
      }
      if (moving || Math.abs(progress - scrollProgress) > .0001) request = requestAnimationFrame(render);
    };
    const schedule = () => { if (!request && !removed) request = requestAnimationFrame(render); };
    const resize = () => { needsMeasure = dirty = true; scene?.resize(); schedule(); };
    const scroll = () => { needsMeasure = dirty = true; schedule(); };
    const pointer = (event) => {
      if (event.pointerType === 'touch' || settings.current.paused || settings.current.reduced) return;
      const rect = stage.getBoundingClientRect();
      pointerTargetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      pointerTargetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      dirty = true; schedule();
    };
    const leave = () => {
      if (settings.current.paused || settings.current.reduced) return;
      pointerTargetX = pointerTargetY = 0; dirty = true; schedule();
    };
    const visibility = () => { last = 0; needsMeasure = dirty = true; schedule(); };
    const controls = () => { last = 0; dirty = true; schedule(); };
    const replay = () => { elapsed = 0; last = 0; dirty = true; schedule(); };
    const lost = () => onStatus('fallback');
    const observer = new IntersectionObserver(([entry]) => {
      if (!viewport && entry.isIntersecting) snapProgress = true;
      viewport = entry.isIntersecting;
      last = 0;
      needsMeasure = dirty = true;
      schedule();
    }, { rootMargin: '120px 0px' });
    observer.observe(stage);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    stage.addEventListener('pointermove', pointer);
    stage.addEventListener('pointerleave', leave);
    page.addEventListener('robot-controls', controls);
    page.addEventListener('robot-replay', replay);
    element.addEventListener('webglcontextlost', lost);
    window.GDamonRobot = { getMetrics: () => ({ ...scene?.getMetrics(), elapsed, explosion, progress, targetProgress: scrollProgress, opening, closing, handoff, chapter, pointer: [pointerX, pointerY], paused: settings.current.paused, reduced: settings.current.reduced }), capture: () => scene?.captureFrame() };
    schedule();
    return () => {
      removed = true;
      cancelAnimationFrame(request);
      observer.disconnect(); resizeObserver.disconnect();
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      stage.removeEventListener('pointermove', pointer); stage.removeEventListener('pointerleave', leave);
      page.removeEventListener('robot-controls', controls); page.removeEventListener('robot-replay', replay);
      element.removeEventListener('webglcontextlost', lost);
      scene?.dispose(); delete window.GDamonRobot;
    };
  }, [root, sceneHost, canvas, settings, onChapter, onStatus]);
}

export default function RobotPortfolio() {
  const root = useRef(null), sceneHost = useRef(null), canvas = useRef(null);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [paused, setPaused] = useState(false);
  const [chapter, setChapter] = useState('hello');
  const introduction = chapter === 'hello';
  const inspection = chapter === 'inspection';
  const handoff = chapter === 'handoff';
  const [status, setStatus] = useState('loading');
  const [greeting, setGreeting] = useState(false);
  const greetingTimer = useRef(null);
  const settings = useRef({ paused: false, reduced, gesture: 0 });
  useCharacter({ root, sceneHost, canvas, settings, onChapter: setChapter, onStatus: setStatus });

  useEffect(() => {
    settings.current.paused = paused;
    settings.current.reduced = reduced;
    root.current?.dispatchEvent(new Event('robot-controls'));
  }, [paused, reduced]);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Hello, human. — Damon Guo-Siyi';
    const theme = document.querySelector('meta[name="theme-color"]');
    const originalTheme = theme?.getAttribute('content');
    theme?.setAttribute('content', '#0757ed');
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => setReduced(media.matches);
    media.addEventListener('change', preference);
    const page = root.current;
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); }
    }), { threshold: .08 });
    page.querySelectorAll('[data-reveal]').forEach(element => reveals.observe(element));
    page.classList.add('rb-reveals-ready');
    return () => {
      document.title = originalTitle;
      if (originalTheme != null) theme?.setAttribute('content', originalTheme);
      media.removeEventListener('change', preference);
      reveals.disconnect(); clearTimeout(greetingTimer.current);
    };
  }, []);

  const goToScene = (open) => {
    const story = root.current.querySelector('.rb-story');
    const top = story.getBoundingClientRect().top + window.scrollY;
    const distance = Math.max(1, story.offsetHeight - sceneHost.current.offsetHeight);
    window.scrollTo({ top: top + (open ? distance * .49 : 0), behavior: reduced ? 'instant' : 'smooth' });
  };
  const hello = () => {
    settings.current.gesture += 1;
    root.current.dispatchEvent(new Event('robot-controls'));
    setGreeting(true); clearTimeout(greetingTimer.current);
    greetingTimer.current = setTimeout(() => setGreeting(false), 2200);
  };
  const replay = () => {
    goToScene(false); setPaused(false);
    root.current.dispatchEvent(new Event('robot-replay'));
  };

  return (
    <main className="rb-page" id="rb-top" ref={root} data-motion={reduced ? 'reduced' : paused ? 'paused' : 'active'}>
      <a href="#rb-work" className="rb-skip">Skip to selected work</a>
      <section className="rb-story" aria-label="Meet the agent and look inside">
        <div className="rb-stage" ref={sceneHost} data-inspection={inspection} data-phase={chapter}>
          <header className="rb-header">
            <Link to="/" className="rb-brand" aria-label="GDamon — all previews">gdamon<Asterisk aria-hidden="true" /></Link>
            <nav aria-label="Portfolio navigation"><a href="#rb-work">Work</a><a href="#rb-about">About</a><a href="#rb-notes">Notes</a><a href="#rb-contact" className="rb-nav-contact">Let’s talk <ArrowUpRight size={16} aria-hidden="true" /></a></nav>
            <div className="rb-identity"><span>Damon Guo-Siyi</span><small>AI RESEARCHER AT ALIBABA</small></div>
          </header>
          <div className="rb-cross rb-cross-one" aria-hidden="true"><Plus strokeWidth={.5} /></div>
          <div className="rb-cross rb-cross-two" aria-hidden="true"><Plus strokeWidth={.5} /></div>
          <div className="rb-hello-copy" aria-hidden={!introduction}>
            <p className="rb-overline">Damon Guo-Siyi / AI researcher &amp; LLM engineer</p>
            <h1>HELLO,<br />HUMAN<span>.</span></h1>
            <div className="rb-intro-bottom"><p>I build agents that turn<br />reasoning into real work.</p><button type="button" className="rb-primary" onClick={() => goToScene(true)} tabIndex={introduction ? 0 : -1}>Meet the system <ArrowDown size={21} aria-hidden="true" /></button></div>
          </div>
          <div className="rb-inside-copy" aria-hidden={!inspection}>
            <p className="rb-overline">Same curiosity. A closer look.</p>
            <h2>INSIDE<br />THE AGENT<span>.</span></h2>
            <p className="rb-inside-description">A useful agent is more than an answer.<br />It plans, takes action, and learns<br />from what happens next.</p>
            <button type="button" className="rb-inline-button" onClick={() => goToScene(false)} tabIndex={inspection ? 0 : -1}>Reassemble <RotateCcw size={15} aria-hidden="true" /></button>
          </div>
          <div className="rb-outro-copy" aria-hidden={!handoff}>
            <p className="rb-overline">The parts become the practice.</p>
            <h2>NOW,<br />THE WORK<span>.</span></h2>
            <p className="rb-inside-description">From thoughtful decisions<br />to systems people can use.</p>
            <button type="button" className="rb-inline-button" onClick={() => root.current.querySelector('#rb-work').scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })} tabIndex={handoff ? 0 : -1}>See selected work <ArrowDown size={15} aria-hidden="true" /></button>
          </div>
          <div className="rb-sculpture" data-status={status}>
            <canvas ref={canvas} aria-label="A ceramic robot with luminous eyes. Its shell opens as you scroll, revealing a mechanical core." role="img" />
            {status === 'fallback' && <img className="rb-fallback" src="/robot-assets/robot-still.webp" alt="White ceramic robot with lime eyes and machined metal details" />}
            {status === 'loading' && <span className="rb-scene-loading">WAKING UP…</span>}
          </div>
          <div className="rb-callouts" aria-hidden="true"><span className="rb-callout rb-callout-plan"><i /><b>01 / PLAN</b><small>Make the next decision.</small></span><span className="rb-callout rb-callout-act"><i /><b>02 / ACT</b><small>Give intelligence tools.</small></span><span className="rb-callout rb-callout-learn"><i /><b>03 / LEARN</b><small>Close the loop.</small></span></div>
          <button className="rb-say-hello" type="button" onClick={hello} disabled={paused || reduced || status !== 'ready'} aria-hidden={!introduction} aria-label="Say hello to the robot" tabIndex={introduction ? 0 : -1}><span className="rb-hello-icon"><AudioLines size={23} aria-hidden="true" /></span><span aria-live="polite">{greeting ? 'Hello, human.' : 'Say hello'}</span><span className="rb-short-rule" /></button>
          <div className="rb-stage-bottom"><span className="rb-scene-number">{inspection ? '02 / UNDER THE SURFACE' : handoff ? '03 / BUILT FOR THE REAL WORLD' : '01 / A FRIENDLY INTRODUCTION'}</span><span className="rb-scroll-cue">{inspection ? 'KEEP SCROLLING TO BRING IT TOGETHER' : handoff ? 'FROM RESEARCH TO REAL SYSTEMS' : 'SCROLL TO OPEN MY MIND'}<ArrowDown size={14} aria-hidden="true" /></span><div className="rb-motion-controls"><button onClick={() => setPaused(p => !p)} disabled={reduced} aria-label={reduced ? 'Reduced motion enabled' : paused ? 'Resume motion' : 'Pause motion'}>{paused || reduced ? <Play size={12} /> : <Pause size={12} />}<span>{reduced ? 'Motion off' : paused ? 'Resume' : 'Pause'}</span></button><button onClick={replay} disabled={reduced} aria-label="Replay robot entrance"><RotateCcw size={13} /></button></div></div>
        </div>
      </section>

      <section className="rb-systems" aria-label="How useful agents work"><div className="rb-system-lead"><Asterisk size={46} strokeWidth={1.3} aria-hidden="true" /><span>THE PARTS<br />BECOME THE PRACTICE.</span></div>{systems.map(([name, title, description], i) => <article key={name} data-reveal><span className="rb-micro">0{i + 1} / {name}</span><h3>{title}</h3><p>{description}</p></article>)}</section>

      <section className="rb-work rb-section" id="rb-work" aria-labelledby="rb-work-title">
        <div className="rb-section-bar"><span>01 / SELECTED WORK</span><Link to="/projects">All projects <ArrowUpRight size={15} /></Link></div>
        <div className="rb-section-heading" data-reveal><h2 id="rb-work-title">INTELLIGENCE,<br />PUT TO WORK<span>.</span></h2><p>A few things I’ve helped move<br />from possibility to practice.<CornerDownRight size={35} strokeWidth={1} aria-hidden="true" /></p></div>
        <div className="rb-work-grid">{work.map((project, i) => <Link key={project.id} className={`rb-project rb-project-${i + 1}`} to={`/projects#${project.id}`} data-reveal><div className="rb-project-top"><span>0{i + 1} / {project.kicker.toUpperCase()}</span><ArrowUpRight size={25} strokeWidth={1.3} /></div><div className="rb-project-figure"><strong>{workDetails[i][0]}</strong><span>{workDetails[i][1]}</span></div><div className="rb-project-info"><h3>{project.title}</h3><p>{workDetails[i][2]}</p></div><div className="rb-project-bottom"><span>{project.tags.join(' / ')}</span><span>{project.year}</span></div></Link>)}</div>
      </section>

      <section className="rb-about rb-section" id="rb-about" aria-labelledby="rb-about-title"><div className="rb-section-bar"><span>02 / HUMAN IN THE LOOP</span><span>HANGZHOU, CHINA</span></div><div className="rb-about-grid"><div data-reveal><h2 id="rb-about-title">THE HUMAN<br />BEHIND<br />THE AGENT<span>.</span></h2><span className="rb-about-signature">Damon Guo-Siyi <Asterisk size={36} strokeWidth={1} /></span></div><div className="rb-about-copy" data-reveal><p className="rb-about-intro">Curiosity is the<br />part you can’t automate.</p><p>I’m Damon, an AI researcher and LLM engineer at Alibaba. I work on agentic reinforcement learning, post-training, and evaluation — connecting research with the demands of production.</p><p>My education took me through NUS and UNSW. Today, I’m interested in what happens after a model gives an answer: the decisions, tools, and feedback that make it useful.</p><Link className="rb-about-link" to="/about">A little more about me <ArrowUpRight size={20} /></Link></div></div><div className="rb-research-list">{[['Agentic RL', 'Learning better decisions, one step at a time.'], ['Post-training', 'Turning model capability into useful behavior.'], ['Evaluation', 'Understanding the whole trajectory.']].map(([title, description], i) => <div key={title} data-reveal><span>0{i + 1}</span><h3>{title}</h3><p>{description}</p><Plus size={21} strokeWidth={1} aria-hidden="true" /></div>)}</div></section>

      <section className="rb-notes rb-section" id="rb-notes" aria-labelledby="rb-notes-title"><div className="rb-section-bar"><span>03 / FROM THE NOTEBOOK</span><Link to="/blog">All writing <ArrowUpRight size={15} /></Link></div><h2 id="rb-notes-title" data-reveal>FIELD NOTES<span>.</span></h2><div className="rb-notes-grid">{posts.slice(0, 3).map((post, i) => <Link key={post.slug} to={`/blog/${post.slug}`} className="rb-note" data-reveal><div className="rb-note-top"><span>{post.category}</span><ArrowUpRight size={22} /></div><span className="rb-note-index" aria-hidden="true">(0{i + 1})</span><h3>{post.title}</h3><p>{post.excerpt}</p><span className="rb-note-time">{post.readingTime}<ArrowRight size={16} /></span></Link>)}</div></section>

      <footer className="rb-contact rb-section" id="rb-contact"><div className="rb-section-bar"><span>04 / YOUR TURN</span><Link to="/">All experiments <ArrowUpRight size={15} /></Link></div><a className="rb-contact-title" href="mailto:hello@damon.ai" data-reveal>LET’S MAKE<br />IT USEFUL<span>.</span><ArrowUpRight strokeWidth={1} aria-hidden="true" /></a><div className="rb-contact-bottom"><div><p>Working on agents, evaluation,<br />or a good research question?</p><a href="mailto:hello@damon.ai">hello@damon.ai <ArrowUpRight size={17} /></a></div><nav aria-label="Find Damon online">{channels.map(([label, url]) => <a href={url} key={label} target="_blank" rel="noreferrer">{label}<ArrowUpRight size={13} /></a>)}</nav><a href="#rb-top" className="rb-back-top">Back to the human <ArrowUpRight size={15} /></a></div><div className="rb-colophon"><span>DAMON GUO-SIYI</span><span>A LITTLE CURIOSITY GOES A LONG WAY.</span></div></footer>
    </main>
  );
}
