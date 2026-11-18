import { useLang } from '../../i18n.jsx';

// Studio Lens: the dock's choices and the per-chapter lens bars. A lazy chunk, fetched when the dock is
// pointed at or opened (polish pass, 2026-11-18: it kept the phone bar's menu out of first-paint JS).
const LENSES = {
  hero: [
    { id: 'ink', label: { en: '01 · Wet Ink', zh: '01 · 湿墨揭幕' }, short: { en: '01 Ink', zh: '01 湿墨' } },
    { id: 'shadow', label: { en: '10 · 318° Shadow', zh: '10 · 318° 光影' }, short: { en: '10 Shadow', zh: '10 光影' } },
    { id: 'typist', label: { en: '09 · Token Typist', zh: '09 · 策略逐词' }, short: { en: '09 Typist', zh: '09 逐词' } },
  ],
  work: [
    { id: 'parcel', label: { en: '02 · Parcel Box', zh: '02 · 快递拆盒' }, short: { en: '02 Parcel', zh: '02 快递' } },
    { id: 'bento', label: { en: '08 · Bento Cards', zh: '08 · Bento 卡片' }, short: { en: '08 Bento', zh: '08 卡片' } },
    { id: 'receipt', label: { en: '11 · Thermal Receipt', zh: '11 · 实证小票' }, short: { en: '11 Receipt', zh: '11 小票' } },
    { id: 'city', label: { en: '12 · Metric City', zh: '12 · 尺度天际线' }, short: { en: '12 City', zh: '12 建筑' } },
  ],
  eval: [
    { id: 'd20', label: { en: '05 · D20 Die', zh: '05 · 二十面骰' }, short: { en: '05 D20', zh: '05 骰子' } },
    { id: 'arena', label: { en: '13 · Agent Arena', zh: '13 · 对抗沙盒' }, short: { en: '13 Arena', zh: '13 沙盒' } },
  ],
};
const GROUPS = [
  ['hero', { en: 'Hero', zh: '开场' }],
  ['work', { en: 'Work', zh: '作品' }],
  ['eval', { en: 'Eval', zh: '评测' }],
];

// the dock's open panel: one row of choices per chapter that has more than one way to be shown
export default function LensGroups({ value, onPick, onReset }) {
  const { t } = useLang();
  const custom = value.hero !== 'ink' || value.work !== 'parcel' || value.eval !== 'd20';
  return (
    <>
      {GROUPS.map(([kind, name]) => (
        <div key={kind} className="h-lens-group">
          <span>{t(name)}</span>
          {LENSES[kind].map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={value[kind] === opt.id ? 'is-active' : undefined}
              onClick={() => onPick(kind, opt.id)}
            >
              {t(opt.short)}
            </button>
          ))}
        </div>
      ))}
      {custom && (
        <button type="button" className="h-lens-reset" onClick={onReset}>
          {t({ en: 'Reset', zh: '恢复默认' })}
        </button>
      )}
    </>
  );
}

export function ChapterLensBar({ kind, label, value, onChange }) {
  const { t } = useLang();
  return (
    <div className="h-chapter-bar">
      <div className="h-lens-tabs" role="group" aria-label={label}>
        {LENSES[kind].map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={value === opt.id ? 'is-active' : undefined}
            aria-pressed={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            {t(opt.label)}
          </button>
        ))}
      </div>
      <a className="mono" href={`/${value}`}>
        {t({ en: 'Open standalone', zh: '独立全屏体验' })} →
      </a>
    </div>
  );
}
