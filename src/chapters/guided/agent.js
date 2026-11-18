import { profile, work } from '../../content.js';
import { getVisit, quiet, setVisit } from '../../engine/store.js';
import { hasWebGL2 } from '../../engine/webgl.js';
import { closeCase, getCase } from '../../pages/work/caseRoute.js';
import { closeNote, getNote } from '../notes/noteRoute.js';

// Phase H, "Guided" (assembly plan §3 modes, after the Agent study, /lab/agent/): the page operates
// itself as an agent would. Each step is a tool call, logged before it runs and given the outcome the
// page actually shows (read from the DOM at that moment, never typed in here). The script drives the
// real chapters: it scrolls through them at reading pace (so every film plays as it would for the
// visitor), opens one case study and closes it, asks before rolling the d20 (the one step that changes
// what the receipt records about the visitor), dwells on Evidence, opens and closes the newest note,
// and ends by printing the receipt, where the trace is printed too (store field `guided`).
//
// Chapter positions are read live, every frame of a glide, so the script follows whatever scroll
// lengths and pins the page has. Nothing here is imported before the visitor presses "Guided".
//
// `?speed=N` (0.25–20) scales every glide and dwell, as in the Agent study. Reduced motion: no glides,
// it jumps between chapters (the chapters are then static) and still narrates.

const qs = new URLSearchParams(window.location.search);
export const SPEED = Math.min(20, Math.max(0.25, parseFloat(qs.get('speed')) || 1));
export const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// the films run only with motion and WebGL2 (the home page's own test)
const still = () => RM || !hasWebGL2();

const PER_SCREEN = 1150; // ms of glide per screen of scroll at speed 1
const PER_PRINT = 1500;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const H = () => window.innerHeight;
const maxY = () => Math.max(0, document.documentElement.scrollHeight - H());
const clampY = (y) => Math.min(maxY(), Math.max(0, Math.round(y)));
const top = (el) => el.getBoundingClientRect().top + window.scrollY;
const bottom = (el) => el.getBoundingClientRect().bottom + window.scrollY;
const text = (el) => el?.textContent.replace(/\s+/g, ' ').trim() || '';
// a pinned chapter rests on its last screen; a short one on its top
const through = (el) => (el.offsetHeight > H() * 1.3 ? bottom(el) - H() : top(el) - 16);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const SEC = {
  top: { en: '(00) Opening', zh: '(00) 开场' },
  statement: { en: '(01) Statement', zh: '(01) 自述' },
  work: { en: '(02) Work', zh: '(02) 作品' },
  evidence: { en: '(04) Evidence', zh: '(04) 证据' },
  path: { en: '(05) Path', zh: '(05) 经历' },
  notes: { en: '(06) Notes', zh: '(06) 笔记' },
};

const MISSING = { status: 'skip', out: { en: 'Not on this page', zh: '本页没有这一部分' } };

// the Work chapter rests on its grid of cards: the end of the film, or the cards in the static version
function workRest(host) {
  if (!still() && host.querySelector('.h-workfilm, .h-defer')) return bottom(host) - H();
  const card = host.querySelector('[data-case]');
  if (card) {
    const r = card.getBoundingClientRect();
    return r.top + window.scrollY + r.height / 2 - H() / 2;
  }
  return top(host) - 16;
}

// Evidence: the start (`end` false) or the end of its pinned film; static, its top, 1 px in, so the
// chapter above is wholly out of view (the receipt counts a chapter once any of it is on screen)
function evidenceAt(el, end) {
  const track = el.querySelector('.ev-track');
  if (!el.classList.contains('is-live') || !track) return top(el) + 1;
  return end ? bottom(track) - H() : top(track);
}

const seedOf = () => text($('#evaluate .d20-seed')).match(/[0-9a-f]{8}/)?.[0] || '';
const latestNote = () => $('#notes .h-note-dot')?.closest('a[data-note]') || $('#notes a[data-note]');

