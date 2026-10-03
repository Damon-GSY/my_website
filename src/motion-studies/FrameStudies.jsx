import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import PoseCanvas from './PoseCanvas';
import './frame-studies.css';

const DIRECTIONS = {
  observer: {
    number: '01', name: 'The Observer', type: 'CHARACTER / INTERACTION',
    title: <>A little<br />more <em>human.</em></>,
    description: 'Building useful intelligence starts with understanding the people on the other side.',
    chinese: '钴蓝、温暖的机器角色，以及随指针转向的六个姿态。',
    gesture: 'Move across the character', start: 'LOOK LEFT', end: 'LOOK RIGHT',
    accessible: 'A robotic character shown in six different viewing directions',
  },
  bloom: {
    number: '02', name: 'Soft Intelligence', type: 'ORGANIC / TRANSFORMATION',
    title: <>Good ideas<br /><em>unfold.</em></>,
    description: 'From a small question to a more capable system. Research is a practice of opening things up.',
    chinese: '纸白与朱红。拖动时间轴，观察机械花朵逐帧展开。',
    gesture: 'Drag to let it unfold', start: 'CLOSED', end: 'OPEN',
    accessible: 'A sculptural mechanical flower shown at six stages of opening',
  },
  core: {
    number: '03', name: 'Inner Workings', type: 'STRUCTURE / ASSEMBLY',
    title: <>Order from<br /><em>uncertainty.</em></>,
    description: 'Tools, memory, and decisions. Exploring how individual parts become a system that works.',
    chinese: '黑色与琥珀。结构拆解、再装配，可随时反向播放。',
    gesture: 'Take it apart. Put it together.', start: 'SCATTERED', end: 'ASSEMBLED',
    accessible: 'A machine core shown in six stages from separated parts to assembled',
  },
};

function useTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return () => { document.title = previous; };
  }, [title]);
}

function StudyHeader({ dark = false }) {
  return (
    <header className={`fm-header${dark ? ' fm-header-dark' : ''}`}>
      <Link className="fm-wordmark" to="/motion-lab" aria-label="Damon — motion studies home">damon<ArrowUpRight size={12} aria-hidden="true" /></Link>
      <span className="fm-header-note">INDEPENDENT EXPLORATIONS<br />INTELLIGENCE IN MOTION</span>
      <nav aria-label="Primary navigation">
        <Link to="/projects">Work <ArrowUpRight size={13} /></Link>
        <Link to="/about">About <ArrowUpRight size={13} /></Link>
        <a href="mailto:hello@damon.ai" className="fm-contact-link">Let’s talk <ArrowUpRight size={15} /></a>
      </nav>
    </header>
  );
}

function StudiesIndex({ studies }) {
  useTitle('Motion studies — Damon Guo-Siyi');
  return (
    <main className="fm-page fm-index">
      <StudyHeader />
      <section className="fm-index-intro" aria-labelledby="fm-index-title">
        <div className="fm-kicker"><span className="fm-dot" /> THE MOTION NOTEBOOK · VOL. 01</div>
        <h1 id="fm-index-title">Still images.<br /><em>New possibilities.</em></h1>
        <div className="fm-index-intro-bottom">
          <p>Three little experiments in giving ideas a life of their own.</p>
          <p lang="zh-CN">三种视觉方向，三种交互。<br />从生成画面出发，探索逐帧的可能性。</p>
          <a href="#studies" className="fm-round-link" aria-label="Explore the three studies"><ArrowDown size={23} /></a>
        </div>
      </section>
      <section id="studies" className="fm-index-studies" aria-label="Choose a motion study">
        {studies.filter((study) => DIRECTIONS[study.id]).map((study) => {
          const direction = DIRECTIONS[study.id];
          return (
            <Link className={`fm-study-row fm-row-${study.id}`} to={`/motion-lab/${study.id}`} key={study.id}>
              <span className="fm-row-number">{direction.number}<span>/</span></span>
              <div className="fm-row-art"><PoseCanvas study={study} frame={study.restFrame ?? 0} /></div>
              <div className="fm-row-copy">
                <span className="fm-kicker">{direction.type}</span>
                <h2>{direction.name}</h2>
                <p lang="zh-CN">{direction.chinese}</p>
                <span className="fm-row-enter">Explore study <ArrowUpRight size={18} /></span>
              </div>
              <span className="fm-row-native">{study.frameCount} POSES<br />FRAME BY FRAME</span>
            </Link>
          );
        })}
      </section>
      <footer className="fm-index-footer">
        <div><strong>Made of curiosity.</strong><p>AI research & engineering — Damon Guo-Siyi, Alibaba.</p></div>
        <p lang="zh-CN">基于 Oil Motion 的分镜思路。<br />六个原生姿态，往返预览；并非连续视频。</p>
        <Link to="/lab">More experiments <ArrowUpRight size={15} /></Link>
      </footer>
    </main>
  );
}

