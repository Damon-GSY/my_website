import { useFilm } from '../../engine/useFilm.js';
import { useLang } from '../../i18n.jsx';
import { footnote, joinParts, profile, route, work } from '../../content.js';
import { buildParcel, buildParcelPaper } from './Scene.js';
import './parcel.css';

// The Parcel film. `paper` is the white-carton printing used as the Work chapter of the home page;
// `kraft` is the standalone /parcel study. `before` and `after` render inside the film root.
export default function ParcelFilm({ paper = false, id, before, after, label }) {
  const { root, canvas, track, mode } = useFilm(paper ? buildParcelPaper : buildParcel);
  const { t } = useLang();
  return (
    <div ref={root} id={id} className={`film parcel ${paper ? 'paper' : 'kraft'} ${mode}`}>
      {before}
      <section ref={track} className="track" style={{ '--len': 7 }}>
        <div className="sticky">
          <canvas ref={canvas} className="stage" aria-hidden="true" />
          {label}
          {paper ? (
            <h2 className="sr">{t({ en: 'Selected work', zh: '代表工作' })}</h2>
          ) : (
            <h1 className="sr">{profile.name}. I build agents that ship.</h1>
          )}
          <div className="p-fallback">
            <p className="eyebrow">{joinParts([t(profile.role), t(profile.org)])}</p>
            <p className="p-fallback-title">I build agents that ship.</p>
          </div>
          <p className="p-hint mono" data-hint>
            {t({ en: 'Scroll to pack ↓', zh: '向下滚动，开始打包 ↓' })}
          </p>
          <ol className="p-route mono" data-route>
            {route.map((stop) => (
              <li key={stop.years}>
                <b>{stop.code || <i className="p-blank" aria-label={t({ en: 'to be filled in', zh: '待填写' })} />}</b>
                <span>{joinParts([stop.years, stop.what, t(stop.city)])}</span>
              </li>
            ))}
          </ol>
          <div className="p-work" data-work>
            <header data-work-head>
              <p className="eyebrow">{t({ en: 'Selected work · 06', zh: '代表工作 · 06' })}</p>
              <h2 aria-hidden={paper || undefined}>{t({ en: 'Unpacked.', zh: '开箱。' })}</h2>
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
      {after}
    </div>
  );
}
