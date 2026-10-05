import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Asterisk, MoveUpRight } from 'lucide-react';
import '@fontsource/anton/latin-400.css';
import { projects } from '../data/projects';
import { aboutProfile } from '../data/about';
import { createFilm } from './filmScene';
import { storyState } from './storyFlow';
import './film.css';

const FilmArchive = lazy(() => import('./FilmArchive'));
const START = .55;
const END = 18;
const CHAPTERS = [
  {
    id: 'fw-human', name: 'Train', time: START, number: '01', theme: 'blue',
    label: 'Post-training / Domain models', heading: ['TEACH THE MODEL.', 'TEST THE CAPABILITY.'],
    description: 'At Alibaba, I build supply-chain LLMs: define the benchmark first, then improve knowledge and tool use through continual pretraining, SFT, and reinforcement learning.',
    method: ['Benchmark', 'Train', 'Evaluate'],
    cases: [
      { id: 'supply-chain-domain-llm', metric: 'Two axes.', label: 'Knowledge QA + tool use', note: 'Internal SOTA on the domain benchmark.' },
      { id: 'product-attribute-rl', metric: 'GRPO.', label: 'Multi-objective reward design', note: 'Conditional rewards and variance control for stable training.' },
    ],
  },
  {
    id: 'fw-agent', name: 'Deploy', time: 6.85, number: '02', theme: 'ink',
    label: 'Agentic RL / Production systems', heading: ['GIVE AGENTS TOOLS.', 'AND BOUNDARIES.'],
    description: 'I train agents to choose from a changing tool pool and design how they act in production: progressive confirmations, clear automation boundaries, and handoffs when an exception needs a human.',
    method: ['Resolve tools', 'Execute', 'Hand off'],
    cases: [
      { id: 'dynamic-tool-resolution-agents', metric: '100+', label: 'Dynamically registered tools', note: '90% less manual ticket handling in supported internal workflows.' },
      { id: 'supply-chain-agent-system', metric: '12', label: 'Supply-chain scenarios', note: 'Exception handoff below 1 second in the deployed framework.' },
    ],
  },
  {
    id: 'fw-signal', name: 'Evaluate', time: 12.85, number: '03', theme: 'ink',
    label: 'Agent evaluation / Research', heading: ['LOOK BEYOND', 'THE FINAL ANSWER.'],
    description: 'I study what happens between turns: planning, tool use, memory, and recovery. My research connects evaluation taxonomies with realistic tasks, so failures become something we can measure and improve.',
    method: ['Planning', 'Tool use', 'Memory'],
    cases: [
      { id: 'multi-turn-agent-evaluation', metric: '~250', label: 'Papers reviewed', note: 'A taxonomy for multi-turn agents and intermediate-step judgment.' },
      { id: 'supchain-bench', metric: '530', label: 'Annotated real-world samples', note: 'Logistics, fulfillment, finance, and customs in SupChain-Bench.' },
    ],
  },
];
const selectedWork = [projects[0], projects[1], projects[2], projects[3], projects[4]];
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function ScrollPortfolio() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [status, setStatus] = useState('loading');
  const [chapter, setChapter] = useState(0);
  const rootRef = useRef(null);
  const storyRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const staticMode = reduced || status === 'fallback';

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Damon Guo-Siyi — Training models. Building agents. Evaluating systems.';
    let engine;
    let observer;
    let frame = 0;
    let disposed = false;
    let failed = false;
    let last = 0;
    let current = START;
    let target = START;
    let progress = 0;
    let initialized = false;
    let scrollDirty = true;
    let frameCount = 0;
    let lastFrameMs = 0;
    let deltaTime = 0;
    let readability = [1, 0, 0];
    let currentChapter = 0;
    let width = 0;
    let height = 0;
    const story = storyRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const articles = [...stage.querySelectorAll('.fw-story-chapter')];
    const clearNarrativeStyles = () => articles.forEach((article) => { article.style.opacity = ''; article.style.visibility = ''; article.style.removeProperty('--fw-reveal-y'); });
    const report = () => ({
      ...engine?.getMetrics(),
      control: 'scroll', time: current, targetTime: target, scrollProgress: progress, progress,
      chapter: CHAPTERS[currentChapter].name.toLowerCase(),
      settled: Math.abs(current - target) < .001,
      motion: { running: !!frame, frames: frameCount, frameMs: lastFrameMs, deltaTime, renderedProgress: clamp((current - START) / (END - START)), readability: [...readability], clock: 'native-scroll' },
      reduced, static: reduced || failed, width, height,
    });
    const fail = (error) => {
      failed = true;
      cancelAnimationFrame(frame);
      frame = 0;
      engine?.dispose();
      engine = null;
      root.dataset.sceneError = error instanceof Error ? error.message : 'The interactive artwork is unavailable.';
      clearNarrativeStyles();
      setStatus('fallback');
      setChapter(0);
    };
    const contextLost = (event) => {
      event.preventDefault();
      if (!disposed && !failed && !reduced) fail(new Error('The graphics context was lost. All project information remains available below.'));
    };
    canvas.addEventListener('webglcontextlost', contextLost);
    const paint = () => {
      if (!engine || failed || disposed) return;
      try {
        engine.seek(current);
        const robot = engine.getMetrics().robot;
        if (robot && robot.renderer !== 'three') throw new Error(robot.failure || 'The 3D scene is unavailable.');
        const state = storyState(current);
        const nextChapter = state.chapter;
        if (nextChapter !== currentChapter) { currentChapter = nextChapter; setChapter(nextChapter); }
        readability = state.weights.map((weight) => { const amount = clamp((weight - .42) / .58); return amount * amount * (3 - 2 * amount); });
        articles.forEach((article, index) => {
          const opacity = readability[index];
          article.style.opacity = opacity;
          article.style.visibility = opacity > .001 ? 'visible' : 'hidden';
          article.style.setProperty('--fw-reveal-y', `${(index < nextChapter ? -1 : 1) * (1 - opacity) * 14}px`);
        });
        stage.style.setProperty('--fw-progress', clamp((current - START) / (END - START)));
        frameCount++;
      } catch (error) { fail(error); }
    };
    const tick = (now) => {
      frame = 0;
      if (disposed || failed || reduced || document.hidden || !engine) return;
      const start = performance.now();
      if (scrollDirty) measureScroll();
      if (current === target) { last = 0; return; }
      const dt = last ? clamp((now - last) / 1000, 0, .05) : 1 / 60;
      deltaTime = dt;
      last = now;
      current += (target - current) * (1 - Math.exp(-dt * 14));
      if (Math.abs(current - target) < .001) current = target;
      paint();
      lastFrameMs = performance.now() - start;
      if (Math.abs(current - target) >= .001 && !failed) frame = requestAnimationFrame(tick);
      else last = 0;
    };
    const requestPaint = () => {
      if (!frame && engine && !failed && !reduced && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const measureScroll = () => {
      scrollDirty = false;
      const rect = story.getBoundingClientRect();
      const travel = Math.max(1, story.offsetHeight - stage.clientHeight);
      progress = clamp(-rect.top / travel);
      target = START + (END - START) * progress;
    };
    const readScroll = () => { scrollDirty = true; requestPaint(); };
    const resize = () => {
      if (!engine || failed || disposed) return;
      width = stage.clientWidth;
      height = stage.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const top = root.querySelector('.fw-header').getBoundingClientRect().height * dpr;
      let artworkBounds = null;
      if (width / height <= 1.1 && height <= 600) {
        const headingBottom = Math.max(...Array.from(stage.querySelectorAll('.fw-story-heading'), (element) => element.offsetTop + element.offsetHeight));
        const explanationTop = Math.min(...Array.from(stage.querySelectorAll('.fw-story-explanation'), (element) => element.offsetTop));
        artworkBounds = { x: width * .1 * dpr, y: (headingBottom + 12) * dpr, width: width * .8 * dpr, height: Math.max(1, explanationTop - headingBottom - 24) * dpr };
      }
      try {
        engine.setSize(Math.round(width * dpr), Math.round(height * dpr), { top, bottom: 20 * dpr, artworkBounds });
        measureScroll();
        if (!initialized) current = target;
        paint();
        requestPaint();
      } catch (error) { fail(error); }
    };
    const visibility = () => {
      last = 0;
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else { readScroll(); requestPaint(); }
    };
    const restoreAnchor = () => {
      if (disposed) return;
      const id = window.location.hash.slice(1);
      if (!id.startsWith('fw-')) return;
      const chapterIndex = CHAPTERS.findIndex((item) => item.id === id);
      const anchor = (reduced || failed) && chapterIndex >= 0 ? articles[chapterIndex] : document.getElementById(id);
      anchor?.scrollIntoView({ behavior: 'instant', block: 'start' });
    };
    const api = {
      getMetrics: report,
      capture: () => engine?.capture(current),
      scrollToChapter: (index) => {
        const item = CHAPTERS[clamp(Math.round(index), 0, 2)];
        document.getElementById(item.id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
      },
    };
    window.GDamonSite = api;

    const initialize = async () => {
      setStatus(reduced ? 'static' : 'loading');
      setChapter(0);
      if (reduced) { clearNarrativeStyles(); requestAnimationFrame(restoreAnchor); return; }
      try {
        await document.fonts.load('400 120px Anton');
        await document.fonts.ready;
        if (disposed) return;
        engine = createFilm(canvas, { storyArtwork: true });
        restoreAnchor();
        resize();
        initialized = true;
        if (failed) return;
        setStatus('ready');
        observer = new ResizeObserver(resize);
        observer.observe(stage);
        window.addEventListener('scroll', readScroll, { passive: true });
        window.visualViewport?.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', visibility);
        readScroll();
      } catch (error) { fail(error); requestAnimationFrame(restoreAnchor); }
    };
    initialize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', readScroll);
      window.visualViewport?.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('webglcontextlost', contextLost);
      engine?.dispose();
      if (window.GDamonSite === api) delete window.GDamonSite;
      document.title = previousTitle;
    };
  }, [reduced]);

  return (
    <main className={`fw-page${staticMode ? ' fw-page--static' : ''}`} ref={rootRef} data-scene={status}>
      <a className="fw-skip" href="#fw-work">Skip to selected work</a>
      <section className="fw-story" ref={storyRef} aria-label="How I train models, deploy agents, and evaluate their behavior">
        {CHAPTERS.map((item) => {
          const ratio = (item.time - START) / (END - START);
          return <span key={item.id} className="fw-anchor" id={item.id} style={{ top: `calc(${ratio * 100}% - ${ratio * 100}svh)` }} aria-hidden="true" />;
        })}
        <div className={`fw-stage fw-stage--${CHAPTERS[chapter].theme}`} ref={stageRef}>
          <canvas className="fw-canvas" ref={canvasRef} width="1440" height="900" aria-hidden="true" />
          {(staticMode || status === 'loading') && <div className="fw-static-art" aria-hidden="true"><img src="/robot-assets/robot-still.webp" alt="" width="900" height="900" /></div>}
          <header className="fw-header">
            <a className="fw-brand" href="#fw-human" aria-label="GDamon — back to the beginning">gdamon<Asterisk aria-hidden="true" /></a>
            {!staticMode && <nav className="fw-chapter-nav" aria-label="Explore the story">{CHAPTERS.map((item, index) => <a key={item.id} href={`#${item.id}`} aria-current={index === chapter ? 'step' : undefined}><span>{item.number}</span>{item.name}</a>)}</nav>}
            <nav className="fw-nav" aria-label="Main navigation"><a href="#fw-work">Work</a><a href="#fw-about">About</a><a href="#fw-contact">Let’s talk<ArrowUpRight size={14} aria-hidden="true" /></a></nav>
          </header>
          <div className="fw-identity"><h1>Damon Guo-Siyi</h1><p>AI researcher &amp; LLM engineer at Alibaba</p></div>
          <div className="fw-story-chapters">
            {CHAPTERS.map((item, index) => <article className={`fw-story-chapter${chapter === index ? ' is-active' : ''}`} key={item.id} aria-hidden={!staticMode && chapter !== index} inert={!staticMode && chapter !== index}>
              <div className="fw-story-heading"><p className="fw-story-label">{item.number} / {item.label}</p><h2>{item.heading.map((line) => <span key={line}>{line}</span>)}</h2></div>
              <div className="fw-story-explanation"><p>{item.description}</p><ol className="fw-method">{item.method.map((step) => <li key={step}>{step}</li>)}</ol></div>
              <div className="fw-story-evidence">{item.cases.map((itemCase) => {
                const project = projects.find((entry) => entry.id === itemCase.id);
                return <Link className="fw-evidence-link" key={itemCase.id} to={`/projects#${itemCase.id}`}><div className="fw-evidence-measure"><strong>{itemCase.metric}</strong><span>{itemCase.label}</span></div><div className="fw-evidence-description"><h3>{project.title}<ArrowUpRight size={15} aria-hidden="true" /></h3><p>{itemCase.note}</p></div></Link>;
              })}</div>
            </article>)}
          </div>
          <a className="fw-scroll-invite is-visible" href={staticMode || chapter === 2 ? '#fw-work' : `#${CHAPTERS[chapter + 1].id}`}><span>{staticMode || chapter === 2 ? 'Explore the case studies' : `Scroll to ${CHAPTERS[chapter + 1].name.toLowerCase()}`}</span><ArrowDown size={18} aria-hidden="true" /></a>
          <a className="fw-skip-story" href="#fw-work">All selected work<ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>
      </section>
      <section className="fw-work" id="fw-work" aria-labelledby="fw-work-title">
        <div className="fw-section-label"><span>01 / Selected work</span><Link to="/projects">All projects<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        <div className="fw-work-heading"><h2 id="fw-work-title">BUILT. TRAINED.<br /><span>EVALUATED.</span></h2><p>Production systems at Alibaba and research into how agents plan, use tools, and recover. Here is what I contributed and what changed.</p></div>
        <div className="fw-projects">{selectedWork.map((project, index) => <Link className="fw-project" key={project.id} to={`/projects#${project.id}`}>
          <span className="fw-project-number">0{index + 1}</span>
          <div className="fw-project-content"><p className="fw-project-kicker">{project.kicker} / {project.stage}</p><h3>{project.title}</h3><p className="fw-project-description">{project.description}</p><div className="fw-project-contribution"><span>My work</span><p>{project.details[0]}</p></div><div className="fw-project-outcome"><span>{project.category === 'production' ? 'Reported internal outcome' : 'Research contribution'}</span><p>{project.outcome}</p></div><span className="fw-project-tags">{project.tags.join(' · ')}</span></div>
          <MoveUpRight className="fw-project-arrow" aria-hidden="true" />
        </Link>)}</div>
        <p className="fw-outcome-context">Production figures describe supported internal workflows at Alibaba; they are not general benchmark results.</p>
      </section>
      <section className="fw-about" id="fw-about" aria-labelledby="fw-about-title">
        <div className="fw-section-label"><span>02 / The human behind the agent</span><Asterisk size={21} aria-hidden="true" /></div>
        <div className="fw-about-main"><h2 id="fw-about-title">CURIOUS<br />BY DEFAULT<span>.</span></h2><div className="fw-about-copy"><p className="fw-about-lead">I’m Damon.<br />I make intelligence useful.</p><p>{aboutProfile.intro}</p><p>{aboutProfile.focus}</p><Link to="/about">More about me<ArrowUpRight size={18} aria-hidden="true" /></Link><Link to="/blog" className="fw-notes-link">Research notes<ArrowUpRight size={18} aria-hidden="true" /></Link></div></div>
        <dl className="fw-facts"><div><dt>Currently</dt><dd>Alibaba</dd><span>LLM engineer · Hangzhou</span></div><div><dt>Education</dt><dd>NUS / UNSW</dd><span>Statistics / Computer science</span></div><div><dt>Always exploring</dt><dd>What comes next?</dd><span>Agents · Research · Making things</span></div></dl>
      </section>
      <section className="fw-contact" id="fw-contact" aria-labelledby="fw-contact-title">
        <div className="fw-section-label"><span>03 / Start a conversation</span><span>Hangzhou, China</span></div>
        <h2 id="fw-contact-title">LET’S MAKE<br />IT <span>USEFUL.</span><Asterisk aria-hidden="true" /></h2>
        <div className="fw-contact-row"><a className="fw-email" href="mailto:hello@damon.ai">hello@damon.ai<ArrowUpRight aria-hidden="true" /></a><p>Research, collaboration,<br />or a good idea. Say hello.</p></div>
        <footer className="fw-footer"><a href="#fw-human" className="fw-footer-brand">gdamon<Asterisk size={18} aria-hidden="true" /></a><div><a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer">GitHub<ArrowUpRight size={13} aria-hidden="true" /></a><a href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA" target="_blank" rel="noreferrer">YouTube<ArrowUpRight size={13} aria-hidden="true" /></a><Link to="/">All studies<ArrowUpRight size={13} aria-hidden="true" /></Link></div><span>Made with curiosity.</span></footer>
      </section>
    </main>
  );
}

export default function FilmPage() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('render') === '1' || params.get('view') === 'player') return <Suspense fallback={null}><FilmArchive /></Suspense>;
  return <ScrollPortfolio />;
}
