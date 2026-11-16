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

## Deploy

- Build: `npm run build`. Output directory: `dist/` (static files only, no server needed).
- Routes such as `/lab`, `/notes/<slug>` and `/parcel` are client-side, so the host must fall back to `index.html` for unknown paths. Real files (`/lab/*`, `/fonts/*`, `/og.png`, assets) must still be served directly.

Host notes (no host has been chosen):

- **Netlify**: `public/_redirects` (`/*  /index.html  200`) is copied into `dist/`. Netlify serves existing files first, so the single catch-all is enough.
- **Vercel**: `vercel.json` rewrites any path that is not under `lab/`, `fonts/`, `assets/`, `ink/` and has no file extension to `/index.html`.
- **GitHub Pages**: no rewrites are available. After building, copy the entry page to the 404 page so deep links load the app: `cp dist/index.html dist/404.html` (the app then routes by `location.pathname`; the response status is still 404, which is fine for users but not ideal for crawlers). If it is served from a project sub-path, set `base` in `vite.config.js`. No workflow is included.

`public/robots.txt` allows all crawlers. The document title is set in `index.html` only; per-route titles are not pre-rendered.

### Before going live

- [ ] Current employer and city in `src/content.js` (both are blank on purpose).
- [ ] Real email in `src/content.js` (`hello@damon.ai` is unconfirmed).
- [ ] Choose the domain, then add `<link rel="canonical">` and make `og:image` / `twitter:image` in `index.html` absolute (`https://<domain>/og.png`); some scrapers ignore relative image URLs. Optionally add `og:url` and a sitemap.
- [ ] Re-check the link preview with the final URL; `public/og.png` is 1200x630.
