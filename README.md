# Damon Guan — personal site

One continuous home page, plus the design studies it was built from.

| Route | What it is |
| --- | --- |
| `/` | Home: ink hero (`#top`), statement (`#statement`), Parcel film as the Work chapter (`#work`), d20 chapter (`#evaluate`), career path (`#path`), field notes (`#notes`), contact (`#contact`) |
| `/notes/<slug>` | Reading page for one field note (data in `src/notes.js`) |
| `/lab` | Design studies: links to every standalone study |
| `/ink` | Full-screen ink hero; the pointer reveals moving ink |
| `/parcel` | The page is a box net: it folds, ships, and unpacks into the work cards (kraft printing) |
| `/descent` | The flat page was lying on a loss landscape |
| `/rollout` | The visitor is the agent; the decision tree collapses into one trace |
| `/d20` | Evaluation as a twenty-sided die |

## Run

```bash
npm install
npm run dev
```

## Map

- `src/content.js`: all copy and facts, English and Chinese.
- `src/engine/`: scroll timeline, pixel-space stage with the perspective-to-flat camera, DOM docking.
- `src/directions/<name>/`: one scene, one page and one stylesheet per direction.
- `src/pages/Home.jsx`, `src/pages/home.css`: the home page and its visual system; `src/pages/Note.jsx`: note pages.

With reduced motion or without WebGL each route shows a static page with the same content.
