import { useEffect, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Github, Mail, MapPin, Youtube } from 'lucide-react';
import { projects } from '../data/projects';
import ThreeScene from './ThreeScenes';
import './concepts.css';

const selected = [projects[0], projects[1], projects[3]];
const conceptNames = [
  ['editorial', '01 · Editorial'],
  ['kinetic', '02 · Kinetic type'],
  ['sculpture', '03 · Sculpture'],
];

function ConceptSwitch({ active }) {
  return (
    <nav className="concept-switch" aria-label="Design concepts" data-concept-switcher>
      <span className="concept-switch-label">DESIGN PREVIEW</span>
      {conceptNames.map(([key, label]) => (
        <Link key={key} to={`/concepts/${key}`} aria-current={active === key ? 'page' : undefined}>
          {label}
        </Link>
      ))}
      <Link className="concept-switch-original" to="/">Original <ArrowUpRight size={14} /></Link>
    </nav>
  );
}

function Header({ variant }) {
  return (
    <header className="concept-header">
      <a className="concept-logo" href="#top">{variant === 'kinetic' ? 'Damon' : 'Damon Guo-Siyi'}</a>
      <nav aria-label="Main navigation">
        <a href="#top">Home</a>
        <a href="#work">Work</a>
        <a href="/blog">Notes</a>
        <a href="#about">About</a>
        <a href="/uses">Uses</a>
      </nav>
      <a className="concept-header-contact" href="mailto:hello@damon.ai">Contact <ArrowUpRight size={14} /></a>
    </header>
  );
}

function ContactLinks() {
  return (
    <div className="concept-contact-links">
      <a href="mailto:hello@damon.ai"><Mail size={20} /><span><strong>Email</strong><small>Open a conversation</small></span><ArrowRight size={19} /></a>
      <a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer"><Github size={20} /><span><strong>GitHub</strong><small>Projects and code</small></span><ArrowUpRight size={19} /></a>
      <a href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA" target="_blank" rel="noreferrer"><Youtube size={20} /><span><strong>YouTube</strong><small>Talks and writing</small></span><ArrowUpRight size={19} /></a>
      <div><MapPin size={20} /><span><strong>Location</strong><small>Hangzhou, China</small></span></div>
    </div>
  );
}

function Editorial() {
  return (
    <div className="concept-page concept-editorial" id="top">
      <div className="editorial-blue">
        <Header variant="editorial" />
        <section className="editorial-hero" aria-labelledby="editorial-title">
          <ThreeScene variant="editorial" className="editorial-orb" />
          <div className="editorial-hero-grid">
            <div className="editorial-hero-main">
              <p className="concept-eyebrow">AI RESEARCHER / LLM ENGINEER</p>
              <h1 id="editorial-title">Research<br />that <em>runs</em><br />in the<br />real world<span>.</span></h1>
              <div className="concept-actions">
                <a className="concept-button button-coral" href="#work">See selected work <ArrowRight size={17} /></a>
                <a className="concept-text-link" href="mailto:hello@damon.ai">Say hello <ArrowRight size={17} /></a>
              </div>
            </div>
            <div className="editorial-hero-side">
              <p>I'm Damon Guo-Siyi, an AI researcher and LLM engineer at Alibaba, working on agentic RL, post-training, and evaluation for real-world deployment.</p>
              <dl>
                <div><dt>CURRENTLY AT</dt><dd>Alibaba · Hangzhou</dd></div>
                <div><dt>FOCUS</dt><dd>Agentic RL · Post-Training · Evaluation</dd></div>
                <div><dt>EDUCATION</dt><dd>NUS · UNSW</dd></div>
              </dl>
            </div>
          </div>
        </section>
      </div>
      <main>
        <section className="editorial-work concept-shell" id="work">
          <div className="concept-section-line"><span>SELECTED WORK</span><a href="/projects">ALL WORK <ArrowRight size={16} /></a></div>
          <div className="editorial-section-intro"><h2>From research<br />to deployed agents<span>.</span></h2><p>I work on agentic RL, post-training and evaluation, with a focus on building agent systems that create real value in production at Alibaba.</p></div>
          <div className="editorial-list">
            {selected.map((project, index) => (
              <a href={`/projects#${project.id}`} className="editorial-project" key={project.id}>
                <span className="editorial-project-number">0{index + 1}</span>
                <div><span className="concept-kicker">{index === 2 ? 'RESEARCH' : 'PRODUCTION SYSTEM'}</span><h3>{project.title}</h3><p>{project.description}</p></div>
                <span className="editorial-project-meta">{project.tags.slice(0, 2).join(' / ')}<br />{project.stage}</span>
                <ArrowRight className="project-arrow" size={24} strokeWidth={1.4} />
              </a>
            ))}
          </div>
        </section>
        <section className="editorial-contact" id="about">
          <div className="editorial-contact-call"><span className="concept-eyebrow">GET IN TOUCH</span><h2>Let's build<br />useful agents<span>.</span></h2><p>Open to conversations with fellow researchers, engineers, and potential collaborators working on real-world agent systems.</p><a className="concept-button button-white" href="mailto:hello@damon.ai">Say hello <ArrowRight size={18} /></a></div>
          <div className="editorial-contact-list"><div className="concept-section-line"><span>WHERE TO FIND ME</span></div><ContactLinks /></div>
        </section>
      </main>
    </div>
  );
}

