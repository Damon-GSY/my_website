import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Asterisk } from 'lucide-react';
import '@fontsource/anton/latin-400.css';
import { clamp, createNoirScene, noirPose, smooth } from './noirScene';
import { readTimeline } from '../oil-lab/frameAnimator';
import './noir.css';

const poses = [
  { label: 'Potential', anchor: 'noir-potential', lines: ['Intelligence.', 'With intent.'], copy: 'I’m Damon Guo-Siyi. I build agent systems from the first benchmark to the last mile of deployment.', link: '#noir-approach', cta: 'Follow the work', note: 'AI researcher & LLM engineer at Alibaba' },
  { label: 'Train', anchor: 'noir-capability', lines: ['Train for', 'capability.'], copy: 'Knowledge matters. So does knowing what to do with it. I train domain models for knowledge QA and real tool use.', link: '/projects#supply-chain-domain-llm', cta: 'The domain model', note: 'Continual pretraining · SFT · Reinforcement learning' },
  { label: 'Deploy', anchor: 'noir-action', lines: ['Connect to', 'the real world.'], copy: 'A plan becomes useful when an agent can act on it. I build dynamic tool systems with clear boundaries and human handoffs.', link: '/projects#dynamic-tool-resolution-agents', cta: 'The tool system', note: '100+ dynamically registered tools' },
  { label: 'Evaluate', anchor: 'noir-judgment', lines: ['Make every', 'step count.'], copy: 'A correct answer is only part of the story. I evaluate the planning, memory, and decisions that happen along the way.', link: '/projects#multi-turn-agent-evaluation', cta: 'The evaluation research', note: 'A taxonomy informed by around 250 papers' },
];

const studies = [
  { id: 'seed', anchor: 'noir-train', number: '01', title: ['From signal', 'to capability.'], label: 'Train', description: 'I led end-to-end training of a supply-chain domain LLM: a dual-axis benchmark, continual pretraining, and integrated SFT/RL. The benchmark measures both what the model knows and how it uses tools.', evidence: 'Internal SOTA on knowledge QA + tool use', method: ['Benchmark', 'Pretrain', 'Align'], project: 'supply-chain-domain-llm', cta: 'Explore the domain model', related: 'product-attribute-rl', relatedLabel: 'Also: multi-objective GRPO' },
  { id: 'relay', anchor: 'noir-deploy', number: '02', title: ['Reasoning,', 'in motion.'], label: 'Deploy', description: 'I designed agentic RL training and dynamic tool registration for ticket-resolution assistants. A Meta Tool gives agents access to a changing pool of 100+ tools, with decisions grounded in the task at hand.', evidence: '90% less manual ticket handling in supported workflows', method: ['Reason', 'Select', 'Execute'], project: 'dynamic-tool-resolution-agents', cta: 'Explore dynamic tool agents', related: 'supply-chain-agent-system', relatedLabel: 'Also: risk-tiered agent systems' },
  { id: 'lens', anchor: 'noir-evaluate', number: '03', title: ['Look closer.', 'Think further.'], label: 'Evaluate', description: 'My multi-turn evaluation research examines planning, tool use, memory, and the decisions between turns. With SupChain-Bench, I bring that question into supply-chain work through 530 annotated real-world samples.', evidence: 'Planning · Tool use · Memory · Agent-as-Judge', method: ['Observe', 'Evaluate', 'Replan'], project: 'multi-turn-agent-evaluation', cta: 'Explore the evaluation taxonomy', related: 'supchain-bench', relatedLabel: 'Also: SupChain-Bench' },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);
  return reduced;
}

