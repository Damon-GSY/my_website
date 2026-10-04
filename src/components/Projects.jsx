import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { projects } from '@/data/projects';
import './projects.css';

const categories = [
  { label: 'All work', value: 'all' },
  { label: 'Production', value: 'production' },
  { label: 'Research', value: 'research' },
  { label: 'Side projects', value: 'side-project' },
];

const projectViews = {
  'supply-chain-agent-system': {
    short: 'Supply chain agents',
    focus: 'Decision-making with explicit boundaries.',
    nodes: ['Assess risk', 'Confirm intent', 'Execute / hand off'],
    stat: '90%', statLabel: 'fewer misoperations',
    scope: 'Alibaba · 12 supply-chain scenarios',
    context: 'Supply-chain operations involve consequential decisions. This work defines which actions an agent can take, when to confirm, and when to hand a task back to a person.',
  },
  'dynamic-tool-resolution-agents': {
    short: 'Dynamic tool resolution',
    focus: 'The right tool, at the right step.',
    nodes: ['Register tools', 'Train decisions', 'Resolve tickets'],
    stat: '100+', statLabel: 'tools in a changing pool',
    scope: 'Alibaba · supported ticket-resolution workflows',
    context: 'Ticket-resolution assistants operate against an evolving collection of internal tools. The work connects dynamic registration with training and evaluation of the decisions an agent makes along the way.',
  },
  'supply-chain-domain-llm': {
    short: 'Domain language models',
    focus: 'Training against real capabilities.',
    nodes: ['Benchmark', 'Pretrain + SFT', 'RL alignment'],
    stat: '2 axes', statLabel: 'knowledge QA + tool use',
    scope: 'Alibaba · internal knowledge QA and tool-use benchmark',
    context: 'Supply-chain knowledge and effective tool use require different capabilities. This work establishes a dual-axis benchmark, then uses it to guide end-to-end model training.',
  },
  'multi-turn-agent-evaluation': {
    short: 'Multi-turn agent evaluation',
    focus: 'Evaluate the path, not only the answer.',
    nodes: ['Planning', 'Memory', 'Tool use'],
    stat: '~250', statLabel: 'papers reviewed',
    context: 'An agent can reach a plausible answer while failing to plan, remember, or recover across turns. This survey separates what to evaluate from how to evaluate it.',
  },
  'supchain-bench': {
    short: 'SupChain-Bench',
    focus: 'A benchmark grounded in operations.',
    nodes: ['Real tasks', 'Expert review', 'Tool-call evaluation'],
    stat: '530', statLabel: 'annotated real-world samples',
    context: 'Logistics, warehouse, finance, and customs workflows demand coordinated execution. SupChain-Bench brings these settings into a unified benchmark for supply-chain agents.',
  },
  visualdeltas: {
    short: 'VisualDeltas',
    focus: 'Learning preferences from visual quality.',
    nodes: ['Vary resolution', 'Build pairs', 'DPO training'],
    stat: '+8.2%', statLabel: 'up to, over baselines',
    context: 'Controlled changes in image resolution expose differences in model reasoning. VisualDeltas converts that visual-quality sensitivity into preference data for training.',
  },
  'm365-copilot-memory-eval': {
    short: 'Copilot memory evaluation',
    focus: 'Keeping context across the conversation.',
    nodes: ['Long-term memory', 'Conversation', 'Preferences'],
    stat: 'MSRA', statLabel: 'M365 Copilot · 2024',
    context: 'Multi-turn email workflows require more than retrieving a document. This work explores memory architecture and evaluation of intent, completion, and consistency during an early GPT-4o production rollout.',
  },
  'product-attribute-rl': {
    short: 'Multi-objective RL',
    focus: 'Balancing rewards across tasks.',
    nodes: ['Conditional rewards', 'Variance control', 'GRPO training'],
    stat: 'GRPO', statLabel: 'multi-objective training',
    scope: 'Alibaba · supply-chain product-attribute tasks',
    context: 'A shared model makes decisions about fulfillment, bundle consolidation, HS Code, and related product attributes. This work addresses the conflicting rewards and gradient imbalance that arise across those tasks.',
  },
  'ai-content-engine': {
    short: 'AI Content Engine',
    focus: 'Keeping the research thread intact.',
    nodes: ['Read research', 'Structure scripts', 'Publish notes'],
    stat: '3', statLabel: 'publishing platforms',
    context: 'Research communication needs a repeatable workflow without losing technical context. This system turns papers and production lessons into scripts, bilingual notes, and short-form explainers.',
  },
};

