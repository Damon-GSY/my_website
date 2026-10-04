import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, RotateCcw } from 'lucide-react';
import { projects } from '../data/projects';
import { posts } from '../data/posts';
import './robot-portfolio.css';

const selectedWork = projects.filter((project) => project.featured).slice(0, 4);
const channels = [
  ['GitHub', 'https://github.com/Damon-GSY'],
  ['YouTube', 'https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA'],
  ['Bilibili', 'https://space.bilibili.com/358541297'],
];

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
      <circle cx="180" cy="180" r="150" stroke="currentColor" strokeOpacity=".3" />
      <ellipse cx="180" cy="180" rx="68" ry="150" stroke="currentColor" strokeOpacity=".7" transform="rotate(35 180 180)" />
      <ellipse cx="180" cy="180" rx="68" ry="150" stroke="currentColor" strokeOpacity=".7" transform="rotate(-35 180 180)" />
      <path d="M30 180h300M180 30v300" stroke="currentColor" strokeOpacity=".3" strokeDasharray="3 6" />
      <circle cx="180" cy="180" r="24" fill="currentColor" />
      <circle cx="280" cy="68" r="8" fill="currentColor" />
      <circle cx="77" cy="287" r="5" fill="currentColor" />
    </svg>
  );
}

export default function RobotPortfolio() {
  const [entrance, setEntrance] = useState({ active: true, version: 0 });
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

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
        setEntrance((current) => ({ active: true, version: current.version + 1 }));
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

  useEffect(() => {
    if (!entrance.active) return;
    const timeout = window.setTimeout(() => setEntrance((current) => ({ ...current, active: false })), 2100);
    return () => window.clearTimeout(timeout);
  }, [entrance.active, entrance.version]);

  const replayAssembly = () => {
    if (!reducedMotion) setEntrance((current) => ({ active: true, version: current.version + 1 }));
  };

  return (
    <main className="robot-portfolio" id="rp-top">
      <a className="rp-skip" href="#rp-work">Skip to selected work</a>
      <section className={`rp-hero${entrance.active && !reducedMotion ? ' rp-is-entering' : ''}`} aria-labelledby="rp-name">
        <header className="rp-header">
          <a className="rp-wordmark" href="#rp-top" aria-label="Damon Guo-Siyi, back to top">Damon<span aria-hidden="true">✳</span></a>
          <nav aria-label="Portfolio navigation">
            <a href="#rp-work">Work</a><a href="#rp-about">About</a><a href="#rp-notes">Notes</a><a href="#rp-contact">Contact <ArrowUpRight aria-hidden="true" /></a>
          </nav>
          <span className="rp-location"><i aria-hidden="true" /> Hangzhou, China</span>
        </header>

        <div className="rp-hero-content">
          <div className="rp-introduction">
            <p className="rp-eyebrow rp-hero-eyebrow">AI researcher / LLM engineer</p>
            <h1 id="rp-name">Damon<br />Guo-Siyi<span>.</span></h1>
            <p className="rp-hero-description">I build agent systems that turn<br className="rp-desktop-break" /> research into real-world capability.</p>
            <a className="rp-primary-link" href="#rp-work">Explore my work <ArrowDown size={19} aria-hidden="true" /></a>
          </div>

          <div className="rp-mascot">
            <span className="rp-mascot-caption rp-eyebrow">The pieces. The system.</span>
            <RobotHelmet key={entrance.version} />
            <button className="rp-replay" type="button" onClick={replayAssembly} disabled={reducedMotion} aria-label={reducedMotion ? 'Assembly animation disabled for reduced motion' : 'Replay robot assembly animation'}><RotateCcw size={13} aria-hidden="true" /> {reducedMotion ? 'Still, by preference' : 'Replay assembly'}</button>
          </div>
        </div>

        <div className="rp-hero-bottom">
          <div className="rp-current"><span className="rp-eyebrow">Currently at</span><p>Alibaba <ArrowUpRight size={14} aria-hidden="true" /></p></div>
          <p className="rp-hero-tagline">Intelligence,<br /><em>put to work.</em></p>
          <a className="rp-scroll" href="#rp-work" aria-label="Scroll to selected work"><ArrowDown aria-hidden="true" /></a>
        </div>
      </section>

      <section className="rp-work rp-section" id="rp-work" aria-labelledby="rp-work-title">
        <div className="rp-section-bar"><p className="rp-eyebrow"><span>01</span> Selected work</p><Link to="/projects">All projects <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
        <div className="rp-section-heading">
          <h2 id="rp-work-title">From possibility<br />to <em>practice.</em></h2>
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
        <div className="rp-section-bar"><p className="rp-eyebrow"><span>02</span> About / Approach</p><span className="rp-eyebrow">Curiosity → capability</span></div>
        <div className="rp-about-grid">
          <div className="rp-about-statement"><h2 id="rp-about-title">A better answer<br />is only<br /><em>the start.</em></h2><ResearchMark /></div>
          <div className="rp-about-copy">
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
        <div className="rp-section-bar"><p className="rp-eyebrow"><span>03</span> Notes from the work</p><Link to="/blog">All writing <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
        <div className="rp-section-heading"><h2 id="rp-notes-title">Thinking<br /><em>out loud.</em></h2><p>Ideas, observations, and lessons from building AI. Written to make the next question a little clearer.</p></div>
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
        <div className="rp-section-bar"><p className="rp-eyebrow"><span>04</span> Start a conversation</p><span className="rp-eyebrow">Hangzhou / Everywhere</span></div>
        <div className="rp-contact-main"><h2 id="rp-contact-title">Let’s make<br />it <em>useful.</em></h2><div className="rp-contact-copy"><p>Working on agents, evaluation, or an interesting research question? I’d love to hear about it.</p><a className="rp-contact-email" href="mailto:hello@damon.ai">hello@damon.ai <ArrowUpRight size={28} strokeWidth={1.5} aria-hidden="true" /></a></div></div>
        <div className="rp-footer-bottom"><span>Damon Guo-Siyi</span><nav aria-label="Find Damon online">{channels.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noreferrer">{label} <ArrowUpRight size={13} aria-hidden="true" /></a>)}</nav><a href="#rp-top">Back to top <ArrowUpRight size={14} aria-hidden="true" /></a></div>
      </footer>
    </main>
  );
}
