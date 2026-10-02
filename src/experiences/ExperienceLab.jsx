import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Code2, Database, Globe2, Search, Wrench } from 'lucide-react';
import { projects } from '../data/projects';
import ExperienceScene from './ExperienceScene';
import '@fontsource/anton/400.css';
import './experiences.css';

const choices = [
  ['path', '01', 'The Agent’s Path'],
  ['field-notes', '02', 'Field Notes'],
  ['world-model', '03', 'World Model'],
];

function ReviewSwitcher({ active }) {
  return <nav className="xp-switcher" aria-label="Switch experimental designs">
    <span>EXPLORE THE DIRECTIONS</span>
    {choices.map(([slug, number, name]) => <Link key={slug} to={`/experiences/${slug}`} aria-label={`${number} — ${name}`} aria-current={active === slug ? 'page' : undefined}>{number}<strong>{name}</strong></Link>)}
    <Link className="xp-switcher-original" to="/">Original <ArrowUpRight size={14} /></Link>
  </nav>;
}

function Header({ theme }) {
  return <header className={`xp-header xp-header-${theme}`}>
    <a className="xp-brand" href="#top">Damon Guo-Siyi<span>AI RESEARCHER / LLM ENGINEER</span></a>
    <nav aria-label="Main navigation"><a href="#work">Work</a><a href="/blog">Notes</a><a href="/about">About</a><a href="/uses">Uses</a></nav>
    <a className="xp-header-contact" href="mailto:hello@damon.ai">Contact <ArrowUpRight size={16} /></a>
  </header>;
}

const decisionSteps = [
  { name: 'PLAN', label: 'Reason, decompose, set goals', detail: 'Turn a request into a sequence of decisions with explicit boundaries.' },
  { name: 'TOOL', label: 'Resolve tools dynamically', detail: 'Choose and use the right tool from a changing environment.' },
  { name: 'EVALUATE', label: 'Verify, learn, improve', detail: 'Inspect intermediate steps, recover from errors, and measure outcomes.' },
  { name: 'DEPLOY', label: 'Create real-world impact', detail: 'Ship the agent with safe handoffs and visible operating limits.' },
];

function PathExperience() {
  const [stage, setStage] = useState(0);
  return <div className="xp-page xp-path" id="top">
    <section className="xp-path-hero">
      <img className="xp-full-art xp-path-hero-art" src="/experience-assets/path-hero.webp" alt="" />
      <ExperienceScene kind="path" activeStep={stage} />
      <Header theme="dark" />
      <div className="xp-path-copy" data-entrance>
        <span className="xp-overline">/ 01 &nbsp; AN INTERACTIVE RESEARCH EXHIBITION</span>
        <h1>Every agent<br />leaves<br />a <em>trace</em><span>.</span></h1>
        <p>Researching the path from reasoning to real-world action.</p>
        <a className="xp-path-enter" href="#work"><span><ArrowRight size={30} /></span><strong>Follow a decision</strong></a>
        <span className="xp-path-cue">CHOOSE A STAGE / SEE THE SYSTEM RESPOND</span>
      </div>
      <div className="xp-path-stages" aria-label="Agent decision stages">
        {decisionSteps.map((step, index) => <button type="button" key={step.name} className={stage === index ? 'is-active' : ''} onClick={() => setStage(index)} aria-pressed={stage === index}><span>{step.name}</span><small>{step.label}</small></button>)}
      </div>
      <aside className="xp-path-map" aria-label="Page chapters">
        <a href="#top" aria-current="location"><i />01 <span>Home</span></a>
        <a href="#work"><i />02 <span>Supply Chain<br />Agent System</span></a>
        <a href="#more-work"><i />03 <span>More Work</span></a>
      </aside>
      <span className="xp-path-scroll">MOVE / SCROLL <ArrowDown size={15} /></span>
    </section>
    <main>
      <section className="xp-path-case" id="work">
        <img className="xp-full-art" src="/experience-assets/path-case.webp" alt="" />
        <div className="xp-path-case-copy" data-reveal>
          <p className="xp-overline">/ 02 &nbsp; CASE STUDY — ALIBABA</p>
          <h2>Supply Chain<br />Agent System</h2>
          <p>An agent system designed for real-world supply chain operations, with risk-aware decisions and human handoffs.</p>
          <div className="xp-path-result"><strong>90%</strong><span>fewer misoperations<br />in supported workflows</span></div>
          <a href={`/projects#${projects[0].id}`} className="xp-path-case-link"><span><ArrowUpRight size={24} /></span> Explore this project</a>
        </div>
        <div className="xp-path-trace" data-reveal>
          <span>ONE DECISION, FOUR VISIBLE STAGES</span>
          {decisionSteps.map((step, index) => <button type="button" key={step.name} onClick={() => setStage(index)} aria-pressed={stage === index}><i />{step.name}</button>)}
          <p aria-live="polite">{decisionSteps[stage].detail}</p>
        </div>
      </section>
      <section className="xp-path-next" id="more-work"><p className="xp-overline">OTHER ROUTES THROUGH THE SYSTEM</p><h2>Each trace tells<br />a different story.</h2><div>{[projects[1], projects[3]].map((project, index) => <a key={project.id} href={`/projects#${project.id}`}><span>0{index + 3}</span><strong>{project.title}</strong><ArrowUpRight size={21} /></a>)}</div></section>
    </main>
  </div>;
}