// The script. run(c, entry) returns { out, status? } and must be safe to run again from the start:
// a pause aborts the step in flight, and Resume runs it again from wherever the page now is.
export const STEPS = [
  {
    fn: 'scroll_to',
    arg: () => SEC.top,
    async run(c) {
      // back to the beginning: from far down, a jump (gliding up would play every film backwards)
      if (window.scrollY > H() * 2.5) c.jump(0);
      else await c.glide(() => 0);
      await c.wait(1300);
      return { out: { en: `${profile.name}, the top of the page`, zh: `${profile.name}，页面顶部` } };
    },
  },
  {
    fn: 'scroll_to',
    arg: () => SEC.statement,
    async run(c) {
      const el = $('#statement');
      if (!el) return MISSING;
      await c.glide(() => through(el));
      await c.wait(1500);
      const s = text(el.querySelector('.sr-only'));
      return { out: s ? `“${s}”` : null };
    },
  },
  {
    fn: 'scroll_to',
    arg: () => SEC.work,
    async run(c) {
      const host = $('#work');
      if (!host) return MISSING;
      await c.glide(() => workRest(host));
      await c.until(() => $('[data-case]'), 3000);
      await c.wait(1200);
      const n = $$('#work [data-case]').length;
      return { out: { en: `${n} cases on the shelf`, zh: `货架上有 ${n} 个案例` } };
    },
  },
  {
    fn: 'open_case',
    arg: () => work[0].id,
    async run(c) {
      const id = work[0].id;
      if (getCase() !== id) {
        const card = $(`[data-case="${id}"]`);
        if (!card) return MISSING;
        await c.press(card);
        await c.until(() => window.__case?.state?.() === 'open', 5000);
        c.refocus();
      }
      c.unpoint();
      await c.wait(3600);
      return { out: [text($('#wc-title')), text($('.wc-met b'))].filter(Boolean).join(' · ') || null };
    },
  },
  {
    fn: 'close_case',
    arg: () => '',
    async run(c) {
      if (getCase()) {
        const b = $('.wc-close');
        if (b) await c.press(b);
        else closeCase();
      }
      await c.until(() => !$('.wc'), 5000);
      c.refocus();
      c.unpoint();
      await c.wait(700);
      return { out: { en: 'Folded back into its card', zh: '折回卡片' } };
    },
  },
  {
    fn: 'roll_d20',
    arg: () => '',
    // Asks first: rolling is the one step that changes what the receipt records about the visitor.
    async run(c, e) {
      const d20 = $('#evaluate .d20');
      if (!d20) return { status: 'skip', out: { en: 'No die on this page', zh: '本页没有骰子' } };
      if (!e.decision) {
        e.arg = seedOf();
        e.decision = await c.ask(e);
      }
      if (e.decision === 'skip') {
        e.arg = ''; // never rolled: no seed to name
        // jump over the chapter, so neither it nor the run counts as reached: land where Evidence holds
        // the mark (the start of its film) or, static, where its rest leaves nothing of Evaluate in view
        const ev = $('#evidence');
        if (!still()) quiet(350);
        if (ev) c.jump(evidenceAt(ev, false));
        await c.wait(450, true);
        return {
          status: 'skip',
          out: { en: 'Skipped by you · the receipt prints “Not rolled”', zh: '你选择了跳过 · 小票上印“未掷”' },
        };
      }
      const track = d20.querySelector('.d20-track');
      const film = d20.classList.contains('film') && track;
      await c.glide(() => (film ? bottom(track) - H() : top(d20) - 16));
      e.arg = seedOf();
      c.update();
      await c.wait(2400);
      return { out: text(d20.querySelector('.d20-verdict')) || null };
    },
  },
  {
    fn: 'read',
    arg: () => SEC.evidence,
    async run(c) {
      const el = $('#evidence');
      if (!el) return MISSING;
      await c.glide(() => evidenceAt(el, true));
      // the pause on Evidence: the chart, at rest, for a moment longer than any other stop
      await c.wait(4200);
      const n = el.querySelectorAll('.sr-only tbody tr').length;
      const axes = $$('#evidence .ev-chart .ev-plot > .ev-atitle').map(text).filter(Boolean);
      return { out: { en: [`${n} figures`, ...axes].join(' · '), zh: [`${n} 个数字`, ...axes].join(' · ') } };
    },
  },
  {
    fn: 'scroll_to',
    arg: () => SEC.path,
    async run(c) {
      const el = $('#path');
      if (!el) return MISSING;
      await c.glide(() => top(el) - 16);
      await c.wait(2200);
      const n = el.querySelectorAll('.h-row:not(.h-row-head)').length;
      return { out: { en: `${n} rows, newest first`, zh: `${n} 行，由近及远` } };
    },
  },
  {
    fn: 'open_note',
    arg: () => latestNote()?.dataset.note || '',
    async run(c, e) {
      const list = $('#notes');
      if (!list) return MISSING;
      if (!getNote()) {
        await c.glide(() => top(list) - 16);
        const row = latestNote();
        if (!row) return MISSING;
        e.arg = row.dataset.note;
        c.update();
        await c.wait(500);
        await c.press(row);
        await c.until(() => window.__notes?.state?.() === 'open', 6000);
        c.refocus();
      }
      c.unpoint();
      await c.wait(3600);
      return { out: text($('#nt-title')) || null };
    },
  },
  {
    fn: 'close_note',
    arg: () => '',
    async run(c) {
      if (getNote()) {
        const back = $('.nt-layer .nt-bar a[href="/#notes"]');
        if (back) await c.press(back);
        else closeNote();
      }
      await c.until(() => !$('.nt-layer'), 6000);
      c.refocus();
      c.unpoint();
      await c.wait(700);
      return { out: { en: 'Crumpled back into its row', zh: '揉回列表里的那一行' } };
    },
  },
  {
    fn: 'print_receipt',
    arg: () => '',
    async run(c) {
      const roll = $('#contact .cl-roll');
      if (!roll) return MISSING;
      // the trace goes on the record before the paper comes out, so it prints with the rest
      c.record('done');
      // the whole roll out of the printer, clear of this panel on a phone
      await c.glide(() => bottom(roll) - H() + 24 + c.inset(), PER_PRINT);
      await c.wait(1200);
      return { out: text($('#contact .cl-totals .is-strong dd')) || null };
    },
  },
];

