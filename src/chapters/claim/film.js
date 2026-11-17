// The Claim chapter's film (Claim.jsx), loaded after first paint: builds the depth layer (the words not
// chosen and the chosen token's ghost) and writes every frame as a pure function of scroll.

// The words not chosen, three per token, in the order of Claim.jsx's tokens (invented, plausible
// next words; rank only, no probabilities).
const ALTS = {
  en: 'We My This|build tune teach|coding web small|models systems tools|and that to|and so but|test check watch|if how when|these it each|stand work scale|true out firm|in at under|actual messy hard|tasks data jobs|, — !',
  zh: '我们 本人 他|构建 调教 研究|编程 通用 小型|模型 系统 助手|并 后 ；|然后 并 也|测量 测试 观察|其 这些 它|于 到 进|实际 复杂 线上|任务 场景 环境|里 上 下|能否 如何 怎样|可靠 成立 管用|， ！ ；',
};

// inside a token's window (f = 0..1) the chosen token starts to flatten at FLAT (it lands at LAND)
const FLAT = 0.34;
// The candidates stand as a deck in depth under the cursor, in the empty lines the sentence has not
// reached yet: place 0 (nearest) is the chosen token, the words not chosen stand behind it, each one
// deeper, smaller and fainter (rank, not a probability). Units: em, from the token's own slot.
// `ys` is the row step, squeezed for the last lines so the deck stays above the three-term line.
const DECK = (k, ys = 0.9) => ({ x: 0.06 + 0.5 * k, y: 0.95 + ys * k, z: -0.35 - 1.05 * k, ry: -6 - 6 * k, rx: 8 });
const DECK_OP = [1, 0.8, 0.55, 0.34];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a));
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

