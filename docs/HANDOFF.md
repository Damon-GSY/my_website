# Handoff — dimensional site

## Polish pass (2026-11-14, latest)

- **Evaluate** now opens with the shared ruled head `(03) EVALUATE ... ONE DIE, TWENTY ROLLS` (Home passes it to `D20Chapter` as `head`; `/d20` alone keeps its own small label). Sections run 01-06 without gaps. The heading is larger (5.6vw, 10.4vw on phones), and the closing line "That gap is my job." is set like the other display type (11vw, weight 900, balanced onto two lines). The duplicate `id="evaluate"` (wrapper and chapter) is gone.
- **Work box** (white `PAPER` printing only): the name face now reads `SIX PROJECTS.`, so the flat net reads "SIX PROJECTS. / I BUILD AGENTS / THAT SHIP." and no longer repeats the hero. The kraft `/parcel` study keeps the name.
- **Phones:** "Selected work · 06" no longer wraps and "UNPACKED." no longer runs past the card grid.
- **Fixed bar:** now a solid `--bg` bar with a hairline instead of `mix-blend-mode: difference`, so text scrolling under it no longer runs through the links. It clears the pinned section heads (bar 53 px / 42 px tall, heads at 76 px).
- **Timeline** (`src/engine/timeline.js`): a jump of more than 0.3 of a film's progress in one frame (anchor link, End key) lands on the target frame at once; ordinary scrolling is still damped.

Verified by looking at screenshots (SwiftShader, `vite preview`): home at 12 positions at 1440x900 and 8 at 390x844; the bar after scrolling down then up at Work, Evaluate (start, middle), Path and Notes, and after tabbing into it, at both sizes; an anchor jump Path -> Evaluate shows the right frame after 400 ms; `/d20` (start, middle, end), `/parcel` (start, end), `/lab` at both sizes; reduced-motion Evaluate with the head; Chinese Evaluate (rolling, end) at desktop. No console errors, no horizontal scroll. `npx eslint .` and `npm run build` pass.

Left alone: during a roll the die's hop can briefly reach the head's rule at the top (die mechanics unchanged); unlanded Parcel cards still show their text only after landing.

## Update: the real home page (2026-11-14, later)

`/` is now one continuous page; the old chooser moved to `/lab` (it also lists `/d20`). Not committed yet.

**System** (`src/pages/home.css`): background #f4f4f2, ink #0d0d0d, muted #8a8a88, hairlines #d9d9d5; one accent per section (cobalt full stop in the statement, magenta sticker and route highlight in Work, tangerine `@` in Contact). Archivo Variable 750–900 for display and body, Cartograph CF for the small uppercase labels. Every section opens with the same ruled mono head: `(nn) label ... aside`.

| Section | Built from | Notes |
| --- | --- | --- |
| `#top` | `src/directions/ink/InkHero.jsx` (shared with `/ink`, same `ink.js` shader) | `flow` mode: in normal flow, 100svh, `touch-action: pan-y`; corner nav is the section anchors plus the language switch; bottom-left "Scroll". The render loop and video pause when the hero is off screen. |
| `#statement` | `Home.jsx` | One sentence in display type; words go from grey to ink as they cross 60% of the viewport (scroll listener plus rAF, no library). Chinese is split with `Intl.Segmenter`. |
| `#work` | `src/directions/parcel/ParcelFilm.jsx` with `paper` | White carton (`PAPER` theme in `prints.js`): #fbfbf9 faces, black print, black dashed dieline, magenta sticker, #e9e9e5 inside faces. Same fold, turn, unfold and landing. |
| `#evaluate` | `src/directions/d20/D20Chapter.jsx` (other agent), lazy inside Suspense | Wired. |
| `#path` | `path` in `src/content.js` | Typographic table, newest first. The "Now" row renders the blank employer and city as fill-in rules. |
| `#notes` | `src/notes.js` (moved from `main:src/data/posts.js`) | Seven notes; `/notes/<slug>` is the reading page (`src/pages/Note.jsx`), with a 404 state. |
| `#contact` | `profile` | Big email link, four links, a footer linking to `/lab`. |

A slim fixed bar (mix-blend difference) appears after the hero, marks the section in view, hides while scrolling down and returns on scroll up or keyboard focus.

**Engine change:** the film canvas (`.film .stage`) now sits inside its `.sticky` viewport (`position: absolute`, `z-index: -1` inside the sticky stacking context) instead of `position: fixed`, and `createStage` sizes itself to that box. That lets several films share one page. `/parcel`, `/descent` and `/rollout` were re-checked after the change.

**Content:** `profile.org` and the new `profile.city` are blank strings (comment in `content.js`); everything that prints role/org/city uses `joinParts()`, so there are no stray separators. The Parcel label's destination and last route stop are blank rules, and "ALIBABA" under the name is gone. Past work keeps its Alibaba and MSRA attribution.