function resolveProject(hash) {
  try {
    return projects.find((project) => project.id === decodeURIComponent(hash.slice(1))) ?? null;
  } catch {
    return null;
  }
}

function ProjectDiagram({ project, compact = false }) {
  const view = projectViews[project.id];
  return (
    <div className={`pw-diagram${compact ? ' pw-diagram--compact' : ''}`} aria-label={`${view.focus} ${view.nodes.join(', ')}.`} role="img">
      <div className="pw-diagram-label"><span>{project.kicker}</span><span aria-hidden="true">↗</span></div>
      <div className="pw-diagram-orbit" aria-hidden="true"><span /><span /><span /><b>{project.category === 'production' ? 'AI' : project.category === 'research' ? 'R' : '↗'}</b></div>
      <div className="pw-diagram-flow" aria-hidden="true">{view.nodes.map((node, index) => <div key={node}><span>0{index + 1}</span><p>{node}</p>{index < 2 && <ArrowRight />}</div>)}</div>
    </div>
  );
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  target?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  target?.focus({ preventScroll: true });
}

function Header() {
  return (
    <header className="pw-header">
      <Link to="/" className="pw-brand" aria-label="GDamon — all website studies">GDamon<span aria-hidden="true">✳</span></Link>
      <span className="pw-header-label">RESEARCH → REAL SYSTEMS</span>
      <nav aria-label="Main navigation"><Link to="/projects" aria-current="page">Work</Link><Link to="/about">About</Link><a href="mailto:hello@damon.ai">Let’s talk <ArrowUpRight size={15} aria-hidden="true" /></a></nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="pw-footer">
      <p>Have a problem worth solving?</p>
      <a href="mailto:hello@damon.ai">Let’s build something useful.<ArrowUpRight aria-hidden="true" /></a>
      <div><span>Damon Guo-Siyi · Hangzhou, China</span><a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer">GitHub ↗</a><Link to="/">All website studies ↗</Link></div>
    </footer>
  );
}