export function startClaim({ lang, sec, h2, depth, caret, count, cap, facets, U0, U1, LEN, LAND, MARK_R, MARK_Y }) {
  const root = h2.current;
  const tokEls = [...root.querySelectorAll('[data-t]')];
  const n = tokEls.length;
  const last = n - 1;
  const step = 1 / (n - 1 + LEN);
  const L = LEN * step;
  const made = [];
  const add = (cls, text) => {
    const el = document.createElement('span');
    el.className = cls;
    el.textContent = text;
    depth.current.appendChild(el);
    made.push(el);
    return el;
  };
  const alts = [];
  const ghosts = [];
  (ALTS[lang] ?? ALTS.en).split('|').forEach((words, i) => {
    words.split(' ').forEach((w, r) => alts.push({ el: add('cl-alt', w), i, r }));
    if (i < last) ghosts.push(add('cl-ghost', tokEls[i].textContent));
  });
  let geo = null;
  let stopped = false;
  let raf = 0;
  const prev = new Map(); // last value written per element, so a frame only touches what changed

  const put = (el, key, v) => {
    const k = prev.get(el) || {};
    if (k[key] === v) return;
    k[key] = v;
    prev.set(el, k);
    if (key === 'op') el.style.opacity = v;
    else if (key === 'tf') el.style.transform = v;
    else if (key === 'fill') el.style.setProperty('--fill', v);
  };

  const measure = () => {
    const o = root.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(root).fontSize);
    const rects = tokEls.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height };
    });
    const stop = rects[last];
    const size = Math.min(30, Math.min(stop.w, stop.h) * MARK_R);
    // where the cursor's centre sits once token i is written: where a full stop would follow it
    const end = (i) =>
      i < 0
        ? { x: rects[0].x + stop.w / 2, y: rects[0].y + stop.h * MARK_Y }
        : { x: rects[i].x + rects[i].w + stop.w / 2, y: rects[i].y + stop.h * MARK_Y };
    const ends = rects.map((_, i) => end(i));
    ends[last] = end(last - 1);
    // room under each line, down to the three-term line, sets how far the deck may step down
    const floor = facets.current.getBoundingClientRect().top - o.top - 0.1 * em;
    const ys = rects.map((r) => clamp((floor - r.y - r.h) / em / 2.2, 0.32, 0.9));
    geo = { em, rects, size, ends, ys, start: end(-1) };
    depth.current.style.setProperty('--lh', `${stop.h}px`);
    depth.current.style.height = `${Math.max(floor, rects[last].y + rects[last].h)}px`;
    caret.current.style.width = `${size}px`;
    caret.current.style.height = `${size}px`;
    prev.clear();
    frame();
  };

  const frame = () => {
    raf = 0;
    if (!geo) return;
    const H = window.innerHeight;
    const u = -sec.current.getBoundingClientRect().top / H;
    const p = span(u, U0, U1);
    const { em, rects, size, ends, ys, start } = geo;
    const fs = rects.map((_, i) => span(p, i * step, i * step + L));

    // the cursor: slides to the end of the token being flattened; a new line starts at its left
    let c = start;
    let cur = -1;
    for (let i = 0; i < last; i += 1) if (fs[i] > FLAT) cur = i;
    if (cur >= 0) {
      const g = ease(span(fs[cur], FLAT, LAND));
      const a = cur ? ends[cur - 1] : start;
      const b = ends[cur];
      const from = Math.abs(a.y - b.y) > 2 ? { x: rects[cur].x + size / 2, y: b.y } : a;
      c = { x: lerp(from.x, b.x, g), y: lerp(from.y, b.y, g) };
    }
    const stopIn = span(fs[last], 0.45, LAND);
    put(caret.current, 'tf', `translate3d(${(c.x - size / 2).toFixed(2)}px, ${(c.y - size / 2).toFixed(2)}px, 0)`);
    put(caret.current, 'op', (1 - span(stopIn, 0.75, 1)).toFixed(3));
    depth.current.style.perspectiveOrigin = `${c.x.toFixed(1)}px ${c.y.toFixed(1)}px`;

    // the line: a token is there once it has landed; the full stop arrives with the mark
    tokEls.forEach((el, i) => {
      const v = i === last ? span(stopIn, 0.75, 1) : fs[i] >= LAND ? 1 : 0;
      put(el, 'op', String(v));
    });

    // the chosen token, coming forward out of the fan and flattening onto its slot
    ghosts.forEach((el, i) => {
      const f = fs[i];
      if (f <= 0 || f >= LAND) {
        put(el, 'op', '0');
        return;
      }
      const g = ease(span(f, FLAT, LAND));
      const e = ease(span(f, 0, 0.32));
      const k = 1 - g;
      const r = rects[i];
      const d = DECK(0);
      put(
        el,
        'tf',
        `translate3d(${(r.x + d.x * em * k).toFixed(2)}px, ${(r.y + d.y * em * k).toFixed(2)}px, ${((d.z - (1 - e) * 3) * em * k).toFixed(2)}px) rotateY(${(d.ry * k).toFixed(2)}deg) rotateX(${(d.rx * k).toFixed(2)}deg)`,
      );
      put(el, 'op', ease(span(f, 0, 0.3)).toFixed(3));
      put(el, 'fill', g.toFixed(3));
    });

    // the words not chosen: fan out behind the cursor, then recede and fade
    alts.forEach(({ el, i, r }) => {
      const f = fs[i];
      if (f <= 0 || f >= 1) {
        put(el, 'op', '0');
        return;
      }
      const s = DECK(r + 1, ys[i]);
      const e = ease(span(f, 0, 0.38));
      const o = ease(span(f, 0.5, 1));
      const z = s.z + (1 - e) * -3 + o * -4;
      const R = rects[i];
      put(
        el,
        'tf',
        `translate3d(${(R.x + s.x * em).toFixed(2)}px, ${(R.y + s.y * em * (1 + 0.35 * o)).toFixed(2)}px, ${(z * em).toFixed(2)}px) rotateY(${s.ry}deg) rotateX(${s.rx}deg)`,
      );
      put(el, 'op', (DECK_OP[r + 1] * e * (1 - o)).toFixed(3));
    });

    // the caption counts tokens while the sentence is being written, and leaves at rest
    const done = fs.filter((f) => f >= LAND).length;
    const nn = String(Math.max(1, Math.min(n, done + (p > 0 && done < n ? 1 : 0)))).padStart(2, '0');
    if (count.current.textContent !== nn) count.current.textContent = nn;
    put(cap.current, 'op', (span(p, 0, 0.04) * (1 - span(p, 0.94, 1))).toFixed(3));
  };

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const ro = new ResizeObserver(measure);
  ro.observe(root);
  measure();
  document.fonts?.ready.then(() => stopped || measure());
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    made.forEach((el) => el.remove());
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}