**Verified by looking at screenshots** (headless Chromium, SwiftShader, `vite preview`): home at 12 positions at 1440×900 and 8 at 390×844 (no horizontal scroll, no console errors); the d20 chapter in place on desktop and phone; `/parcel`, `/descent` and `/rollout` mid-film and at the end, desktop and phone; `/lab`; two note pages (desktop, phone); `/ink`; home with reduced motion (Parcel static fallback readable); home in Chinese (statement, path) at desktop and statement at phone width. `npx eslint .` and `npm run build` pass.

**Not verified:** real GPU, Safari or iOS (svh, `touch-action: pan-y` while painting), real touch scrolling over the ink hero, the no-WebGL path on the home page (only reduced motion was rendered), screen readers, Chinese at every scroll position.

**Rough edges (at the time; see the polish pass above for what was fixed):** the d20 chapter used its own label style; unlanded Parcel cards show their text only after landing; long jumps were slow to catch up; the box net repeated the hero name.

---

## Earlier state (openings only)

Written 2026-11-14 when the session approached the 5-hour usage limit. Branch: `claude/serene-cori-mookmf`, everything pushed.

## State

Phases 1 and 2 of `docs/plans/2026-11-14-dimensional-site-plan.md` are built: the foundation and all three openings. Phase 3 (the full site) is not started and needs a direction to be chosen first.

| Route | What happens | State |
| --- | --- | --- |
| `/` | Chooser with the three directions | Built, not screenshot-checked |
| `/parcel` | Flat box net reading "Damon Guan / I build agents / that ship." folds into a box, turns to show the shipping label, unfolds inside-out, and its six faces land on the six work cards | Works, desktop and phone |
| `/descent` | Flat page with contour lines tilts into a lit loss landscape; the headline's orange full stop rolls down it (SFT basin, then the surface changes for RL); terrain flattens, rings unroll into the work-list rules | Works, desktop and phone |
| `/rollout` | The big percentage falls from 100% to 35.8% and narrows as you scroll through a 3D decision tree; the tree collapses into one flat trace above the work list | Works, desktop and phone |

## Run

```bash
npm install
npm run dev        # or: npm run build && npm run preview
```

`npm run lint` and `npm run build` both pass.

## How it was checked

Headless Chromium with software WebGL (SwiftShader), production build via `vite preview`.

- First pass: 12 scroll positions per route at 1440×900 and 390×844, no console errors.
- Second pass (2026-11-14), screenshots looked at by eye:
  - Static fallback (`prefers-reduced-motion: reduce`) on `/parcel`, `/descent`, `/rollout` at 1440×900 and 390×844: the root gets class `static`, pages are 1050–1340 px tall (no pinned scroll), hero, six work items and footer are readable with no overlap. On phones some secondary text is hidden by design (Parcel card blurbs, Descent row numbers and places, Rollout metric labels).
  - Chinese mode (`localStorage.lang = 'zh'`) on `/`, `/ink`, and the first and last scroll positions of the three openings at 1440×900: no overflow or clipped text. Project titles, metrics, "step 20 / 20", the Rollout chapter labels (Train, Deploy, Evaluate) and the text painted on the Parcel box stay English.
  - `/ink` at 390×844 after a 40-step pointer sweep across the wordmark: the blob shows coloured ink (the video was playing), the corner UI does not touch the wordmark.
  - No console errors or page errors on any route, English or Chinese, film or static.
  - Fixed: Rollout's "THAT GAP IS MY JOB." rendered as "GAPIS" (tight letter-spacing ate the word space); added `word-spacing`.

Not checked:

- real GPU frame rate, Safari, or a physical phone
- the no-WebGL fallback path (only reduced motion was rendered; both set the same `static` class)
- Chinese mode at phone width, and Chinese at the in-between scroll positions
- the plan's acceptance checks in section 8 (pixel difference at the DOM handoff, same frame when arriving from above and below)

## Added after the first handoff

- `/ink`: full-screen hero, wordmark DAMON GUAN; the pointer paints a gooey trail that reveals moving ink. Built from Damon's pasted reference spec. The reference video is in `public/ink/` as `ink.webm` (VP9) and `ink.mp4` (H.264), converted from the HEVC original, which most browsers cannot play. It loops by cross-fading two video elements; if neither file plays, the ink is generated in the shader.
- Damon is no longer based in Hangzhou. The city line is removed from the chooser, the Descent hero and the Parcel label. Still unconfirmed: current city and employer. The Parcel route still ends at `HGH 2025–`.

## Known rough edges

**Parcel**
- The net is small on phones (about 86 px per face); the face text is not readable there.
- The shipping label is only visible while the box turns.
- Cards take their background from the same canvas image as the box faces, so the swap is seamless, but card text only appears after landing.

