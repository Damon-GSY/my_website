import { Fragment, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { projects } from '../data/projects';
import { aboutProfile } from '../data/about';
import { posts } from '../data/posts';
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

const channels = [
  { label: 'GitHub', detail: 'Projects & experiments', href: 'https://github.com/Damon-GSY' },
  { label: 'YouTube', detail: 'Ideas, explained', href: 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA' },
  { label: 'Bilibili', detail: 'AI in practice', href: 'https://space.bilibili.com/358541297' },
];
const researchAreas = [
  { title: 'Train for the task.', label: 'Agentic RL / Post-training', description: 'Connecting reward design, SFT, and reinforcement learning to the behavior an agent needs in a real workflow.' },
  { title: 'Build the whole system.', label: 'Tool use / Deployment', description: 'Planning, dynamic tool access, and human collaboration — the infrastructure that turns a model into a useful agent.' },
  { title: 'Measure what matters.', label: 'Evaluation / Multi-turn agents', description: 'Evaluating the decisions between the first request and the final result, including memory, recovery, and replanning.' },
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
  const cinematicRef = useRef(null);
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const flowRef = useRef({ progress: 0, paused: false, reduced: false, stage: 'overview', elapsed: 0, inView: true });
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
      controller.setPaused(flowRef.current.paused || !flowRef.current.inView);
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
    sceneRef.current?.setPaused(paused || !flowRef.current.inView);
    sceneRef.current?.setReducedMotion(reducedMotion);
  }, [paused, reducedMotion]);

  useEffect(() => {
    const root = pageRef.current;
    const cinematic = cinematicRef.current;
    const cards = [...root.querySelectorAll('.particle-orbit-card')];
    const contentSections = [...root.querySelectorAll('[data-particle-section]')];
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
      const bounds = cinematic.getBoundingClientRect();
      const progress = staticView ? 0 : clamp(-bounds.top / Math.max(1, cinematic.offsetHeight - innerHeight));
      if (flowRef.current.progress !== progress) sceneRef.current?.setProgress(progress);
      flowRef.current.progress = progress;
      root.style.setProperty('--hero-opacity', 1 - smooth(0.08, 0.2, progress));
      root.style.setProperty('--hero-y', `${smooth(0.08, 0.2, progress) * -30}px`);
      root.style.setProperty('--work-opacity', smooth(0.78, 0.9, progress));
      root.style.setProperty('--progress', progress);
      let nextStage = staticView
        ? (root.querySelector('#particle-work').getBoundingClientRect().top < innerHeight * 0.5 ? 'work' : 'overview')
        : progress < 0.18 ? 'overview' : progress < 0.78 ? 'thinking' : 'work';
      contentSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= Math.min(innerHeight * 0.35, 240)) nextStage = section.dataset.particleSection;
      });
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
      if (!document.hidden && flowRef.current.inView && !paused && !staticView) frame = requestAnimationFrame(tick);
      else paintCards();
    };
    const observer = new IntersectionObserver(([entry]) => {
      flowRef.current.inView = entry.isIntersecting;
      root.dataset.sceneVisible = String(entry.isIntersecting);
      sceneRef.current?.setPaused(paused || !entry.isIntersecting);
      resume();
    });
    observer.observe(viewportRef.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('visibilitychange', resume);
    onScroll();
    resume();
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', resume);
    };
  }, [paused, staticView]);

  const goTo = (event, target, focus = false) => {
    event.preventDefault();
    const root = pageRef.current;
    const cinematic = cinematicRef.current;
    if (staticView) {
      const section = root.querySelector(target === 1 ? '#particle-work' : '#particle-overview');
      section.scrollIntoView({ behavior: 'instant' });
    } else {
      const offset = cinematic.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: offset + target * (cinematic.offsetHeight - innerHeight), behavior: 'instant' });
      // Chapter links jump immediately; the scene eases its own camera and geometry.
      window.dispatchEvent(new Event('scroll'));
    }
    if (focus) requestAnimationFrame(() => root.querySelector('#particle-work h2')?.focus({ preventScroll: true }));
  };

  return (
    <main ref={pageRef} className={`particle-page ${status === 'ready' ? 'is-ready' : ''} ${staticView ? 'is-static' : ''}`} data-stage={stage} data-scene={status}>
      <a className="particle-skip" href="#particle-work" onClick={(event) => goTo(event, 1, true)}>Skip to selected work</a>
      <header className="particle-header">
        <a className="particle-brand" href="#particle-overview" onClick={(event) => goTo(event, 0)} aria-label="Damon, back to overview">
          <span className="particle-brand-mark" aria-hidden="true">d.</span>
          <span>Damon<span className="particle-brand-sub">GUO-SIYI</span></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#particle-overview" aria-current={stage === 'overview' ? 'location' : undefined} onClick={(event) => goTo(event, 0)}>Overview</a>
          <a href="#particle-work" aria-current={stage === 'work' ? 'location' : undefined} onClick={(event) => goTo(event, 1)}>Work</a>
          <a href="#particle-about" aria-current={stage === 'about' ? 'location' : undefined}>About</a>
          <a href="#particle-notes" aria-current={stage === 'notes' ? 'location' : undefined}>Notes</a>
          <a href="#particle-contact" aria-current={stage === 'contact' ? 'location' : undefined}>Contact</a>
        </nav>
        <a href="mailto:hello@damon.ai" className="particle-pill particle-primary particle-contact">Let’s talk <ArrowUpRight size={16} /></a>
      </header>

      <div ref={cinematicRef} className="particle-cinematic">
        <div ref={viewportRef} className="particle-viewport">
          <div className="particle-backdrop" aria-hidden="true" />
          <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />
          <div className="particle-vignette" aria-hidden="true" />

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
            <a href="#particle-about" className="particle-pill particle-light">About me</a>
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
        <span className="particle-scroll-hint">{stage === 'work' ? 'SCROLL TO MEET DAMON' : 'SCROLL TO TRANSFORM'} <ArrowDown size={14} /></span>
        {status === 'loading' ? <span className="particle-load" role="status">Preparing the scene…</span> : staticView ? <span className="particle-static-label">Static view</span> : <button className="particle-pause" type="button" aria-pressed={paused} aria-label={paused ? 'Resume animation' : 'Pause animation'} onClick={() => setPaused(!paused)}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? 'Resume motion' : 'Pause motion'}</span></button>}
      </footer>
      <div className="particle-scroll-progress" aria-hidden="true" />
        </div>
      </div>

      <div className="particle-personal">
        <section className="particle-about particle-content-section" id="particle-about" data-particle-section="about" aria-labelledby="particle-about-title" tabIndex={-1}>
          <div className="particle-section-top"><p className="particle-eyebrow">02 — THE PERSON BEHIND THE WORK</p><span>HANGZHOU, CHINA</span></div>
          <div className="particle-about-grid">
            <h2 id="particle-about-title">Curious by nature.<br /><span>Engineer by practice.</span></h2>
            <div className="particle-about-copy">
              <p className="particle-about-name">I’m Damon Guo-Siyi.</p>
              <p>{aboutProfile.intro} I work at Alibaba in Hangzhou, building agent systems for real-world supply-chain operations.</p>
              <p>{aboutProfile.focus}</p>
              <Link className="particle-text-link" to="/about">My background <ArrowUpRight size={17} /></Link>
            </div>
          </div>
          <dl className="particle-background">
            <div><dt>NOW</dt><dd>Alibaba<span>LLM Algorithm Engineer · Hangzhou</span></dd></div>
            <div><dt>BEFORE</dt><dd>Microsoft Research Asia<span>LLM Intern · MC AI Group</span></dd></div>
            <div><dt>EDUCATION</dt><dd>NUS / UNSW<span>Statistics / Computer Science</span></dd></div>
          </dl>
          <div className="particle-research">
            <div className="particle-research-heading"><p className="particle-eyebrow">A CONNECTED PRACTICE</p><h3>From a question<br />to a working system.</h3></div>
            <div className="particle-research-list">
              {researchAreas.map((area, index) => <article key={area.title}>
                <span className="particle-research-number">0{index + 1}</span>
                <div><p className="particle-research-label">{area.label}</p><h4>{area.title}</h4><p>{area.description}</p></div>
              </article>)}
            </div>
          </div>
        </section>

        <section className="particle-notes particle-content-section" id="particle-notes" data-particle-section="notes" aria-labelledby="particle-notes-title" tabIndex={-1}>
          <div className="particle-section-top"><p className="particle-eyebrow">03 — NOTES & IDEAS</p><Link className="particle-text-link" to="/blog">All writing <ArrowUpRight size={16} /></Link></div>
          <div className="particle-notes-heading"><h2 id="particle-notes-title">Thinking,<br /><span>out in the open.</span></h2><p>Field notes on agents, training, and evaluation. Things I’m learning while turning research into systems people can use.</p></div>
          <div className="particle-note-list">
            {posts.slice(0, 3).map((post, index) => <Link className="particle-note" key={post.slug} to={`/blog/${post.slug}`}>
              <span className="particle-note-index">0{index + 1}</span>
              <div><p className="particle-note-meta">{post.category}<span>{post.readingTime}</span></p><h3>{post.title}</h3><p className="particle-note-excerpt">{post.excerpt}</p></div>
              <ArrowUpRight className="particle-note-arrow" size={25} aria-hidden="true" />
            </Link>)}
          </div>
          <div className="particle-channels"><p>I also share practical AI ideas on video.</p><a href={channels[1].href} target="_blank" rel="noreferrer">YouTube <ArrowUpRight size={15} /></a><a href={channels[2].href} target="_blank" rel="noreferrer">Bilibili <ArrowUpRight size={15} /></a></div>
        </section>

        <section className="particle-get-in-touch particle-content-section" id="particle-contact" data-particle-section="contact" aria-labelledby="particle-contact-title" tabIndex={-1}>
          <div className="particle-section-top"><p className="particle-eyebrow">04 — START A CONVERSATION</p><span className="particle-contact-coordinate">HANGZHOU, CHINA</span></div>
          <h2 id="particle-contact-title">Let’s make<br /><span>it useful.</span></h2>
          <div className="particle-contact-bottom"><p>Working on agent systems, evaluation, or practical AI? I’m always happy to exchange ideas with researchers, engineers, and fellow creators.</p><a className="particle-email" href="mailto:hello@damon.ai">hello@damon.ai <ArrowUpRight aria-hidden="true" /></a></div>
          <ul className="particle-socials">{channels.map((channel) => <li key={channel.label}><a href={channel.href} target="_blank" rel="noreferrer"><span>{channel.label}<small>{channel.detail}</small></span><ArrowUpRight size={20} aria-hidden="true" /></a></li>)}</ul>
        </section>
        <footer className="particle-site-footer"><span>Damon Guo-Siyi</span><span>Research. Build. Learn. Repeat.</span><a href="#particle-overview" onClick={(event) => goTo(event, 0)}>Back to top <ArrowUpRight size={15} /></a></footer>
      </div>
    </main>
  );
}
