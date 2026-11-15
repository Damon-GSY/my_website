# Handoff — dimensional site

## Start here (2026-11-15, latest)

All six planned studies now exist. Work stopped because every remaining step needs a decision from Damon (below), not because of the usage limit. Everything below is on `claude/serene-cori-mookmf`. Sections further down are older and partly superseded; this one is current.

### The home page (`/`), composed from the strongest pieces

With no lens chosen, `/` now runs: ink hero, (01) Statement, (02) Work, (03) Evaluate (d20), **(04) Evidence**, (05) Path, (06) Notes, **(07) More ways in**, (08) Contact. Work is the white-carton Parcel film as before, but the six landed cards are now links to `/lab/parcels/#<slug>`, so a click unfolds that project's parcel ("Open the parcel ↗" on each card; arrow only on phones; the long line moved to the case study so cards stay legible). That lives in a fork, `src/pages/WorkFilm.jsx`, so `/parcel` is untouched. Evidence (`src/directions/home-evidence/`) is a departure board of the eight honest figures (≈90%, 100+, SOTA, GRPO, 3, 530, ~250, +8.2%), each with what it measures and where it comes from; production figures carry a cobalt dagger pointing at the footnote. Tiles flip down and digits settle once on entry; reduced motion shows the finished board. City is not embedded (its numbers were being relabelled). More ways in (`src/pages/MoreWays.jsx`) links Parcels, Agent, Paper, Night, Pill and `/lab` with static previews (`src/pages/more/*.jpg`, captured 2026-11-15; grey until hover). Damon's lens mechanism is kept whole: the dock is folded into a small "Studio Lens +" button (bottom right), and the per-chapter lens bars appear only once a non-default lens is chosen, so the default page reads as one site. The Path "Now" row still shows blank rules for employer and city. Checked by screenshots at 1440x900 and 390x844 (SwiftShader), Chinese, reduced motion and a card click; no console errors, no horizontal scroll. Rough edges: the More ways in previews go stale if the studies change; on phones the dock button can sit over the last line of a section.

### What exists now

**The site (`/`, React + Vite in `src/`).** One continuous home page: ink hero, statement, Work (the box film as a white carton), Evaluate (the d20 die), Path, Notes, Contact. Damon's commit `0e712cf` (pushed from another session) then changed `Home.jsx`, `home.css`, `base.css`, `App.jsx` and `Chooser.jsx` and added React studies. The home page has since been recomposed (above).

**React studies (routes in `src/App.jsx`):** `/ink`, `/parcel`, `/descent`, `/rollout`, `/d20`, and from Damon's commit `/bento`, `/typist`, `/shadow`, `/receipt`, `/city`, `/arena`. `/lab` is the chooser.

**Standalone studies (`public/lab/<name>/index.html`, served as-is):**

| Page | Built from | State |
| --- | --- | --- |
| `/lab/pill/` | Damon's "Wild" pill prompt | Done, checked desktop + phone |
| `/lab/bento/` | Damon's "Maya Lind" bento prompt | Done; Damon's commit edited it slightly |
| `/lab/night/` | Damon's "Helion Dispatch" prompt | Done, checked desktop + phone |
| `/lab/agent/` | Plan 03 | **Done this session.** All "Done when" items met by script at `?speed=3`; contact sheet looked at |
| `/lab/parcels/` | Plan 02 | **Done this session.** All four "Done when" items met by script; contact sheet looked at by the build agent. One last fix (a tape stub over the "Next parcel" card) was not re-screenshotted. The "What it is" / "How it is held" panel copy was written as principles, not new claims; Damon should review it |
| `/lab/paper/` | Plan 04 | **Done.** Plain WebGL2, no three.js. All three "Done when" items met: reversibility checked by pixel diff (second transition only), mesh-to-DOM handoff pixel-close, crease shading ≤2.5% and masked under small text. Contact sheet looked at by Claude |
| `/lab/concepts/*.html` | — | Eight static concept boards (mountain, parcels, agent, paper, typist, shadow, receipt, city) |

All standalone studies (pill, bento, night, parcels, agent, paper) and the eight concept boards are linked from the chooser at `/lab`.

### The plan and how far it got

Plan: `docs/plans/2026-11-15-six-studies-plan.md` (shared rules, then one section per study with storyboard, technique, risks and a "Done when" list).

