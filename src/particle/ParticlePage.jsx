import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { projects } from '../data/projects';
import './particle.css';

const topics = ['Agentic RL', 'Tool use', 'Post-training', 'Evaluation', 'Planning', 'Memory', 'Reasoning', 'Deployment'];
const selectedProjects = projects.filter((project) => [
  'supply-chain-agent-system', 'dynamic-tool-resolution-agents',
  'supply-chain-domain-llm', 'multi-turn-agent-evaluation',
].includes(project.id));
const projectSummaries = [
  'Multi-turn agents that connect planning, tool use, and human judgment in real supply-chain operations.',
  'Learning to find and use the right tools in an environment that keeps changing.',
  'From domain knowledge to useful behavior through continual pretraining, SFT, and RL.',
  'A framework for evaluating planning, memory, and tool use across a conversation.',
];

const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (from, to, value) => {
  const amount = clamp((value - from) / (to - from));
  return amount * amount * (3 - 2 * amount);
};

function PixelTitle({ children }) {
  let character = 0;
  return children.split(' ').map((word, index) => (
    <Fragment key={`${word}-${index}`}>
      {index > 0 && ' '}
      <span className="particle-word" aria-hidden="true">
        {[...word].map((letter) => {
          const position = character++;
          return <span key={position} style={{ '--character': position }}>{letter}</span>;
        })}
      </span>
    </Fragment>
  ));
}

