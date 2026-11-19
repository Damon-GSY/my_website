import { lazy, Suspense, useEffect, useMemo } from 'react';
import { LangProvider } from './i18n.jsx';
import { work } from './content.js';
import { startNav, useRoute } from './engine/nav.js';

// A page whose chunk can be fetched ahead (src/engine/nav.js loads it before the page changes, so the
// new page renders in one go, without a blank Suspense frame in the middle of the transition).
function page(load) {
  let mod = null;
  const get = () => load().then((m) => (mod = m));
  const Lazy = lazy(get);
  return { load: get, get: () => (mod ? mod.default : Lazy) };
}

// The site's own pages: links between them change the page in place (src/engine/nav.js), with the mark
// as the thread. /lab is its own chunk: the home page's first paint does not carry the studies' index.
const SITE = {
  home: page(() => import('./pages/Home.jsx')),
  lab: page(() => import('./pages/Chooser.jsx')),
  short: page(() => import('./pages/Short.jsx')),
  note: page(() => import('./pages/Note.jsx')),
  404: page(() => import('./pages/NotFound.jsx')),
};

// The studies: path → [component, document title]. Each is a page of its own (full loads both ways).
const studies = {
  '/parcel': [lazy(() => import('./directions/parcel/Opening.jsx')), 'Parcel Box'],
  '/descent': [lazy(() => import('./directions/descent/Opening.jsx')), 'Descent'],
  '/ink': [lazy(() => import('./directions/ink/Opening.jsx')), 'Wet Ink'],
  '/rollout': [lazy(() => import('./directions/rollout/Opening.jsx')), 'Rollout'],
  '/d20': [lazy(() => import('./directions/d20/Standalone.jsx')), 'D20 Die'],
  '/bento': [lazy(() => import('./directions/bento/Opening.jsx')), 'Bento Cards'],
  '/typist': [lazy(() => import('./directions/typist/Opening.jsx')), 'Token Typist'],
  '/shadow': [lazy(() => import('./directions/shadow/Opening.jsx')), '318° Shadow'],
  '/receipt': [lazy(() => import('./directions/receipt/Opening.jsx')), 'Thermal Receipt'],
  '/city': [lazy(() => import('./directions/city/Opening.jsx')), 'Metric City'],
  '/arena': [lazy(() => import('./directions/arena/Opening.jsx')), 'Agent Arena'],
};

const isCase = (path) => work.some((item) => path === `/work/${item.id}`);

// path → page key, or null for the browser to load it (a study, /lab/<study>/, a file). `from` is the
// page shown now; `pop`: Back / Forward. /work/<slug> and /notes/<slug> over the home page are the home
// page (the case and note dialogs own those entries); a note opened on its own is the note page.
function resolve(path, state, from, pop) {
  if (path === '/') return 'home';
  if (path === '/lab' || path === '/short') return path.slice(1);
  if (studies[path] || path.startsWith('/lab/') || /\.[a-z0-9]+$/i.test(path)) return null;
  if (path.startsWith('/work/')) return !isCase(path) ? '404' : pop || from === 'home' ? 'home' : null;
  if (path.startsWith('/notes/')) {
    if (state?.note) return from === 'note' ? 'note' : 'home';
    return from === 'home' && !pop ? null : 'note';
  }
  return '404';
}

const first = window.location.pathname.replace(/\/+$/, '') || '/';
startNav({
  initial: studies[first] ? first : first.startsWith('/notes/') ? 'note' : resolve(first, null, null, true),
  site: new Set(Object.keys(SITE)),
  resolve,
  load: (key) => SITE[key].load(),
});

// the home page's own title (index.html), restored when the visitor comes back to it
const HOME_TITLE = document.querySelector('meta[property="og:title"]')?.content || document.title;

// one page, by its route; `shown: false` keeps a page that is leaving mounted (and hidden) until the
// page change has finished, so the old page's GPU canvas is only released once its last frame is gone
function Route({ route, shown }) {
  const { key } = route;
  const Page = useMemo(() => (SITE[key] ? SITE[key].get() : studies[key][0]), [key]);
  return (
    <div className="route" style={{ display: shown ? 'contents' : 'none' }}>
      <Page />
    </div>
  );
}
const instance = ({ key, path }) => (key === '404' || key === 'note' ? path : key);

export default function App() {
  const route = useRoute();
  const { key, path, keep } = route;
  // pages around the run set their own titles (in the visitor's language); /work/<slug> opens on its case
  const parcel = key === 'home' && work.find((item) => path === `/work/${item.id}`);
  const study = studies[key]?.[1];
  const title = key === 'home' ? (parcel ? `${parcel.title} — Damon Guan` : HOME_TITLE) : study && `${study} — Damon Guan`;
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
  return (
    <LangProvider>
      <Suspense fallback={null}>
        {key && <Route key={instance(route)} route={route} shown />}
        {keep && <Route key={instance(keep)} route={keep} shown={false} />}
      </Suspense>
    </LangProvider>
  );
}
