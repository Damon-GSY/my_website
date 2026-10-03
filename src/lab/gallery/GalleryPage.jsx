/*! @license
MIT License

Copyright (c) 2023 Jordan-Gilliam

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/*
 * Cylinder placement and shared-layout expansion adapted from Cult UI:
 * nolly-studio/cult-ui @ 67a66c6ac1cd240914ba688a907611b3437a7a2b
 * apps/www/registry/default/ui/three-d-carousel.tsx
 * apps/www/registry/default/ui/expandable-screen.tsx
 * MIT © 2023 Jordan-Gilliam. See docs/licenses/cult-ui-MIT.txt.
 */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, MotionConfig, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { projects } from '../../data/projects';
import './gallery.css';

const entries = projects.slice(0, 6);
const covers = [
  { short: ['Supply', 'Chain'], caption: 'Systems that act.', color: '#d4ed79', ink: '#293a30', mark: 'SC / 01' },
  { short: ['Tool', 'Resolution'], caption: 'The right tool. Every turn.', color: '#c9b6e7', ink: '#48294e', mark: 'TR / 02' },
  { short: ['Domain', 'Intelligence'], caption: 'Knowledge becomes capability.', color: '#ed7963', ink: '#4d271f', mark: 'DI / 03' },
  { short: ['Every', 'Turn'], caption: 'Look between the answers.', color: '#ece7da', ink: '#32283e', mark: 'ET / 04' },
  { short: ['The Real', 'World'], caption: 'A benchmark beyond the lab.', color: '#98b9ba', ink: '#203e48', mark: 'RW / 05' },
  { short: ['Visual', 'Deltas'], caption: 'A different way to see.', color: '#d6a3b6', ink: '#592b46', mark: 'VD / 06' },
];
const mod = (n, length) => ((n % length) + length) % length;