function usePosePlayer(study, surfaceRef) {
  const maximum = study.frameCount - 1;
  const frameInterval = 1000 / (study.playbackFPS || 5);
  const [frame, setFrame] = useState(Math.min(maximum, study.restFrame ?? 0));
  const frameRef = useRef(frame);
  const [mode, setMode] = useState('paused');
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [visible, setVisible] = useState(true);
  const [foreground, setForeground] = useState(() => !document.hidden);
  const direction = useRef(1);

  const commitFrame = useCallback((next) => {
    const bounded = Math.max(0, Math.min(maximum, Math.round(next)));
    if (frameRef.current !== bounded) {
      frameRef.current = bounded;
      setFrame(bounded);
    }
  }, [maximum]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => {
      setReduced(media.matches);
      if (media.matches) setMode('paused');
    };
    const onVisibility = () => setForeground(!document.hidden);
    media.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    if (surfaceRef.current) observer.observe(surfaceRef.current);
    return () => {
      media.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
    };
  }, [surfaceRef]);

  useEffect(() => {
    if (mode === 'paused' || reduced || !visible || !foreground) return undefined;
    let timer;
    const tick = () => {
      const current = frameRef.current;
      if (mode === 'preview') {
        if (current >= maximum) direction.current = -1;
        if (current <= 0) direction.current = 1;
        commitFrame(current + direction.current);
      } else {
        const next = current + (mode === 'forward' ? 1 : -1);
        commitFrame(next);
        if (next >= maximum || next <= 0) {
          setMode('paused');
          return;
        }
      }
      timer = window.setTimeout(tick, frameInterval);
    };
    timer = window.setTimeout(tick, frameInterval);
    return () => window.clearTimeout(timer);
  }, [mode, reduced, visible, foreground, maximum, frameInterval, commitFrame]);

  const selectFrame = useCallback((next) => {
    setMode('paused');
    commitFrame(next);
  }, [commitFrame]);

  const moveTo = (target) => {
    if (reduced || target === frameRef.current) {
      selectFrame(target);
    } else {
      setMode(target > frameRef.current ? 'forward' : 'reverse');
    }
  };

  return {
    frame, mode, reduced, selectFrame, moveTo,
    togglePreview: () => {
      if (reduced) return;
      setMode((current) => current === 'paused' ? 'preview' : 'paused');
    },
  };
}

