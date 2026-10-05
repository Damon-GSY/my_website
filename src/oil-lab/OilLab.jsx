import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Asterisk, MoveUpRight } from 'lucide-react';
import '@fontsource/anton/latin-400.css';
import { projects } from '../data/projects';
import { aboutProfile } from '../data/about';
import { oilStudies } from './studies';
import { createFrameAnimator, readTimeline } from './frameAnimator';
import './oil-lab.css';
import MatterStory from './MatterStory';

const clamp = (value) => Math.max(0, Math.min(1, value));

function useScrollArtwork(study, storyRef, stageRef, videoRef) {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [status, setStatus] = useState('loading');
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(preference.matches);
    preference.addEventListener('change', change);
    return () => preference.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const story = storyRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    const abort = new AbortController();
    const source = innerWidth <= 700 ? 'mobile.mp4' : 'desktop.mp4';
    let timeline;
    let animator;
    let intersection;
    let resize;
    let disposed = false;
    let ready = false;
    let visible = true;
    let inputFrame = 0;
    let seekFrame = 0;
    let pendingFrame = null;
    let currentFrame = 0;
    let targetFrame = 0;
    let progress = 0;
    let phaseIndex = 0;
    let seekCount = 0;
    let state = reduced ? 'static' : 'loading';
    let failure = null;
    let lastSeekStarted = 0;
    let lastSeekMs = 0;
    let loadTimeout;
    const updateStatus = (value) => { state = value; setStatus(value); };
    const active = () => ready && visible && !document.hidden && !disposed && !reduced && state === 'ready';

    const fail = (error) => {
      if (disposed || state === 'error') return;
      failure = error instanceof Error ? error.message : 'The artwork is unavailable.';
      ready = false;
      clearTimeout(loadTimeout);
      abort.abort();
      animator?.destroy();
      cancelAnimationFrame(seekFrame);
      cancelAnimationFrame(inputFrame);
      seekFrame = inputFrame = 0;
      video.pause();
      updateStatus('error');
      video.removeAttribute('src');
      video.load();
    };
    const flushSeek = () => {
      seekFrame = 0;
      if (!active() || pendingFrame === null || video.seeking || video.readyState < 2) return;
      const frame = pendingFrame;
      pendingFrame = null;
      const time = frame / timeline.fps;
      if (Math.abs(video.currentTime - time) < timeline.frameDuration * .1) {
        currentFrame = frame;
        return;
      }
      try {
        lastSeekStarted = performance.now();
        seekCount++;
        video.currentTime = time;
      } catch (error) { fail(error); }
    };
    const queueSeek = (frame) => {
      pendingFrame = frame;
      if (active() && !seekFrame && !video.seeking) seekFrame = requestAnimationFrame(flushSeek);
    };
    const seeked = () => {
      if (disposed || !timeline) return;
      currentFrame = Math.round(video.currentTime * timeline.fps);
      lastSeekMs = lastSeekStarted ? performance.now() - lastSeekStarted : 0;
      if (pendingFrame !== null && active() && !seekFrame) seekFrame = requestAnimationFrame(flushSeek);
    };
    const readInput = () => {
      inputFrame = 0;
      if (disposed || reduced || state === 'error') return;
      const travel = Math.max(1, story.offsetHeight - stage.clientHeight);
      progress = clamp(-story.getBoundingClientRect().top / travel);
      if (timeline) {
        targetFrame = Math.round(progress * (timeline.frameCount - 1));
        animator?.setProgress(progress);
      }
      const nextPhase = Math.min(2, Math.floor(progress * 3));
      if (nextPhase !== phaseIndex) { phaseIndex = nextPhase; setPhase(nextPhase); }
    };
    const requestInput = () => {
      if (!inputFrame && !disposed && !reduced && state !== 'error' && !document.hidden) inputFrame = requestAnimationFrame(readInput);
    };
    const syncVisibility = () => {
      video.pause();
      if (!active()) {
        animator?.pause();
        cancelAnimationFrame(seekFrame);
        seekFrame = 0;
        if (document.hidden) { cancelAnimationFrame(inputFrame); inputFrame = 0; }
      } else {
        requestInput();
        animator?.resume();
        if (pendingFrame !== null && !seekFrame && !video.seeking) seekFrame = requestAnimationFrame(flushSeek);
      }
    };
    const mediaReady = () => {
      if (!timeline || ready || disposed || state === 'error' || video.readyState < 2) return;
      if (!Number.isFinite(video.duration) || video.duration + timeline.frameDuration < timeline.duration) {
        fail(new Error('The media does not match its timeline.'));
        return;
      }
      video.pause();
      ready = true;
      clearTimeout(loadTimeout);
      updateStatus('ready');
      animator = createFrameAnimator({
        frameCount: timeline.frameCount,
        initialFrame: timeline.initialFrame,
        smoothTime: .12,
        render: queueSeek,
      });
      requestInput();
      syncVisibility();
    };
    const mediaError = () => fail(new Error('The artwork could not be loaded.'));
    const api = {
      getMetrics: () => ({
        id: study.id, control: 'frame-scrub', status: state, progress, targetFrame, currentFrame,
        currentTime: video.currentTime, duration: video.duration || 0,
        fps: timeline?.fps || null, frameCount: timeline?.frameCount || null,
        pendingFrame, seeking: video.seeking, seekCount, lastSeekMs,
        animating: Boolean(animator?.isAnimating() || seekFrame), visible, hidden: document.hidden,
        settled: ready && !animator?.isAnimating() && !seekFrame && pendingFrame === null && !video.seeking && currentFrame === targetFrame,
        paused: video.paused, reduced, source, failure,
      }),
    };
    window.GDamonOil = api;
    updateStatus(reduced ? 'static' : 'loading');
    setPhase(0);
    if (!reduced) {
      loadTimeout = setTimeout(() => fail(new Error('The artwork took too long to load.')), 20000);
      window.addEventListener('scroll', requestInput, { passive: true });
      document.addEventListener('visibilitychange', syncVisibility);
      video.addEventListener('loadeddata', mediaReady);
      video.addEventListener('canplay', mediaReady);
      video.addEventListener('seeked', seeked);
      video.addEventListener('error', mediaError);
      intersection = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        syncVisibility();
      }, { threshold: 0 });
      intersection.observe(stage);
      resize = new ResizeObserver(requestInput);
      resize.observe(story);
      resize.observe(stage);
      const initialize = async () => {
        try {
          const response = await fetch(`/oil-lab/${study.id}/timeline.json`, { signal: abort.signal });
          if (!response.ok) throw new Error('The motion timeline is unavailable.');
          timeline = readTimeline(await response.json());
          const poster = new Image();
          poster.src = `/oil-lab/${study.id}/poster.webp`;
          await poster.decode();
          if (disposed || state === 'error') return;
          video.preload = 'auto';
          video.src = `/oil-lab/${study.id}/${source}`;
          video.load();
        } catch (error) { if (!disposed && error.name !== 'AbortError') fail(error); }
      };
      initialize();
    }
    return () => {
      disposed = true;
      clearTimeout(loadTimeout);
      abort.abort();
      animator?.destroy();
      intersection?.disconnect();
      resize?.disconnect();
      cancelAnimationFrame(inputFrame);
      cancelAnimationFrame(seekFrame);
      window.removeEventListener('scroll', requestInput);
      document.removeEventListener('visibilitychange', syncVisibility);
      video.removeEventListener('loadeddata', mediaReady);
      video.removeEventListener('canplay', mediaReady);
      video.removeEventListener('seeked', seeked);
      video.removeEventListener('error', mediaError);
      video.pause();
      video.removeAttribute('src');
      video.load();
      if (window.GDamonOil === api) delete window.GDamonOil;
    };
  }, [reduced, stageRef, storyRef, study.id, videoRef]);
  return { status, phase, reduced };
}

