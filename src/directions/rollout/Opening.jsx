import { useFilm } from '../../engine/useFilm.js';
import { Header, Outro } from '../../components/Chrome.jsx';
import { useLang } from '../../i18n.jsx';
import { footnote, joinParts, profile, work } from '../../content.js';
import { buildRollout } from './Scene.js';
import './rollout.css';

const chapters = [
  { n: '05', name: 'Train', line: { en: 'SFT, then RL, on a domain LLM', zh: '领域大模型：先 SFT，再 RL' } },
  { n: '10', name: 'Deploy', line: { en: '100+ tools, 12 scenarios, clear limits', zh: '100+ 工具、12 个场景、明确边界' } },
  { n: '15', name: 'Evaluate', line: { en: 'Judge the trace, not the last answer', zh: '评判整条轨迹，而不是最后的答案' } },
];

export default function RolloutOpening() {
  const { root, canvas, track, mode } = useFilm(buildRollout);
  const { t } = useLang();
  return (
    <div ref={root} className={`film rollout ${mode}`}>
      <Header />
      <section ref={track} className="track" style={{ '--len': 7 }}>
        <div className="sticky">
          <canvas ref={canvas} className="stage" aria-hidden="true" />
          <div className="r-hero" data-hero>
            <p className="eyebrow">
              {joinParts([profile.name, joinParts([t(profile.role), t(profile.org)], ', ')], ' — ')}
            </p>
            <output className="r-pct" data-pct>
              36%
            </output>
            <h1>
              {t({
                en: 'An agent that is right 95% of the time finishes a 20-step task 36% of the time.',
                zh: '单步正确率 95% 的智能体，完成一个 20 步任务的概率只有 36%。',
              })}
            </h1>
            <p className="mono r-read">
              <span>
                step <b data-step>20</b> / 20
              </span>
              <span>
                P(success) = 0.95<sup data-exp>20</sup>
              </span>
              <span className="r-scroll">{t({ en: 'scroll = act ↓', zh: '滚动 = 行动 ↓' })}</span>
            </p>
          </div>
          {chapters.map((chapter) => (
            <p key={chapter.n} className="r-chapter mono" data-chapter>
              <b>
                {chapter.n} {chapter.name}
              </b>
              <span>{t(chapter.line)}</span>
            </p>
          ))}
          <div className="r-work" data-work>
            <div className="r-trace-head mono">
              <span>{t({ en: 'Your trace · 20 steps', zh: '你的轨迹 · 20 步' })}</span>
              <span>P = 35.8%</span>
            </div>
            <svg className="r-trace" data-trace aria-hidden="true">
              <path data-trace-dead />
              <path data-trace-live />
              <path data-trace-dots />
              <rect data-trace-head x="-6" y="-6" width="12" height="12" />
            </svg>
            <div className="r-body">
              <h2>{t({ en: 'That gap is my job.', zh: '这个落差，就是我的工作。' })}</h2>
              <ol>
                {work.map((item, i) => (
                  <li key={item.id}>
                    <span className="mono">0{i + 1}</span>
                    <h3>{item.title}</h3>
                    <strong>{item.metric}</strong>
                    <em>{t(item.metricLabel)}</em>
                  </li>
                ))}
              </ol>
              <small className="mono">{t(footnote)}</small>
            </div>
          </div>
        </div>
      </section>
      <Outro current="rollout" />
    </div>
  );
}