const fieldTrace = [
  ['REQUEST', 'Understand the user’s intent and the constraints of the task.'],
  ['PLAN', 'Break the task into checks, actions, and points for human review.'],
  ['TOOL USE', 'Resolve and call tools from a changing set of more than 100.'],
  ['OBSERVE', 'Read evidence and adapt when the environment changes.'],
  ['HANDOFF', 'Return a clear result with a trace someone can inspect.'],
];

const tools = [
  { name: 'Search', description: 'Find the right knowledge and evidence.', icon: <Search size={18} strokeWidth={1.7} /> },
  { name: 'Database', description: 'Query structured operational records.', icon: <Database size={18} strokeWidth={1.7} /> },
  { name: 'Python', description: 'Analyze and model the result.', icon: <Code2 size={18} strokeWidth={1.7} /> },
  { name: 'Web', description: 'Reach information outside the internal system.', icon: <Globe2 size={18} strokeWidth={1.7} /> },
  { name: 'API', description: 'Act through a connected service.', icon: <Wrench size={18} strokeWidth={1.7} /> },
];

function FieldNotesExperience() {
  const [unfolded, setUnfolded] = useState(false);
  const [traceStep, setTraceStep] = useState(0);
  const [toolIndex, setToolIndex] = useState(0);
  const openTrace = () => { setUnfolded((value) => !value); };
  return <div className="xp-page xp-field" id="top">
    <section className={`xp-field-hero ${unfolded ? 'is-unfolded' : ''}`}>
      <img className="xp-full-art xp-field-hero-art" src="/experience-assets/field-hero.webp" alt="" />
      <ExperienceScene kind="field" activeStep={unfolded ? traceStep + 1 : 0} />
      <Header theme="light" />
      <div className="xp-field-copy" data-entrance><p className="xp-overline">AI RESEARCHER &nbsp;/&nbsp; LLM ENGINEER<br />AT ALIBABA</p><h1>Intelligence<br />happens<br />in the<br />handoff<span>.</span></h1><p>Researching and building agentic RL, post-training, and evaluation frameworks for real-world systems at Alibaba.</p><button type="button" className="xp-field-open" onClick={openTrace} aria-expanded={unfolded}>{unfolded ? 'Fold the trace' : 'Unfold the work'} <ArrowRight size={23} /></button></div>
      <button type="button" className="xp-field-art-hit" onClick={openTrace} aria-label={unfolded ? 'Fold research trace' : 'Unfold research trace'} />
      <div className="xp-field-trace-sheet" aria-hidden={!unfolded}>
        <div><span>AGENT TRACE / LIVE SPECIMEN</span><button type="button" tabIndex={unfolded ? 0 : -1} onClick={() => setUnfolded(false)} aria-label="Close trace">×</button></div>
        <div className="xp-field-trace-list">{fieldTrace.map(([name], index) => <button type="button" key={name} tabIndex={unfolded ? 0 : -1} className={traceStep === index ? 'is-active' : ''} onClick={() => setTraceStep(index)}><span>0{index + 1}</span>{name}</button>)}</div>
        <p aria-live="polite">{fieldTrace[traceStep][1]}</p>
      </div>
      <div className="xp-field-bottom"><p>FOCUS<br />Agentic RL<br />Post-Training<br />Evaluation<br />Real-World Deployment</p><span>FIELD NOTES ON AGENT SYSTEMS <em>vol. 1</em></span><a href="#work">MOVE / SCROLL <ArrowDown size={17} /></a></div>
    </section>
    <main>
      <section className="xp-field-case" id="work">
        <img className="xp-full-art" src="/experience-assets/field-case.webp" alt="" />
        <div className="xp-field-case-head" data-reveal><span className="xp-overline">01 &nbsp; — &nbsp; DYNAMIC TOOL RESOLUTION AGENTS</span><h2>Dynamic Tool<br />Resolution Agents</h2><p>Agents that dynamically resolve and use tools to complete real-world tasks at Alibaba.</p></div>
        <div className="xp-field-case-bottom" data-reveal><div className="xp-field-metric"><strong>100+</strong><span>TOOLS IN A CHANGING ENVIRONMENT</span></div><div className="xp-field-tools"><p>/ FROM A USER REQUEST<br />&nbsp; TO A MULTI-TOOL SOLUTION</p><div className="xp-field-tool-layout"><div className="xp-field-tool-origin"><span>USER REQUEST</span><strong>Analyze recent sales and find supply risks</strong><ArrowRight size={18} /><span>AGENT PLANNER</span></div><div className="xp-field-tool-options" aria-label="Select a tool">{tools.map(({ name, icon }, index) => <button type="button" key={name} onClick={() => setToolIndex(index)} aria-pressed={toolIndex === index}>{icon}{name}{toolIndex === index && <Check size={15} />}</button>)}</div></div><p className="xp-field-tool-detail" aria-live="polite">{tools[toolIndex].description}</p></div></div>
        <a className="xp-field-project-link" href={`/projects#${projects[1].id}`}>Read the project <ArrowUpRight size={20} /></a>
      </section>
      <section className="xp-field-next"><span className="xp-overline">NEXT FIELD NOTE</span><a href={`/projects#${projects[3].id}`}>How do you evaluate an agent across turns? <ArrowUpRight size={25} /></a></section>
    </main>
  </div>;
}

