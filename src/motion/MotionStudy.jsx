import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import { projects } from '../data/projects';
import useMotionVideo from './useMotionVideo';
import './motion-study.css';

const fallbackManifest = {
  poster: '/motion-assets/agent-closed.webp',
  endPoster: '/motion-assets/agent-open.webp',
  video: null,
};
const principles = [
  { name: 'Make a plan.', tag: '01 / REASON', copy: 'Turn a request into a sequence of decisions. Make the assumptions, limits, and next steps visible.' },
  { name: 'Find the right tool.', tag: '02 / RESOLVE', copy: 'Connect reasoning to the world. Resolve the right tools from a changing environment, and learn from the result.' },
  { name: 'Check the work.', tag: '03 / EVALUATE', copy: 'Evaluate the path as well as the answer. Build systems that know when to act, recover, or ask for a handoff.' },
];
const selected = [projects[0], projects[1], projects[3]];

function useMotionPreference() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(query.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return reduced;
}

export default function MotionStudy() {
  const [manifest, setManifest] = useState(fallbackManifest);
  const [progress, setProgress] = useState(0);
  const [principle, setPrinciple] = useState(0);
  const storyRef = useRef(null);
  const pageRef = useRef(null);
  const reduced = useMotionPreference();
  const { videoRef, status } = useMotionVideo({ manifest, progress });
  const hasSequence = Boolean(manifest.video) && !reduced && status === 'ready';

  useEffect(() => {
    const controller = new AbortController();
    fetch('/motion-assets/manifest.json', { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('Manifest unavailable'); return response.json(); })
      .then((value) => setManifest({ ...fallbackManifest, ...value }))
      .catch(() => {});
    const oldTitle = document.title;
    document.title = 'Damon — From thought to action';
    return () => { controller.abort(); document.title = oldTitle; };
  }, []);

  useEffect(() => {
    if (!hasSequence) return undefined;
    const story = storyRef.current;
    let frame = 0;
    let start = 0;
    let distance = 1;
    const update = () => {
      frame = 0;
      const next = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
      setProgress((current) => Math.abs(next - current) > 0.001 ? next : current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      start = story.getBoundingClientRect().top + window.scrollY;
      distance = Math.max(1, story.offsetHeight - story.querySelector('.om-hero').offsetHeight);
      schedule();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(story);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
    };
  }, [hasSequence]);

  useEffect(() => {
    if (reduced) return undefined;
    const nodes = pageRef.current.querySelectorAll('[data-enter]');
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    nodes.forEach((node) => { node.classList.add('om-reveal'); observer.observe(node); });
    return () => { observer.disconnect(); nodes.forEach((node) => node.classList.remove('om-reveal')); };
  }, [reduced]);

  return <div className="om-page" ref={pageRef} id="top">
    <a className="om-skip" href="#selected-work">Skip to selected work</a>
    <header className="om-header">
      <a className="om-wordmark" href="#top">Damon<span className="om-brand-dot" /> <span className="om-full-name">Guo-Siyi</span></a>
      <nav aria-label="Main navigation"><a href="#selected-work">Work</a><a href="/blog">Notes</a><a href="/about">About</a></nav>
      <a className="om-contact-link" href="mailto:hello@damon.ai">Let's talk <ArrowUpRight size={16} /></a>
    </header>

    <main>
      <section ref={storyRef} className={`om-story ${hasSequence ? 'om-story-sequence' : ''}`} aria-label="From thought to action">
        <div className="om-hero">
          <div className="om-media" aria-hidden="true">
            <img className="om-hero-poster" src={manifest.poster} alt="" fetchPriority="high" />
            <video className={status === 'ready' ? 'is-ready' : ''} ref={videoRef} muted playsInline tabIndex={-1} />
          </div>
          <div className="om-hero-copy" inert={hasSequence && progress >= 0.36 ? true : undefined} style={hasSequence ? { opacity: Math.max(0, 1 - progress * 2.8), transform: `translateY(${-progress * 60}px)` } : undefined}>
            <p className="om-eyebrow"><span /> INDEPENDENT THINKING. REAL-WORLD SYSTEMS.</p>
            <h1>From thought<br />to <em>action.</em></h1>
            <p className="om-intro">I'm Damon, an AI researcher and LLM engineer at Alibaba. I build agents that turn good reasoning into useful work.</p>
            <a className="om-primary" href="#selected-work">Explore the work <span><ArrowUpRight size={20} /></span></a>
          </div>
          {hasSequence && <div className="om-sequence-copy" style={{ opacity: Math.max(0, (progress - 0.45) * 3), transform: `translateY(${(1 - progress) * 35}px)` }} aria-hidden={progress < 0.5}>
            <p className="om-eyebrow">THE ANATOMY OF AN AGENT</p><h2>One system.<br /><em>Many decisions.</em></h2>
          </div>}
          <div className="om-hero-foot"><a href={hasSequence ? '#anatomy' : '#selected-work'}><span className="om-scroll-mark"><ArrowDown size={16} /></span>{hasSequence ? 'SCROLL TO UNFOLD' : 'SCROLL TO EXPLORE'}</a><span>STUDY 001 <i /> THE AGENT INSTRUMENT</span></div>
          {hasSequence && <div className="om-sequence-progress" style={{ transform: `scaleX(${progress})` }} />}
        </div>
      </section>

      <div className="om-context"><span>BASED IN <strong>Hangzhou, China</strong></span><span>CURRENTLY <strong>Alibaba</strong></span><span>WORKING ON <strong>Agentic RL · Post-training · Evaluation</strong></span><a href="/about">A little about me <ArrowUpRight size={15} /></a></div>

      <section className="om-work om-shell" id="selected-work">
        <div className="om-section-intro" data-enter><p className="om-eyebrow">01 / SELECTED WORK</p><div><h2>Built to leave<br /><em>the lab.</em></h2><p>Research matters when it meets the world.<br />A selection of systems, experiments, and ideas<br className="om-desktop-break" /> that made that journey.</p></div></div>
        <div className="om-projects">{selected.map((project, index) => <a className="om-project" href={`/projects#${project.id}`} key={project.id} data-enter>
          <span className="om-project-number">0{index + 1}</span>
          <div className="om-project-main"><p>{project.kicker} <span>·</span> {project.stage}</p><h3>{project.title}</h3><p className="om-project-description">{project.description}</p></div>
          <span className="om-project-tag">{index === 0 ? '90% fewer misoperations' : index === 1 ? '100+ dynamic tools' : 'Multi-turn evaluation'}</span>
          <span className="om-project-arrow"><ArrowUpRight size={24} /></span>
        </a>)}</div>
      </section>

      <section className="om-anatomy" id="anatomy">
        <div className="om-anatomy-visual"><img src={manifest.endPoster} alt="The Agent Instrument opened to reveal its curved cobalt glass layers" loading="lazy" /><span className="om-image-caption">FIG. 02 — INSIDE THE INSTRUMENT</span></div>
        <div className="om-anatomy-copy" data-enter><p className="om-eyebrow">02 / A WAY OF THINKING</p><h2>Good agents<br /><em>show their work.</em></h2><p className="om-anatomy-lead">I’m interested in what happens between a request and a result.</p>
          <div className="om-principles" aria-label="Explore how agents work">{principles.map((item, index) => <button type="button" key={item.name} onClick={() => setPrinciple(index)} aria-expanded={principle === index} aria-controls={`om-principle-${index}`} className={principle === index ? 'is-active' : ''}><span>0{index + 1}</span><strong>{item.name}</strong><Plus size={18} /></button>)}</div>
          <div aria-live="polite">{principles.map((item, index) => <div className="om-principle-detail" id={`om-principle-${index}`} key={item.tag} hidden={principle !== index}><span>{item.tag}</span><p>{item.copy}</p></div>)}</div>
        </div>
      </section>

      <section className="om-about om-shell" data-enter><p className="om-eyebrow">03 / THE PERSON BEHIND THE WORK</p><h2>Curiosity is the starting point.<br /><em>Making things useful is the goal.</em></h2><div><p>My work sits between AI research and production engineering. I focus on agentic reinforcement learning, post-training, and evaluation—and the practical details that make systems work for people.</p><a className="om-text-link" href="/about">More about Damon <ArrowUpRight size={18} /></a></div></section>

      <section className="om-contact"><div className="om-shell"><p className="om-eyebrow">HAVE SOMETHING IN MIND?</p><a href="mailto:hello@damon.ai"><h2>Let's make<br /><em>something useful.</em></h2><span><ArrowUpRight /></span></a><div className="om-contact-bottom"><p>Open to conversations about useful agents,<br />ambitious research, and ideas worth building.</p><a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a></div></div></section>
    </main>
    <footer className="om-footer"><span>© {new Date().getFullYear()} Damon Guo-Siyi</span><span>VISUAL STUDY / INSPIRED BY <a href="https://github.com/oil-oil/oil-motion" target="_blank" rel="noreferrer">OIL MOTION</a></span><a href="/experiences/path">Earlier studies <ArrowUpRight size={13} /></a></footer>
  </div>;
}