function useHeroMotion(storyRef, stageRef, canvasRef, reduced, metricsRef, onFailure) {
  const [status, setStatus] = useState(reduced ? 'static' : 'loading');
  const [phase, setPhase] = useState(0);
  const [interaction, setInteraction] = useState(0);
  useEffect(() => {
    const story = storyRef.current, stage = stageRef.current, canvas = canvasRef.current;
    const registry = metricsRef.current;
    const cards = [...stage.querySelectorAll('.noir-pose')];
    const state = { progress: 0, target: 0, phase: 0, interaction: 0, visible: true, status: reduced ? 'static' : 'loading' };
    const pointer = { x: 0, y: 0 }, pointerTarget = { x: 0, y: 0 };
    let scene, raf = 0, last = 0, disposed = false, observer, resizeObserver;
    const pending = () => Math.abs(state.progress - state.target) > .00004 || Math.abs(pointer.x - pointerTarget.x) + Math.abs(pointer.y - pointerTarget.y) > .0001;
    const active = () => !disposed && state.visible && !document.hidden && state.status === 'ready';
    const wake = () => { if (!raf && active()) raf = requestAnimationFrame(tick); };
    const draw = () => {
      const pose = noirPose(state.progress);
      if (state.phase !== pose.phase) { state.phase = pose.phase; setPhase(pose.phase); }
      const interactivePose = pose.opacity.findIndex((opacity) => opacity >= .2);
      if (state.interaction !== interactivePose) { state.interaction = interactivePose; setInteraction(interactivePose); }
      cards.forEach((card, i) => {
        const visible = pose.opacity[i];
        card.style.opacity = visible;
        card.style.transform = `translateY(${(1 - visible) * 20}px)`;
        card.inert = visible < .2;
        card.setAttribute('aria-hidden', visible < .2 ? 'true' : 'false');
      });
      stage.style.setProperty('--noir-progress', state.progress);
      scene.render(state.progress, pointer);
    };
    function tick(now) {
      raf = 0;
      if (!active()) return;
      const dt = Math.min(.04, last ? (now - last) / 1000 : 1 / 60);
      last = now;
      const alpha = 1 - Math.exp(-dt / .105);
      state.progress += (state.target - state.progress) * alpha;
      pointer.x += (pointerTarget.x - pointer.x) * alpha;
      pointer.y += (pointerTarget.y - pointer.y) * alpha;
      if (Math.abs(state.target - state.progress) < .00004) state.progress = state.target;
      draw();
      if (pending()) wake(); else last = 0;
    }
    const input = () => {
      state.target = clamp(-story.getBoundingClientRect().top / Math.max(1, story.offsetHeight - stage.clientHeight));
      wake();
    };
    const placeAnchors = () => {
      const travel = Math.max(1, story.offsetHeight - stage.clientHeight);
      [...story.querySelectorAll('.noir-anchor')].forEach((anchor, i) => { anchor.style.top = `${[0, .34, .67, 1][i] * travel}px`; });
    };
    const resize = () => { placeAnchors(); scene?.resize(); input(); if (active()) draw(); };
    const move = (event) => {
      if (event.pointerType !== 'mouse' || event.target.closest('a,button')) return;
      pointerTarget.x = (event.clientX / innerWidth - .5) * .8;
      pointerTarget.y = (event.clientY / innerHeight - .5) * .8;
      wake();
    };
    const reset = () => { pointerTarget.x = pointerTarget.y = 0; wake(); };
    const visibility = () => {
      if (!active()) { cancelAnimationFrame(raf); raf = 0; last = 0; }
      else { input(); wake(); }
    };
    const fallback = () => {
      if (disposed) return;
      state.status = 'fallback'; cancelAnimationFrame(raf); raf = 0;
      cards.forEach((card) => { card.style.removeProperty('opacity'); card.style.removeProperty('transform'); card.inert = false; card.removeAttribute('aria-hidden'); });
      setStatus('fallback');
      onFailure(true);
    };
    const contextLost = (event) => { event.preventDefault(); fallback(); };
    registry.hero = () => ({ ...state, targetProgress: state.target, running: Boolean(raf), settled: !raf && !pending(), reduced, hidden: document.hidden, ...scene?.getMetrics() });
    queueMicrotask(() => { if (!disposed) { setStatus(state.status); setPhase(0); setInteraction(0); } });
    cards.forEach((card, i) => { card.style.removeProperty('opacity'); card.style.removeProperty('transform'); card.inert = !reduced && i > 0; card.setAttribute('aria-hidden', !reduced && i > 0 ? 'true' : 'false'); });
    if (!reduced) {
      document.fonts.load('400 100px Anton').then(() => {
        if (disposed) return;
        try {
          scene = createNoirScene(canvas);
          state.status = 'ready'; setStatus('ready');
          observer = new IntersectionObserver((entries) => { state.visible = entries[0].isIntersecting; visibility(); });
          observer.observe(stage);
          resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
          window.addEventListener('scroll', input, { passive: true });
          window.addEventListener('resize', resize);
          window.visualViewport?.addEventListener('resize', resize);
          stage.addEventListener('pointermove', move, { passive: true });
          stage.addEventListener('pointerleave', reset);
          document.addEventListener('visibilitychange', visibility);
          canvas.addEventListener('webglcontextlost', contextLost);
          placeAnchors(); input(); state.progress = state.target; draw();
        } catch { fallback(); }
      }).catch(fallback);
    }
    return () => {
      disposed = true; cancelAnimationFrame(raf);
      observer?.disconnect(); resizeObserver?.disconnect(); scene?.dispose();
      window.removeEventListener('scroll', input); window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
      stage.removeEventListener('pointermove', move); stage.removeEventListener('pointerleave', reset);
      document.removeEventListener('visibilitychange', visibility); canvas.removeEventListener('webglcontextlost', contextLost);
      delete registry.hero;
    };
  }, [storyRef, stageRef, canvasRef, reduced, metricsRef, onFailure]);
  return { status, phase, interaction };
}

