import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../../i18n.jsx';
import { getVisit, subscribeVisit } from '../../engine/store.js';
import './print.css';

// Phase H: the guided run becomes part of the record. Once the visit store holds a `guided` trace,
// its steps print on the receipt (src/chapters/close/) as one more block above the totals, set in the
// receipt's own line styles: each tool call with the time it ran, then "Guided: yes · N steps".
// The block is added beside the receipt's own markup (not by editing the chapter): one node inserted
// before `.cl-totals`, filled through a portal; it goes away with this component.

const pad = (n) => String(n).padStart(2, '0');
const clock = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};

function summary(g, t) {
  const n = g.steps.length;
  const N = g.total;
  if (g.end === 'done') return t({ en: `yes · ${n} steps`, zh: `是 · ${n} 步` });
  if (g.end === 'taken') return t({ en: `yes · ${n} of ${N} steps · taken over`, zh: `是 · ${n} / ${N} 步 · 已接管` });
  if (g.end === 'ended') return t({ en: `yes · ${n} of ${N} steps · ended`, zh: `是 · ${n} / ${N} 步 · 已结束` });
  return t({ en: `yes · ${n} of ${N} steps so far`, zh: `是 · 已走 ${n} / ${N} 步` });
}

export default function ReceiptTrace() {
  const { t } = useLang();
  const [visit, setVisit] = useState(getVisit);
  const [host, setHost] = useState(null);
  useEffect(() => {
    const off = subscribeVisit(setVisit);
    return () => void off();
  }, []);
  useEffect(() => {
    let el = null;
    let raf = 0;
    let tries = 0;
    const place = () => {
      const totals = document.querySelector('#contact .cl-body > .cl-totals');
      if (!totals) {
        if ((tries += 1) < 240) raf = requestAnimationFrame(place);
        return;
      }
      el = document.createElement('div');
      el.className = 'cl-block mono gd-print';
      totals.before(el);
      setHost(el);
    };
    place();
    return () => {
      cancelAnimationFrame(raf);
      el?.remove();
    };
  }, []);

  const g = visit.guided;
  if (!host || !g?.steps?.length) return null;
  return createPortal(
    <>
      <p className="cl-cols">
        <span>{t({ en: 'Guided · agent trace', zh: '导览 · 智能体轨迹' })}</span>
        <span>{t({ en: 'at', zh: '时刻' })}</span>
      </p>
      <ol className="cl-items">
        {g.steps.map((s, i) => {
          const arg = s.arg && typeof s.arg === 'object' ? t(s.arg) : s.arg;
          return (
            <li key={`${s.t}-${i}`}>
              <span className="cl-n">{pad(i + 1)}</span>
              <span className="cl-item">
                <span>
                  {s.fn}
                  {arg ? ` ${arg}` : ''}
                  {s.status === 'skip' ? ` · ${t({ en: 'skipped', zh: '跳过' })}` : ''}
                </span>
              </span>
              <span className="cl-time">{clock(s.t)}</span>
            </li>
          );
        })}
      </ol>
      <dl>
        <div className="cl-row">
          <dt>{t({ en: 'Guided', zh: '导览' })}</dt>
          <dd>{summary(g, t)}</dd>
        </div>
      </dl>
    </>,
    host,
  );
}
