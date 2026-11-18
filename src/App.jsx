import { lazy, Suspense, useEffect } from 'react';
import { LangProvider } from './i18n.jsx';
import { work } from './content.js';

const Home = lazy(() => import('./pages/Home.jsx'));
// /lab is its own chunk: the home page's first paint does not carry the studies' index
const Chooser = lazy(() => import('./pages/Chooser.jsx'));
const Note = lazy(() => import('./pages/Note.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

// path → [component, document title]. A null title keeps the one from index.html.
const routes = {
  '/': [Home, null],
  '/lab': [Chooser, 'Design studies'],
  '/short': [lazy(() => import('./pages/Short.jsx')), 'The short version'],
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

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const isNote = path.startsWith('/notes/');
  // /work/<slug>: the home page with that parcel's case study open over the Work chapter
  const parcel = path.startsWith('/work/') && work.find((item) => path === `/work/${item.id}`);
  // notes set their own title (note title, or their own not-found state)
  const [Page, title] =
    routes[path] || (parcel ? [Home, parcel.title] : isNote ? [Note, undefined] : [NotFound, 'Not found']);
  useEffect(() => {
    if (title) document.title = `${title} — Damon Guan`;
  }, [title]);
  return (
    <LangProvider>
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    </LangProvider>
  );
}