function StudySite({ study }) {
  const storyRef = useRef(null);
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const { status, phase, reduced } = useScrollArtwork(study, storyRef, stageRef, videoRef);
  const staticMode = reduced || status !== 'ready';
  useEffect(() => {
    const previous = document.title;
    document.title = `GDamon — ${study.name}`;
    return () => { document.title = previous; };
  }, [study.name]);

  return (
    <main className={`oil-site oil-site--${study.id}${staticMode ? ' oil-site--still' : ''}`} data-status={status}>
      <a className="oil-skip" href="#oil-work">Skip to selected work</a>
      <section className="oil-story" ref={storyRef} aria-label={study.name}>
        <div className="oil-stage" ref={stageRef}>
          <header className="oil-header"><Link to="/" className="oil-brand" aria-label="GDamon home">gdamon<Asterisk aria-hidden="true" /></Link><span className="oil-header-note">AI researcher. Builder. Human.</span><nav aria-label="Main navigation"><a href="#oil-work">Work</a><a href="#oil-about">About</a><a href="#oil-contact">Contact<ArrowUpRight size={14} aria-hidden="true" /></a></nav></header>
          <div className="oil-heading"><p className="oil-eyebrow">{study.eyebrow}</p><h1>{study.headline.map((line) => <span key={line}>{line}</span>)}</h1><p className="oil-introduction">{study.introduction}</p><a className="oil-work-link" href="#oil-work">Explore the work<ArrowUpRight size={17} aria-hidden="true" /></a></div>
          <div className="oil-artwork" aria-hidden="true"><img src={`/oil-lab/${study.id}/poster.webp`} className={status === 'ready' ? 'oil-poster is-hidden' : 'oil-poster'} alt="" width="1280" height="720" /><video ref={videoRef} className={status === 'ready' ? 'oil-media is-ready' : 'oil-media'} muted playsInline preload="none" disablePictureInPicture tabIndex={-1} /></div>
          <div className="oil-states" aria-label="The idea in three parts">{study.phases.map((item, index) => <div key={item.id} className={phase === index ? 'is-current' : ''}><span>0{index + 1}</span><div><strong>{item.title}</strong><p>{item.copy}</p></div></div>)}</div>
          {!staticMode && <div className="oil-scroll-hint"><span>Scroll to shape the story</span><ArrowDown size={15} aria-hidden="true" /></div>}
        </div>
      </section>
      <StudySections study={study} />
    </main>
  );
}

