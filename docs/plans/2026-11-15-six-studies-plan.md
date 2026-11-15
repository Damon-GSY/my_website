# Six approved studies — build plans

Status: **plans only.** Damon approved these six concepts from their boards on 2026-11-15. Three builds were started and stopped at his request before any file was written, so nothing below exists as a working page yet.

Already built and approved, not covered here: the ink hero (`/ink`, and the home page hero), `/lab/bento/`, `/lab/night/`, `/lab/pill/`.

| # | Study | Route to build | Concept board | Size |
| --- | --- | --- | --- | --- |
| 02 | Every link is a parcel | `/lab/parcels/` | `public/lab/concepts/parcels.html` | Medium |
| 03 | The site behaves like his agent | `/lab/agent/` | `public/lab/concepts/agent.html` | Medium |
| 04 | Crumpled paper | `/lab/paper/` | `public/lab/concepts/paper.html` | Large |
| 05 | A machine that types the site | `/lab/typist/` | `public/lab/concepts/typist.html` | Medium |
| 07 | The whole site is one long receipt | `/lab/receipt/` | `public/lab/concepts/receipt.html` | Medium |
| 08 | A city built from his numbers | `/lab/city/` | `public/lab/concepts/city.html` | Small |

Suggested order: 02, 07, 03, 05, 08, 04. The first three are the strongest boards; 04 is the most striking image and the hardest to make comfortable to read.

## Rules shared by all six

- **Form:** one standalone page per study at `public/lab/<name>/index.html`, with inline HTML, CSS and JS. No framework, no build step, no external requests. Files under `public/` are served as-is, so there is no coupling to the Vite app. When a study is finished, add a link to it in `src/pages/Chooser.jsx` (entries take an `href`).
- **Start from the board:** each board's HTML already contains drawing code, colours and copy that Damon approved. Reuse it; the working page must look at least as good as the still.
- **System:** background `#f4f4f2`, ink `#0d0d0d`, muted `#8a8a88`, hairlines `#d9d9d5`, and exactly one accent per study (cobalt `#1a3cff`, magenta `#ff2d8a` or tangerine `#ff7a1a`, as on its board).
- **Type:** Archivo variable from `/lab/concepts/archivo.woff2` (weight 100–900, width 62–125%), display at 800–900 with −0.04em tracking; Cartograph CF from `/fonts/` for small uppercase labels.
- **Content:** only résumé facts. Work: Supply Chain Agent System (≈90% fewer misoperations, 12 scenarios); Dynamic Tool Resolution (100+ tools); Supply-Chain Domain LLM (internal SOTA); Multi-Objective Attribute RL (GRPO); M365 Copilot Memory (3 memory layers); SupChain-Bench (530 samples, ACL Findings 2026). Research: multi-turn agent evaluation survey (~250 papers); VisualDeltas (+8.2%). Path: UNSW, NUS, Singapore AI Visual, Meituan, MSRA, Alibaba. Principles: Evaluate before training / Bound the authority / Read the trace. Footnote wherever production figures appear: "Production figures are internal measurements, not public benchmarks." Current employer and city stay blank.
- **Every page has:** a small nav ("Damon Guan" to `/`, "Design studies" to `/lab`), a `<title>`, no horizontal scroll, visible keyboard focus, a phone layout, and a reduced-motion state that shows the finished content without animation.
- **Motion:** scroll-driven motion is a pure function of scroll position, so it reverses exactly and renders only when something changes.
- **Checking:** serve `public/` with `python3 -m http.server`, capture with the pre-installed Playwright at 1440×900 and 390×844, build a contact sheet, and look at it. Report what was seen in screenshots separately from what was inferred.
- **Cost:** one subagent per study, each committing only its own folder. Read the usage meter when each reports back; Damon's stop line is 75% of the 5-hour window.

---

## 02 — Every link is a parcel

**Idea.** His work is supply-chain systems: things that are packed, labelled, routed and checked. Each project is a delivered unit with one honest number on the label, and opening a case study means opening its box.

**Accent:** magenta (the tape).

**States.**