function StudyPage({ study }) {
  const direction = DIRECTIONS[study.id];
  const surfaceRef = useRef(null);
  const dragging = useRef(false);
  const [assetState, setAssetState] = useState('loading');
  const player = usePosePlayer(study, surfaceRef);
  const ready = assetState === 'ready';
  const maximum = study.frameCount - 1;
  const nextStudy = { observer: 'bloom', bloom: 'core', core: 'observer' }[study.id];
  useTitle(`${direction.name} — Damon’s motion studies`);

  const poseFromPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    player.selectFrame(((event.clientX - bounds.left) / bounds.width) * maximum);
  };
  const onDragStart = (event) => {
    if (study.id !== 'bloom' || !ready) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    poseFromPointer(event);
  };
  const onDragMove = (event) => {
    if (dragging.current) poseFromPointer(event);
  };
  const endDrag = () => { dragging.current = false; };
  const onReady = useCallback(() => setAssetState('ready'), []);
  const onError = useCallback(() => setAssetState('error'), []);

  return (
    <main className={`fm-page fm-detail fm-${study.id}`}>
      <StudyHeader dark={study.id !== 'bloom'} />
      <section className="fm-hero" aria-labelledby="fm-study-title">
        <div className="fm-hero-topline">
          <Link to="/motion-lab"><ArrowLeft size={14} /> All studies</Link>
          <span>{direction.number} / 03 <span className="fm-topline-divider">—</span> {direction.name}</span>
          <span className="fm-edition">EXPERIMENTS IN INTELLIGENCE</span>
        </div>
        <div className="fm-hero-composition">
          <div className="fm-hero-copy">
            <div className="fm-kicker"><span className="fm-dot" /> {direction.type}</div>
            <h1 id="fm-study-title">{direction.title}</h1>
            <p className="fm-hero-description">{direction.description}</p>
            <Link to="/projects" className="fm-project-link">Explore my work <ArrowUpRight size={19} /></Link>
          </div>
          <div className="fm-art-column">
            <div className="fm-art-meta"><span>FIG. {direction.number}</span><span>{direction.name.toUpperCase()}</span><span>↗</span></div>
            <div
              className={`fm-art-surface${study.id === 'bloom' ? ' fm-draggable' : ''}`}
              ref={surfaceRef}
              style={{ '--fm-art-size': `${study.displaySize ?? study.cellWidth}px` }}
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onLostPointerCapture={endDrag}
              role="img"
              aria-label={`${direction.accessible}. Current pose ${player.frame + 1} of ${study.frameCount}.`}
            >
              <span className="fm-cross fm-cross-top" aria-hidden="true">+</span>
              <span className="fm-cross fm-cross-bottom" aria-hidden="true">+</span>
              <PoseCanvas
                study={study}
                frame={player.frame}
                onReady={onReady}
                onError={onError}
                interactive={study.id === 'observer' && ready && !player.reduced}
                onPointerFrame={player.selectFrame}
              />
            </div>
            <div className="fm-art-caption"><span className="fm-caption-line" /><span>{direction.gesture}</span><span className="fm-caption-line" /></div>
            <div className="fm-player" aria-label="Frame controls">
              {study.id === 'core' && (
                <div className="fm-assembly-controls">
                  <button disabled={!ready} onClick={() => player.moveTo(maximum)} aria-pressed={player.mode === 'forward'}>Assemble <span>↙</span></button>
                  <button disabled={!ready} onClick={() => player.moveTo(0)} aria-pressed={player.mode === 'reverse'}>Scatter <span>↗</span></button>
                </div>
              )}
              <div className="fm-timeline-labels"><span>{direction.start}</span><output aria-label="Current pose">{String(player.frame + 1).padStart(2, '0')} <span>/ {String(study.frameCount).padStart(2, '0')}</span></output><span>{direction.end}</span></div>
              <input
                className="fm-frame-range"
                aria-label={study.id === 'observer' ? 'Character viewing direction' : study.id === 'bloom' ? 'Flower opening stage' : 'Machine assembly stage'}
                type="range" min="0" max={maximum} step="1" value={player.frame}
                aria-valuetext={`Pose ${player.frame + 1} of ${study.frameCount}`}
                onChange={(event) => player.selectFrame(Number(event.target.value))}
                disabled={!ready}
              />
              <div className="fm-player-bottom">
                <div className="fm-step-controls">
                  <button aria-label="Previous pose" disabled={!ready || player.frame === 0} onClick={() => player.selectFrame(player.frame - 1)}><ArrowLeft size={17} /></button>
                  <button aria-label="Next pose" disabled={!ready || player.frame === maximum} onClick={() => player.selectFrame(player.frame + 1)}><ArrowRight size={17} /></button>
                </div>
                <button className="fm-preview-button" disabled={!ready || player.reduced} onClick={player.togglePreview} aria-pressed={player.mode !== 'paused'}>
                  {player.mode === 'paused' ? <Play size={12} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
                  <span lang="zh-CN">{player.mode === 'paused' ? '播放' : '暂停'}</span><span className="fm-preview-detail">/ BACK & FORTH</span>
                </button>
              </div>
              <p className="fm-sequence-note">{study.frameCount} poses · frame-by-frame study{player.reduced ? ' · reduced motion' : ''}</p>
              {study.previewVideo && <a className="fm-video-download" href={study.previewVideo} download lang="zh-CN">下载逐帧视频 <ArrowDown size={11} /></a>}
              {assetState === 'error' && <p className="fm-asset-error" role="status">The artwork could not load. Please refresh to try again.</p>}
            </div>
          </div>
        </div>
        <footer className="fm-hero-footer">
          <p>DAMON GUO-SIYI <span>AI RESEARCHER & LLM ENGINEER AT ALIBABA</span></p>
          <Link to={`/motion-lab/${nextStudy}`}>Next experiment <span>{DIRECTIONS[nextStudy].number}</span><ArrowRight size={21} /></Link>
        </footer>
      </section>
    </main>
  );
}

function StudyRoute({ studies }) {
  const { id } = useParams();
  const study = studies.find((entry) => entry.id === id && DIRECTIONS[entry.id]);
  if (!study) return <main className="fm-page fm-message"><h1>Study not found.</h1><Link to="/motion-lab">Return to the notebook <ArrowRight size={18} /></Link></main>;
  return <StudyPage study={study} key={study.id} />;
}

export default function FrameStudies() {
  const [manifest, setManifest] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/motion-studies/manifest.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Manifest unavailable');
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data.studies) || data.studies.length === 0) throw new Error('No studies available');
        setManifest(data);
      })
      .catch((error) => { if (error.name !== 'AbortError') setFailed(true); });
    return () => controller.abort();
  }, []);

  if (!manifest) return (
    <main className="fm-page fm-message" aria-live="polite">
      <p className="fm-kicker">DAMON / THE MOTION NOTEBOOK</p>
      <h1>{failed ? 'The notebook is unavailable.' : 'A little curiosity…'}</h1>
      {failed ? <Link to="/lab">Browse other experiments <ArrowRight size={18} /></Link> : <p>Loading the studies.</p>}
    </main>
  );

  return (
    <Routes>
      <Route path="/" element={<StudiesIndex studies={manifest.studies} />} />
      <Route path="/motion-lab" element={<StudiesIndex studies={manifest.studies} />} />
      <Route path="/motion-lab/:id" element={<StudyRoute studies={manifest.studies} />} />
      <Route path="*" element={<main className="fm-page fm-message"><h1>Study not found.</h1><Link to="/motion-lab">Return to the notebook</Link></main>} />
    </Routes>
  );
}