function WorkIndex() {
  const [active, setActive] = useState('all');
  const filtered = useMemo(() => active === 'all' ? projects : projects.filter((project) => project.category === active), [active]);
  return (
    <main id="pw-content" tabIndex={-1}>
      <section className="pw-index-intro">
        <div className="pw-eyebrow"><span>Selected work / 2024—2026</span><span>AI researcher & LLM engineer</span></div>
        <h1 tabIndex={-1}>From research.<br /><span>Into the real world.</span></h1>
        <div className="pw-intro-bottom"><ArrowDown aria-hidden="true" /><p>I build agent systems at Alibaba, working across agentic RL, post-training, and evaluation. These are the systems, research, and tools behind that work.</p></div>
      </section>
      <section className="pw-index" aria-label="Project index">
        <div className="pw-filter-bar"><span className="pw-eyebrow">Work index / {String(projects.length).padStart(2, '0')}</span><div className="pw-filters" aria-label="Filter projects">{categories.map((category) => <button key={category.value} type="button" aria-pressed={active === category.value} onClick={() => setActive(category.value)}>{category.label}<span>{category.value === 'all' ? projects.length : projects.filter((project) => project.category === category.value).length}</span></button>)}</div></div>
        <div className="pw-project-list" aria-live="polite">
          {filtered.map((project) => (
            <Link className="pw-project-row" key={project.id} to={`/projects#${project.id}`} aria-label={`Read ${project.title}`}>
              <span className="pw-project-number">{String(projects.indexOf(project) + 1).padStart(2, '0')}</span>
              <div className="pw-project-summary"><span className="pw-eyebrow">{project.kicker} / {project.stage} / {project.year}</span><h2>{project.title}</h2><p>{project.description}</p><div className="pw-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
              <div className="pw-project-art"><ProjectDiagram project={project} compact /></div>
              <span className="pw-project-open"><ArrowUpRight aria-hidden="true" /><span>Read project</span></span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function CaseStudy({ project }) {
  const view = projectViews[project.id];
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  return (
    <main id="pw-content" tabIndex={-1}>
      <article id={`case-${project.id}`} data-project-id={project.id} className="pw-case">
        <div className="pw-case-top"><Link to="/projects"><ArrowLeft size={15} aria-hidden="true" />All work</Link><span>PROJECT {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span></div>
        <header className="pw-case-hero">
          <div className="pw-case-intro"><p className="pw-eyebrow">{project.kicker} <span>/</span> {project.stage} <span>/</span> {project.year}</p><h1 tabIndex={-1}>{project.title}<span>.</span></h1><p className="pw-case-description">{project.description}</p><div className="pw-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><button type="button" onClick={() => scrollToSection('project-contribution')} className="pw-case-jump">Explore the work<ArrowDown size={16} aria-hidden="true" /></button></div>
          <div className="pw-case-visual"><ProjectDiagram project={project} /><div className="pw-stat"><strong>{view.stat}</strong><span>{view.statLabel}</span></div></div>
        </header>
        <div className="pw-case-story" id="project-contribution" tabIndex={-1}>
          <aside className="pw-case-margin"><span className="pw-eyebrow">Inside the project</span><p>{view.focus}</p><div><span>Role</span><strong>{project.kicker === 'Internship' ? 'Research intern' : project.category === 'production' ? 'AI researcher & LLM engineer' : project.category === 'research' ? 'Research' : 'Creator & builder'}</strong><span>Setting</span><strong>{project.stage}</strong></div></aside>
          <div className="pw-case-sections">
            <section><span className="pw-section-number">01 / Context</span><h2>What the work addresses.</h2><p>{view.context}</p></section>
            <section><span className="pw-section-number">02 / My contribution</span><h2>What I worked on.</h2><ol className="pw-contributions">{project.details.map((detail, detailIndex) => <li key={detail}><span>{String(detailIndex + 1).padStart(2, '0')}</span><p>{detail}</p></li>)}</ol></section>
            <section className="pw-result"><span className="pw-section-number">03 / Result</span><h2>What came out of it.</h2><p>{project.outcome}</p>{view.scope && <small className="pw-result-scope">{view.scope}</small>}</section>
            {project.href.startsWith('https://') && <a className="pw-source-link" href={project.href} target="_blank" rel="noreferrer">Explore the published work<ArrowUpRight size={17} aria-hidden="true" /></a>}
          </div>
        </div>
      </article>
      <nav className="pw-case-next" aria-label="Project navigation"><Link to="/projects" className="pw-all-work"><ArrowLeft size={16} aria-hidden="true" />All work</Link><Link to={`/projects#${next.id}`} className="pw-next-work"><span className="pw-eyebrow">Next project / {String((index + 1) % projects.length + 1).padStart(2, '0')}</span><strong>{projectViews[next.id].short}<ArrowUpRight aria-hidden="true" /></strong></Link></nav>
    </main>
  );
}

export default function Projects() {
  const { hash } = useLocation();
  const project = resolveProject(hash);
  const selectedId = project?.id;

  useLayoutEffect(() => {
    // A project hash selects a full case; it is never a delayed scroll into a filtered list.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.querySelector('.pw-page h1')?.focus({ preventScroll: true });
  }, [hash, selectedId]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${project ? project.title : 'Selected work'} — GDamon`;
    return () => { document.title = previousTitle; };
  }, [project]);

  return <div className="pw-page"><a href="#pw-content" className="pw-skip" onClick={(event) => { event.preventDefault(); scrollToSection('pw-content'); }}>Skip to content</a><Header />{project ? <CaseStudy project={project} /> : <WorkIndex />}<Footer /></div>;
}
