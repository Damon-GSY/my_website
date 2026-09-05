import Link from 'next/link'
import { work } from '@/lib/content'
import styles from './home.module.css'

function ProjectDrawing({ type }: { type: string }) {
  if (type === 'risk') return <svg viewBox="0 0 580 350" fill="none" aria-hidden="true">
    <g stroke="#f5f3ec" opacity=".07">{Array.from({length: 9}, (_, i) => <path key={i} d={`M${60+i*58} 65V300`}/>)}</g>
    <path d="M90 182H208M288 182C335 182 324 118 368 118H476M288 182C335 182 324 247 368 247H476" stroke="#7d9580" strokeWidth="1.5"/>
    <path d="M90 182H208M288 182C335 182 324 247 368 247H476" className={styles.signal} stroke="#eab492" strokeWidth="3"/>
    <rect x="56" y="154" width="126" height="56" rx="8" fill="#30493b" stroke="#5a705e"/>
    <text x="119" y="178" textAnchor="middle" fill="#e9e9dc" fontSize="14">Intent + context</text><text x="119" y="197" textAnchor="middle" fill="#a4b69e" fontSize="10">Observe the task</text>
    <rect x="218" y="151" width="64" height="64" rx="12" transform="rotate(45 250 183)" fill="#314d3b" stroke="#91a487"/>
    <text x="250" y="181" textAnchor="middle" fill="#edf0da" fontSize="13">Risk</text><text x="250" y="198" textAnchor="middle" fill="#a4b69e" fontSize="10">gate</text>
    <rect x="368" y="92" width="142" height="53" rx="8" fill="#2c4537" stroke="#6e876f"/>
    <text x="439" y="113" textAnchor="middle" fill="#a4b69e" fontSize="9">ROUTINE ACTION</text><text x="439" y="132" textAnchor="middle" fill="#e9e9dc" fontSize="14">Execute</text>
    <rect x="368" y="220" width="142" height="53" rx="8" fill="#c27652" stroke="#e8b291"/>
    <text x="439" y="241" textAnchor="middle" fill="#fff1da" fontSize="9">HIGH CONSEQUENCE</text><text x="439" y="260" textAnchor="middle" fill="#fff8eb" fontSize="12">Human confirmation</text>
    <circle cx="310" cy="194" r="4" fill="#eab492"/>
  </svg>
  if (type === 'tools') return <svg viewBox="0 0 580 350" fill="none" aria-hidden="true">
    {[65,98,132].map(r => <circle key={r} cx="285" cy="182" r={r} stroke="#20352c" opacity=".1" strokeDasharray={r===98?'3 6':undefined}/>)}
    {[[-100,-70,'Search'],[116,-55,'Inventory'],[-113,73,'Orders'],[111,77,'Resolve']].map(([x,y,label]) => <g key={label}><path d={`M285 182L${285+Number(x)} ${182+Number(y)}`} stroke="#8b977f" strokeWidth="1.4"/><rect x={285+Number(x)-47} y={182+Number(y)-17} width="94" height="34" rx="17" fill="#f5f3ec" stroke="#aeb7a2"/><text x={285+Number(x)} y={187+Number(y)} textAnchor="middle" fontSize="12" fill="#344734">{label}</text></g>)}
    <circle cx="285" cy="182" r="44" fill="#20352c"/><text x="285" y="178" textAnchor="middle" fontSize="14" fill="#e8ecd8">Meta tool</text><text x="285" y="196" textAnchor="middle" fontSize="10" fill="#a8b89e">discover → select</text>
    <circle cx="220" cy="135" r="5" fill="#bd573a"/><circle cx="355" cy="230" r="5" fill="#bd573a"/>
    <text x="470" y="100" textAnchor="middle" fontSize="38" fill="#bd573a" fontFamily="var(--font-editorial)">100+</text><text x="470" y="118" textAnchor="middle" fontSize="9" fill="#66715f">CHANGING TOOLS</text>
  </svg>
  if (type === 'benchmark') return <svg viewBox="0 0 580 350" fill="none" aria-hidden="true">
    <path d="M95 265H465M95 265V84" stroke="#718467" strokeWidth="1.2"/>
    {[0,1,2,3].map(i=><path key={i} d={`M95 ${115+i*38}H465`} stroke="#20352c" opacity=".1"/>)}
    <path d="M121 238C168 231 167 213 202 200S250 176 285 153S337 146 381 107S413 101 445 83" stroke="#527047" strokeWidth="3"/>
    <path d="M121 250C164 250 167 233 202 229S252 220 285 191S335 201 381 154S414 155 445 129" stroke="#bd573a" strokeWidth="3"/>
    {[[121,238],[202,200],[285,153],[381,107],[445,83]].map(([x,y], i)=><circle key={i} cx={x} cy={y} r="4" fill="#527047" stroke="#d8ded0" strokeWidth="2"/>)}
    <text x="100" y="294" fontSize="10" fill="#56664f">CAPABILITY MAP</text><text x="265" y="294" fontSize="10" fill="#56664f">CPT → SFT → RL</text>
    <rect x="342" y="212" width="11" height="3" fill="#527047"/><text x="361" y="218" fontSize="11" fill="#41543a">Knowledge</text><rect x="342" y="235" width="11" height="3" fill="#bd573a"/><text x="361" y="241" fontSize="11" fill="#41543a">Execution</text>
  </svg>
  return <svg viewBox="0 0 580 350" fill="none" aria-hidden="true">
    <path d="M87 128C153 128 191 129 258 177S360 231 487 208M87 238C167 238 179 219 258 177S387 122 487 129" stroke="#ab8b78" strokeWidth="1.5"/>
    <path d="M87 182H487" stroke="#ab8b78" strokeDasharray="3 5"/>
    <circle cx="285" cy="183" r="69" fill="#ece2d8" stroke="#ab8b78"/><circle cx="285" cy="183" r="56" stroke="#bd573a"/>
    <text x="285" y="182" textAnchor="middle" fill="#20352c" fontSize="23" fontFamily="var(--font-editorial)">Balance,</text><text x="285" y="207" textAnchor="middle" fill="#bd573a" fontSize="23" fontFamily="var(--font-editorial)" fontStyle="italic">by design.</text>
    <circle cx="98" cy="128" r="7" fill="#4d6449"/><circle cx="98" cy="238" r="7" fill="#bd573a"/><circle cx="476" cy="129" r="7" fill="#bd573a"/><circle cx="476" cy="208" r="7" fill="#4d6449"/>
    <text x="89" y="105" fontSize="10" fill="#66594c">QUALITY</text><text x="89" y="271" fontSize="10" fill="#66594c">CONSTRAINTS</text><text x="423" y="105" fontSize="10" fill="#66594c">REWARD</text><text x="423" y="240" fontSize="10" fill="#66594c">STABILITY</text>
  </svg>
}

