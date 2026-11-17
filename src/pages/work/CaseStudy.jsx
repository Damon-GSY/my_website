import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../../i18n.jsx';
import { footnote, joinParts, work } from '../../content.js';
import { getVisit, setVisit } from '../../engine/store.js';
import { cases } from './cases.js';
import { HOME_TITLE, closeCase, caseOrigin, releaseScroll, scrollToWork, switchCase, useCase } from './caseRoute.js';
import './case.css';

// A Work card, opened in place (phase B). The card's parcel is a CSS 3D carton: it rises out of the
// card, tilts so its walls read as a box, the lid swings off and the four walls fold down flat into a
// cross-shaped sheet, the case study (the same net as /lab/parcels/). Closing plays it backwards into
// the card. On narrow screens the sheet is a column of panels that unfold one under another. No
// WebGL: it runs over the film without a second context, and works where the film is static.
// Reduced motion: a plain fade.

const W = 560; // base (title + figure)
const D = 340;
const H = 300; // depth of the walls: the four flaps
const NET_W = W + 2 * H;
const NET_H = D + 2 * H;
const DUR = 900;
const DUR_STACK = 820;
const DUR_FADE = 180;
const CLOSE_RATE = 1.3;
const EZ = 'cubic-bezier(.45,0,.2,1)';
const OUT = 'cubic-bezier(.2,.7,.25,1)';
const CLOSED = { fb: 'rotateX(-90deg)', ff: 'rotateX(90deg)', fl: 'rotateY(90deg)', fr: 'rotateY(-90deg)' };
const FLAT = { fb: 'rotateX(0deg)', ff: 'rotateX(0deg)', fl: 'rotateY(0deg)', fr: 'rotateY(0deg)' };
// [start, end] of each wall folding down, as a share of the opening
const FOLD = { ff: [0.22, 0.8], fl: [0.28, 0.86], fr: [0.3, 0.9], fb: [0.36, 0.92] };

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const layoutFor = () => (window.innerWidth >= 900 && window.innerHeight >= 560 ? 'net' : 'stack');
const netScale = () => Math.min(1, (window.innerWidth - 48) / NET_W, Math.max(0.8, (window.innerHeight - 48) / NET_H));
const scene = (x, y, z, k, rx, rz) =>
  `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale3d(${k}, ${k}, ${k}) rotateX(${rx}deg) rotateZ(${rz}deg)`;
const frames = (n) => new Promise((done) => {
  const step = (k) => (k ? requestAnimationFrame(() => step(k - 1)) : done());
  step(n);
});
const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