function Kinetic() {
  return (
    <div className="concept-page concept-kinetic" id="top">
      <div className="kinetic-blue">
        <Header variant="kinetic" />
        <section className="kinetic-hero">
          <ThreeScene variant="kinetic" className="kinetic-letters" />
          <div className="kinetic-hero-copy"><p className="concept-eyebrow">AI RESEARCHER &amp; LLM ENGINEER<br />AT ALIBABA</p><h1>AI that<br />works<br />beyond<br />the demo<span>.</span></h1><p>Researching and deploying agentic RL, post-training, and evaluation frameworks at Alibaba.</p><div className="concept-actions"><a className="concept-button button-coral" href="#work">Selected work <ArrowRight size={18} /></a><a className="concept-outline-button" href="mailto:hello@damon.ai">Let's talk</a></div></div>
          <div className="kinetic-hero-bottom"><span>01<br />AGENTIC RL<br />POST-TRAINING<br />EVALUATION</span><span>Drag the letters to interact ↗</span></div>
        </section>
      </div>
      <main>
        <section className="kinetic-work concept-shell" id="work"><div className="concept-section-line"><span>SELECTED WORK</span></div><div className="kinetic-work-intro"><h2>Research to systems<span>.</span></h2><p>From agent training and evaluation to real-world deployment, I work on making agent systems more capable, reliable, and useful.</p></div><div className="kinetic-list">{selected.map((project, index) => <a className="kinetic-project" href={`/projects#${project.id}`} key={project.id}><span className="kinetic-project-number">0{index + 1}</span><div><span className="concept-kicker">{project.kicker}</span><h3>{project.title}</h3><p>{project.description}</p><strong>View details <ArrowRight size={15} /></strong></div><ArrowRight className="project-arrow" size={23} /></a>)}</div></section>
        <section className="kinetic-about concept-shell" id="about"><div><span className="concept-eyebrow">ABOUT</span><h2>Building useful<br />agent systems<span>.</span></h2></div><div><p>I'm Damon Guo-Siyi, an AI researcher and LLM engineer at Alibaba. I work on agentic RL, post-training, and evaluation frameworks with a focus on real-world use.</p><p>Based in Hangzhou. Educated at NUS and UNSW.</p><a href="mailto:hello@damon.ai">Start a conversation <ArrowUpRight size={17} /></a></div></section>
      </main>
    </div>
  );
}

const imagePaths = ['supply-chain.png', 'tool-resolution.png', 'evaluation-taxonomy.png'];

