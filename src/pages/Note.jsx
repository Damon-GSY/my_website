import NoteView from '../chapters/notes/NoteView.jsx';
import './home.css';

// `/notes/<slug>` loaded on its own (typed, shared, opened in a new tab). From the home page a note
// opens over the Notes list instead (src/chapters/notes/, mode "layer"); this is the same sheet as a page.
export default function Note() {
  return <NoteView mode="page" />;
}