// the card on the page, if it is on screen and drawn (a film card is invisible until it has landed)
// (`whole`: entirely, for folding back into it and handing focus back)
function visibleCard(id, whole = false) {
  const el = id && document.querySelector(`[data-case="${id}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const m = whole ? 0 : Math.min(r.width, r.height) - 1; // how far it may stick out
  if (r.width < 8 || r.top < -m || r.bottom > window.innerHeight + m || r.left < -m || r.right > window.innerWidth + m) return null;
  if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return null;
  return el;
}

export default function CaseStudy() {
  const slug = useCase();
  const { t } = useLang();
  const [shown, setShown] = useState(null);
  const [mode, setMode] = useState(layoutFor);
  const [fs, setFs] = useState(netScale);
  const ref = useRef({});
  const r = ref.current; // elements
  const ctl = useRef({ anims: [], token: 0, cur: null, state: 'closed', card: null });

  // ---- animation ----------------------------------------------------------------------------
  function build(card) {
    const list = [];
    const A = (el, kf, dur) => {
      const a = el.animate(kf, { duration: dur, fill: 'both' });
      list.push(a);
      return a;
    };
    if (reduced()) {
      A(r.root, [{ opacity: 0 }, { opacity: 1 }], DUR_FADE);
      return list;
    }
    const net = layoutFor() === 'net';
    const dur = net ? DUR : DUR_STACK;
    A(r.backdrop, [{ opacity: 0 }, { opacity: 1, offset: 0.5 }, { opacity: 1 }], dur);
    A(r.chrome, [{ opacity: 0 }, { opacity: 0, offset: 0.7 }, { opacity: 1 }], dur);
    if (card) A(card, [{ opacity: 1 }, { opacity: 0, offset: 0.16 }, { opacity: 0 }], dur);
    const c = card?.getBoundingClientRect();
    if (net) {
      const k1 = netScale();
      const s = r.stage.getBoundingClientRect();
      const cx = s.left + s.width / 2;
      const cy = s.top + s.height / 2;
      // the closed box sits on the card, its lid at the card's own depth (z = 0), as wide as the card
      const k = c ? c.width / W : k1 * 0.32;
      const dx = c ? c.left + c.width / 2 - cx : 0;
      const dy = c ? c.top + c.height / 2 - cy : 0;
      const kMid = k + (k1 - k) * 0.3;
      A(
        r.scene,
        [
          { transform: scene(dx, dy, -H * k, k, 0, 0), easing: OUT },
          { transform: scene(dx * 0.5, dy * 0.5, 40, kMid, 52, -24), offset: 0.32, easing: EZ },
          { transform: scene(0, 0, 0, k1, 0, 0) },
        ],
        dur,
      );
      for (const key of Object.keys(FOLD)) {
        const [a, b] = FOLD[key];
        A(
          r[key],
          [
            { transform: CLOSED[key], offset: 0 },
            { transform: CLOSED[key], offset: a, easing: OUT },
            { transform: FLAT[key], offset: b },
            { transform: FLAT[key], offset: 1 },
          ],
          dur,
        );
      }
      A(
        r.lid,
        [
          { transform: 'rotateX(-90deg)', opacity: 1, offset: 0 },
          { transform: 'rotateX(-90deg)', opacity: 1, offset: 0.1, easing: 'cubic-bezier(.35,0,.25,1)' },
          { transform: 'rotateX(70deg)', opacity: 1, offset: 0.48 },
          { transform: 'rotateX(100deg)', opacity: 0, offset: 0.66 },
          { transform: 'rotateX(100deg)', opacity: 0, offset: 1 },
        ],
        dur,
      );
      A(r.shadow, [{ opacity: 1 }, { opacity: 0, offset: 0.6 }, { opacity: 0 }], dur);
    } else {
      // the first panel grows out of the card; the others unfold under it like a folded leaflet
      const b = r.base.getBoundingClientRect();
      const from = c
        ? `translate(${(c.left - b.left).toFixed(1)}px, ${(c.top - b.top).toFixed(1)}px) scale(${(c.width / b.width).toFixed(4)})`
        : 'translate(0px, 32px) scale(0.86)';
      A(
        r.base,
        [
          { transform: from, opacity: c ? 1 : 0, easing: EZ },
          { transform: 'translate(0px, 0px) scale(1)', opacity: 1, offset: 0.42 },
          { transform: 'translate(0px, 0px) scale(1)', opacity: 1 },
        ],
        dur,
      );
      ['fl', 'fr', 'fb', 'ff'].forEach((key, i) => {
        const a = 0.3 + i * 0.1;
        const shut = { transform: 'perspective(900px) rotateX(-88deg)', opacity: 0 };
        const flat = { transform: 'perspective(900px) rotateX(0deg)', opacity: 1 };
        A(r[key], [{ ...shut, offset: 0 }, { ...shut, offset: a, easing: OUT }, { ...flat, offset: a + 0.36 }, { ...flat, offset: 1 }], dur);
      });
    }
    return list;
  }

  const finished = (list) => Promise.all(list.map((a) => a.finished)).catch(() => {});
  const drop = () => {
    ctl.current.anims.forEach((a) => a.cancel());
    ctl.current.anims = [];
  };

  function lock(on) {
    const html = document.documentElement;
    const app = document.getElementById('root');
    // keep the page where it is: hold the scrollbar's space only if it takes any (classic scrollbars)
    html.style.scrollbarGutter = on && window.innerWidth > html.clientWidth ? 'stable' : '';
    html.classList.toggle('case-open', on);
    html.style.overflow = on ? 'hidden' : '';
    if (app) app.inert = on;
  }

  async function open() {
    const s = ctl.current;
    const token = ++s.token;
    s.state = 'opening';
    lock(true);
    r.scroll.scrollTop = 0;
    const origin = caseOrigin();
    const card = origin?.isConnected && origin.dataset.case === s.cur ? visibleCard(s.cur) : null;
    drop();
    s.card = card;
    s.anims = build(card);
    r.title?.focus({ preventScroll: true });
    await finished(s.anims);
    if (token !== s.token) return;
    s.state = 'open';
    if (s.card) s.card.style.visibility = 'hidden';
    drop();
  }

  async function close() {
    const s = ctl.current;
    const token = ++s.token;
    const id = s.cur;
    if (s.state === 'opening' && s.anims.length) {
      // still unfolding: fold back from where it is
      s.state = 'closing';
      s.anims.forEach((a) => {
        a.playbackRate = -CLOSE_RATE;
        a.play();
      });
    } else {
      s.state = 'closing';
      if (s.card) s.card.style.visibility = '';
      let card = visibleCard(id, true);
      if (!card) {
        // the page under the dialog may have moved (a deep link, fonts, the film loading): bring the
        // card back into view first, so the parcel folds back into it
        scrollToWork(id);
        await frames(3);
        if (token !== s.token) return;
        card = visibleCard(id, true);
      }
      drop();
      s.card = card;
      s.anims = build(card);
      s.anims.forEach((a) => {
        a.currentTime = a.effect.getComputedTiming().endTime;
        a.playbackRate = -CLOSE_RATE;
        a.play();
      });
    }
    await finished(s.anims);
    if (token !== s.token) return;
    s.state = 'closed';
    s.cur = null;
    lock(false);
    releaseScroll();
    const back = document.querySelector(`[data-case="${id}"]`);
    if (back) back.style.visibility = '';
    drop();
    s.card = null;
    setShown(null);
    document.title = HOME_TITLE;
    back?.focus({ preventScroll: true });
  }

  // ---- URL → dialog ---------------------------------------------------------------------------
  useEffect(() => {
    const s = ctl.current;
    if (slug && !work.some((w) => w.id === slug)) {
      closeCase();
      return;
    }
    if (slug) {
      if (s.state === 'closing') {
        // reopened while folding back (Forward, or a quick second click): unfold again
        s.token += 1;
        s.state = 'opening';
        s.cur = slug;
        setShown(slug);
        const token = s.token;
        s.anims.forEach((a) => {
          a.playbackRate = 1;
          a.play();
        });
        finished(s.anims).then(() => {
          if (token !== s.token) return;
          s.state = 'open';
          if (s.card) s.card.style.visibility = 'hidden';
          drop();
        });
      } else if (!s.cur) {
        s.cur = slug;
        setShown(slug); // the layout effect below starts the unfold once the sheet is in the DOM
      } else if (slug !== s.cur) {
        // "next parcel": same sheet, new contents
        if (s.card) s.card.style.visibility = '';
        s.card = null;
        s.cur = slug;
        setShown(slug);
        if (!reduced() && r.box) r.box.animate([{ opacity: 0.2, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], 260);
        requestAnimationFrame(() => r.title?.focus({ preventScroll: true }));
      }
    } else if (s.cur && s.state !== 'closing') {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useLayoutEffect(() => {
    if (shown && ctl.current.state === 'closed') open();
    if (!shown) return;
    const item = work.find((w) => w.id === shown);
    document.title = `${item.title} — Damon Guan`;
    const seen = getVisit().parcels || [];
    if (!seen.includes(shown)) setVisit({ parcels: [...seen, shown] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  // Esc, the focus trap, and layout on resize, while a case is on screen
  useEffect(() => {
    if (!shown) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCase();
        return;
      }
      if (e.key !== 'Tab' || !r.root) return;
      const items = [...r.root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      // cycle through the dialog's controls only, from wherever focus is (the title holds it at first)
      e.preventDefault();
      const a = document.activeElement;
      let at = items.indexOf(a);
      if (at < 0) {
        const after = items.findIndex((el) => a.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
        at = e.shiftKey ? (after < 0 ? items.length : after) : after < 0 ? -1 : after - 1;
      }
      items[(at + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
    };
    const onResize = () => {
      setMode(layoutFor());
      setFs(netScale());
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  // unmounting with a case open (the page went away): leave the document as it was
  useEffect(
    () => () => {
      ctl.current.anims.forEach((a) => a.cancel());
      document.documentElement.classList.remove('case-open');
      document.documentElement.style.overflow = '';
      document.documentElement.style.scrollbarGutter = '';
      const app = document.getElementById('root');
      if (app) app.inert = false;
    },
    [],
  );

  // verification hook: __case.seek(0..1) freezes the current unfold at that point
  useEffect(() => {
    window.__case = {
      seek: (p) =>
        ctl.current.anims.forEach((a) => {
          a.pause();
          a.currentTime = p * a.effect.getComputedTiming().endTime;
        }),
      play: () => ctl.current.anims.forEach((a) => a.play()),
      state: () => ctl.current.state,
    };
    return () => {
      delete window.__case;
    };
  }, []);

  if (!shown) return null;
  const i = work.findIndex((w) => w.id === shown);
  const item = work[i];
  const c = cases[shown];
  if (!item || !c) return null;
  const nx = work[(i + 1) % work.length];
  const parcel = (k) => `${t({ en: 'Parcel', zh: '包裹' })} ${String(k + 1).padStart(2, '0')} / 06`;
  const set = (key) => (el) => {
    r[key] = el;
  };
  const onBackdrop = (e) => {
    if (e.target === r.scroll || e.target === r.stage) closeCase();
  };
  const net = mode === 'net';
  const stageStyle = net ? { height: `${Math.max(window.innerHeight, Math.ceil(NET_H * fs + 48))}px` } : undefined;
  const sceneStyle = net ? { transform: scene(0, 0, 0, fs, 0, 0) } : undefined;

  return createPortal(
    <div className={`wc wc-${mode}`} ref={set('root')} role="dialog" aria-modal="true" aria-labelledby="wc-title">
      <div className="wc-chrome" ref={set('chrome')}>
        <button type="button" className="wc-close" onClick={closeCase}>
          {t({ en: 'Close', zh: '关闭' })} <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="wc-backdrop" ref={set('backdrop')} />
      {/* clicking the empty table around the sheet closes it; Esc and the buttons do the same by keyboard */}
      <div className="wc-scroll" ref={set('scroll')} onClick={onBackdrop}>
        <div className="wc-stage" ref={set('stage')} style={stageStyle}>
          <div className="wc-scene" ref={set('scene')} style={sceneStyle}>
            <div className="wc-shadow" ref={set('shadow')} aria-hidden="true" />
            <article className="wc-box" ref={set('box')}>
              <div className="wc-pnl wc-base" ref={set('base')}>
                <div className="wc-in wc-main">
                  <p className="wc-k">{joinParts([parcel(i), item.where, item.year])}</p>
                  <h2 id="wc-title" ref={set('title')} tabIndex={-1}>
                    {item.title}
                  </h2>
                  <div className="wc-met">
                    <b>{item.metric}</b>
                    <span>
                      {t(item.metricLabel)}
                      <br />
                      {t(c.sub)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="wc-flap wc-fl" ref={set('fl')}>
                <section className="wc-in wc-pin">
                  <p className="wc-k">01 · {t({ en: 'What it is', zh: '它是什么' })}</p>
                  <h3>{t(c.what[0])}</h3>
                  <p>{t(c.what[1])}</p>
                </section>
                <div className="wc-out" aria-hidden="true" />
              </div>
              <div className="wc-flap wc-fr" ref={set('fr')}>
                <section className="wc-in wc-pin">
                  <p className="wc-k">02 · {t({ en: 'How it is held', zh: '如何站得住' })}</p>
                  <h3>{t(c.held[0])}</h3>
                  <p>{t(c.held[1])}</p>
                </section>
                <div className="wc-out" aria-hidden="true" />
              </div>
              <div className="wc-flap wc-fb" ref={set('fb')}>
                <section className="wc-in wc-pin wc-slip">
                  <div className="wc-row">
                    <h3 className="wc-k">{t({ en: 'Packing slip', zh: '装箱单' })}</h3>
                    <span className="wc-k">{t({ en: 'Opened from the shelf', zh: '从货架上拆开' })}</span>
                  </div>
                  <dl>
                    <dt>{t({ en: 'Contents', zh: '内容' })}</dt>
                    <dd>{item.title}</dd>
                    <dt>{t({ en: 'Summary', zh: '概要' })}</dt>
                    <dd>{t(item.line)}</dd>
                    <dt>{t({ en: 'Declared figure', zh: '申报数字' })}</dt>
                    <dd>
                      {item.metric} {t(item.metricLabel)}
                      {c.prod && <span className="wc-fn"> — {t(footnote)}</span>}
                    </dd>
                  </dl>
                  <div className="wc-end">
                    <button type="button" className="wc-go" onClick={closeCase}>
                      <span aria-hidden="true">←</span> {t({ en: 'Back to the shelf', zh: '回到货架' })}
                    </button>
                    <span className="wc-bc" aria-hidden="true" />
                  </div>
                </section>
                <div className="wc-out" aria-hidden="true" />
                <div className="wc-flap wc-lid" ref={set('lid')} aria-hidden="true">
                  <div className="wc-in" />
                  <div className="wc-out wc-lid-out">
                    <span className="wc-tape" />
                    <span className="wc-k">{parcel(i)}</span>
                  </div>
                </div>
              </div>
              <div className="wc-flap wc-ff" ref={set('ff')}>
                <section className="wc-in wc-pin wc-next">
                  <div className="wc-row">
                    <h3 className="wc-k">03 · {t({ en: 'Next parcel', zh: '下一只箱子' })}</h3>
                    <span className="wc-k wc-esc" aria-hidden="true">
                      {t({ en: 'Esc closes', zh: 'Esc 关闭' })}
                    </span>
                  </div>
                  <button type="button" className="wc-nextcard" onClick={() => switchCase(nx.id)}>
                    <span className="wc-k">{parcel((i + 1) % work.length)}</span>
                    <span className="wc-nm">{nx.title}</span>
                    <b>{nx.metric}</b>
                  </button>
                </section>
                <div className="wc-out wc-ff-out" aria-hidden="true">
                  <span className="wc-label">
                    <span className="wc-k">{parcel(i)}</span>
                    <span className="wc-nm">{item.title}</span>
                    <b>{item.metric}</b>
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