function NoirHero({ reduced, metricsRef, onFailure }) {
  const storyRef = useRef(null), stageRef = useRef(null), canvasRef = useRef(null);
  const { status, phase, interaction } = useHeroMotion(storyRef, stageRef, canvasRef, reduced, metricsRef, onFailure);
  const staticMode = reduced || status === 'fallback';
  return <section className="noir-story" ref={storyRef} data-mode={staticMode ? 'static' : 'motion'} data-status={status} aria-label="From research to useful intelligence">
    {!staticMode && poses.map((pose) => <span className="noir-anchor" id={pose.anchor} key={pose.anchor} />)}
    <div className="noir-stage" ref={stageRef}>
      <div className="noir-static-orb" aria-hidden="true" />
      <canvas ref={canvasRef} className="noir-canvas" aria-hidden="true" />
      <div className="noir-identity"><span>Damon Guo-Siyi</span><span>Alibaba / Hangzhou, China</span><span>Agentic RL · Post-training · Evaluation</span></div>
      <span className="noir-side-label" aria-hidden="true">THOUGHT → ACTION</span>
      <div className="noir-pose-stack">
        {poses.map((pose, i) => {
          const Heading = i === 0 ? 'h1' : 'h2';
          return <article className="noir-pose" key={pose.label} id={staticMode ? pose.anchor : undefined} inert={!staticMode && i !== interaction} aria-hidden={!staticMode && i !== interaction}>
            <p className="noir-eyebrow"><span className="noir-live-dot" />{pose.note}</p>
            <Heading>{pose.lines.map((line) => <span key={line}>{line}</span>)}</Heading>
            <p className="noir-pose-copy">{pose.copy}</p>
            <a className="noir-text-link" href={pose.link}>{pose.cta}<ArrowUpRight size={18} aria-hidden="true" /></a>
          </article>;
        })}
      </div>
      <div className="noir-story-bottom"><span className="noir-scroll-cue"><ArrowDown size={15} aria-hidden="true" /> A story in four movements</span><nav aria-label="Research movements">{poses.map((pose, i) => <a href={`#${pose.anchor}`} key={pose.label} aria-current={phase === i ? 'step' : undefined}><span>0{i + 1}</span>{pose.label}</a>)}</nav><span className="noir-bottom-tick" aria-hidden="true" /></div>
    </div>
  </section>;
}

