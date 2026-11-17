# Handoff — dimensional site

## Start here (2026-11-17): Phase D, Arrival

**Built:** the first load of `/` in a tab session opens with the Pill study's reveal joined to the ink hero (`src/directions/ink/arrival.js`, behind InkHero's `arrival` prop, which only Home passes; `/ink` and `/lab/pill/` are unchanged). The mark appears at the wordmark's full stop; a hairline of ink runs left out of it along the baseline, opens into a pill of moving ink around the name (the name turns white inside it), and the pill widens to the edges. The pill is the hero's own WebGL canvas clipped with CSS `clip-path` (mask full), so the full-bleed ink *is* the ink layer: same canvas, same video frame, no second context. The ink then drains back into the mark through the hero's reveal mask (the trail canvas), with the same gooey edge as a cursor trail, and the corner UI comes in. About 1.9 s of timeline after the first video frame; at most 0.6 s is spent waiting for it (no frame or font in time: no intro), so it ends within 2.5 s of first paint (measured 1.9–2.2 s). Any key, click, wheel, touch or scroll jumps to the final state at once. `sessionStorage['dg-arrival']` stops it repeating; reduced motion, no WebGL, a hash, a deep link or a page not at the top get no intro. The h1 and all hero text are in the DOM from the start (the UI is only transparent during the intro).

