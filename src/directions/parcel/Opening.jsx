import { useFilm } from '../../engine/useFilm.js';
import { Header, Outro } from '../../components/Chrome.jsx';
import { useLang } from '../../i18n.jsx';
import { footnote, profile, route, work } from '../../content.js';
import { buildParcel } from './Scene.js';
import './parcel.css';

export default function ParcelOpening() {
  const { root, canvas, track, mode } = useFilm(buildParcel);
  const { t } = useLang();
  return (
    <div ref={root} className={`film parcel ${mode}`}>
      <canvas ref={canvas} className="stage" aria-hidden="true" />
      <Header />
      <section ref={track} className="track" style={{ '--len': 7 }}>
        <div className="sticky">
          <h1 className="sr">{profile.name}. I build agents that ship.</h1>
          <div className="p-fallback">
            <p className="eyebrow">
              {t(profile.role)} · {t(profile.org)}
            </p>
            <p className="p-fallback-title">I build agents that ship.</p>
          </div>
          <p className="p-hint mono" data-hint>
            {t({ en: 'Scroll to pack ↓', zh: '向下滚动，开始打包 ↓' })}
          </p>
          <ol className="p-route mono" data-route>
            {route.map((stop) => (
              <li key={stop.code}>
                <b>{stop.code}</b>
                <span>
                  {stop.years} · {stop.what} · {t(stop.city)}
                </span>
              </li>
            ))}
          </ol>
          <div className="p-work" data-work>
            <header data-work-head>
              <p className="eyebrow">{t({ en: 'Selected work · 06', zh: '代表工作 · 06' })}</p>
              <h2>{t({ en: 'Unpacked.', zh: '开箱。' })}</h2>
            </header>
            <div className="p-grid">
              {work.map((item, i) => (
                <article key={item.id} className="p-card" data-card>
                  <div className="p-card-in">
                    <span className="mono">
                      0{i + 1} · {item.where} · {item.year}
                    </span>
                    <h3>{item.title}</h3>
                    <strong>{item.metric}</strong>
                    <em>{t(item.metricLabel)}</em>
                    <p>{t(item.line)}</p>
                  </div>
                </article>
              ))}
            </div>
            <small className="mono">{t(footnote)}</small>
          </div>
        </div>
      </section>
      <Outro current="parcel" />
    </div>
  );
}
