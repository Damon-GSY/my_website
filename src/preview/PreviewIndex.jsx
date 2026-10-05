import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Pause, Play, Plus } from 'lucide-react';
import { archiveGroups, previewFilters, previews, reviewOrder } from './previewCatalog';
import { projects } from '../data/projects';
import './preview-index.css';

function MotionPreview({ preview }) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(() => !document.hidden);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [manualPlay, setManualPlay] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => setReduced(media.matches);
    const onVisibility = () => setForeground(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(videoRef.current);
    media.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      media.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const requested = manualPlay ?? !reduced;
  useEffect(() => {
    const video = videoRef.current;
    if (visible && foreground && requested && !failed) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    return () => video.pause();
  }, [visible, foreground, requested, failed]);

  return (
    <>
      <a className="pv-media-link" href={preview.href} target="_blank" rel="noopener" aria-label={`打开${preview.title}完整体验（新标签页）`}>
        <video ref={videoRef} poster={preview.image} muted loop playsInline preload="none"
          onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} aria-hidden="true">
          <source src={preview.video} type="video/mp4" onError={() => setFailed(true)} />
        </video>
      </a>
      <span className="pv-media-label"><i />{preview.mediaLabel}</span>
      {!failed && <button className="pv-play-toggle" type="button" onClick={() => setManualPlay(!playing)}
        aria-label={`${playing ? '暂停' : '播放'}${preview.title}预览`} aria-pressed={playing}>
        {playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
        <span>{playing ? '暂停预览' : '播放预览'}</span>
      </button>}
    </>
  );
}