| State | What is on screen |
| --- | --- |
| Shelf | Six small white cartons in 3D, each with magenta tape and a printed label: project name, parcel number, its one figure (≈90%, 100+, SOTA, GRPO, 3, 530) and a small barcode. Heading "Work, shipped in six cartons." |
| Lift | Hover or keyboard focus lifts a carton off the shelf with a deeper shadow and shows a tag "Open 01 · Supply Chain Agent System". |
| Unfold | On click or Enter the tape tears, the lid swings back and the four flaps fall open. The inside print is already the case study. |
| Net = page | The flat cross-shaped net is the case-study page. Base panel: title and big metric. Flaps: "What it is", "How it is held", "Back to the shelf", "Next parcel". Fold lines stay as hairline rules. |

**Technique.** CSS 3D only. Each carton is six faces with hinge transforms (the same hinge layout as `src/directions/parcel/Scene.js`: base, four flaps, lid on one flap). The opening is one Web Animations timeline of about 0.9 s that drives the hinge angles and moves the carton from its shelf position to the page centre while the other five recede. The flat net's panels are real DOM text from the start, so there is no texture-to-DOM swap.

**Behaviour.** The URL hash tracks the open parcel (`#supply-chain-agent-system`), so links and back/forward work. Escape or "Back to the shelf" folds it closed. "Next parcel" closes one and opens the next.

**Phone.** Two columns of cartons. The open net becomes a scrolling stack of its panels in fold order, still animated open.

**Risks.** Six cartons can read as a toy if the labels are not crisp: label type must stay sharp at the shelf size. The unfold must stay under a second or it delays the reading.

**Done when.** All six open and close by mouse and keyboard; hash navigation works; text is selectable in the open state; phone and reduced motion are readable.

---

## 03 — The site behaves like his agent

**Idea.** It is his job on screen: train an agent, bound its authority, then read the trace. The three principles become the interaction model.

**Accent:** cobalt.

**The page.** A compact one-page site: hero statement, Work list with figures, Evaluate section with the three principles, Contact. An on-page agent operates it visibly.

**Script (deterministic, one step about every 2.5 s).**

| Step | Call | Tier | Effect |
| --- | --- | --- | --- |
| 1 | `open(#work)` | 1 · auto | Cursor travels to Work, the list is revealed |
| 2 | `scroll(to: evaluate)` | 1 · auto | Page scrolls |
| 3 | `read(SupChain-Bench)` | 1 · auto | Row highlights; log shows "530 samples · ACL Findings 2026" |
| 4 | `summarize(principles)` | 2 · notify | A small toast; nothing blocks |
| 5 | `email(to: damon)` | 3 · needs you | Everything pauses; the page sinks back in depth; a sheet rises: "Agent wants to email Damon. Tier 3: needs you." with the reason, the draft subject, Approve and Deny |
| 6 | `end()` | — | Layers collapse into the trace |

**Layers.** While the agent drives, page, log and agent cursor sit on three slightly separated, slightly tilted sheets (desktop only). When the visitor is in control everything is flat.

**Control, the part that makes it acceptable.** A control bar with "Take over", "Resume agent" and "Step". Any wheel, touch or key scroll by the visitor pauses the agent at once and shows "You took over". Approve opens `mailto:` with a subject; Deny logs "denied by you" and the agent continues. Escape means Deny.

**Trace.** At the end, or from a "Read the trace" button at any time: a flat timeline of every step of this visit with time, call, tier and outcome, including the visitor's take-overs and the approval decision, plus "Replay visit".

**Honesty line.** One small line on the page: "Scripted demo. No model is running and nothing leaves this page without your approval."

**Technique.** Plain DOM. The script is an array of steps; a small runner moves the cursor element to the target's rect with a transform transition, performs the effect, and appends to the log and the trace array. The confirmation sheet is a focus-trapping dialog that returns focus when closed.

**Phone.** The log is a bottom sheet showing the latest call; no tilt.

**Reduced motion.** The agent does not start by itself; the page is ordinary, with a "Run the agent" button, and steps apply without travel animation.

**Risks.** Hijacking the visit. If the agent moves before the visitor has oriented it feels like an ad, so the first step waits about two seconds and "Take over" is always visible.

