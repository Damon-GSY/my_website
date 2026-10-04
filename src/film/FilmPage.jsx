import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Asterisk, MoveUpRight } from 'lucide-react';
import '@fontsource/anton/latin-400.css';
import { projects } from '../data/projects';
import { aboutProfile } from '../data/about';
import { createFilm } from './filmScene';
import './film.css';

const FilmArchive = lazy(() => import('./FilmArchive'));
const START = .55;
const END = 18;
const CHAPTERS = [
  { id: 'fw-human', name: 'Human', time: START, number: '01' },
  { id: 'fw-agent', name: 'Agent', time: 6.85, number: '02' },
  { id: 'fw-signal', name: 'Signal', time: 12.85, number: '03' },
];
const selectedWork = [projects[0], projects[1], projects[3]];
const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

function ScrollPortfolio() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [status, setStatus] = useState('loading');
  const [chapter, setChapter] = useState(0);
  const [introVisible, setIntroVisible] = useState(true);
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
    document.title = 'GDamon — Intelligence in motion';
    let engine;
    let observer;
    let frame = 0;
    let disposed = false;
    let failed = false;
    let last = 0;
    let current = START;
    let target = START;
    let progress = 0;
    let currentChapter = 0;
    let introduction = true;
    let width = 0;
    let height = 0;
    const story = storyRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const report = () => ({
      ...engine?.getMetrics(),
      control: 'scroll', time: current, targetTime: target, scrollProgress: progress, progress,
      chapter: CHAPTERS[currentChapter].name.toLowerCase(),
      settled: Math.abs(current - target) < .001,
      reduced, static: reduced || failed, width, height,
    });
    const fail = (error) => {
      failed = true;
      cancelAnimationFrame(frame);
      frame = 0;
      engine?.dispose();
      engine = null;
      root.dataset.sceneError = error instanceof Error ? error.message : 'The interactive artwork is unavailable.';
      setStatus('fallback');
      setIntroVisible(true);
    };
    const paint = () => {
      if (!engine || failed || disposed) return;
      try {
        engine.seek(current);
        const robot = engine.getMetrics().robot;
        if (robot && robot.renderer !== 'three') throw new Error(robot.failure || 'The 3D scene is unavailable.');
        const nextChapter = current < 6 ? 0 : current < 12 ? 1 : 2;
        if (nextChapter !== currentChapter) { currentChapter = nextChapter; setChapter(nextChapter); }
        const nextIntroduction = current < 1.35;
        if (nextIntroduction !== introduction) { introduction = nextIntroduction; setIntroVisible(nextIntroduction); }
        stage.style.setProperty('--fw-progress', progress);
      } catch (error) { fail(error); }
    };
    const tick = (now) => {
      frame = 0;
      if (disposed || failed || reduced || document.hidden || !engine) return;
      const dt = last ? Math.max(0, (now - last) / 1000) : 1 / 60;
      last = now;
      current += (target - current) * (1 - Math.exp(-dt * 12));
      if (Math.abs(current - target) < .001) current = target;
      paint();
      if (Math.abs(current - target) >= .001 && !failed) frame = requestAnimationFrame(tick);
      else last = 0;
    };
    const requestPaint = () => {
      if (!frame && engine && !failed && !reduced && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const readScroll = () => {
      const rect = story.getBoundingClientRect();
      const travel = Math.max(1, story.offsetHeight - stage.clientHeight);
      progress = clamp(-rect.top / travel);
      target = START + (END - START) * progress;
      if (Math.abs(target - current) > .0001) requestPaint();
    };
    const resize = () => {
      if (!engine || failed || disposed) return;
      width = stage.clientWidth;
      height = stage.clientHeight;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const top = root.querySelector('.fw-header').getBoundingClientRect().height * dpr;
      try {
        engine.setSize(Math.round(width * dpr), Math.round(height * dpr), { top, bottom: 20 * dpr });
        readScroll();
        paint();
      } catch (error) { fail(error); }
    };
    const visibility = () => {
      last = 0;
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
      else { readScroll(); requestPaint(); }
    };
    const api = {
      getMetrics: report,
      scrollToChapter: (index) => {
        const item = CHAPTERS[clamp(Math.round(index), 0, 2)];
        document.getElementById(item.id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
      },
    };
    window.GDamonSite = api;

    const initialize = async () => {
      setStatus(reduced ? 'static' : 'loading');
      setIntroVisible(true);
      if (reduced) return;
      try {
        await document.fonts.load('400 120px Anton');
        await document.fonts.ready;
        if (disposed) return;
        engine = createFilm(canvas, { wipeDuration: .7 });
        resize();
        if (failed) return;
        setStatus('ready');
        observer = new ResizeObserver(resize);
        observer.observe(stage);
        window.addEventListener('scroll', readScroll, { passive: true });
        window.visualViewport?.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', visibility);
        readScroll();
      } catch (error) { fail(error); }
    };
    initialize();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', readScroll);
      window.visualViewport?.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
      engine?.dispose();
      if (window.GDamonSite === api) delete window.GDamonSite;
      document.title = previousTitle;
    };
  }, [reduced]);

  return (
    <main className={`fw-page${staticMode ? ' fw-page--static' : ''}`} ref={rootRef} data-scene={status}>
      <a className="fw-skip" href="#fw-work">Skip to selected work</a>
      <section className="fw-story" ref={storyRef} aria-label="Meet Damon and his approach to AI">
        {CHAPTERS.map((item) => {
          const ratio = (item.time - START) / (END - START);
          return <span key={item.id} className="fw-anchor" id={item.id} style={{ top: `calc(${ratio * 100}% - ${ratio * 100}svh)` }} aria-hidden="true" />;
        })}
        <div className="fw-stage" ref={stageRef}>
          <canvas className="fw-canvas" ref={canvasRef} width="1440" height="900" aria-hidden="true" />
          {(staticMode || status === 'loading') && <div className="fw-static-art" aria-hidden="true"><span>HELLO,<br />HUMAN.</span><img src="/robot-assets/robot-still.webp" alt="" width="900" height="900" /></div>}
          <header className="fw-header">
            <a className="fw-brand" href="#fw-human" aria-label="GDamon — back to the beginning">gdamon<Asterisk aria-hidden="true" /></a>
            {!staticMode && <nav className="fw-chapter-nav" aria-label="Explore the story">{CHAPTERS.map((item, index) => <a key={item.id} href={`#${item.id}`} aria-current={index === chapter ? 'step' : undefined}><span>{item.number}</span>{item.name}</a>)}</nav>}
            <nav className="fw-nav" aria-label="Main navigation"><a href="#fw-work">Work</a><a href="#fw-about">About</a><a href="#fw-contact">Let’s talk<ArrowUpRight size={14} aria-hidden="true" /></a></nav>
          </header>
          <div className={`fw-introduction${introVisible ? ' is-visible' : ''}`}>
            <h1>Damon Guo-Siyi</h1>
            <p>AI researcher &amp; LLM engineer.<br />Alibaba. Hangzhou. Building what’s next.</p>
          </div>
          <a className={`fw-scroll-invite${introVisible ? ' is-visible' : ''}`} href={staticMode ? '#fw-work' : '#fw-agent'}><span>{staticMode ? 'Explore the work' : 'Scroll to meet the system'}</span><ArrowDown size={18} aria-hidden="true" /></a>
          <a className="fw-skip-story" href="#fw-work">Selected work<ArrowUpRight size={15} aria-hidden="true" /></a>
        </div>
      </section>
      <section className="fw-work" id="fw-work" aria-labelledby="fw-work-title">
        <div className="fw-section-label"><span>01 / Selected work</span><Link to="/projects">All projects<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        <div className="fw-work-heading"><h2 id="fw-work-title">LESS DEMO.<br /><span>MORE DOING.</span></h2><p>I work across agentic reinforcement learning, post-training, and evaluation to build agent systems that work in the real world.</p></div>
        <div className="fw-projects">{selectedWork.map((project, index) => <Link className="fw-project" key={project.id} to={`/projects#${project.id}`}>
          <span className="fw-project-number">0{index + 1}</span>
          <div className="fw-project-content"><p className="fw-project-kicker">{project.kicker} / {project.stage}</p><h3>{project.title}</h3><p className="fw-project-description">{project.description}</p><span className="fw-project-tags">{project.tags.join(' · ')}</span></div>
          <MoveUpRight className="fw-project-arrow" aria-hidden="true" />
        </Link>)}</div>
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
