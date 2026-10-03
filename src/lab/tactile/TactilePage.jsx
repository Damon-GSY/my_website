import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, MoveUpRight } from 'lucide-react';
import { projects } from '../../data/projects';
import PaperDesk from './PaperDesk';
import './tactile.css';

const artifacts = [projects[0], projects[1], projects[3]];
const labels = ['Production systems', 'Tool-using agents', 'Evaluation research'];

export default function TactilePage() {
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    const previous = document.title;
    document.title = 'A working archive — Damon Guo-Siyi';
    return () => { document.title = previous; };
  }, []);
  const project = artifacts[selected];
  return <div className="tl-page" id="tl-top">
    <a className="tl-skip" href="#tl-work">Skip to research</a>
    <header className="tl-header">
      <a className="tl-brand" href="/lab"><span>dg.</span><strong>Damon Guo-Siyi<small>AI RESEARCHER & LLM ENGINEER</small></strong></a>
      <nav aria-label="Portfolio navigation"><a href="#tl-work">Research</a><a href="/blog">Writing</a><a href="/about">About</a></nav>
      <a className="tl-lab-link" href="/lab">The experiment index <ArrowUpRight size={15} /></a>
    </header>
    <main>
      <section className="tl-hero" aria-labelledby="tl-heading">
        <div className="tl-hero-copy"><p className="tl-eyebrow"><span /> BASED IN HANGZHOU / BUILDING AT ALIBABA</p>
          <h1 id="tl-heading">Ideas are<br />a <em>material.</em></h1>
          <p className="tl-hero-intro">I turn research into agents that work. <br />A working archive of experiments,<br />decisions, and things shipped.</p>
          <a className="tl-down" href="#tl-work"><span><ArrowDown size={21} /></span>OPEN THE ARCHIVE</a>
          <div className="tl-hero-note"><span>↗</span><p>Some ideas deserve<br />a closer look.<br /><em>Go on, lift a corner.</em></p></div>
        </div>
        <PaperDesk selected={selected} onSelect={setSelected} items={artifacts} />
      </section>
      <section className="tl-work" id="tl-work" aria-labelledby="tl-work-heading">
        <div className="tl-section-line"><span>01 / SELECTED RESEARCH</span><span>THE WORK BENEATH THE SURFACE</span></div>
        <div className="tl-work-layout">
          <div className="tl-work-index"><h2 id="tl-work-heading">A few things<br />I’m working on<span>.</span></h2>
            <div className="tl-project-tabs" aria-label="Choose research artifact">{artifacts.map((item, index) => <button type="button" key={item.id} onClick={() => setSelected(index)} aria-pressed={selected === index}><span>0{index + 1}</span><strong>{labels[index]}</strong><MoveUpRight size={17} /></button>)}</div>
          </div>
          <article className="tl-project-detail" aria-live="polite">
            <p className="tl-eyebrow">{project.kicker} / {project.stage} / {project.year}</p>
            <h3>{project.title}</h3><p>{project.description}</p>
            <div className="tl-project-result"><span>IN PRACTICE</span><p>{project.outcome}</p></div>
            <a href={`/projects#${project.id}`}>Project notes <ArrowUpRight size={18} /></a>
          </article>
        </div>
      </section>
      <section className="tl-note-section"><span className="tl-eyebrow">02 / A NOTE ON THE WORK</span><h2>Good research asks better questions.<br /><em>Good engineering makes the answers useful.</em></h2><div><p>My work connects agentic reinforcement learning, post-training, and evaluation with the demands of production. I care about what happens between an impressive answer and a reliable system.</p><a href="/about">A little more about me <ArrowUpRight size={17} /></a></div></section>
    </main>
    <footer className="tl-footer"><div><p className="tl-eyebrow">GOT A QUESTION WORTH PURSUING?</p><a className="tl-contact" href="mailto:hello@damon.ai">Let’s make<br /><em>something useful.</em><ArrowUpRight /></a></div><div className="tl-footer-bottom"><a href="https://github.com/Damon-GSY">GITHUB ↗</a><span>PEEL PHYSICS ADAPTED FROM <a href="https://github.com/CatsJuice/sticker-forge">STICKER FORGE ↗</a></span><a href="#tl-top">BACK TO THE DESK ↑</a></div><nav className="tl-other-studies" aria-label="Other design experiments"><a href="/lab">All experiments</a><a href="/lab/observatory">Observatory ↗</a><a href="/lab/gallery">Spatial gallery ↗</a><a href="/lab/signal">Signal ↗</a></nav></footer>
  </div>;
}