**Done when.** Auto-run, take-over, resume, step, approve, deny and replay all work; the trace matches what actually happened; the dialog is keyboard-safe.

---

## 04 — Crumpled paper

**Idea.** A printed sheet that has been worked on: notes, drafts and evaluations, not a polished brochure. Between sections the sheet balls up, rolls on, and opens flat as the next section with its creases still faintly there.

**Accent:** magenta, for the small section labels only.

**Storyboard (per section change).**

| Progress | 3D | 2D |
| --- | --- | --- |
| 0–0.15 | Flat sheet | The current section, readable |
| 0.15–0.45 | Sheet crumples into a faceted ball; fragments of the printed page stay visible on the facets | DOM text hidden once the mesh matches it |
| 0.45–0.60 | Ball rolls a short distance with a soft shadow | — |
| 0.60–0.90 | Ball opens; facets relax, edges still curl | Type becomes readable across the creases |
| 0.90–1 | Flat, creases at a few percent | DOM text takes over |

**Technique.** This one needs WebGL. A plane of roughly 40×32 quads (about 1,280 facets, as on the board), textured with a canvas rendering of the section. Precompute one crumpled target per vertex: fold the plane with a few random crease lines, then pull the vertices toward a sphere with noise. Progress interpolates flat to crumpled per vertex with staggered timing, and flat shading from face normals gives the faceted look. The crease pattern is kept as a faint normal-based shade on the flat state. Use plain WebGL or copy three's module build into the study folder; do not load it from a CDN.

**Scope.** Three sections only: Statement, Work, Contact. Two transitions.

**Texture match.** Draw the canvas after `document.fonts.ready`, taking line breaks from the DOM twin's measured lines, so the swap between mesh and DOM text is not visible.

**Phone.** Fewer facets (about 24×20) and a shorter roll.

**Reduced motion.** No crumple; sections simply follow each other.

**Risks.** Reading comfort: crease shading over body text can look like a rendering fault. Keep it under a few percent and never across small type. The mesh-to-DOM swap is the other risk.

**Done when.** Both transitions run forward and backward from scroll; the flat state is pixel-close to the DOM at the swap; text is never unreadable at rest.

---

## 05 — A machine that types the site

**Idea.** He trains language agents. Showing the choices behind every word is a portfolio that is also a lesson in how a model decides.

**Accent:** cobalt, for the chosen token.

**Storyboard.**

| Progress | 3D | 2D |
| --- | --- | --- |
| 0–0.1 | Empty page, a caret | Nav only |
| 0.1–0.7 | Each scroll notch commits one token of "I train language agents, then measure whether they hold up on real work." The next token is lifted from a small cloud of candidates standing on a perspective floor, receding in size, opacity and blur with their odds ("measure 0.58", "evaluate 0.17", "test 0.11") | Committed words sit flat in huge display type |
| 0.7–0.9 | Runners-up sink back and flatten into the baseline | Sentence complete |
| 0.9–1 | — | Flat statement section with the three principles. One cobalt underline stays on the word the model was least sure of |

**Technique.** DOM and CSS 3D. The sentence is an array of tokens, each with three or four hand-written alternatives and probabilities. These are illustrative, and the page says so in a small caption ("Illustrative probabilities"). Candidates are absolutely positioned spans with `translateZ` under a perspective parent; progress maps to a token index plus a fraction that drives the lift of the chosen candidate into its slot (measure the slot rect from a hidden, fully laid-out copy of the sentence). Scrolling up un-writes token by token.

**Accessibility.** The full sentence is in the DOM for screen readers from the start. Generation is a layer on top, never a gate.

**Phone.** Two candidates per token, less depth.

**Reduced motion.** The finished statement, with a small static inset showing one token's alternatives.

**Risks.** It reads as a gimmick if it is slow. The whole sentence must be written within about one and a half screens of scroll, and skimmers must be able to jump past it.

**Done when.** Writing and un-writing are exact and reversible; the lifted word lands on its slot without a jump; the page is plain text at rest.

---

## 07 — The whole site is one long receipt

