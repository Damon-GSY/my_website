import { lazy } from 'react';
import NoteView from '../chapters/notes/NoteView.jsx';
import { notes } from '../notes.js';
import './home.css';

const NotFound = lazy(() => import('./NotFound.jsx'));

// `/notes/<slug>` loaded on its own (typed, shared, opened in a new tab). From the home page a note
// opens over the Notes list instead (src/chapters/notes/, mode "layer"); this is the same sheet as a page.
// A slug that is not a note gets the site's one 404 (the shadow play), like an unknown `/work/<slug>`.
export default function Note() {
  const slug = window.location.pathname.replace(/\/+$/, '').slice('/notes/'.length);
  if (!notes.some((n) => n.slug === slug)) return <NotFound />;
  return <NoteView mode="page" />;
}