function useStudyMotion(study, sectionRef, stageRef, videoRef, reduced, metricsRef) {
  const [status, setStatus] = useState(reduced ? 'static' : 'loading');
  useEffect(() => {
    const section = sectionRef.current, stage = stageRef.current, video = videoRef.current;
    const registry = metricsRef.current;
    const abort = new AbortController();
    const source = innerWidth <= 700 ? 'mobile.mp4' : 'desktop.mp4';
    const state = { id: study.id, progress: 0, target: 0, frame: 0, targetFrame: 0, status: reduced ? 'static' : 'loading', visible: false, seeks: 0 };
    let raf = 0, last = 0, disposed = false, timeout, seekTimeout, observer, resizeObserver, timeline, requested = false;
    let timelineStatus = reduced ? 'static' : 'unrequested';
    const active = () => !disposed && !reduced && !document.hidden && state.visible;
    const pending = () => Math.abs(state.progress - state.target) > .00008;
    const wake = () => { if (active() && !raf) raf = requestAnimationFrame(tick); };
    const fail = () => {
      if (disposed || state.status === 'poster') return;
      const rect = section.getBoundingClientRect();
      const preserveReading = state.visible && rect.top <= 0 && rect.bottom > innerHeight * .5;
      clearTimeout(timeout); clearTimeout(seekTimeout);
      if (timelineStatus === 'loading') timelineStatus = 'error';
      abort.abort();
      state.status = 'poster'; setStatus('poster');
      video.pause(); video.removeAttribute('src'); video.load();
      if (preserveReading) requestAnimationFrame(() => { if (!disposed) section.scrollIntoView({ behavior: 'instant', block: 'start' }); });
    };
    const seek = () => {
      if (!timeline || state.status !== 'ready' || video.seeking || !active()) return;
      const targetTime = Math.min(timeline.states.at(-1).hold, state.targetFrame / timeline.fps);
      if (Math.abs(video.currentTime - targetTime) < timeline.frameDuration * .25) { state.frame = state.targetFrame; return; }
      try { video.currentTime = targetTime; state.seeks++; clearTimeout(seekTimeout); seekTimeout = setTimeout(fail, 3000); }
      catch { fail(); }
    };
    const draw = () => {
      const p = smooth(.04, .92, state.progress);
      if (timeline) state.targetFrame = Math.max(timeline.initialFrame, Math.min(timeline.frameCount - 1, Math.round(timeline.initialFrame + p * (timeline.frameCount - 1 - timeline.initialFrame))));
      stage.style.setProperty('--study-progress', p);
      stage.style.setProperty('--study-lift', `${(1 - smooth(0, .30, state.progress)) * 22}px`);
      [...stage.querySelectorAll('.noir-process span')].forEach((item, i) => { item.dataset.active = p >= i / 3 ? 'true' : 'false'; });
      seek();
    };
    function tick(now) {
      raf = 0;
      if (!active()) return;
      const dt = Math.min(.045, last ? (now - last) / 1000 : 1 / 60); last = now;
      state.progress += (state.target - state.progress) * (1 - Math.exp(-dt / .10));
      if (!pending()) state.progress = state.target;
      draw();
      if (pending()) wake(); else last = 0;
    }
    const input = () => {
      const travel = Math.max(1, section.offsetHeight - stage.clientHeight);
      state.target = clamp(-section.getBoundingClientRect().top / travel);
      wake();
    };
    const ready = () => {
      if (!timeline || state.status === 'poster' || state.status === 'ready' || video.readyState < 2) return;
      if (!Number.isFinite(video.duration) || video.duration + timeline.frameDuration < timeline.duration) { fail(); return; }
      clearTimeout(timeout); state.status = 'ready'; setStatus('ready'); video.pause(); input(); wake();
    };
    const seeked = () => { if (!timeline) return; clearTimeout(seekTimeout); state.frame = Math.max(timeline.initialFrame, Math.min(timeline.frameCount - 1, Math.round(video.currentTime * timeline.fps))); video.pause(); if (active()) { seek(); wake(); } };
    const visibility = () => {
      video.pause();
      if (!active()) { cancelAnimationFrame(raf); raf = 0; last = 0; }
      else { input(); wake(); }
    };
    registry[study.id] = () => ({ ...state, targetProgress: state.target, source, timelineStatus, fps: timeline?.fps || null, frameCount: timeline?.frameCount || null, initialFrame: timeline?.initialFrame ?? null, finalHold: timeline?.states.at(-1).hold ?? null, currentTime: video.currentTime, duration: video.duration || 0, paused: video.paused, seeking: video.seeking, running: Boolean(raf), settled: !raf && !pending() && !video.seeking, reduced, hidden: document.hidden });
    queueMicrotask(() => { if (!disposed) setStatus(state.status); });
    if (!reduced) {
      video.addEventListener('loadeddata', ready); video.addEventListener('canplay', ready); video.addEventListener('seeked', seeked); video.addEventListener('error', fail);
      observer = new IntersectionObserver((entries) => {
        state.visible = entries[0].isIntersecting;
        if (state.visible && state.status === 'loading' && !requested) {
          requested = true; timelineStatus = 'loading'; timeout = setTimeout(fail, 12000);
          fetch(`/oil-lab/noir/${study.id}/timeline.json`, { signal: abort.signal }).then(async (response) => {
            if (!response.ok) throw new Error('Motion timeline unavailable.');
            const data = await response.json();
            const parsed = readTimeline(data);
            if (data.initialState !== 'form' || parsed.states.length !== 2 || parsed.states[0].id !== 'form' || parsed.states[1].id !== 'resolve') throw new Error('Unexpected motion sequence.');
            if (disposed || abort.signal.aborted) return;
            timeline = parsed; timelineStatus = 'ready'; state.frame = timeline.initialFrame;
            input(); draw();
            video.src = `/oil-lab/noir/${study.id}/${source}`; video.load();
          }).catch(() => { if (!disposed && !abort.signal.aborted) { timelineStatus = 'error'; fail(); } });
        }
        visibility();
      }, { rootMargin: '100px 0px' });
      observer.observe(stage);
      resizeObserver = new ResizeObserver(input); resizeObserver.observe(stage);
      window.addEventListener('scroll', input, { passive: true }); window.addEventListener('resize', input);
      window.visualViewport?.addEventListener('resize', input); document.addEventListener('visibilitychange', visibility);
      input(); draw();
    }
    return () => {
      disposed = true; abort.abort(); cancelAnimationFrame(raf); clearTimeout(timeout); clearTimeout(seekTimeout);
      observer?.disconnect(); resizeObserver?.disconnect();
      window.removeEventListener('scroll', input); window.removeEventListener('resize', input);
      window.visualViewport?.removeEventListener('resize', input); document.removeEventListener('visibilitychange', visibility);
      video.removeEventListener('loadeddata', ready); video.removeEventListener('canplay', ready); video.removeEventListener('seeked', seeked); video.removeEventListener('error', fail);
      video.pause(); video.removeAttribute('src'); video.load(); delete registry[study.id];
    };
  }, [study, sectionRef, stageRef, videoRef, reduced, metricsRef]);
  return status;
}