function Sculpture() {
  return (
    <div className="concept-page concept-sculpture" id="top">
      <Header variant="sculpture" />
      <main>
        <section className="sculpture-hero"><div className="sculpture-hero-copy"><p className="concept-eyebrow">AI RESEARCHER / LLM ENGINEER</p><h1>Intelligence<br />is a system.</h1><p>I build agent systems from evaluation to deployment at Alibaba.</p><div className="concept-actions"><a className="concept-button button-blue" href="#work">Explore projects <ArrowRight size={17} /></a><a className="concept-outline-button" href="#about">About Damon</a></div></div><ThreeScene variant="sculpture" className="sculpture-object" /><div className="sculpture-annotation sculpture-plan"><strong>PLAN</strong><span>Reason, decompose,<br />set goals</span></div><div className="sculpture-annotation sculpture-tools"><strong>USE TOOLS</strong><span>Interact with<br />the real world</span></div><div className="sculpture-annotation sculpture-evaluate"><strong>EVALUATE</strong><span>Verify, learn,<br />improve</span></div><span className="sculpture-drag">Drag to rotate ↔</span></section>
        <section className="sculpture-work concept-shell" id="work"><div className="concept-section-line"><span>FEATURED WORK</span><a href="/projects">ALL PROJECTS <ArrowRight size={16} /></a></div><div className="sculpture-work-intro"><h2>Research for more capable agent systems.</h2><p>From agentic reinforcement learning to post-training and evaluation, I work on making agent systems more useful in real-world environments.</p></div><div className="sculpture-grid">{selected.map((project, index) => <article className="sculpture-project" key={project.id}><a href={`/projects#${project.id}`} aria-label={`View ${project.title}`}><img src={`/concept-assets/${imagePaths[index]}`} alt="" /></a><span className="concept-kicker">0{index + 1}</span><h3>{project.title}</h3><p>{project.description}</p><a className="sculpture-project-link" href={`/projects#${project.id}`}>View project <ArrowRight size={17} /></a></article>)}</div></section>
        <section className="sculpture-about concept-shell" id="about"><div className="concept-section-line"><span>ABOUT</span></div><div className="sculpture-about-grid"><div><h2>Damon Guo-Siyi</h2><p className="sculpture-about-lead">AI researcher and LLM engineer at Alibaba.</p><p>I'm interested in agent systems, agentic reinforcement learning, post-training, and evaluation. I share practical AI on YouTube and Bilibili.</p><a className="concept-button button-blue" href="mailto:hello@damon.ai">Get in touch <ArrowRight size={17} /></a></div><img src="/concept-assets/about-gallery.png" alt="Minimal gallery wall in warm afternoon light" /></div></section>
      </main>
    </div>
  );
}

export default function ConceptLab() {
  const { pathname } = useLocation();
  const variant = pathname.split('/')[2];
  const active = conceptNames.some(([key]) => key === variant) ? variant : 'editorial';
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const page = document.querySelector('.concept-page');
    const nodes = page?.querySelectorAll([
      '.editorial-section-intro', '.editorial-project', '.editorial-contact-call', '.editorial-contact-list',
      '.kinetic-work-intro', '.kinetic-project', '.kinetic-about > div',
      '.sculpture-work-intro', '.sculpture-project', '.sculpture-about-grid > *',
    ].join(',')) ?? [];
    nodes.forEach((node, index) => {
      node.classList.add('concept-reveal');
      node.style.setProperty('--reveal-delay', `${index % 3 * 90}ms`);
    });
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -7% 0px' });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [active]);
  useEffect(() => {
    document.title = `${conceptNames.find(([key]) => key === active)?.[1].slice(5)} — Damon design preview`;
    window.scrollTo(0, 0);
    return () => { document.title = 'Damon — Agent Systems & AI Research'; };
  }, [active]);
  return <><ConceptSwitch active={active} />{active === 'kinetic' ? <Kinetic /> : active === 'sculpture' ? <Sculpture /> : <Editorial />}</>;
}
