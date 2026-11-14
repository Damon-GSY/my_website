import { lazy, Suspense } from 'react';
import { LangProvider } from './i18n.jsx';
import Chooser from './pages/Chooser.jsx';

const routes = {
  '/parcel': lazy(() => import('./directions/parcel/Opening.jsx')),
  '/descent': lazy(() => import('./directions/descent/Opening.jsx')),
  '/rollout': lazy(() => import('./directions/rollout/Opening.jsx')),
};

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const Page = routes[path] || Chooser;
  return (
    <LangProvider>
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    </LangProvider>
  );
}
