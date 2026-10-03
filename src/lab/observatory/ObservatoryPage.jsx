import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, ArrowLeft, Pause, Play } from 'lucide-react';
import { projects } from '../../data/projects';
import { createObservatory } from './observatoryScene';
import './observatory.css';

const studies = [projects[0], projects[1], projects[3]];
const chapters = ['The observatory', 'From plan to action', 'A tool for the task', 'Make progress visible', 'An open invitation'];

export default function ObservatoryPage() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const [chapter, setChapter] = useState(0);
  const [status, setStatus] = useState('loading');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'The Observatory — Damon Guo-Siyi';
    let alive = true;
    let scene;
    try {
      scene = createObservatory(canvasRef.current, hostRef.current, {
        onReady: () => alive && setStatus('ready'),
        onError: () => alive && setStatus('fallback'),
      });
      sceneRef.current = scene;
    } catch {
      setStatus('fallback');
    }
    return () => {
      alive = false;
      scene?.dispose();
      sceneRef.current = null;
      document.title = previousTitle;
    };
  }, []);

  // Chapter navigation belongs to the document, so it stays available while
  // shaders compile and when WebGL is unavailable.
  useEffect(() => {
    const host = hostRef.current;
    const sections = [...host.querySelectorAll('[data-ob-chapter]')];
    let anchors = [];
    const update = () => {
      let next = 0;
      for (let index = 0; index < anchors.length - 1; index++) {
        if (window.scrollY >= anchors[index]) {
          const fraction = Math.min(1, Math.max(0, (window.scrollY - anchors[index]) / Math.max(1, anchors[index + 1] - anchors[index])));
          next = Math.min(4, Math.floor(index + fraction + .48));
        }
      }
      setChapter((previous) => previous === next ? previous : next);
    };
    const measure = () => {
      anchors = sections.map((section) => section.getBoundingClientRect().top + window.scrollY);
      update();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const jumpTo = (index) => {
    // A selected chapter opens immediately; the scene supplies the eased dolly.
    // Native smooth scrolling can queue behind software WebGL compositing.
    document.getElementById(`ob-chapter-${index}`)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    // The instant jump has already changed the document position. Reflect it
    // in this click transaction instead of waiting for a compositor scroll event.
    setChapter(index);
    sceneRef.current?.syncScroll();
  };

  const toggleMotion = () => {
    setPaused((previous) => {
      sceneRef.current?.setPaused(!previous);
      return !previous;
    });
  };

  return (
    <div className={`ob-page ob-${status}`} ref={hostRef}>
      <a className="ob-skip" href="#ob-chapter-1">Skip to selected work</a>
      <div className="ob-world" aria-hidden="true">
        <div className="ob-world-fallback"><i /><i /><i /><i /><span>DG / RESEARCH ARCHIVE</span></div>
        <canvas ref={canvasRef} />
        <div className="ob-world-shade" />
      </div>
      <header className="ob-header">
        <a className="ob-brand" href="/lab"><span className="ob-brand-mark">d.</span><span>Damon<br />Guo-Siyi</span></a>
        <nav aria-label="Main navigation">
          <a href="#ob-chapter-1">Selected work <span>03</span></a>
          <a href="/blog">Field notes</a>
          <a href="/about">About</a>
        </nav>
        <a className="ob-header-contact" href="#ob-chapter-4">Let’s talk <ArrowUpRight size={17} /></a>
      </header>

      <main>
        <section className="ob-chapter ob-hero" id="ob-chapter-0" data-ob-chapter="0" aria-labelledby="ob-hero-title">
          <div className="ob-copy">
            <p className="ob-eyebrow"><span /> An observatory for useful intelligence</p>
            <h1 id="ob-hero-title">Ideas need<br />a <em>world.</em></h1>
            <p className="ob-lede">I’m Damon, an AI researcher at Alibaba.<br />I build agents that find their way<br className="ob-desktop-break" /> from possibility to practice.</p>
            <button className="ob-explore" onClick={() => jumpTo(1)}><span>Enter the archive</span><span className="ob-round"><ArrowDown size={19} /></span></button>
          </div>
          <div className="ob-hero-note"><span>HANGZHOU, CHINA</span><span>RESEARCH × ENGINEERING</span></div>
          <div className="ob-architecture-label"><i /> THE OBSERVATORY<span>A living archive / 2026</span></div>
        </section>

        {studies.map((project, index) => (
          <section className="ob-chapter ob-study" id={`ob-chapter-${index + 1}`} data-ob-chapter={index + 1} key={project.id} aria-labelledby={`ob-study-title-${index}`}>
            <div className="ob-copy">
              <p className="ob-eyebrow">Study 0{index + 1} <span className="ob-eyebrow-line" /> {project.kicker}</p>
              <h2 id={`ob-study-title-${index}`}>{index === 0 ? <>From plan<br />to <em>action.</em></> : index === 1 ? <>A tool for<br />the <em>task.</em></> : <>Make progress<br /><em>visible.</em></>}</h2>
              <h3>{project.title}</h3>
              <p className="ob-study-description">{project.description}</p>
              <div className="ob-outcome"><span>IN PRACTICE</span><p>{project.outcome}</p></div>
              <a className="ob-text-link" href={`/projects#${project.id}`}>Explore the project <ArrowUpRight size={18} /></a>
            </div>
            <div className="ob-study-caption"><span>0{index + 1} / RESEARCH IN CONTEXT</span><span>{project.tags.join(' · ')}</span></div>
          </section>
        ))}

        <section className="ob-chapter ob-contact" id="ob-chapter-4" data-ob-chapter="4" aria-labelledby="ob-contact-title">
          <div className="ob-copy">
            <p className="ob-eyebrow"><span /> The next chapter is open</p>
            <h2 id="ob-contact-title">Good questions.<br /><em>Real work.</em></h2>
            <p className="ob-lede">I’m interested in agentic RL, post-training,<br className="ob-desktop-break" /> and making AI useful in the real world.<br />Let’s compare notes.</p>
            <a className="ob-contact-cta" href="mailto:hello@damon.ai">Start a conversation <ArrowUpRight size={24} /></a>
            <div className="ob-contact-links"><a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={14} /></a><a href="/about">More about me <ArrowUpRight size={14} /></a></div>
          </div>
          <footer className="ob-footer"><a href="/lab"><ArrowLeft size={14} /> All experiments</a><span>Camera study adapted from <a href="https://github.com/MengTo/threeui" target="_blank" rel="noreferrer">ThreeUI</a> · MIT</span></footer>
        </section>
      </main>

      <aside className="ob-chapter-nav" aria-label="Archive chapters">
        <span className="ob-current-number">0{chapter + 1}<span>/ 05</span></span>
        <div>{chapters.map((label, index) => <button key={label} aria-label={`Go to ${label}`} title={label} aria-current={chapter === index ? 'step' : undefined} onClick={() => jumpTo(index)}><span /></button>)}</div>
        <span className="ob-current-label">{chapters[chapter]}</span>
      </aside>
      {status === 'ready' && <button className="ob-motion-control" onClick={toggleMotion} aria-label={paused ? 'Resume ambient motion' : 'Pause ambient motion'} aria-pressed={paused}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{paused ? 'Motion paused' : 'Living scene'}</span></button>}
    </div>
  );
}