class Stop extends Error {}

// The controller: phases ready → running ⇄ asking, paused (by any visitor input), done or ended.
export function createAgent({ emit, cursor, panel }) {
  let phase = 'ready';
  let at = 0;
  let entries = [];
  let why = null;
  let end = null; // how the run ended: done | taken | ended
  let job = null; // the step in flight: { cancels: [] }
  let askFor = null;

  const snap = () => emit({ phase, at, entries: entries.map((e) => ({ ...e })), why, end, total: STEPS.length });
  const since = () => Date.now() - (getVisit().arrived || Date.now());
  const steps = () => entries.filter((e) => e.kind === 'step' && (e.status === 'done' || e.status === 'skip'));

  // the record the receipt prints (src/chapters/guided/ReceiptTrace.jsx reads it from the store)
  function record(how = end) {
    const list = steps().map(({ fn, arg, status, t }) => ({ fn, arg, status, t }));
    if (how === 'done' && phase !== 'done') {
      // print_receipt writes itself as done before it runs, so the paper carries the whole run
      const cur = entries.find((e) => e.kind === 'step' && e.i === at);
      if (cur && !list.some((s) => s.t === cur.t)) list.push({ fn: cur.fn, arg: cur.arg, status: 'done', t: cur.t });
    }
    if (!list.length) return;
    setVisit({ guided: { steps: list, total: STEPS.length, end: how || 'running' } });
  }

  function you(text) {
    entries.push({ kind: 'you', text, t: since() });
  }

  function cancel() {
    const j = job;
    job = null;
    j?.cancels.splice(0).forEach((fn) => fn());
    cursor.hide();
  }

  // ---- what a step can do ----
  function ctx(j) {
    const alive = () => job === j;
    const guard = () => {
      if (!alive()) throw new Stop();
    };
    const hold = (fn) => j.cancels.push(fn);
    const c = {
      // `fixed`: not scaled by speed (a settling time, not a dwell)
      wait: (ms, fixed = false) =>
        new Promise((res, rej) => {
          guard();
          const id = window.setTimeout(res, fixed ? ms : ms / SPEED);
          hold(() => {
            window.clearTimeout(id);
            rej(new Stop());
          });
        }),
      until: (test, ms) =>
        new Promise((res, rej) => {
          guard();
          const t0 = performance.now();
          let raf = 0;
          const tick = () => {
            if (test()) res(true);
            else if (performance.now() - t0 > ms) res(false);
            else raf = requestAnimationFrame(tick);
          };
          tick();
          hold(() => {
            cancelAnimationFrame(raf);
            rej(new Stop());
          });
        }),
      jump(y) {
        guard();
        cursor.hide();
        window.scrollTo({ top: clampY(y), behavior: 'instant' });
      },
      // glide to a target that is read again every frame (films mount, pins change length)
      glide: (target, per = PER_SCREEN) =>
        new Promise((res, rej) => {
          guard();
          cursor.hide();
          if (RM) {
            window.scrollTo({ top: clampY(target()), behavior: 'instant' });
            res();
            return;
          }
          const y0 = window.scrollY;
          const dist = Math.abs(clampY(target()) - y0);
          if (dist < 2) {
            res();
            return;
          }
          const T = Math.max(450, (dist / H()) * per) / SPEED;
          const t0 = performance.now();
          let raf = 0;
          const tick = (now) => {
            const t = Math.min(1, (now - t0) / T);
            window.scrollTo({ top: Math.round(y0 + (clampY(target()) - y0) * ease(t)), behavior: 'instant' });
            if (t < 1) raf = requestAnimationFrame(tick);
            else res();
          };
          raf = requestAnimationFrame(tick);
          hold(() => {
            cancelAnimationFrame(raf);
            rej(new Stop());
          });
        }),
      // move the agent's cursor onto an element, press, and click it (a real click on a real control)
      async press(el) {
        guard();
        el.scrollIntoView?.({ block: 'nearest', behavior: 'instant' });
        cursor.point(el);
        await c.wait(650);
        cursor.press();
        await c.wait(220);
        guard();
        el.click();
      },
      unpoint: () => cursor.hide(),
      // controls that open over the page take focus to their title; while the visitor is working the
      // panel, give it back to the panel
      refocus: () => panel.refocus(),
      inset: () => panel.inset(),
      ask: (e) =>
        new Promise((res, rej) => {
          guard();
          phase = 'asking';
          e.status = 'wait';
          askFor = (answer) => {
            askFor = null;
            phase = 'running';
            e.status = 'run';
            you(answer === 'yes' ? { en: 'Yes, roll', zh: '掷' } : { en: 'Skip', zh: '跳过' });
            res(answer);
          };
          snap();
          hold(() => {
            askFor = null;
            rej(new Stop());
          });
        }),
      update: snap,
      record: (how) => record(how),
    };
    return c;
  }

  async function loop() {
    const j = { cancels: [] };
    job = j;
    while (at < STEPS.length && job === j) {
      const s = STEPS[at];
      let e = entries.find((x) => x.kind === 'step' && x.i === at);
      if (!e) {
        e = { kind: 'step', i: at, n: at + 1, fn: s.fn, arg: s.arg(), status: 'run', out: null, t: since() };
        entries.push(e);
      }
      e.status = 'run';
      snap();
      let res;
      try {
        res = await s.run(ctx(j), e);
      } catch (err) {
        if (err instanceof Stop || job !== j) return;
        res = { status: 'skip', out: { en: 'Could not run here', zh: '这里无法执行' } };
      }
      if (job !== j) return;
      e.status = res?.status || 'done';
      e.out = res?.out ?? null;
      at += 1;
      record(at >= STEPS.length ? 'done' : null);
      snap();
    }
    if (job !== j) return;
    job = null;
    phase = 'done';
    end = 'done';
    cursor.hide();
    record('done');
    snap();
  }

  return {
    start() {
      if (phase !== 'ready') return;
      phase = 'running';
      you({ en: 'Start', zh: '开始' });
      loop();
    },
    // any visitor input while the agent drives: stop at once, keep the step to run again on Resume
    pause(reason) {
      if (phase !== 'running' && phase !== 'asking') return;
      cancel();
      phase = 'paused';
      why = reason;
      you({ en: `Paused · ${reason.en}`, zh: `暂停 · ${reason.zh}` });
      snap();
    },
    resume() {
      if (phase !== 'paused') return;
      phase = 'running';
      why = null;
      you({ en: 'Resume', zh: '继续' });
      loop();
    },
    answer(a) {
      askFor?.(a);
    },
    takeOver(how = 'taken') {
      if (phase === 'done' || phase === 'ended' || phase === 'ready') return;
      cancel();
      phase = 'ended';
      end = how;
      const cur = entries.find((e) => e.kind === 'step' && e.i === at);
      if (cur && cur.status === 'run') cur.status = 'stop';
      you(how === 'ended' ? { en: 'Esc · ended', zh: 'Esc · 结束' } : { en: 'Take over', zh: '接管' });
      record(how);
      snap();
    },
    get phase() {
      return phase;
    },
    dispose() {
      if (phase === 'running' || phase === 'asking' || phase === 'paused') {
        cancel();
        phase = 'ended';
        end = 'ended';
        record('ended');
      }
      cancel();
    },
  };
}
