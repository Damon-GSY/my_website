import { useFilm } from '../engine/useFilm.js';
import { useLang } from '../i18n.jsx';
import { footnote, joinParts, profile, route, work } from '../content.js';
import { buildParcelHome } from '../directions/parcel/Scene.js';
import '../directions/parcel/parcel.css';

// The home page's Work chapter: the white-carton Parcel film (same scene as /parcel), except that each
// landed card is a link that opens its own parcel in the Parcels study (/lab/parcels/#<slug>).
// Kept as a fork so the /parcel study stays untouched.
export default function WorkFilm({ label }) {
  const { root, canvas, track, mode } = useFilm(buildParcelHome);
  const { t } = useLang();
  const open = t({ en: 'Open the parcel', zh: '拆开这只箱子' });
  return (
    <div ref={root} className={`film parcel paper h-workfilm ${mode}`}>
      <section ref={track} className="track" style={{ '--len': 7 }} data-mark-track>
        <div className="sticky">
          <canvas ref={canvas} className="stage" aria-hidden="true" />
          {/* the travelling mark's dock: the carton's sticker, then the route, then the first card */}
          <i className="h-mark-film" data-mark="work" data-mark-kind="gl" data-mark-in="-0.5 0" aria-hidden="true" />
          {label}
          <h2 className="sr">{t({ en: 'Selected work', zh: '代表工作' })}</h2>
          <div className="p-fallback">
            <p className="eyebrow">{joinParts([t(profile.role), t(profile.org)])}</p>
            <p className="p-fallback-title">{t({ en: 'Six projects, packed.', zh: '六个项目，装箱。' })}</p>
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
              <h2 aria-hidden="true">{t({ en: 'Unpacked.', zh: '开箱。' })}</h2>
            </header>
            <div className="p-grid">
              {work.map((item, i) => (
                <a
                  key={item.id}
                  className="p-card h-card"
                  data-card
                  href={`/lab/parcels/#${item.id}`}
                  aria-label={`${item.title}, ${item.metric} ${t(item.metricLabel)}. ${open}`}
                >
                  <div className="p-card-in">
                    <span className="mono">
                      0{i + 1} · {item.where} · {item.year}
                    </span>
                    <h3>{item.title}</h3>
                    <strong>{item.metric}</strong>
                    <em>{t(item.metricLabel)}</em>
                    <p>{t(item.line)}</p>
                    <span className="h-card-open mono" aria-hidden="true">
                      <span className="h-card-open-text">{open}</span> ↗
                    </span>
                  </div>
                </a>
              ))}
            </div>
            <small className="mono">{t(footnote)}</small>
          </div>
        </div>
      </section>
    </div>
  );
}
