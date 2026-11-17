import { useLang } from '../i18n.jsx';
import night from './more/night.jpg';
import pill from './more/pill.jpg';
import agent from './more/agent.jpg';
import paper from './more/paper.jpg';
import parcels from './more/parcels.jpg';
import lab from './more/lab.jpg';

// "More ways in": the same facts, told by the standalone studies. Static previews (captured from
// each study) keep the home page light; they come to colour on hover or focus.
const DOORS = [
  {
    href: '/lab/parcels/',
    img: parcels,
    title: { en: 'Parcels', zh: '快递箱' },
    line: {
      en: 'Six cartons on a shelf; each unfolds into its case study.',
      zh: '架上六只纸箱，每只展开就是一个案例。',
    },
  },
  {
    href: '/lab/agent/',
    img: agent,
    title: { en: 'Agent', zh: '智能体' },
    line: {
      en: 'The page drives itself and asks before anything risky.',
      zh: '页面自己操作，遇到有风险的动作先问你。',
    },
  },
  {
    href: '/lab/paper/',
    img: paper,
    title: { en: 'Paper', zh: '纸团' },
    line: {
      en: 'One printed sheet that crumples into a ball between sections.',
      zh: '一张印刷纸，在章节之间揉成纸团，再摊平。',
    },
  },
  {
    href: '/lab/night/',
    img: night,
    title: { en: 'Night', zh: '夜景' },
    line: {
      en: 'A particle night, a ring of text, and a warp into amber.',
      zh: '粒子夜景、文字圆环，以及一次冲入琥珀色的跃迁。',
    },
  },
  {
    href: '/lab/pill/',
    img: pill,
    title: { en: 'Pill', zh: '胶囊' },
    line: {
      en: 'A hairline opens into a pill and pushes the name apart.',
      zh: '一条细线张开成胶囊，把名字向两边推开。',
    },
  },
  {
    href: '/lab',
    img: lab,
    title: { en: 'All design studies', zh: '全部设计研究' },
    line: {
      en: 'Every direction tried for this site, side by side.',
      zh: '为这个网站尝试过的所有方向，并排陈列。',
    },
  },
];

export default function MoreWays({ head }) {
  const { t } = useLang();
  return (
    <section id="more" className="h-section h-more" data-pv="0 0.9">
      {head}
      <h2 className="h-more-title">{t({ en: 'More ways in', zh: '换一种方式进入' })}</h2>
      <ul className="h-doors">
        {DOORS.map((d, i) => (
          <li key={d.href}>
            <a href={d.href} className="h-door">
              <span className="h-door-shot" data-pv="0 cover">
                <img src={d.img} alt="" loading="lazy" decoding="async" width="640" height="400" />
              </span>
              <span className="h-door-meta mono">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <span>{d.href}</span>
              </span>
              <span className="h-door-title">
                {t(d.title)}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 18L18 6M8 6h10v10" />
                </svg>
              </span>
              <span className="h-door-line">{t(d.line)}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
