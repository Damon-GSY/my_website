import { useFilm } from '../../engine/useFilm.js';
import { Header, Outro } from '../../components/Chrome.jsx';
import { useLang } from '../../i18n.jsx';
import { footnote, profile, work } from '../../content.js';
import { buildDescent } from './Scene.js';
import './descent.css';

export default function DescentOpening() {
  const { root, canvas, track, mode } = useFilm(buildDescent);
  const { t } = useLang();
  return (
    <div ref={root} className={`film descent ${mode}`}>
      <canvas ref={canvas} className="stage" aria-hidden="true" />
      <Header />
      <section ref={track} className="track" style={{ '--len': 7 }}>
        <div className="sticky">
          <div className="d-hero" data-hero>
            <p className="eyebrow">
              {profile.name} — {t(profile.role)}, {t(profile.org)}
            </p>
            <h1>
              {t({ en: 'Every agent I train starts somewhere up here', zh: '我训练的每一个智能体，都从这样的高处出发' })}
              <i className="d-dot" data-dot />
            </h1>
            <p className="mono d-hint">{t({ en: 'Scroll. This page is not flat. ↓', zh: '向下滚动。这一页并不是平的。↓' })}</p>
          </div>
          <div className="d-hud mono" data-hud>
            <svg viewBox="0 0 160 44" aria-hidden="true">
              <polyline data-curve-bg />
              <polyline data-curve pathLength="1" />
            </svg>
            <span data-read />
          </div>
          <div className="d-work" data-work>
            <header data-work-head>
              <p className="eyebrow">{t({ en: 'Selected work', zh: '代表工作' })}</p>
              <h2>{t({ en: 'Where it settled.', zh: '最终收敛在这里。' })}</h2>
            </header>
            <ol>
              {work.map((item, i) => (
                <li key={item.id} data-row>
                  <span className="d-cell-dot">{i === 0 && <i className="d-rowdot" data-rowdot />}</span>
                  <span className="mono d-n">0{i + 1}</span>
                  <h3>{item.title}</h3>
                  <strong>{item.metric}</strong>
                  <em>{t(item.metricLabel)}</em>
                  <span className="mono d-where">
                    {item.where} · {item.year}
                  </span>
                </li>
              ))}
            </ol>
            <small className="mono">{t(footnote)}</small>
          </div>
        </div>
      </section>
      <Outro current="descent" />
    </div>
  );
}
