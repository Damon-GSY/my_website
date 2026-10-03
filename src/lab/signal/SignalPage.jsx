import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, Pause, Play, Plus } from 'lucide-react';
import '@fontsource/anton/latin-400.css';
import { projects } from '../../data/projects';
import SignalField from './SignalField';
import './signal.css';

const chapters = [
  { label: 'Plan', verb: 'Find a direction.', caption: 'A useful plan connects intent to a sequence of decisions.', axis: 'INTENT → ACTION', project: projects[0], detail: 'Risk-aware decisions. Clear automation boundaries. A person in the loop when it matters.' },
  { label: 'Resolve', verb: 'Make the right move.', caption: 'The right tool changes what an agent can do next.', axis: 'CONTEXT → CAPABILITY', project: projects[1], detail: 'A changing pool of 100+ tools. Agents that learn how to choose, use, and recover.' },
  { label: 'Evaluate', verb: 'Close the loop.', caption: 'Look beyond the answer. Follow the decisions that led to it.', axis: 'EVIDENCE → IMPROVEMENT', project: projects[3], detail: 'Planning, memory, and tool use. Evaluation that makes failures visible across turns.' },
];

export default function SignalPage() {
  const [mode, setMode] = useState(0);
  const [paused, setPaused] = useState(false);
  const chapter = chapters[mode];

  useEffect(() => {
    const previous = document.title;
    document.title = 'Signal / Noise — Damon Guo-Siyi';
    return () => { document.title = previous; };
  }, []);

  return <div className="sl-page">
    <a className="sl-skip" href="#sl-main">Skip to content</a>
    <header className="sl-header">
      <a href="/lab" className="sl-brand" aria-label="Damon Guo-Siyi — back to experiments">D—G<span>SIYI</span></a>
      <span className="sl-header-note">INDEPENDENT THOUGHT.<br />REAL-WORLD SYSTEMS.</span>
      <nav aria-label="Main navigation"><a href="#sl-work">Work</a><a href="/about">About</a><a href="mailto:hello@damon.ai" className="sl-sayhello">Say hello <ArrowUpRight size={15} /></a></nav>
    </header>

    <main id="sl-main">
      <section className="sl-poster" aria-labelledby="sl-title">
        <div className="sl-poster-top"><p>AI RESEARCHER / LLM ENGINEER</p><p>HANGZHOU, CN <span className="sl-dot" /> ALIBABA</p></div>
        <h1 id="sl-title"><span>SIGNAL</span><span className="sl-title-divider" aria-hidden="true">/</span><span className="sl-noise">NOISE</span></h1>
        <div className="sl-poster-bottom"><p>I turn research into<br /><strong>agents that do the work.</strong></p><p>Agentic reinforcement learning,<br />post-training, and evaluation.</p><a href="#sl-instrument" aria-label="Explore the interactive field"><ArrowDown size={27} /></a></div>
      </section>

      <section className="sl-instrument" id="sl-instrument" aria-labelledby="sl-instrument-title">
        <div className="sl-instrument-heading"><span><span className="sl-live-dot" /> THE DECISION FIELD</span><span>MOVE / TOUCH TO REDIRECT</span></div>
        <div className="sl-stage">
          <div className="sl-stage-copy" aria-live="polite" aria-atomic="true"><span className="sl-stage-number">0{mode + 1}</span><h2 id="sl-instrument-title">{chapter.verb}</h2><p>{chapter.caption}</p><span className="sl-axis">{chapter.axis}</span></div>
          <div className="sl-canvas-wrap"><SignalField mode={mode} paused={paused} /><span className="sl-plot-label">FIG. 0{mode + 1} / {chapter.label.toUpperCase()}</span><Plus className="sl-plot-cross" size={18} /></div>
        </div>
        <div className="sl-controls">
          <div className="sl-mode-buttons" role="group" aria-label="Field behavior">
            {chapters.map((item, index) => <button key={item.label} type="button" aria-pressed={mode === index} aria-controls="sl-chapter" onClick={() => setMode(index)}><span>0{index + 1}</span>{item.label}<ArrowUpRight size={19} /></button>)}
          </div>
          <button type="button" className="sl-pause" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? 'Resume field motion' : 'Pause field motion'}>{paused ? <Play size={17} /> : <Pause size={17} />}<span>{paused ? 'Resume' : 'Pause'}</span></button>
        </div>
        <div className="sl-chapter" id="sl-chapter" aria-live="polite"><span>IN PRACTICE</span><a href={`/projects#${chapter.project.id}`}>{chapter.project.title}<ArrowUpRight size={20} /></a><p>{chapter.detail}</p></div>
        <div className="sl-field-credit"><span>INTERACTIVE CANVAS 2D</span><a href="https://github.com/oleksand4rux-del/cursor-lab" target="_blank" rel="noreferrer">FIELD MATH ADAPTED FROM CURSOR LAB ↗</a></div>
      </section>

      <section className="sl-work" id="sl-work" aria-labelledby="sl-work-title">
        <div className="sl-section-label"><span>SELECTED WORK / 2025—26</span><Plus size={19} /></div>
        <div className="sl-work-heading"><h2 id="sl-work-title">LESS DEMO.<br />MORE <em>DOING.</em></h2><p>Research earns its place<br />when it leaves the lab.</p></div>
        <div className="sl-work-list">{chapters.map(({ project }, index) => <a className="sl-work-row" key={project.id} href={`/projects#${project.id}`}><span className="sl-work-index">0{index + 1}</span><div><span className="sl-work-kicker">{project.kicker} / {project.stage}</span><h3>{project.title}</h3><p>{project.description}</p></div><ArrowUpRight className="sl-work-arrow" size={37} /></a>)}</div>
      </section>

      <section className="sl-about" aria-labelledby="sl-about-title"><svg className="sl-about-marker" viewBox="0 0 200 200" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <rect key={index} x="89" y="10" width="22" height="90" transform={`rotate(${index * 45} 100 100)`} />)}</svg><div><p className="sl-section-label">THE PERSON BEHIND THE SYSTEMS</p><h2 id="sl-about-title">Damon Guo-Siyi.<br />Always asking<br /><em>“does it work?”</em></h2><p className="sl-about-copy">I research and build agent systems at Alibaba. My work connects reinforcement learning, post-training, and evaluation with the practical details of getting things done.</p><a href="/about">A little more about me <ArrowUpRight size={18} /></a></div></section>

      <footer className="sl-footer"><div className="sl-footer-top"><span>GOT A GOOD QUESTION?</span><a href="mailto:hello@damon.ai">LET’S TALK.<ArrowUpRight /></a></div><div className="sl-footer-bottom"><span>DAMON GUO-SIYI / SIGNAL—NOISE</span><a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer">GitHub ↗</a><a href="/blog">Notes ↗</a></div><nav className="sl-experiments" aria-label="More experiments"><a href="/lab">All experiments</a><a href="/lab/observatory">Observatory</a><a href="/lab/tactile">Tactile</a><a href="/lab/gallery">Gallery</a></nav></footer>
    </main>
  </div>;
}