| Study | Status |
| --- | --- |
| 02 Every link is a parcel | Done |
| 03 The site behaves like his agent | Done |
| 04 Crumpled paper | Done (`/lab/paper/`) |
| 05 Typing machine | Exists in Damon's commit as `/typist`. Reviewed: see `docs/reviews/2026-11-15-typist-receipt-city.md` |
| 07 Receipt | Exists in Damon's commit as `/receipt`. Reviewed (same file) |
| 08 City | Exists in Damon's commit as `/city`. Reviewed (same file) |

### Agent study: details worth knowing

- Script runs `open → scroll → read → summarize → email (Tier 3) → end`; first step after 2 s, then every 2.5 s. `?speed=N` speeds it up for testing.
- Any wheel, touch, scroll key, pointerdown or nav click pauses it ("You took over"). Only wheel and the button were tested by script.
- Tier 3 is a native modal dialog: focus starts on Deny, Escape = Deny, focus returns afterwards. Approve opens a `mailto:` draft.
- Rough edges: the desktop tilt is gentle (5°/−9°) and reads less 3D than the board; the page scrolls inside its own sheet, so keyboard scrolling needs the page focused; the phone cursor-label fix was measured, not re-screenshotted.

### Next steps, in order

All need Damon first.

1. **Invented numbers in typist, receipt and city.** The review found figures shown as measurements that are not résumé facts: typist's `R = +2.65 · VERIFIED`, `KL = 0.84` and token logits; receipt's "20-step reliability" box and "VERIFIED PRODUCTION METRIC"; city's ≈90% plotted as a count of 90, two ≈90% figures merged, and percentages on an invented 0–600 scale. Typist and receipt also print "2025– · Alibaba" as the current stop. Line references are in the review (some approximate). Options: remove them, label them illustrative, or keep. Claude did not touch Damon's code.
2. **Which studies go into the home page**, and as what (whole-site direction vs. a chapter). Likely candidates: parcels as the Work section's case-study navigation, city as a short chapter, agent or receipt as an alternative whole-site direction.
3. **Copy to review:** the parcels "What it is" / "How it is held" panels (written as principles, not his words); the paper study's Contact page shows GitHub and LinkedIn from `src/content.js`.
4. **Known rough edges, if worth fixing:** parcels shelf labels tiny on phones; agent tilt gentler than the board; paper's half-opened sheet is a lumpy blob rather than the board's tidy half-open sheet, a large empty band on the desktop Statement page, and off-screen sections hidden from screen readers in WebGL mode.

### Still open from Damon

- Current employer and city: blank on purpose (`src/content.js`).
- Contact email: `hello@damon.ai` is a stand-in he will change (`src/content.js`; the agent study also uses it).
- "PAID IN EVIDENCE" stamp wording on the receipt concept was the drawing agent's, not his.
- Nothing has been checked on a real GPU, Safari or a physical phone.

### Working within the usage limit

- Damon's rule: stop and write this file when the 5-hour window reaches 75%.
- The meter is read with the `list_events` tool (kinds `rate_limit_event`) on this session; it only updates as requests are made, and running subagents cannot be stopped at the line automatically.
- Resuming a long idle session re-reads the whole conversation and costs a lot in one request. Start the next round in a fresh session from this file, and give each build to one subagent with a tight brief.


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

## Update 2026-11-15

- Concept boards for all eight unbuilt ideas are in `public/lab/concepts/` (one HTML board each: mountain, parcels, agent, paper, typist, shadow, receipt, city).
- Damon approved: ink, bento, night, pill (all built) and concepts 02 parcels, 03 agent, 04 paper, 05 typist, 07 receipt, 08 city. He did not pick 01 mountain or 06 shadow.
- Builds of 02, 07 and 03 were started and stopped at his request before any file was written. Detailed build plans for the six approved concepts are in `docs/plans/2026-11-15-six-studies-plan.md`.
- Commit `0e712cf`, pushed by Damon from another session during this work, adds React studies in `src/directions/` (typist, receipt, city, shadow, bento, arena) and edits `Home.jsx`, `Chooser.jsx`, `base.css` and `App.jsx`. Claude in this session has not reviewed or rendered it; the notes above about the home page and `/lab` may no longer match the code. Of the six planned studies, typist, receipt and city therefore already exist in some form; parcels, agent and crumpled paper do not.
- Next step is his call: which of the six to build, in what order. His stop line for subagent work is 75% of the 5-hour usage window.