function FolioGraphic({ index }) {
  return <svg className="ga-folio-graphic" viewBox="0 0 260 200" aria-hidden="true" fill="none" stroke="currentColor">
    {index === 0 && <g transform="translate(130 105)">{Array.from({ length: 11 }, (_, i) => <rect key={i} x={-69 + i * 2.1} y={-69 + i * 2.1} width={138 - i * 4.2} height={138 - i * 4.2} transform={`rotate(${i * 7})`} strokeWidth="1.3" />)}</g>}
    {index === 1 && <g>{Array.from({ length: 7 }, (_, i) => <g key={i} transform={`translate(${42 + i * 29} ${96 + Math.sin(i * 0.75) * 30}) rotate(-28)`}><ellipse rx="29" ry="60" strokeWidth="1.4" /></g>)}</g>}
    {index === 2 && <g>{Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${25 + i * 4} ${150 - i * 7} L130 ${30 + i * 6} L${235 - i * 4} ${150 - i * 7} L130 ${190 - i * 6} Z`} strokeWidth="1.25" />)}</g>}
    {index === 3 && <g>{Array.from({ length: 6 }, (_, i) => <g key={i}><circle cx={55 + (i % 3) * 75} cy={58 + Math.floor(i / 3) * 86} r="33" strokeWidth="1.3" /><path d={`M${31 + (i % 3) * 75} ${58 + Math.floor(i / 3) * 86}h48M${55 + (i % 3) * 75} ${34 + Math.floor(i / 3) * 86}v48`} strokeDasharray={i % 2 ? '2 3' : '0'} /></g>)}</g>}
    {index === 4 && <g transform="translate(130 100)">{Array.from({ length: 12 }, (_, i) => <ellipse key={i} rx={79} ry={15 + i * 5.6} transform={`rotate(${i * 15})`} strokeWidth="0.9" />)}<circle r="6" fill="currentColor" /></g>}
    {index === 5 && <g>{Array.from({ length: 10 }, (_, col) => Array.from({ length: 7 }, (_, row) => <rect key={`${col}-${row}`} x={29 + col * 20} y={30 + row * 20} width={3 + (col / 9) * 14} height={3 + (col / 9) * 14} fill="currentColor" stroke="none" opacity={0.22 + (Math.sin(col * 0.7 + row * 0.8) + 1) * 0.37} />))}</g>}
  </svg>;
}

function Folio({ index, shared = true }) {
  const cover = covers[index];
  return <motion.div className="ga-folio" layoutId={shared ? `ga-folio-${index}` : undefined} style={{ '--folio-color': cover.color, '--folio-ink': cover.ink }}>
    <div className="ga-folio-top"><span>DAMON GUO-SIYI</span><span>{cover.mark}</span></div>
    <div className="ga-folio-title">{cover.short.map((line) => <span key={line}>{line}</span>)}</div>
    <FolioGraphic index={index} />
    <div className="ga-folio-bottom"><span>{cover.caption}</span><span>2025</span></div>
  </motion.div>;
}

function ProjectDialog({ index, onClose, returnFocus, reduced }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const project = entries[index];
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.close();
      returnFocus?.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  return <motion.dialog ref={dialogRef} className="ga-dialog" aria-labelledby="ga-project-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === dialogRef.current) onClose(); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.18 }}>
    <div className="ga-dialog-sheet">
      <button ref={closeRef} className="ga-dialog-close" onClick={onClose} aria-label="Close project"><X size={22} /></button>
      <div className="ga-dialog-art"><Folio index={index} shared={!reduced} /><span className="ga-dialog-edition">RESEARCH ARCHIVE / EDITION {String(index + 1).padStart(2, '0')}</span></div>
      <motion.div className="ga-dialog-copy" initial={{ opacity: 0, y: reduced ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.14 }}>
        <div className="ga-eyebrow">{project.kicker} <span>·</span> {project.stage} / {project.year}</div>
        <h2 id="ga-project-title">{project.title}</h2>
        <p className="ga-dialog-description">{project.description}</p>
        <div className="ga-dialog-outcome"><span>THE OUTCOME</span><p>{project.outcome}</p></div>
        <ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
        <div className="ga-dialog-tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <a className="ga-dialog-link" href={`/projects#${project.id}`}>More about this work <ArrowUpRight size={18} /></a>
      </motion.div>
    </div>
  </motion.dialog>;
}

export default function GalleryPage() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const rotation = useMotionValue(0);
  const cylinderTransform = useTransform(rotation, (angle) => `rotateX(-8deg) rotateY(${angle}deg)`);
  const [current, setCurrent] = useState(0);
  const [active, setActive] = useState(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const animation = useRef(null);
  const returnFocus = useRef(null);
  const suppressedClick = useRef(false);
  const angleStep = 360 / entries.length;

  useEffect(() => {
    const oldTitle = document.title;
    document.title = 'A living archive — Damon Guo-Siyi';
    return () => { document.title = oldTitle; animation.current?.stop(); };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { animation.current?.stop(); setReduced(media.matches); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  function snap(angle, instant = false) {
    const step = Math.round(angle / angleStep);
    setCurrent(mod(-step, entries.length));
    animation.current?.stop();
    if (instant || reduced) rotation.set(step * angleStep);
    else animation.current = animate(rotation, step * angleStep, { type: 'spring', stiffness: 92, damping: 22, mass: 1.1 });
  }

  function move(direction) {
    snap((Math.round(rotation.get() / angleStep) - direction) * angleStep);
  }

  function startDrag(event) {
    if (reduced || event.button !== 0 || active !== null) return;
    animation.current?.stop();
    suppressedClick.current = false;
    drag.current = { startX: event.clientX, startY: event.clientY, startAngle: rotation.get(), lastX: event.clientX, time: performance.now(), velocity: 0, moved: false, vertical: false };
  }

  function updateDrag(event) {
    const gesture = drag.current;
    if (!gesture || gesture.vertical) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (!gesture.moved && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { gesture.vertical = true; return; }
    if (!gesture.moved && Math.abs(dx) < 7) return;
    if (!gesture.moved) { gesture.moved = true; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); }
    const now = performance.now();
    gesture.velocity = (event.clientX - gesture.lastX) / Math.max(8, now - gesture.time);
    gesture.lastX = event.clientX;
    gesture.time = now;
    rotation.set(gesture.startAngle + dx * 0.23);
  }

  function endDrag(event) {
    const gesture = drag.current;
    if (!gesture) return;
    if (gesture.moved) {
      suppressedClick.current = true;
      const momentum = event.type === 'pointercancel' || performance.now() - gesture.time > 120 ? 0 : Math.max(-70, Math.min(70, gesture.velocity * 40));
      snap(rotation.get() + momentum);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    setDragging(false);
  }

  function openProject(index, event) {
    if (suppressedClick.current) { suppressedClick.current = false; return; }
    animation.current?.stop();
    returnFocus.current = event.currentTarget;
    setActive(index);
  }

  return <MotionConfig reducedMotion="user"><LayoutGroup id="research-gallery"><div className="ga-page">
    <a className="ga-skip" href="#ga-archive">Skip to the archive</a>
    <header className="ga-header">
      <a className="ga-wordmark" href="/lab">DAMON<small>GUO-SIYI</small></a>
      <div className="ga-header-note">AI RESEARCHER<br />MAKING IDEAS USEFUL.</div>
      <a className="ga-back" href="/lab">All experiments <ArrowUpRight size={16} /></a>
    </header>

    <main>
      <section className="ga-intro" aria-labelledby="ga-title">
        <div className="ga-intro-top"><span className="ga-eyebrow"><i /> SELECTED WORK / 2024—26</span><span className="ga-index-mark">EXHIBITION No. 02</span></div>
        <h1 id="ga-title">A living <em>archive.</em><svg className="ga-title-star" viewBox="0 0 80 80" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <path key={index} d="M40 8V40" transform={`rotate(${index * 45} 40 40)`} stroke="currentColor" strokeWidth="6" strokeLinecap="round" />)}</svg></h1>
        <div className="ga-intro-bottom"><p>Research, systems, and the space between.<br />A collection of work by Damon Guo-Siyi.</p><a href="#ga-archive">Take a look around <ArrowDown size={17} /></a></div>
      </section>

      <section id="ga-archive" className={`ga-archive ${reduced ? 'ga-archive-static' : ''}`} aria-label="Interactive project archive">
        <div className="ga-room-label"><span>CURATED COLLECTION</span><span>06 OBJECTS / OPEN TO EXPLORE</span></div>
        {reduced ? <div className="ga-static-grid">{entries.map((project, index) => <button key={project.id} className="ga-static-card" onClick={(event) => openProject(index, event)} aria-label={`Open ${project.title}`}><Folio index={index} shared={false} /><span>{project.title} <ArrowUpRight size={15} /></span></button>)}</div> : <>
          <div className={`ga-stage ${dragging ? 'ga-dragging' : ''}`} role="region" aria-roledescription="carousel" aria-label="Project folios. Use left and right arrow keys or drag horizontally." tabIndex={0} onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); move(event.key === 'ArrowRight' ? 1 : -1); } else if ((event.key === 'Enter' || event.key === ' ') && event.target === event.currentTarget) { event.preventDefault(); openProject(current, event); } }} onPointerDown={startDrag} onPointerMove={updateDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onClickCapture={(event) => { if (suppressedClick.current) { event.stopPropagation(); suppressedClick.current = false; } }}>
            <div className="ga-stage-floor" aria-hidden="true" />
            <motion.div className="ga-cylinder" style={{ transform: cylinderTransform }}>
              {entries.map((project, index) => <div className="ga-folio-position" key={project.id} style={{ transform: `rotateY(${index * angleStep}deg) translateZ(var(--ga-radius))` }}><button className={`ga-card-button ${current === index ? 'ga-card-current' : ''}`} tabIndex={current === index ? 0 : -1} aria-label={`Open ${project.title}`} onClick={(event) => openProject(index, event)}><Folio index={index} shared={active !== index} /><span className="ga-card-open"><ArrowUpRight size={19} /></span></button></div>)}
            </motion.div>
          </div>
          <div className="ga-controls">
            <div className="ga-drag-note"><span className="ga-drag-glyph" aria-hidden="true">↔</span><span>DRAG TO BROWSE<br />CLICK TO OPEN</span></div>
            <div className="ga-current" aria-live="polite" aria-atomic="true"><span>{String(current + 1).padStart(2, '0')} <i>/ 06</i></span><p>{entries[current].title}</p></div>
            <div className="ga-control-buttons"><button aria-label="Previous project" onClick={() => move(-1)}><ArrowLeft size={21} /></button><button aria-label="Next project" onClick={() => move(1)}><ArrowRight size={21} /></button></div>
          </div>
          <div className="ga-progress" aria-hidden="true">{entries.map((project, index) => <span key={project.id} className={index === current ? 'ga-progress-active' : ''} />)}</div>
        </>}
      </section>

      <section className="ga-note">
        <div className="ga-eyebrow">A NOTE FROM THE CURATOR</div>
        <div><h2>Good research should<br />make itself <em>useful.</em></h2><div className="ga-note-copy"><p>I build agent systems at Alibaba — connecting agentic reinforcement learning, post-training, and evaluation with the messy, interesting reality of production.</p><p>This archive follows that thread: from asking better questions to building systems that can act on the answers.</p></div><a href="/about" className="ga-about-link">A little more about me <ArrowUpRight size={19} /></a></div>
      </section>
    </main>

    <footer className="ga-footer"><div><span className="ga-eyebrow">KEEP EXPLORING</span><nav aria-label="Other experiments"><a href="/lab/observatory">Observatory <ArrowUpRight size={17} /></a><a href="/lab/tactile">Tactile <ArrowUpRight size={17} /></a><a href="/lab/signal">Signal <ArrowUpRight size={17} /></a></nav></div><div className="ga-footer-bottom"><span>DAMON GUO-SIYI © {new Date().getFullYear()}</span><a href="https://github.com/nolly-studio/cult-ui" target="_blank" rel="noreferrer">INTERACTION STUDY WITH CULT UI <ArrowUpRight size={12} /></a><a href="/lab">BACK TO THE LAB ↑</a></div></footer>
    <AnimatePresence>{active !== null && <ProjectDialog key={active} index={active} reduced={reduced} returnFocus={returnFocus.current} onClose={() => setActive(null)} />}</AnimatePresence>
  </div></LayoutGroup></MotionConfig>;
}