export default function ParticlePage() {
  const pageRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const flowRef = useRef({ progress: 0, paused: false, reduced: false, stage: 'overview', elapsed: 0 });
  const [status, setStatus] = useState('loading');
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [stage, setStage] = useState('overview');
  const staticView = reducedMotion || status === 'fallback';

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    const previousTitle = document.title;
    document.title = 'Damon — Intelligence in the real world';
    const theme = document.querySelector('meta[name="theme-color"]');
    const previousTheme = theme?.content;
    if (theme) theme.content = '#01040a';
    return () => {
      media.removeEventListener('change', update);
      document.title = previousTitle;
      if (theme) theme.content = previousTheme;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let controller;
    import('./particleScene').then(({ createParticleScene }) => {
      if (cancelled) return;
      controller = createParticleScene(canvasRef.current, {
        label: 'Damon',
        onReady: () => { if (!cancelled) setStatus('ready'); },
        onError: () => { if (!cancelled) setStatus('fallback'); },
      });
      sceneRef.current = controller;
      controller.setReducedMotion(flowRef.current.reduced);
      controller.setPaused(flowRef.current.paused);
      controller.setProgress(flowRef.current.progress);
    }).catch(() => { if (!cancelled) setStatus('fallback'); });
    return () => {
      cancelled = true;
      controller?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    flowRef.current.paused = paused;
    flowRef.current.reduced = reducedMotion;
    sceneRef.current?.setPaused(paused);
    sceneRef.current?.setReducedMotion(reducedMotion);
  }, [paused, reducedMotion]);

  useEffect(() => {
    const root = pageRef.current;
    const cards = [...root.querySelectorAll('.particle-orbit-card')];
    let frame = 0;
    let lastTime = 0;
    let disposed = false;

    const paintCards = () => {
      const progress = flowRef.current.progress;
      const show = smooth(0.16, 0.25, progress) * (1 - smooth(0.55, 0.68, progress));
      cards.forEach((card, index) => {
        const angle = index / cards.length * Math.PI * 2 + flowRef.current.elapsed * 0.13 + progress * 5.8;
        const depth = (Math.sin(angle) + 1) / 2;
        const x = innerWidth * 0.5 + Math.cos(angle) * Math.min(innerWidth * 0.37, 610);
        const y = innerHeight * 0.5 + Math.sin(angle) * Math.min(innerHeight * 0.28, 260);
        card.style.opacity = staticView ? 0 : show * smooth(0.2, 0.65, depth);
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${(depth - 0.5) * 240}px) rotateY(${Math.cos(angle) * -28}deg) scale(${0.65 + depth * 0.4})`;
        card.style.zIndex = Math.round(depth * 20);
      });
    };

    const onScroll = () => {
      const bounds = root.getBoundingClientRect();
      const progress = staticView ? 0 : clamp(-bounds.top / Math.max(1, root.offsetHeight - innerHeight));
      flowRef.current.progress = progress;
      sceneRef.current?.setProgress(progress);
      root.style.setProperty('--hero-opacity', 1 - smooth(0.08, 0.2, progress));
      root.style.setProperty('--hero-y', `${smooth(0.08, 0.2, progress) * -30}px`);
      root.style.setProperty('--work-opacity', smooth(0.78, 0.9, progress));
      root.style.setProperty('--progress', progress);
      const nextStage = staticView
        ? (root.querySelector('#particle-work').getBoundingClientRect().top < innerHeight * 0.5 ? 'work' : 'overview')
        : progress < 0.18 ? 'overview' : progress < 0.78 ? 'thinking' : 'work';
      if (flowRef.current.stage !== nextStage) {
        flowRef.current.stage = nextStage;
        setStage(nextStage);
      }
      paintCards();
    };

    const tick = (now) => {
      if (disposed) return;
      if (now - lastTime >= 1000 / 30) {
        flowRef.current.elapsed += lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0;
        lastTime = now;
        paintCards();
      }
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (!document.hidden && !paused && !staticView) frame = requestAnimationFrame(tick);
      else paintCards();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('visibilitychange', resume);
    onScroll();
    resume();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [paused, staticView]);

  const goTo = (event, target, focus = false) => {
    event.preventDefault();
    const root = pageRef.current;
    if (staticView) {
      const section = root.querySelector(target === 1 ? '#particle-work' : '#particle-overview');
      section.scrollIntoView({ behavior: 'instant' });
    } else {
      const offset = root.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: offset + target * (root.offsetHeight - innerHeight), behavior: 'instant' });
      // Chapter links jump immediately; the scene eases its own camera and geometry.
      window.dispatchEvent(new Event('scroll'));
    }
    if (focus) requestAnimationFrame(() => root.querySelector('#particle-work h2')?.focus({ preventScroll: true }));
  };

  return (
    <main ref={pageRef} className={`particle-page ${status === 'ready' ? 'is-ready' : ''} ${staticView ? 'is-static' : ''}`} data-stage={stage} data-scene={status}>
      <a className="particle-skip" href="#particle-work" onClick={(event) => goTo(event, 1, true)}>Skip to selected work</a>
      <div className="particle-backdrop" aria-hidden="true" />
      <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />
      <div className="particle-vignette" aria-hidden="true" />

      <header className="particle-header">
        <a className="particle-brand" href="#particle-overview" onClick={(event) => goTo(event, 0)} aria-label="Damon, back to overview">
          <span className="particle-brand-mark" aria-hidden="true">d.</span>
          <span>Damon<span className="particle-brand-sub">GUO-SIYI</span></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#particle-overview" aria-current={stage === 'overview' ? 'location' : undefined} onClick={(event) => goTo(event, 0)}>Overview</a>
          {!staticView && <a href="#particle-thinking" aria-current={stage === 'thinking' ? 'location' : undefined} onClick={(event) => goTo(event, 0.4)}>Thinking</a>}
          <a href="#particle-work" aria-current={stage === 'work' ? 'location' : undefined} onClick={(event) => goTo(event, 1)}>Work</a>
          <Link to="/about">About</Link>
        </nav>
        <a href="mailto:hello@damon.ai" className="particle-pill particle-primary particle-contact">Let’s talk <ArrowUpRight size={16} /></a>
      </header>

      <section className="particle-hero" id="particle-overview" aria-label="Introduction" inert={!staticView && stage !== 'overview'}>
        <div className="particle-location"><span className="particle-status-dot" />Hangzhou, China<span>AI RESEARCHER / LLM ENGINEER</span></div>
        <div className="particle-hero-title">
          <p className="particle-kicker"><span />Research meets reality</p>
          <h1 aria-label="Intelligence in the real world."><PixelTitle>Intelligence in the real world.</PixelTitle></h1>
        </div>
        <div className="particle-hero-copy">
          <p>I’m Damon. I build agent systems at Alibaba — connecting agentic RL, post-training, and evaluation to work that matters.</p>
          <div className="particle-actions">
            <a href="#particle-work" className="particle-pill particle-primary" onClick={(event) => goTo(event, 1, true)}>Explore work <ArrowUpRight size={16} /></a>
            <Link to="/about" className="particle-pill particle-light">About me</Link>
          </div>
        </div>
      </section>

      <div className="particle-orbits" id="particle-thinking" aria-hidden="true">
        {topics.map((topic, index) => <div className="particle-orbit-card" key={topic}><span>{String(index + 1).padStart(2, '0')}</span>{topic}</div>)}
      </div>
      <div className="particle-interlude" aria-hidden="true"><span>CONNECTED IDEAS. CAPABLE SYSTEMS.</span><p>Every connection<br />changes what’s possible.</p></div>

      <section className="particle-work" id="particle-work" aria-label="Selected work" inert={!staticView && stage !== 'work'}>
        <div className="particle-work-heading">
          <p className="particle-eyebrow">01 — SELECTED WORK</p>
          <h2 tabIndex={-1} aria-label="Intelligence with purpose."><PixelTitle>Intelligence with purpose.</PixelTitle></h2>
        </div>
        <p className="particle-work-intro">From research questions to deployed agents. Four explorations in making AI more capable, reliable, and useful.<Link to="/projects">All projects <ArrowUpRight size={14} /></Link></p>
        <div className="particle-project-grid">
          {selectedProjects.map((project, index) => (
            <Link className="particle-project" to={`/projects#${project.id}`} key={project.id} style={{ '--card': index }}>
              <div className="particle-project-meta"><span>{project.kicker}</span><span>{String(index + 1).padStart(2, '0')}</span></div>
              <div><h3>{project.title}</h3><p>{projectSummaries[index]}</p></div>
              <span className="particle-project-link">Explore project <ArrowUpRight size={17} /></span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="particle-controls">
        <div className="particle-chapter"><span>{stage === 'overview' ? '01' : stage === 'thinking' ? '02' : '03'}</span><span>{stage === 'overview' ? 'A living intelligence' : stage === 'thinking' ? 'Ideas in orbit' : 'Research into systems'}</span></div>
        <span className="particle-scroll-hint">{stage === 'work' ? 'SELECT A PROJECT TO EXPLORE' : 'SCROLL TO TRANSFORM'} <ArrowDown size={14} /></span>
        {status === 'loading' ? <span className="particle-load" role="status">Preparing the scene…</span> : staticView ? <span className="particle-static-label">Static view</span> : <button className="particle-pause" type="button" aria-pressed={paused} aria-label={paused ? 'Resume animation' : 'Pause animation'} onClick={() => setPaused(!paused)}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? 'Resume motion' : 'Pause motion'}</span></button>}
      </footer>
      <div className="particle-scroll-progress" aria-hidden="true" />
    </main>
  );
}