const worldDecisions = [
  { name: 'PLAN', short: 'Break down goals', text: 'The agent turns a supply-chain request into a sequence of safe next actions.' },
  { name: 'USE TOOLS', short: 'Call external tools', text: 'It finds the right connected tool and acts on fresh operational data.' },
  { name: 'EVALUATE', short: 'Verify and improve', text: 'Every intermediate result is checked before handoff to a person or system.' },
];

function WorldModelExperience() {
  const [decision, setDecision] = useState(0);
  return <div className="xp-page xp-world" id="top">
    <section className="xp-world-hero" data-decision={decision}>
      <img className="xp-full-art xp-world-hero-art" src="/experience-assets/world-hero.webp" alt="" />
      <ExperienceScene kind="world" activeStep={decision} />
      <Header theme="world" />
      <div className="xp-world-copy" data-entrance><p className="xp-overline">AI RESEARCHER &amp; LLM ENGINEER AT ALIBABA</p><h1>What if<br /><em>intelligence</em><br />could act<span>?</span></h1><p>I research and build agent systems that use tools, reason step by step, and work in the real world.</p><a className="xp-world-enter" href="#work">Enter the world <ArrowRight size={20} /></a></div>
      <div className="xp-world-decisions" aria-label="Try an agent decision"><span>TRY A DECISION <ArrowDown size={15} /></span><div>{worldDecisions.map(({ name, short }, index) => <button type="button" key={name} className={decision === index ? 'is-active' : ''} onClick={() => setDecision(index)} aria-pressed={decision === index}><small>0{index + 1}</small><strong>{name}</strong><em>{short}</em></button>)}</div><p aria-live="polite">{worldDecisions[decision].text}</p></div>
      <span className="xp-world-scroll">MOVE / SCROLL TO EXPLORE <ArrowDown size={16} /></span>
    </section>
    <main>
      <section className="xp-world-case" id="work">
        <img className="xp-full-art" src="/experience-assets/world-case.webp" alt="" />
        <div className="xp-world-case-top" data-reveal><span>01 / 03 &nbsp; REAL-WORLD DEPLOYMENT</span><h2>Supply Chain<br />Agent System</h2><p>An agent system at Alibaba built for real supply-chain work, with explicit automation boundaries and fast exception handoff.</p><a href={`/projects#${projects[0].id}`}>Explore the project <ArrowRight size={18} /></a></div>
        <div className="xp-world-outcome" data-reveal><span>REAL-WORLD RESULT</span><strong>90%</strong><b>fewer misoperations</b><p>Risk-aware agent decisions, with humans in control when it matters.</p></div>
      </section>
      <section className="xp-world-next"><span className="xp-overline">KEEP EXPLORING</span>{[projects[1], projects[3]].map((project, index) => <a href={`/projects#${project.id}`} key={project.id}><span>0{index + 2}</span><strong>{project.title}</strong><ArrowUpRight size={22} /></a>)}</section>
    </main>
  </div>;
}

export default function ExperienceLab() {
  const { pathname } = useLocation();
  const active = choices.some(([slug]) => slug === pathname.split('/')[2]) ? pathname.split('/')[2] : 'path';
  useEffect(() => {
    document.title = `${choices.find(([slug]) => slug === active)?.[2]} — Damon design study`;
    window.scrollTo(0, 0);
    return () => { document.title = 'Damon — Agent Systems & AI Research'; };
  }, [active]);
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const nodes = document.querySelectorAll('.xp-page [data-reveal]');
    nodes.forEach((node) => node.classList.add('xp-reveal'));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [active]);
  return <><ReviewSwitcher active={active} />{active === 'field-notes' ? <FieldNotesExperience /> : active === 'world-model' ? <WorldModelExperience /> : <PathExperience />}</>;
}
