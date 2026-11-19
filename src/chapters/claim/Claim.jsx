import { Fragment, useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n.jsx';
import './claim.css';

// Phase E, "Claim" (assembly plan §3 row 1): the thesis is written token by token as the reader
// scrolls, after Damon's Typist study (/typist, which stays as it is). At each token the words that
// were not chosen stand in depth around the cursor (CSS 3D, no WebGL); the chosen one comes forward
// and flattens onto the line while the rest recede. The cursor is the travelling mark: the sentence's
// own full stop runs ahead of the words and, when the last token is written, stays as the full stop.
//
// - Pure function of scroll: the section pins for ~1.3 screens and the typing runs over 1.42 screens
//   (from a quarter screen before the pin), so scrolling back un-writes it exactly.
// - The line is always laid out in full; typing only shows and hides tokens, so the rest state is the
//   plain sentence, and the depth layer (aria-hidden) never moves the layout.
// - The alternatives are invented, plausible next words. No probabilities are drawn: rank is shown only
//   as depth and size, and the caption says they are illustrative.
// - Reduced motion: the plain sentence, no pin, no candidates. Screen readers get the sentence once.

// The sentence as tokens ("~" glues a token to the one before: a comma, the full stop). The words not
// chosen at each token live with the film (film.js), in the same order.
const CLAIM = {
  en: 'I train language agents ~, then measure whether they hold up on real work ~.',
  zh: '我 训练 语言 智能体 ~， 再 检验 它们 在 真实 工作 中 是否 站得住 ~。',
};
const tokens = (s) => s.split(' ').map((w) => (w[0] === '~' ? { t: w.slice(1), glue: 1 } : { t: w }));

// scroll (viewports into the section) -> typing progress; the pin itself is --pin in claim.css
const U0 = -0.26;
const U1 = 1.16;
const PIN = 1.3;
// each token owns a window of LEN steps; inside it (f = 0..1): fan in, flatten from FLAT, on the line at LAND
const LEN = 2.1;
const LAND = 0.8;
const MARK_R = 0.62; // the stop's dock geometry (mark.js reads the same attributes)
const MARK_Y = 0.74;


const still = () =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Claim({ head }) {
  const { lang, t } = useLang();
  const [live] = useState(() => !still());
  const toks = tokens(CLAIM[lang] ?? CLAIM.en);
  const n = toks.length;
  const step = 1 / (n - 1 + LEN);
  const L = LEN * step;
  const toU = (p) => (U0 + p * (U1 - U0)).toFixed(3);
  const last = n - 1;
  const sentence = toks.map((k, i) => (i && !k.glue && lang !== 'zh' ? ' ' : '') + k.t).join('');

  const sec = useRef(null);
  const h2 = useRef(null);
  const depth = useRef(null);
  const caret = useRef(null);
  const count = useRef(null);
  const cap = useRef(null);
  const facets = useRef(null);

  // the film (the depth layer and the per-frame writes) is a small chunk loaded after first paint
  useEffect(() => {
    if (!live) return undefined;
    let stop;
    let gone = false;
    import('./film.js').then(({ startClaim }) => {
      if (!gone) stop = startClaim({ lang, sec, h2, depth, caret, count, cap, facets, U0, U1, LEN, LAND, MARK_R, MARK_Y });
    });
    return () => {
      gone = true;
      stop?.();
    };
  }, [live, lang]);

  // words: a token glued to the one before (a comma, the full stop) never wraps away from it
  const words = [];
  toks.forEach((k, i) => {
    if (k.glue && words.length) words[words.length - 1].push(i);
    else words.push([i]);
  });

  return (
    <section
      id="statement"
      ref={sec}
      tabIndex={-1}
      className={`h-section h-statement cl${live ? ' is-live' : ''}`}
      style={live ? { '--pin': PIN } : undefined}
      data-pv="0 0.9"
      data-mark-track={live ? '' : undefined}
    >
      <div className="cl-stage">
        {head}
        <h2 className="h-sentence cl-sentence" ref={h2}>
          <span className="sr-only">{sentence}</span>
          {live && (
            <span className="cl-depth" ref={depth} aria-hidden="true">
              <i
                className="cl-caret"
                ref={caret}
                data-mark="statement"
                data-mark-kind="dot"
                data-mark-in={`-0.62 ${U0 - 0.04}`}
              />
            </span>
          )}
          <span className="cl-line" aria-hidden="true">
            {words.map((w, j) => (
              <Fragment key={`${lang}-${w[0]}`}>
                {j > 0 && lang !== 'zh' ? ' ' : ''}
                <span className="cl-w">
                  {w.map((i) =>
                    i === last ? (
                      <span
                        key={i}
                        className="h-stop cl-t"
                        data-t
                        data-mark="statement"
                        data-mark-r={MARK_R}
                        data-mark-y={MARK_Y}
                        data-mark-in={live ? `${toU(last * step + 0.45 * L)} ${toU(last * step + LAND * L)}` : undefined}
                      >
                        {toks[i].t}
                      </span>
                    ) : (
                      <span key={i} className="cl-t" data-t>
                        {toks[i].t}
                      </span>
                    ),
                  )}
                </span>
              </Fragment>
            ))}
          </span>
        </h2>
        {live && (
          <p className="cl-cap mono" ref={cap} aria-hidden="true">
            <span>
              {t({ en: 'Token', zh: '词元' })} <b ref={count}>01</b> / {String(n).padStart(2, '0')}
            </span>
            <span>
              {t({
                en: 'Words not chosen stand behind it · illustrative alternatives',
                zh: '未被选中的词退入纵深 · 候选词为示意',
              })}
            </span>
          </p>
        )}
        <ul className="h-facets mono" ref={facets}>
          {['Agentic RL', 'Post-training', 'Evaluation'].map((f, i) => (
            <li key={f}>
              <span>0{i + 1}</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