**Verified** (Playwright, built preview, 1440×900 and 390×844): frame sequences every 150 ms; skip by click, key, wheel, touch and scroll; reload in the same session shows no intro; reduced motion and WebGL-off show none; the mark is 0.00 px from the full stop at rest after the intro and after scrolling down and back; no horizontal overflow; 0 console errors; `/ink` unaffected. InkHero chunk +1.3 kB gzip JS, +0.25 kB CSS. **Rough edges:** the drained blob wobbles around the mark at the very end (the shader's noise warp moves the mask by ~20 px); the mark is hard to see on the orange ink while the pill passes it; not checked on a real phone, Safari or a slow network.

## Start here (2026-11-17): Phase B, Work in place

**Built:** the six Work cards open their case studies inside `/` (`src/pages/work/`). A card is a link to `/work/<slug>`; a plain click opens a dialog in which a CSS 3D carton rises out of the card, tilts, loses its lid, and folds its four walls flat into the cross-shaped sheet from `/lab/parcels/` (base: title and figure; walls: What it is, How it is held, packing slip, next parcel). Closing folds it back into the card. Phones (<900 px wide) get a column of panels that unfold one under another; reduced motion gets a fade. No WebGL is used, so it works over the film and in the static fallback. Copy is the parcels study's text (zh translated in `cases.js`) plus `src/content.js`. URL is the state (`caseRoute.js`): open pushes `/work/<slug>`, next parcel replaces it, Close/Esc/Back go back to `/`; a deep link scrolls to the landed grid, then rewrites history to `/` + `/work/<slug>` so Back stays on the site. App routes valid slugs to Home with the case title; unknown slugs 404. The dialog is modal (root `inert`, Tab cycles inside, focus to the title, back to the card), locks page scroll without moving it, hides the travelling mark, and records `parcels` in the visit store (the receipt prints it). Static-fallback cards now take clicks (`parcel.css`).

**Verified** (Playwright, 1440×900 and 390×844, with motion / reduced motion / WebGL off): all six by click + Esc, Enter + Close button, deep link + Close or Back, Forward, next parcel, Back to the shelf; focus stays in the dialog; page scroll unchanged; no horizontal overflow; 0 console errors. Lint and build pass. First-paint JS +0.95 kB gzip (the dialog is a lazy 5.9 kB chunk).

**Rough edges:** the flat sheet is drawn at ~0.9 scale on a 900 px tall screen, so its type is slightly soft; on screens under ~950 px tall the sheet scrolls inside the dialog. Not checked in Safari or on real devices.

## Start here (2026-11-17): Phase C, the Close (receipt)

**Built:** the page now ends on a thermal receipt of the visitor's own visit (`src/chapters/close/Close.jsx` + `close.css`; it replaces the old Contact section, keeps `id="contact"`, and is (08) Contact). The paper is in normal flow and a printer bar is `position: sticky` at the bottom of the viewport, covering whatever has not come out yet, so scrolling *is* printing: exactly reversible, no script per frame. Every line comes from `src/engine/store.js` (sessionStorage, this tab only): chapters reached, in page order, with the time each was first reached; the d20 seed and first failing step (or "Not rolled" when the visitor never reached the tally); screens scrolled; date, arrival time, time on page, language; "Cases opened" only if Work records `parcels`. The number is the arrival timestamp in base 36; the barcode is drawn from it. No invented values. The stamp "HELD UP ON REAL WORK" (zh: 在真实工作中站得住) is the mark's final dock (`data-mark="close"`, landing by scroll into the roll via `data-mark-in`, measured in JS so it lands only after the stamp is out of the slot and always before the page ends); `--mk` presses the ring in. The tear-off stub is the contact block: mailto link, copy button, the four profile links. Links to `#contact` scroll to the printed stub (chapters flown past during that jump are not counted). "More ways in" is cut to one line to `/lab` (§7); `src/pages/MoreWays.jsx` and its images are no longer used but were left in place. The store now also records `times`, `arrived`, `screens`, and chapters are recorded by an IntersectionObserver too, so the receipt works with reduced motion and without WebGL.

**Verified** (Playwright, built preview): 1440×900, 390×844 and 360×740, en and zh; mark lands on the stamp at 0.00 px at rest and the close region gives identical mark positions scrolling down and back up; a visit that rolls the d20 prints its seed and result, one that jumps past prints "Not rolled" and only the chapters reached; reduced motion shows the whole receipt with the printer under it; no horizontal overflow; 0 console errors. First-paint JS on `/` grew about 2.7 kB gzip. Rough edges: on phones and short windows the top of a long receipt has scrolled away by the time the stub is out (it is a strip of paper, read as it prints); the Bar's "Contact" highlight follows the section, not the stub.

## Start here (2026-11-17): Phase A, parallax, /short

**Built:**
- **The travelling mark** (`src/engine/mark.js`). It is one fixed magenta dot that docks to `[data-mark]` targets in document order. Its position is a pure function of scroll and the live dock rects, so it is exactly reversible. Docks, in order: hero full stop after the wordmark (`ink-stop`) → the statement's full stop (the cobalt stop is gone) → the carton sticker (`work`, a WebGL mesh that swaps with the DOM dot at the same pixel) → the sticker peels off, marks each route stop, then lands on the first card → the d20 heading's "1" → the tally strip's magenta "1" triangle → Evidence E1's dagger → the Path "Now" dot → the newest note's bullet → the "@" of the email. At rest the dot fades into the target glyph, which turns magenta through `--mk`. During long hand-offs it waits in the left margin. It is off with reduced motion or without WebGL; then each target shows its own magenta glyph. Tangerine and cobalt have been removed from the home page.
- **Store** (`src/engine/store.js`, sessionStorage): which chapters the mark reached, and the d20 seed plus the step where the run first failed. The receipt (phase C) reads it.
- **`/short`** (`src/pages/Short.jsx`) shows `/lab/bento/` full window. It is linked from the hero ("Short version") and the end of the top bar.
- **Depth layer** (`src/engine/parallax.js`): `data-pv="a b"` gives each element a scroll progress `--pv`. It uses a native `view()` scroll-driven animation, with a scroll-listener fallback for Safari. The effects are in `home.css` under "depth", use transform and opacity only, and are off with reduced motion. They cover: hero planes (corner UI faster, ink canvas and wordmark slower, sinking and scaling down) plus a pointer tilt; section openers (rule, label and title move at different rates, and titles settle in width); statement lines drifting against each other; a kinetic outlined band between Evaluate and Evidence; Evidence figures on three planes; Path rows sliding in from alternate sides; Notes rows clipping up into place; More-ways-in images moving inside their frames; and the contact email growing as the page ends.
- Deferred films now mount 0.9 viewport ahead instead of 1.0. On phones the Work film began exactly 2 screens down, so three.js used to load at the top.

**Verified** (scripts and sheets were kept out of the repo): 18 scroll positions down the page and back give identical mark x/y/size at 1440 and 390. At every rest the mark is 0 px from its dock. There is no horizontal scroll at 360, 390 or 1440. Console errors: 0. Reduced motion and WebGL-off render no travelling dot, and their targets are magenta. three.js does not load at the top. First-paint JS grew by about 3.2 kB gzip.

**Open / rough edges:** the wordmark is drawn inside the ink canvas, so "wordmark" and "ink" share one depth plane (the corner UI is the faster plane). The die's own "1" face is not tracked in 3D; the mark sits on the heading's "1" while the die rolls. Path and Notes rows near the bottom of the viewport are mid-reveal, and so still faint. Not checked in Safari (fallback path) or on real devices.

## Earlier: 2026-11-15 (stopped at the 70% usage line)

Work stopped because the 5-hour usage window reached Damon's stop line (62% at the last reading, with the final task finishing after it). Everything is committed and pushed on `claude/serene-cori-mookmf`.

### What this round did

- **Illustrative labels (Damon's decision):** invented values in his typist, receipt and city studies now carry "Illustrative values — not measurements." (en/zh); "verified" wording removed; city's ≈90% tower labelled as a rate. Nothing removed. Receipt's five "Verified" row labels were also renamed "Result" (not asked for; easy to revert). "2025– · Alibaba", city's wording claims ("warehouse", "blast radius", survey topics) left as they are.
- **Polish:** parcels (phone name strips, larger open net), agent (stronger layered tilt; fixed a bug where clicking the page did not take over), paper (centre-out reopen, hard texture cut while balled, recomposed Statement page).
- **Home page composed (Claude's choice, for Damon to judge):** ink hero → Statement → Work (carton film; each card opens `/lab/parcels/#<slug>`) → Evaluate (d20) → **Evidence** (new; eight real figures as a type board, production figures marked †) → Path → Notes → **More ways in** (new; static previews linking to parcels, agent, paper, night, pill, /lab) → Contact. Damon's lens mechanism kept, folded into a "Studio Lens +" button; per-chapter lens bars appear only when a lens is chosen. Work film is a fork in `src/pages/WorkFilm.jsx` (update by hand if `ParcelFilm.jsx` changes).
- **Whole-site QA:** every route and `/lab` page × desktop/phone × reduced motion (+ WebGL off for 3D pages). 39 pass, 14 fixed, 0 open. Report: `docs/reviews/2026-11-15-site-qa.md`.
- **Performance:** below-the-fold WebGL chapters (Work film, d20) mount about one viewport before they scroll in; three.js no longer loads at the top of `/`. JS before first paint went from 233.0 kB to 97.1 kB gzip. The second ink video waits until the first can play through. Concept boards scale to fit any window.

### Known open items

The finishing pass of 2026-11-16 (phone polish, full section bar, fresh previews, quiet WebGL fallback, paper Contact) is written up in `docs/reviews/2026-11-15-site-qa.md`, "Finishing pass".


- `/d20` opens on a near-empty "Scroll ↓" screen by design.
- "More ways in" previews were re-captured on 2026-11-16; they are still static screenshots and need re-capturing when a study changes.
- Nothing checked on a real GPU, Safari or a physical phone.
- Some history contains automatic "wip" snapshot commits (made to satisfy a commit-on-stop hook while agents were mid-work); the final state is clean.

### Since then (2026-11-16)

- Home finishing pass: phone tap targets ≥44px, Evidence fits at 360px, the top bar lists all eight sections (scrolling strip on phones, active section marked), More ways in previews re-captured, WebGL availability checked up front so WebGL-off pages log no errors, paper's Contact page rebalanced. Details in `docs/reviews/2026-11-15-site-qa.md` ("Finishing pass").
- Launch readiness: title, description, share tags, `public/og.png`, a "DG" favicon, `public/_redirects` (Netlify), `vercel.json` (Vercel; `/lab/` with a trailing slash now also rewrites), `public/robots.txt`, and a "Deploy" section in `README.md` with the pre-launch checklist. Nothing deployed; host not chosen.
- Remaining work needs Damon's decisions; there is no further unblocked build work queued.

### Quality pass (2026-11-16, finished)

| Item | State |
| --- | --- |
| 1. Per-route titles and a real 404 | **Done.** `/lab` → "Design studies — Damon Guan", studies and notes get their own titles, unknown paths show `src/pages/NotFound.jsx` |
| 2. Accessibility on `/` and notes | **Done, measured.** One h1, no skipped heading levels, skip link works, 0 unnamed buttons/links, 3/3 canvases aria-hidden, 0 small-text colour pairs below 4.5:1 (muted #6f6f6c, active route code #d6136c). `/lab/paper/` keeps all three sections readable by assistive tech in WebGL mode. Open: no banner landmark on `/` until the top bar appears |
| 3. Chinese mode on phones | **Done.** Note categories and reading times translated; Evidence intro wraps without an orphan; no overflow at 360/390/1440 |
| 4. Parcels phone cartons back to light 3D | **Done.** 16° turn + mild perspective; strips placed after the perspective is applied; no overlap at 360/390; open/close/hash/keyboard checked |

Numbers and details: `docs/reviews/2026-11-15-site-qa.md`, "Quality pass".

### Assembly plan (2026-11-16)

`docs/plans/2026-11-16-one-site-assembly-plan.md` proposes how to turn all the studies into one site: an eight-chapter run (Arrival, Claim, Work, Test, Evidence, Path, Notes, Close), one device per chapter, a single magenta mark handed from chapter to chapter, three site-wide modes (Guided, Short, Night), a chapter contract, budgets, phases A–I and the decisions needed. Plan only; nothing in it is built.

### Next steps (Damon decides)

1. Judge the composed home page; keep, change, or pick another direction (night, pill, bento, agent, receipt as whole-site options).
2. Fill in current employer, city and real email in `src/content.js`.
3. Decide on "2025– · Alibaba" in typist/receipt and city's wording claims.
4. Review copy written by Claude: parcels panels ("What it is" / "How it is held"), Evidence labels, More ways in lines.
5. Real-device checks.

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
