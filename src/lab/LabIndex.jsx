import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

const studies = [
  { slug: 'observatory', number: '01', title: 'The Observatory', subtitle: 'A space to think.', description: '走进一座研究展厅。滚动推进镜头，指针改变视角，项目成为空间里的展品。', gesture: 'SCROLL TO TRAVEL', technology: 'Three.js · Camera rails', source: 'MengTo/threeui', tone: 'sand' },
  { slug: 'tactile', number: '02', title: 'A Working Surface', subtitle: 'Ideas you can touch.', description: '拖动研究纸张的边缘，看它卷起、投下阴影，再回弹到桌面。', gesture: 'DRAG TO PEEL', technology: 'Three.js · Deformed geometry', source: 'CatsJuice/sticker-forge', tone: 'red' },
  { slug: 'gallery', number: '03', title: 'The Research Archive', subtitle: 'Take a different angle.', description: '旋转项目档案，选择一册展开阅读；拖拽、按钮和键盘都可以操作。', gesture: 'ROTATE & OPEN', technology: 'CSS 3D · Motion', source: 'nolly-studio/cult-ui', tone: 'plum' },
  { slug: 'signal', number: '04', title: 'Signal / Noise', subtitle: 'Give curiosity a direction.', description: '让磁场随你的指针流动。切换研究阶段，观察图形与内容一起重新组织。', gesture: 'MOVE & RECONFIGURE', technology: 'Canvas 2D · Vector fields', source: 'oleksand4rux-del/cursor-lab', tone: 'acid' },
];

export default function LabIndex() {
  return <div className="lab-index">
    <a className="lab-skip" href="#studies">Skip to experiments</a>
    <header className="lab-index-header"><Link to="/" className="lab-index-brand">Damon<span>●</span></Link><span>RESEARCHER. BUILDER. CURIOUS HUMAN.</span><a href="https://github.com/Damon-GSY?tab=stars" target="_blank" rel="noreferrer">From my GitHub stars <ArrowUpRight size={16} /></a></header>
    <main>
      <section className="lab-index-intro">
        <p className="lab-index-kicker"><span /> AN OPEN DESIGN EXPLORATION</p>
        <div className="lab-index-title"><h1>Playground<span>.</span></h1><span className="lab-index-count">04<small>LIVE STUDIES</small></span></div>
        <div className="lab-index-lead"><p>Same person.<br /><em>Four different ways in.</em></p><div><p>从我的 GitHub 收藏里出发，<br />试着让研究拥有空间、触感和响应。</p><a href="#studies">选一个，进去玩一下 <ArrowDown size={16} /></a></div></div>
      </section>
      <section className="lab-index-studies" id="studies" aria-label="Four interactive design experiments">
        {studies.map((study) => <article className={`lab-index-study lab-tone-${study.tone}`} key={study.slug}>
          <Link to={`/lab/${study.slug}`} className="lab-index-cover" aria-label={`Open ${study.title}`}><img src={`/lab-assets/previews/${study.slug}.webp`} alt="" width="1200" height="750" loading="lazy" /><div className="lab-index-cover-overlay"><span>{study.gesture}</span><span className="lab-index-launch"><ArrowUpRight size={24} /></span></div></Link>
          <div className="lab-index-study-heading"><div><span>{study.number} / {study.technology}</span><Link to={`/lab/${study.slug}`}><h2>{study.title}</h2></Link></div><span className="lab-index-subtitle">{study.subtitle}</span></div>
          <p className="lab-index-study-description">{study.description}</p><a className="lab-index-source" href={`https://github.com/${study.source}`} target="_blank" rel="noreferrer">Built with ideas from <strong>{study.source}</strong><ArrowUpRight size={12} /></a>
        </article>)}
      </section>
      <section className="lab-index-note"><span>NOTES FROM THE WORKBENCH</span><p>空间、触感、档案、信号。<br />四种入口，同一个关于 <em>useful agents</em> 的故事。</p><div><span>更喜欢安静一点的方向？</span><Link to="/motion">See the Oil Motion visual study <ArrowUpRight size={16} /></Link></div></section>
    </main>
    <footer className="lab-index-footer"><span>© {new Date().getFullYear()} Damon Guo-Siyi</span><a href="mailto:hello@damon.ai">Let’s make something useful <ArrowUpRight size={15} /></a><a href="/lab-assets/licenses.txt">Source licenses ↗</a><Link to="/">Back to the website ↗</Link></footer>
  </div>;
}