**Descent**
- The ring-to-rule morph looks loose in the middle: lines cross each other for a moment.
- The trail has a small loop where the ball overshoots; it is real momentum, but may read as a glitch.
- Not built from the plan: captions pinned to the surface, and the footer "your run" chart (only the small live loss curve exists).

**Rollout**
- The visitor does not choose branches; scrolling follows one fixed path.
- Chapter labels (Train, Deploy, Evaluate) are very small.
- On phones the tree runs behind the lower part of the hero text.
- At the very end of the scroll the flat trace slides under the fixed header (the work block scrolls up to reveal the footer).
- The WebGL trace and its SVG twin are drawn from the same numbers but were not compared pixel by pixel.

**All**
- Three.js is a 479 kB chunk (121 kB gzipped), loaded only on the opening routes.
- Fonts: Archivo and Newsreader are self-hosted; Chinese text uses system fonts.
- `profile.email` in `src/content.js` is still the unconfirmed `hello@damon.ai`.

## Where things are

- `src/content.js`: all copy and facts (English and Chinese).
- `src/engine/`: `timeline.js` (scroll to damped progress), `stage.js` (pixel-space camera, `setView({ flat, tilt, yaw })`), `dock.js` (DOM rect to stage coordinates), `useFilm.js` (wires a scene to a page, handles fallback).
- `src/directions/<name>/Scene.js`: one `frame(p)` function per opening; every timing is a `span(p, start, end)` in that function.

## Next

1. Damon picks a direction (or a mix).
2. Fix that direction's rough edges above and run the section 8 acceptance checks.
3. Phase 3: sections after the opening (Research, Path, Notes, Contact), case and note pages, Chinese typography, and a rendered check of the static fallback.

## Design plans on record (2026-11-14)

### Studies in progress from Damon's three reference prompts

Each is a standalone page under `public/lab/`, served as-is, built by a separate agent. They were started together; check `git log` and the folders to see which ones landed.

| Page | Reference it adapts | What it should be |
| --- | --- | --- |
| `/lab/pill/` | "Wild" pill hero | White page with the word GUAN split as GU · pill · AN. A hairline opens into a slit, a circle, then a wide pill showing the ink video, pushing the halves apart; paper background, nav and footer arrive as it opens. Stacks and opens vertically on phones. |
| `/lab/bento/` | "Maya Lind" bento profile | Calm editorial profile on one 1440×960 stage that scales to any window: intro, a 20-step "episode" player, and six live cards (Experience, Research, Field notes, Selected work, Numbers, How I work). No photos; a DG monogram stands in for the avatar. |
| `/lab/night/` | "Helion Dispatch" cinematic dark page | WebGL night scene made of particles, a rotating 3D ring of the word "Agents", a zoom-warp into an amber streak shader, then black sections whose window frames show the shader through them, holding white UI panels with his work and research. |

The reference prompts' own media (a third party's hosted videos and portrait photos) are not used: the pill uses the site's ink video, the others are drawn in code.

Once they land: add links to the three pages on `/lab` (`src/pages/Chooser.jsx`), look at their contact sheets, and ask Damon which direction the home page should take.

### Ideas proposed, not built

1. **Name as a mountain range**: the letters of DAMON GUAN are terrain wrapped in contour lines; a ball rolls through the valleys; it flattens back into ordinary type. An upgrade of `/descent`.
2. **Every link is a parcel**: each work card is a small box; opening a case study unfolds it into the page; tape is torn by dragging. An upgrade of `/parcel`.
3. **The site behaves like his agent**: the page operates itself with a visible cursor and tool-call log; low-risk actions run alone, high-risk ones stop and ask the visitor to confirm. An overlay for any direction.
4. **Crumpled paper**: the site is one printed sheet that crumples into a ball between sections and smooths flat again, creases still visible.
5. **A machine that types the site**: the page is generated word by word with the rejected alternatives floating in 3D behind each word; scrolling back un-writes it.
6. **Shadow theatre**: a tangle of 3D wire whose shadow, at one exact light angle, spells DAMON GUAN, and at the next a diagram of his work. Claude's pick for impact.
7. **One long receipt**: a 3D thermal printer feeds out the site as a paper roll; projects are line items, results are totals, contact is the tear-off stub.
8. **A city built from his numbers**: towers whose heights are the real figures (about 250 papers, 530 samples, 100+ tools, 12 scenarios); the camera rises and the skyline flattens into a bar chart.

Built from this list already: the d20 chapter (`/d20`, and `#evaluate` on the home page).

### Open items from Damon

- Current employer and city: blank on purpose; fill in `src/content.js` (`org`, `city`).
- Contact email: `hello@damon.ai` is a stand-in he will change, also in `src/content.js`.
- Usage: resuming a long idle session re-reads the whole conversation and costs about 20 points of the 5-hour limit in one request. Prefer a fresh session that starts from this file, and use subagents for build work.
