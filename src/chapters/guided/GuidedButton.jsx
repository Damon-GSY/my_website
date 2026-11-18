import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLang } from '../../i18n.jsx';
import { getVisit, subscribeVisit } from '../../engine/store.js';
import './button.css';

// Phase H: the quiet "Guided" switch in the top bar. Only this button is on the page at first paint;
// the mode (Guided.jsx + agent.js) is a lazy chunk fetched on hover, focus or press, and the trace's
// lines on the receipt (ReceiptTrace.jsx) load only once a guided run has been recorded in this tab.
const load = () => import('./Guided.jsx');
const Guided = lazy(load);
const Printed = lazy(() => import('./ReceiptTrace.jsx'));

export default function GuidedButton() {
  const { t } = useLang();
  const [on, setOn] = useState(false);
  const [printed, setPrinted] = useState(() => Boolean(getVisit().guided));
  const ref = useRef(null);
  useEffect(() => {
    const off = subscribeVisit((v) => v.guided && setPrinted(true));
    return () => void off();
  }, []);
  return (
    <>
      <button
        ref={ref}
        type="button"
        className="h-bar-guided"
        aria-pressed={on}
        onClick={() => setOn((v) => !v)}
        onPointerEnter={load}
        onFocus={load}
      >
        {t({ en: 'Guided', zh: '导览' })}
      </button>
      {on && (
        <Suspense fallback={null}>
          <Guided opener={ref} onClose={() => setOn(false)} />
        </Suspense>
      )}
      {printed && (
        <Suspense fallback={null}>
          <Printed />
        </Suspense>
      )}
    </>
  );
}