export function SelectedWork() {
  return <section id="work" className={`container ${styles.work}`} aria-labelledby="work-heading">
    <div className={styles.sectionTop}><div><span className="eyebrow">01 / Selected work</span><h2 id="work-heading">Built for the<br/><em>real world.</em></h2></div><p>From a research question to an operating system. A selection of the problems I’ve helped turn into practice at Alibaba.</p></div>
    <div className={styles.workGrid}>
      {work.map(project => <article key={project.id} className={styles.project}>
        <Link href={`/work/${project.id}`} className={styles.projectLink}>
          <div className={styles.visual}><span className={styles.visualLabel}>{project.id === 'risk-router' ? 'Authority, not just autonomy' : project.id === 'tool-resolver' ? 'The right capability. At the right time.' : project.id === 'domain-model' ? 'Two axes. One training loop.' : 'When objectives meet.'}</span><span className={styles.visualIndex}>{project.index}</span><ProjectDrawing type={project.visual}/><span className={styles.visualCaption}>Conceptual study · not production data</span><span className={styles.cardArrow} aria-hidden="true">↗</span></div>
          <div className={styles.projectMeta}><span>{project.kicker}</span><span>{project.year}</span></div>
          <h3 className={styles.projectTitle}>{project.title}<span aria-hidden="true">↗</span></h3>
          <p className={styles.projectDesc}>{project.statement}</p>
          <div className={styles.projectTags}>{project.tags.slice(0,2).map(tag=><span key={tag}>{tag}</span>)}</div>
        </Link>
      </article>)}
    </div>
    <p className={styles.caseDisclaimer}>These case studies describe my approach and scoped internal outcomes. Diagrams are conceptual; customer data and confidential implementation details are not shown.</p>
  </section>
}