function NoirStudy({ study, reduced, metricsRef }) {
  const sectionRef = useRef(null), stageRef = useRef(null), videoRef = useRef(null);
  const status = useStudyMotion(study, sectionRef, stageRef, videoRef, reduced, metricsRef);
  return <section className="noir-study" data-noir-study={study.id} data-status={status} data-mode={reduced || status === 'poster' ? 'static' : 'motion'} id={study.anchor} ref={sectionRef} aria-labelledby={`${study.id}-heading`}>
    <div className="noir-study-stage" ref={stageRef}>
      <div className="noir-study-rule"><span>{study.number} / {study.label}</span><span>From research to real use</span></div>
      <div className={`noir-study-art noir-study-art-${study.id}`} aria-hidden="true">
        <div className="noir-study-fallback"><span /><span /><span /></div>
        <img src={`/oil-lab/noir/${study.id}/${reduced ? 'rest' : 'poster'}.webp`} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.opacity = 0; }} />
        <video ref={videoRef} muted playsInline preload="none" disablePictureInPicture tabIndex={-1} />
      </div>
      <div className="noir-study-copy"><span className="noir-eyebrow">{study.label} / A closer look</span><h2 id={`${study.id}-heading`}>{study.title.map((line) => <span key={line}>{line}</span>)}</h2><p>{study.description}</p><a className="noir-text-link" href={`/projects#${study.project}`}>{study.cta}<ArrowUpRight size={17} aria-hidden="true" /></a><a className="noir-related" href={`/projects#${study.related}`}>{study.relatedLabel}<ArrowUpRight size={13} aria-hidden="true" /></a></div>
      <div className="noir-study-bottom"><p>{study.evidence}</p><div className="noir-process" aria-label={`${study.label} process`}>{study.method.map((method, i) => <span key={method}><small>0{i + 1}</small>{method}</span>)}</div></div>
    </div>
  </section>;
}

const work = [
  ['01', 'Supply Chain Agent System', 'Production / Alibaba', 'A risk-tiered decision framework across 12 supply-chain scenarios.', 'supply-chain-agent-system'],
  ['02', 'Product Attribute RL', 'Post-training / Alibaba', 'Multi-objective GRPO with conditional rewards and variance control.', 'product-attribute-rl'],
  ['03', 'SupChain-Bench', 'Benchmark / Research', '530 annotated samples grounded in real supply-chain work.', 'supchain-bench'],
  ['04', 'M365 Copilot Memory Evaluation', 'Research / MSRA', 'Long-context memory and multi-turn evaluation for email workflows.', 'm365-copilot-memory-eval'],
];

