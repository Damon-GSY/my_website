import { lazy, Suspense, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LabIndex from './LabIndex';
import './lab-index.css';

const Observatory = lazy(() => import('./observatory/ObservatoryPage'));
const Tactile = lazy(() => import('./tactile/TactilePage'));
const Gallery = lazy(() => import('./gallery/GalleryPage'));
const Signal = lazy(() => import('./signal/SignalPage'));
const pages = { observatory: Observatory, tactile: Tactile, gallery: Gallery, signal: Signal };

export default function LabRouter() {
  const { pathname } = useLocation();
  const slug = pathname.split('/').filter(Boolean)[1];
  const Page = pages[slug];

  useEffect(() => {
    const original = document.title;
    document.title = slug ? `${slug[0].toUpperCase()}${slug.slice(1)} — Damon’s Playground` : 'Playground — Damon Guo-Siyi';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => { document.title = original; };
  }, [slug]);

  if (!slug) return <LabIndex />;
  if (!Page) return <main className="lab-loading"><h1>Study not found.</h1><Link to="/lab">Back to the playground ↗</Link></main>;
  return <Suspense fallback={<main className="lab-loading"><span className="lab-loading-dot" /><p>Opening the study…</p><Link to="/lab">All experiments ↗</Link></main>}><Page /></Suspense>;
}