function StudySections({ study }) {
  const work = study.projectIds.map((id) => projects.find((project) => project.id === id)).filter(Boolean);
  return <>
      <section className="oil-work" id="oil-work" aria-labelledby="oil-work-title"><div className="oil-section-top"><span>Selected work / 01</span><Link to="/projects">All projects<ArrowUpRight size={16} aria-hidden="true" /></Link></div><div className="oil-work-heading"><h2 id="oil-work-title">{study.workTitle.map((line) => <span key={line}>{line}</span>)}</h2><p>Agentic reinforcement learning, post-training, and evaluation — connected to real work at Alibaba.</p></div><div className="oil-projects">{work.map((project, index) => <Link to={`/projects#${project.id}`} className="oil-project" key={project.id}><span className="oil-project-number">0{index + 1}</span><div><p className="oil-kicker">{project.kicker} / {project.stage}</p><h3>{project.title}</h3><p className="oil-project-summary">{project.description}</p><span className="oil-tags">{project.tags.join(' · ')}</span></div><MoveUpRight className="oil-project-arrow" aria-hidden="true" /></Link>)}</div></section>
      <section className="oil-about" id="oil-about" aria-labelledby="oil-about-title"><div className="oil-section-top"><span>About Damon / 02</span><Asterisk size={23} aria-hidden="true" /></div><div className="oil-about-grid"><h2 id="oil-about-title">{study.aboutTitle.map((line) => <span key={line}>{line}</span>)}</h2><div className="oil-about-copy"><p className="oil-about-lead">I’m Damon Guo-Siyi.<br />Curious about what AI can do next.</p><p>{aboutProfile.intro}</p><p>{aboutProfile.focus}</p><div className="oil-about-links"><Link to="/about">My story<ArrowUpRight size={17} aria-hidden="true" /></Link><Link to="/blog">Research notes<ArrowUpRight size={17} aria-hidden="true" /></Link></div></div></div><dl className="oil-facts"><div><dt>Currently</dt><dd>Alibaba · Hangzhou</dd></div><div><dt>Education</dt><dd>NUS / UNSW</dd></div><div><dt>Working on</dt><dd>Agents that work.</dd></div></dl></section>
      <section className="oil-contact" id="oil-contact" aria-labelledby="oil-contact-title"><div className="oil-section-top"><span>Keep the conversation going / 03</span><span>Hangzhou, China</span></div><h2 id="oil-contact-title">LET’S MAKE<br /><span>IT USEFUL.</span><Asterisk aria-hidden="true" /></h2><div className="oil-contact-row"><a href="mailto:hello@damon.ai">hello@damon.ai<ArrowUpRight aria-hidden="true" /></a><p>Research, ideas, and things<br />worth building together.</p></div><footer className="oil-footer"><Link to="/oil-lab">Oil Motion studies<ArrowUpRight size={14} aria-hidden="true" /></Link><div><a href="https://github.com/Damon-GSY" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.youtube.com/channel/UCEizqDJOPFfjRdQbat0DMmA" target="_blank" rel="noreferrer">YouTube</a><Link to="/">All studies</Link></div><a href="https://github.com/oil-oil/oil-motion" target="_blank" rel="noreferrer">Made with Oil Motion.</a></footer></section>
  </>;
}

function MatterSite({ study }) {
  return <main className="oil-site oil-site--matter">
    <a className="oil-skip" href="#oil-work">Skip to selected work</a>
    <MatterStory />
    <StudySections study={study} />
  </main>;
}

function Gallery({ unavailable = false }) {
  return <main className="oil-gallery"><header><Link className="oil-brand" to="/">gdamon<Asterisk aria-hidden="true" /></Link><Link to="/">All studies<ArrowUpRight size={16} aria-hidden="true" /></Link></header><p className="oil-gallery-label">Experiments in motion / Damon Guo-Siyi</p><h1>NEW FORMS.<br /><span>SAME CURIOSITY.</span></h1><p className="oil-gallery-intro">{unavailable ? 'This study is still taking shape. Explore the available directions below.' : 'A collection of personal websites exploring how intelligence looks, moves, and works.'}</p><div className="oil-gallery-grid">{oilStudies.filter((study) => study.available).map((study) => <Link to={`/oil-lab/${study.id}`} className={`oil-gallery-card oil-gallery-card--${study.id}`} key={study.id}><div><img src={`/oil-lab/${study.id}/poster.webp`} alt={study.description} width="1280" height="720" /></div><span>Study {study.number}</span><h2>{study.name}<ArrowUpRight aria-hidden="true" /></h2><p>{study.description}</p></Link>)}</div><footer>Personal websites. An Oil Motion study.</footer></main>;
}

export default function OilLab() {
  const { pathname } = useLocation();
  const id = pathname.split('/').filter(Boolean)[1];
  const study = oilStudies.find((item) => item.id === id && item.available);
  return study ? study.id === 'matter' ? <MatterSite study={study} /> : <StudySite key={study.id} study={study} /> : <Gallery unavailable={Boolean(id)} />;
}