export default function NoirPage() {
  const reduced = useReducedMotion(), metricsRef = useRef({});
  const [visualFallback, setVisualFallback] = useState(false);
  useEffect(() => {
    const oldTitle = document.title;
    document.title = 'Damon Guo-Siyi — Intelligence with intent';
    const api = { getMetrics: () => ({ hero: metricsRef.current.hero?.() || null, chapters: studies.map((study) => metricsRef.current[study.id]?.()).filter(Boolean) }) };
    window.GDamonNoir = api;
    let disposed = false;
    const settleHash = () => { if (!disposed && location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'instant', block: 'start' }); };
    document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(settleHash)));
    return () => { disposed = true; document.title = oldTitle; if (window.GDamonNoir === api) delete window.GDamonNoir; };
  }, []);
  return <main className="noir-page" data-reduced={reduced ? 'true' : 'false'}>
    <a className="noir-skip" href="#noir-work">Skip to selected work</a>
    <header className="noir-header"><a href="#noir-potential" className="noir-brand" aria-label="Damon, back to the beginning">gdamon<Asterisk size={19} aria-hidden="true" /></a><span className="noir-header-role">Research into reality.</span><nav aria-label="Main navigation"><a href="#noir-approach">Approach</a><a href="#noir-work">Work</a><a href="#noir-contact">Let’s talk<ArrowUpRight size={13} aria-hidden="true" /></a></nav></header>
    <NoirHero reduced={reduced} metricsRef={metricsRef} onFailure={setVisualFallback} />
    <section className="noir-intro" id="noir-approach" aria-labelledby="noir-intro-heading"><div className="noir-section-label"><span>01—03 / The practice</span><span>Research → Deployment</span></div><h2 id="noir-intro-heading">Ideas are a beginning.<br /><span>Useful systems are the work.</span></h2><div className="noir-intro-bottom"><p>I work across agentic reinforcement learning, post-training, and evaluation. These are three parts of the same question: how do we make AI capable, reliable, and useful?</p><nav aria-label="Explore the practice">{studies.map((study) => <a href={`#${study.anchor}`} key={study.id}><span>{study.number}</span>{study.label}<ArrowDown size={14} aria-hidden="true" /></a>)}</nav></div></section>
    {studies.map((study) => <NoirStudy key={study.id} study={study} reduced={reduced || visualFallback} metricsRef={metricsRef} />)}
    <section className="noir-work" id="noir-work" aria-labelledby="noir-work-heading"><div className="noir-section-label"><span>04 / Selected work</span><Link to="/projects">All projects<ArrowUpRight size={14} aria-hidden="true" /></Link></div><h2 id="noir-work-heading">Built. Tested.<br /><span>Put to work.</span></h2><div className="noir-work-list">{work.map(([number, title, category, description, id]) => <a className="noir-work-row" href={`/projects#${id}`} key={id}><span className="noir-work-number">{number}</span><div><span className="noir-eyebrow">{category}</span><h3>{title}</h3><p>{description}</p></div><ArrowUpRight size={24} strokeWidth={1.2} aria-hidden="true" /></a>)}</div></section>
    <section className="noir-about" id="noir-about" aria-labelledby="noir-about-heading"><div className="noir-section-label"><span>05 / The human behind the systems</span><span>Hangzhou, China</span></div><div className="noir-about-grid"><h2 id="noir-about-heading">Damon<br />Guo-Siyi<span>・</span></h2><div><p className="noir-about-lead">AI researcher.<br />LLM engineer.<br />Always a work in progress.</p><p>I build and evaluate agent systems at Alibaba. Previously, I worked on memory and evaluation for M365 Copilot at Microsoft Research Asia. I studied at NUS and UNSW, and share practical AI through research notes, YouTube, and Bilibili.</p><Link to="/about" className="noir-text-link">More about me<ArrowUpRight size={17} aria-hidden="true" /></Link><div className="noir-about-facts"><span>Alibaba<small>Current</small></span><span>NUS · UNSW<small>Education</small></span><span>Research + Code<small>Practice</small></span></div></div></div></section>
    <footer className="noir-contact" id="noir-contact"><div className="noir-section-label"><span>Keep the conversation going</span><Asterisk size={19} aria-hidden="true" /></div><a href="mailto:hello@damon.ai" className="noir-contact-title">Let’s make<br />it useful.<ArrowUpRight strokeWidth={.8} aria-hidden="true" /></a><div className="noir-contact-bottom"><a href="mailto:hello@damon.ai">hello@damon.ai</a><p>Research, collaboration,<br />or a question worth asking.</p><nav aria-label="Find Damon online"><a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer">GitHub<ArrowUpRight size={12} aria-hidden="true" /></a><a href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA" target="_blank" rel="noreferrer">YouTube<ArrowUpRight size={12} aria-hidden="true" /></a><a href="https://space.bilibili.com/358541297" target="_blank" rel="noreferrer">Bilibili<ArrowUpRight size={12} aria-hidden="true" /></a></nav></div><div className="noir-colophon"><Link to="/">All directions<ArrowUpRight size={12} aria-hidden="true" /></Link><span>Damon Guo-Siyi</span><a href="#noir-potential">Back to the beginning<ArrowUpRight size={12} aria-hidden="true" /></a></div></footer>
  </main>;
}
