import { lazy, Suspense } from 'react';
import { LangProvider } from './i18n.jsx';
import Chooser from './pages/Chooser.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Note = lazy(() => import('./pages/Note.jsx'));

const routes = {
  '/': Home,
  '/lab': Chooser,
  '/parcel': lazy(() => import('./directions/parcel/Opening.jsx')),
  '/descent': lazy(() => import('./directions/descent/Opening.jsx')),
  '/ink': lazy(() => import('./directions/ink/Opening.jsx')),
  '/rollout': lazy(() => import('./directions/rollout/Opening.jsx')),
  '/d20': lazy(() => import('./directions/d20/Standalone.jsx')),
  '/bento': lazy(() => import('./directions/bento/Opening.jsx')),
  '/typist': lazy(() => import('./directions/typist/Opening.jsx')),
  '/shadow': lazy(() => import('./directions/shadow/Opening.jsx')),
  '/receipt': lazy(() => import('./directions/receipt/Opening.jsx')),
  '/city': lazy(() => import('./directions/city/Opening.jsx')),
  '/arena': lazy(() => import('./directions/arena/Opening.jsx')),
};

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const Page = routes[path] || (path.startsWith('/notes/') ? Note : Home);
  return (
    <LangProvider>
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    </LangProvider>
  );
}