function PreviewCard({ preview, number }) {
  return (
    <article className={`pv-card${preview.featured ? ' pv-card-featured' : ''}`} data-preview={preview.id}>
      <div className="pv-card-media">
        {preview.video ? <MotionPreview preview={preview} /> :
          <a className="pv-media-link" href={preview.href} target="_blank" rel="noopener" aria-label={`打开${preview.title}（新标签页）`}>
            <img src={preview.image} alt={preview.title + '的实际页面截图'} width="1100" height="688" loading="lazy" decoding="async" />
          </a>}
        {!preview.video && preview.mediaLabel && <span className="pv-media-label"><i />{preview.mediaLabel}</span>}
      </div>
      <div className="pv-card-copy">
        <div className="pv-card-topline"><span>{String(number).padStart(2, '0')} / {preview.subtitle}</span>{reviewOrder.includes(preview.id) && <span className="pv-latest">本轮查看</span>}</div>
        <h2><a href={preview.href} target="_blank" rel="noopener">{preview.title}<ArrowUpRight size={23} aria-hidden="true" /></a></h2>
        <p className="pv-description">{preview.description}</p>
        <p className="pv-motion">{preview.motion}</p>
        <div className="pv-card-bottom"><div className="pv-tags">{preview.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
          <a className="pv-enter" href={preview.href} target="_blank" rel="noopener" aria-label={`进入${preview.title}（新标签页）`}>进入体验 <ArrowUpRight size={14} aria-hidden="true" /></a>
        </div>
        <p className="pv-interaction">{preview.interaction}</p>
      </div>
    </article>
  );
}

export default function PreviewIndex() {
  const [filter, setFilter] = useState('all');
  const ordered = [...reviewOrder.map(id => previews.find(preview => preview.id === id)), ...previews.filter(preview => !reviewOrder.includes(preview.id))];
  const shown = ordered.filter(preview => filter === 'all' || preview.category === filter);
  const studies = archiveGroups.find(group => group.id === 'motion-studies');

  useEffect(() => {
    const previous = document.title;
    document.title = 'GDamon — 网站预览室';
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      if (target.tagName === 'DETAILS') target.open = true;
      target.scrollIntoView();
    }
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="pv-page" lang="zh-CN">
      <a className="pv-skip" href="#versions">跳到方案列表</a>
      <header className="pv-header">
        <a className="pv-brand" href="/" aria-label="GDamon 预览首页">GDamon<span className="pv-brand-dot" aria-hidden="true" /></a>
        <span className="pv-edition">DESIGN EXPLORATIONS<br />THE PREVIEW INDEX</span>
        <nav aria-label="预览分类"><a href="#versions">全部方案</a><a href="#cases">项目案例</a><a href="#archive">更多页面 <ArrowDown size={12} aria-hidden="true" /></a></nav>
      </header>

      <main className="pv-main">
        <section className="pv-intro" aria-labelledby="pv-title">
          <div><p className="pv-eyebrow"><span /> WORK IN MOTION</p><h1 id="pv-title">网站预览室<span>。</span></h1>
            <p className="pv-intro-copy">{previews.length} 个视觉方向、{projects.length} 个项目案例，以及全部早期实验。<br />最新修改放在最前面，从这里打开就好。</p>
          </div>
          <div className="pv-intro-aside"><span className="pv-count">{String(previews.length).padStart(2, '0')}<span> / DIRECTIONS</span></span><p>查看页面截图，进入完整网站体验动画。<br />每个入口在新标签页打开，方便来回比较。</p><a href="#versions">浏览全部方案 <ArrowDown size={17} aria-hidden="true" /></a></div>
        </section>

        <section className="pv-review" aria-label="优先查看这次更新">
          <a href="/kernelcode/index.html" target="_blank" rel="noopener"><span>01 / 信息量已补充<ArrowUpRight size={17} aria-hidden="true" /></span><h2>AI 粒子网站</h2><p>研究方法、系统流程与项目成果</p></a>
          <a href="/film" target="_blank" rel="noopener"><span>02 / 工作叙事已更新<ArrowUpRight size={17} aria-hidden="true" /></span><h2>滚动研究叙事</h2><p>训练、部署、评估与你的具体贡献</p></a>
          <a href="/robot" target="_blank" rel="noopener"><span>03 / 连续拆装版本<ArrowUpRight size={17} aria-hidden="true" /></span><h2>机器人个人站</h2><p>角色交互、滚动拆解与完整作品区</p></a>
          <a href="/projects" target="_blank" rel="noopener"><span>04 / {projects.length} 个完整案例<ArrowUpRight size={17} aria-hidden="true" /></span><h2>项目与研究</h2><p>背景、本人贡献、结果与下一项目</p></a>
        </section>

        <section id="versions" className="pv-versions" aria-label="当前网站方案">
          <div className="pv-toolbar">
            <div className="pv-filters" role="group" aria-label="筛选方案">{previewFilters.map(item => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
              {item.label}<span>{item.id === 'all' ? previews.length : previews.filter(preview => preview.category === item.id).length}</span>
            </button>)}</div>
            <p className="pv-results" role="status">显示 {shown.length} / {previews.length}</p>
          </div>
          <div className="pv-grid">{shown.map(preview => <PreviewCard key={preview.id} preview={preview} number={ordered.indexOf(preview) + 1} />)}</div>
        </section>

        <section className="pv-cases" id="cases" aria-labelledby="pv-cases-title">
          <div className="pv-section-heading"><div><p className="pv-eyebrow">THE WORK BEHIND THE WEBSITES</p><h2 id="pv-cases-title">项目与研究案例</h2></div><p>各个网站里的项目都通向这些完整案例。<br /><a href="/projects" target="_blank" rel="noopener">打开作品目录 <ArrowUpRight size={13} aria-hidden="true" /></a></p></div>
          <div className="pv-case-grid">{projects.map((project,index)=><a key={project.id} href={`/projects#${project.id}`} target="_blank" rel="noopener"><span>{String(index+1).padStart(2,'0')} / {project.kicker}<ArrowUpRight size={16} aria-hidden="true" /></span><h3>{project.title}</h3><p>{project.stage} · {project.tags.join(' / ')}</p></a>)}</div>
        </section>

        <section className="pv-studies" id="studies" aria-labelledby="pv-studies-title">
          <div className="pv-section-heading"><div><p className="pv-eyebrow">STUDIES IN MOTION</p><h2 id="pv-studies-title">分镜与动态实验</h2></div><p>{studies.description}</p></div>
          <div className="pv-study-grid">{studies.items.map((study, index) => <a href={study.href} key={study.id} target="_blank" rel="noopener" className={`pv-study pv-study-${study.id}`}>
            <span className="pv-study-top">0{index + 1} / {study.id === 'core' ? 'CONTINUOUS FILM' : 'OIL MOTION'} <ArrowUpRight size={17} aria-hidden="true" /></span><h3>{study.title}</h3><p>{study.description}</p><span className="pv-study-open">打开实验 <ArrowUpRight size={14} aria-hidden="true" /></span>
          </a>)}</div>
        </section>

        <section className="pv-archive" id="archive" aria-labelledby="pv-archive-title">
          <div className="pv-section-heading"><div><p className="pv-eyebrow">MORE TO EXPLORE</p><h2 id="pv-archive-title">更多页面与历史版本</h2></div><p>实验合集、个人内容和原稿都可展开查看。</p></div>
          {archiveGroups.filter(group => group.id !== 'motion-studies').map(group => <details key={group.id} id={group.id}>
            <summary><span>{group.title}<small>{group.items.length} 个页面</small></span><Plus size={20} aria-hidden="true" /></summary>
            <p className="pv-archive-description">{group.description}</p><div className="pv-archive-links">{group.items.map(item => <a key={item.id} href={item.href} target="_blank" rel="noopener"><span><strong>{item.title}</strong><small>{item.description}</small></span><ArrowUpRight size={17} aria-hidden="true" /></a>)}</div>
          </details>)}
        </section>
      </main>
      <footer className="pv-footer"><span>GDamon / Damon Guo-Siyi</span><p>Research. Build. Explore.</p><a href="#pv-title">回到顶部 <ArrowUpRight size={14} aria-hidden="true" /></a></footer>
    </div>
  );
}