**Idea.** He reports results as figures. A receipt is the format where every line has to add up.

**Accent:** magenta, for the stamp only.

**Storyboard.**

| Progress | 3D | 2D |
| --- | --- | --- |
| 0–0.15 | A matte-black thermal printer in three-quarter view; paper rises from the slot and curls toward the viewer, header already printed | Heading "Scroll to print." |
| 0.15–0.6 | Paper feeds with scroll; the camera tips overhead; the strip still curls at the top | Lines print one at a time as they pass the print head. Heading "Work, itemised." |
| 0.6–1 | Printer gone | The flat receipt is the page. Heading "Six projects. Three papers. One receipt." |

**Receipt content.** Header "DAMON GUAN / LLM ALGORITHM ENGINEER", "No. 0001". Work as line items with right-aligned figures. A dashed rule. Research: survey ~250 papers, VisualDeltas +8.2%. Path: the six places. "TOTAL: 6 PROJECTS · 3 PAPERS". The three principles on one line. A barcode. The footnote. A perforated tear-off stub with `hello@damon.ai` that tears slightly on hover or press. The magenta "PAID IN EVIDENCE" stamp, slightly rotated, landing when it scrolls into view.

**Open question for Damon.** The stamp wording was the drawing agent's, not his. Confirm it or drop the stamp.

**Technique.** No WebGL. The printer is the board's SVG/CSS drawing. The receipt is one real DOM column (selectable text) inside a clipping window whose top edge is the slot. The top 150 px or so of the strip is drawn curled with a short stack of CSS 3D strips (each a slice of the same content rotated a little more), which flattens as progress grows. A line becomes visible when its y passes the slot. No sound.

**Phone.** The strip fills the width minus margins; headings sit above it; the printer is smaller and cropped.

**Reduced motion.** The full receipt, no printer animation.

**Risks.** Cute can read as cheap. Restraint: one printer, real thermal typography, a plain list underneath.

**Done when.** The paper visibly connects to the slot at every scroll position; no line is ever clipped mid-glyph at rest; the stub link works.

---

## 08 — A city built from his numbers

**Idea.** He measures things. Here the evidence is the architecture, built to scale, nothing decorative.

**Accent:** cobalt, on the SupChain-Bench tower and bar.

**Figures.** 530 samples, ~250 papers surveyed, 100+ tools, 12 scenarios, 6 projects, 3 papers. Height is log₁₀ of the count, labelled as such in every frame, with floor bands marking 1, 10, 100 and 1000.

**Storyboard.**

| Progress | 3D | 2D |
| --- | --- | --- |
| 0–0.35 | Isometric skyline of six white towers with black edges, rooftop labels, long soft shadows and low filler blocks. Heading "Every tower is a real figure." | — |
| 0.35–0.75 | Camera swings face-on; roofs foreshorten to slivers; the decade lines rise behind the towers as an axis | — |
| 0.75–1 | — | A clean labelled log-scale bar chart. Heading "The figures, to scale." |

**Technique.** One small 3D model (six boxes plus fillers) projected by hand to SVG or 2D canvas, as the board already does. Progress drives the camera's azimuth and elevation, and at the end the projection is exactly the bar chart. Hovering or focusing a tower or bar names the project behind the number.

**Use.** This is small enough to be a chapter inside another site, not only a standalone page. Build it as a self-contained section so it can be dropped into the home page between Evaluate and Path.

**Phone.** Three towers per row are too small; show all six at a narrower spacing with labels beneath.

**Reduced motion.** The bar chart.

**Risks.** Log scales mislead when unlabelled, so the axis stays visible in every state. It is the least surprising of the six; it earns its place only as a short chapter.

**Done when.** The swing is reversible; the final frame is a correct, labelled chart; every bar is reachable by keyboard.

---

## After the six

- Link each finished study from `/lab`.
- Ask Damon which pieces go into the home page. Likely candidates: 02 as the Work section's case-study navigation, 08 as a short chapter, 07 or 03 as an alternative whole-site direction.
- Still open from before: current employer and city (blank), the stand-in email, and checks on a real GPU, Safari and a physical phone for everything built so far.
