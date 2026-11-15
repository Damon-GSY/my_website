# Review: typist, receipt and city against the plan

Branch `claude/serene-cori-mookmf`, build commit `0e712cf`. Compared against `docs/plans/2026-11-15-six-studies-plan.md` (sections 05, 07, 08 and "Rules shared by all six").

**How findings are marked.** `[code]` = from reading source. `[shot]` = from a screenshot taken from `vite build` + `vite preview` with Playwright (1440x900 and 390x844; scripts and images in the session scratchpad `.../scratchpad/review/`). Screenshots are software-rendered, desktop and phone only. I did not test scrolling, keyboard use, Safari, or a real GPU. Console errors: none on any of the three routes, desktop or phone `[shot run]`. No horizontal overflow at 1440 or 390 on any route `[shot run: scrollWidth == innerWidth]`.

## Findings that apply to all three

- **Different form, on purpose or not.** The plan says standalone `public/lab/<name>/index.html`, no framework, routes under `/lab/`. These are React routes `/typist`, `/receipt`, `/city` (`src/App.jsx:17-20`) that share `content.js`, `Chrome.jsx` and `base.css`. Probably deliberate (it matches the rest of the repo's `src/directions/`), but not what the plan says. Chooser links use these routes (`src/pages/Chooser.jsx:256-258`); the concept-board links still point at `/lab/concepts/*.html` (lines 140-158). [code]
- **None of the three is scroll-driven.** The plan's central mechanic (progress from scroll, reversible, "pure function of scroll position") is absent in all three. Typist uses a 270 ms timer plus a step slider (`typist/Opening.jsx:1388-1403`); receipt uses buttons and a 115 ms timer (`receipt/Opening.jsx:283-292`); city uses a slider and presets with a tween (`city/Opening.jsx:432-487`). [code]
- **System colours differ.** Plan: bg `#f4f4f2`, one accent per study. Typist and city use bg `#f2efe8` (`typist.css:5`, `city.css:2`); receipt `#ebe7de` (`receipt.css:4`). Typist also uses red `#c41e3a` and emerald `#0f6f63` (`typist.css:16-18`) plus magenta; city adds orange `#ff5a1f` (`city.css:8`) and a dark blueprint theme `#0c1842` (`city.css:34`). So "exactly one accent" is not met in typist or city. [code] The orange label/marker colour is visible in the city shot. [shot]
- **Principles missing everywhere.** "Evaluate before training / Bound the authority / Read the trace" appear in none of the three; neither do VisualDeltas or +8.2%. [code: grep]
- **Footnote present** in all three ("Production figures are internal measurements, not public benchmarks"): `typist/Opening.jsx:1353`, `receipt/Opening.jsx:622`, `city/Opening.jsx:1318`. Met.
- **Nav present** in all three through `Chrome.jsx` ("Damon Guan" to `/`, "Design studies" to `/lab`). Met. [shot]
- **`<title>` is one static string** (`index.html:7`, "Damon Guan — LLM algorithm engineer") for every route; no per-study title. [code]
- **Footer links in every study** add the `hello@damon.ai` mailto and other studies (`Chrome.jsx:37-41`). Plan mentions the email only for the receipt stub. Minor.
- **Likely implied current employer (check with Damon).** `content.js` route has `{years: '2025–', what: 'Alibaba'}`. Typist shows "2025– · Alibaba" in the trajectory box `[shot]`; receipt shows the same and "SYD → SIN → PEK → ALIBABA" `[shot]`. An open-ended range ending at Alibaba reads as "current employer", which the plan says stays blank. Source is `src/content.js` (route array), rendered at `typist/Opening.jsx:1536-1541` and `receipt/Opening.jsx:470-476`. `content.js` itself marks only the city as blank, so this may be Damon's call.

---

## 05 — Typist (`src/directions/typist/`)

### What it does [code, shot]
A "decoding console" for the sentence "I train language agents, then measure whether they hold up on real work." Three checkpoint tabs (π₀ base, π_SFT, π_GRPO) each type a different, hand-written 10 to 13 token sentence; π_GRPO produces the plan's sentence. Each token has hand-written alternatives with a logit and an "advantage" score. The page turns logits into probabilities with a softmax and a temperature slider, shows four rejected candidates as blurred cards at depth above a floor, and lists a logit inspector and a "Token-Decoded Work" grid linking the six projects to tokens. Auto-plays on load at 270 ms per token, with play/reset/step controls.

### Plan vs built
| Plan item | Status | Evidence |
| --- | --- | --- |
| Sentence "I train language agents, then measure whether they hold up on real work." | Met (π_GRPO tab) | `typist/Opening.jsx` π_GRPO tokens ~455-720; `[shot]` typist-2-done shows it |
| Each token has 3-4 candidates with odds, receding in size/opacity/blur by odds | Met | candidates 4 per token; opacity/blur/z by prob, `Opening.jsx:879-896`; `[shot]` blurred cards |
| Candidates on a perspective floor, lifted to a slot | Partly | cloud of fixed 4 slots over SVG horizon; "lifted to z = 0" is a label, the word does not travel to its slot (`Opening.jsx:926-928`) |
| Progress from scroll; scrolling up un-writes | Not met | timer/slider driven; page has no scroll-linked state (`Opening.jsx:1388-1403`) |
| 0-0.1 empty page and caret, 0.7-0.9 runners-up sink and flatten | Not met | no staged phases; ghosts stay until the last token |
| Statement section with the three principles; one cobalt underline on the least-sure word | Partly | cobalt underline appears on several tokens (`.is-high-ent`, shot shows "train", "agents,", "measure" underlined), not one; principles absent |
| Caption "Illustrative probabilities" | Not met | string absent from all three studies [code: grep]. Probabilities are shown as precise decimals (`p = 0.71`, `H(p) = 0.92 bits`) |
| Cobalt accent for the chosen token | Met | `[shot]` chosen token cobalt |
| Full sentence in the DOM for screen readers from the start | Partly | tokens are `button`s inside `aria-live="polite"` (`Opening.jsx:967`), but unwritten slots are `aria-hidden` `_04` placeholders (line 975); the full sentence is not in the DOM until typed |
| Whole sentence within ~1.5 screens; skimmers can jump | Partly | auto-types in ~3.5 s; "Step Scrubber" and tick buttons jump; but the sentence sits below a 330 px header/tabs block and below the fold at load `[shot]` |
| Phone: two candidates per token, less depth | Partly | `--cloud-scale` var and media queries exist (`typist.css:1185-1243`); `[shot]` typist-m shows all four ghosts overlapping in a very small cloud |
| Reduced motion: finished statement plus one static inset | Met | `step: 999` at load (`Opening.jsx:1368-1371`); `.ty-cursor` stops (`typist.css:1245`) |
| Done when: lifted word lands on slot without a jump; plain text at rest | Not met / partly | no landing animation; at rest the text is button elements with pips, not plain text |
| Extra, not in plan | Different | three policy checkpoints, temperature slider, GAE advantage, KL, reward codes, 12 more sentences in two languages. The page is about RL training, not "choices behind each word" in one sentence |

### Content check (items not in the plan's résumé facts)
Invented figures and claims, all in `src/directions/typist/Opening.jsx`:
- `:45` `R = -1.84 · KL SPIKE`; `:56` `KL = 0.84 > threshold`, `Reward penalty -1.84`; `:279` `R = +0.42 · SAFE / PASSIVE`; `:290` `Advantage plateaus at +0.42`; `:425` and `:436` `R = +2.65 · VERIFIED` (shown in the tab and the ledger chip as if a measured result).
- `:56` `0 production tool traces`; `:290` `0 multi-turn rollouts`: assertions about base and SFT models that are not résumé facts.
- Logit values, advantage values and "H(p)" entropies shown to two decimals for every token (data defined throughout lines 40-720; displayed at `:1236-1252`). Presented as model measurements; the plan required "illustrative" labelling.
- Rationale strings tie specific tokens to résumé numbers in ways the résumé does not state: `:533` "(≈90% fewer misoperations)" attached to the word "hold"; `:719` same for the last token; `:567` "live 12-scenario rollouts"; `:465` "supply-chain CPT & dual-axis QA + tool eval" (matches content.js work line, fine). "Reward" and "GAE" are named as the project's training signal; the résumé facts say GRPO (the plan lists GRPO for Multi-Objective Attribute RL only). GAE is not a résumé fact.
- `:1534-1541` trajectory box prints employer "Alibaba 2025–" with blank city (see shared finding).
- Résumé-sourced but not in the plan's list: cities Sydney, Singapore, Beijing and the dates, taken from `content.js` `route`. The plan's list names the six places without cities.
- No employer or city beyond that was found. `joinParts` leaves role-only in the header (`:1515`, shot shows "LLM ALGORITHM ENGINEER").

### Top 3 gaps, smallest first
1. Add the "Illustrative probabilities" caption and remove the made-up reward/KL strings (`:45, :56, :279, :290, :425, :436`), and the ≈90% rationale strings on "hold"/"work" (`:533`, `:719`).
2. Reduce to the plan's single sentence and one least-sure underline; add the three principles in the closing section; keep the policy tabs only if Damon wants them (they are an addition, not a plan item).
3. Make it scroll-driven: map progress to token index and fraction, so writing and un-writing are reversible and the chosen word actually lifts to its slot.

---

## 07 — Receipt (`src/directions/receipt/`)

### What it does [code, shot]
A dark printer block with four buttons (Print next line, Print full receipt, Stamp, Reset) above a paper strip. The strip is real DOM text: name, role, a trajectory box, the six projects as line items with a figure at the right (click to expand "audit notes"), a "20-step compound reliability" box with two bars, a barcode, the footnote, and a perforated stub with `hello@damon.ai`. Clicking the stub tears it, copies the email, and shows a floating card with GitHub, LinkedIn, YouTube and Bilibili links. Clicking the paper adds magenta "PAID IN EVIDENCE" stamps. All six items are printed at load.

### Plan vs built
| Plan item | Status | Evidence |
| --- | --- | --- |
| Matte-black printer, paper from the slot | Partly | dark slate printer with an inset slot and the strip below `[shot]` receipt-1-load; it is a flat illustration, not three-quarter view |
| Paper curls toward viewer, flattens with progress; camera tips overhead | Not met | `.receipt-curl-shade` only (`Opening.jsx:` paper block, `receipt.css`); no strip stack, no camera |
| Scroll feeds the paper; lines print as they pass the head | Not met | buttons only; `printedCount` starts at all six (`Opening.jsx:262`) |
| Headings "Scroll to print.", "Work, itemised.", "Six projects. Three papers. One receipt." | Not met | none present |
| Printer gone at progress 0.6-1 | Not met | printer stays above the paper at every position `[shot]` receipt-2-full |
| Header "DAMON GUAN / LLM ALGORITHM ENGINEER", "No. 0001" | Partly | header present; number is "NO. RL-2026-06" (`:119`), and "#06/06" |
| Work as line items, right-aligned figures | Met | `[shot]` six items with ≈90%, 100+, SOTA, GRPO, 3, 530 |
| Dashed rule; Research: survey ~250 papers, VisualDeltas +8.2% | Not met | no research section at all |
| Path: the six places | Partly | only four route stops (SYD, SIN, PEK, Alibaba); Singapore AI Visual is missing |
| "TOTAL: 6 PROJECTS · 3 PAPERS" | Not met | replaced by the 20-step reliability box |
| Three principles on one line | Not met | absent |
| Barcode | Met | `[shot]` |
| Footnote | Met | `:622` |
| Perforated stub with `hello@damon.ai`, tears on hover or press | Different | tears on click, and also copies to clipboard and opens a floating card with four social links (`:325-345`, `:370-410`); mailto link only after tearing |
| Magenta "PAID IN EVIDENCE" stamp, rotated, lands on scroll-into-view | Different | one stamp present at load plus unlimited click-to-stamp; not triggered by scroll. In the screenshot the stamp lies over the last item's description text `[shot]` receipt-2-full, and on phone it covers "for logistics, fulfillment" `[shot]` receipt-m |
| Open question: stamp wording unconfirmed | Not resolved | wording kept; an added sub-line "// VERIFIED PRODUCTION METRIC" (`:255`) |
| Accent magenta for the stamp only | Not met | magenta also on figures, buttons, bars, note borders `[shot]` |
| Phone layout | Met | `[shot]` receipt-m fits 390 px |
| Reduced motion: full receipt, no printer animation | Met | all items printed at load; Print full skips animation when reduced (`:297-302`) |
| Done when: paper connects to slot at every position | Partly | it does, trivially, because nothing moves `[shot]` |
| Done when: no line clipped mid-glyph | Partly | stamp overlaps text, no clipping seen `[shot]` |
| Done when: stub link works | Partly | link exists only after tearing (`:343`) |

### Content check (items not in the plan's résumé facts)
All in `src/directions/receipt/Opening.jsx`:
- `:130-131`, `:584`, `:594` "Naive 0.95^20 = 35.8%" and "Agentic RL 0.992^20 = 85.2%"; `:603` "MISOPERATIONS -90%". The 0.95 and 0.992 per-step rates are invented. Neither is a résumé fact. The "-90%" row is derived from the ≈90% figure but presented as the output of the made-up calculation. Visible in the shot.
- `:621` barcode caption `RL-2026-DAMON-GUAN-530-90PCT`; `:119` `NO. RL-2026-06`; `:109` `MODEL RL-2026 · 80MM THERMAL AUDIT`: invented identifiers.
- `:80` "3-layer memory: turn · session · persistent user": names for the three memory layers are not in the résumé facts (the plan says only "3 memory layers"). Same text in `city/Opening.jsx:228`.
- `:88` "Utility evaluated without irrelevant leakage"; `:74` "Stabilised convergence across competing metrics" (content.js says "stabilised across objectives"); `:27, :33` "VERIFIED ≈90% fewer production misoperations (internal)" and "≈90% reduction in manual ticket handling" (second is in content.js).
- `:255` "VERIFIED PRODUCTION METRIC" on the stamp: labels the figures as verified.
- `:358-405` links to GitHub, LinkedIn, YouTube, Bilibili (from `content.js` `profile.links`); not in the plan.
- Employer/city: trajectory shows "2025– · Alibaba" (see shared finding). Singapore AI Visual and the research items are absent rather than wrong.

### Top 3 gaps, smallest first
1. Remove the invented 20-step reliability box, the "RL-2026" identifiers and the "VERIFIED PRODUCTION METRIC" sub-line; use "No. 0001".
2. Add the missing content: research lines (survey ~250 papers, VisualDeltas +8.2%), all six path places, "TOTAL: 6 PROJECTS · 3 PAPERS", the principles line; make the stamp magenta-only and move it off the text.
3. Make printing scroll-driven: paper fed by scroll, lines appear as they pass the head, printer leaves at progress ~0.6, with the three headings.

---

## 08 — City (`src/directions/city/`)

### What it does [code, shot]
An SVG skyline of six towers built from a hand-written 3D projection (`createProjector`), with filler blocks, a log₁₀(x+1) scale, floor lines, a rooftop label per tower, a 3D-to-2D slider with three presets (0, 45, 100 percent), a log/linear toggle, a vellum/blueprint toggle, an inspector panel for the selected tower (with prev/next buttons), and an "elevation schedule" list of six rows. At 100 percent the view is a flat orthographic bar chart `[shot]` city-3-flat. Towers are focusable and keyboard-operable (`Opening.jsx:938-946`).

### Plan vs built
| Plan item | Status | Evidence |
| --- | --- | --- |
| Six figures: 530, ~250, 100+, 12, 6 projects, 3 papers | Partly | six towers are 530, ~250, 100+, ≈90%, 12, 3 (memory layers) (`Opening.jsx:96-240`). "6 projects" and "3 papers" are missing; ≈90% and "3 layers" are added |
| Height is log₁₀ of the count | Different | `log10(value + 1)` (`:10`, `logRatio`), labelled as such, so a value of 0 sits on the floor; floor bands at 1, 10, 100, 1000 labelled `[shot]` |
| Isometric skyline, six white towers with black edges, rooftop labels, soft shadows, low fillers | Met | `[shot]` city-1-load (cobalt tower for 530; others white) |
| Heading "Every tower is a real figure." | Met | `COPY.title` |
| Camera swings face-on as progress rises; roofs foreshorten; decade lines rise as an axis | Partly | morph interpolates yaw/pitch (`createProjector`, `:272-297`); controlled by a slider/preset, not scroll |
| Final frame is a clean labelled log bar chart, heading "The figures, to scale." | Partly | flat chart is present `[shot]`; heading string not found; chart is inside a panel with the inspector, not a full-width end state |
| Hover/focus names the project behind the number | Met | `aria-label` per tower, tooltip/inspector (`:939-941`) |
| Axis visible in every state | Met | `[shot]` both states |
| Every bar keyboard reachable | Met | `tabIndex={0}` `role="button"` (`:938-939`) |
| Swing reversible | Met | slider and presets both ways |
| Cobalt accent only on the SupChain-Bench tower/bar | Partly | tower and bar cobalt `[shot]`, but orange selection/label colour is added and a dark blueprint theme exists |
| Self-contained section usable in the home page | Partly | has `embedded`/`head` props (`:406`); not wired into Home |
| Phone: six towers at a narrower spacing, labels beneath | Partly | `[shot]` city-m: all six fit but the SVG scales down to about 260 px wide; rooftop labels are very small |
| Reduced motion: bar chart | Not met | reduced motion removes the tween but the initial state stays at morph 0 (3D skyline) (`:416-418`, `:489`) |
| Scale toggle to linear | Extra | not in plan; its explanatory strings include made-up percentages (below) |

### Content check (items not in the plan's résumé facts)
All in `src/directions/city/Opening.jsx`:
- `:173` tower value `90` for "≈90%" plotted as a count on the same axis as 530 samples, 250 papers and 100 tools; `:186`'s text says ~90% reduction "of both operational mistakes and manual ticket escalations". A percentage drawn as a count of 90 is a scale error. Visible: the "≈90% REDUCTION" tower between the 100+ and 12 towers `[shot]`.
- `:80-81`, `:207-208`, `:228-229` made-up proportions: "3 layers (0.5%)", "12 scenarios (2.0%)" under a 0-600 linear scale, "20.1%" for log height of 3 layers (`:229-231`), and the inspector meter in the phone shot "90.8% / 88.3%" for 530 (computed from the invented scale constants `LINEAR_MAX = 600`, `LOG_MAX`, `:10-11`). The 600 maximum is invented.
- `:140` "systematic synthesis of ~250 papers charting state-space drift, partial-credit verification, and multi-turn tool-use evaluation": survey content claims not in the résumé facts. `:144` "20-step reality" and "compounding per-step error demands intermediate milestone scoring and recovery diagnostics": invented.
- `:123` "530 real operational traces across logistics, warehouse fulfillment, finance, and customs": "warehouse" and "traces" are additions (content.js says "logistics, fulfillment, finance and customs"; "samples" not "traces").
- `:186` "bounding tool authority cut both operational mistakes and manual ticket escalations by ~90%": merges two separate figures (Supply Chain Agent System ≈90% misoperations; Dynamic Tool Resolution ~90% tickets, content.js).
- `:203` "Twelve live supply-chain workflows partitioned by blast radius": "blast radius" and "live" are invented; `:200` makes "12 scenarios" a separate tower sourced to Alibaba 2025.
- `:228` the memory layer names (turn, session, persistent) as in receipt.
- `:1319-1322` "Companion non-scalar milestones" lists Supply-Chain Domain LLM and Multi-Objective Attribute RL with SOTA and GRPO (from content.js; fine).
- `:51` source tags "Research · Taxonomy", `:149` etc. fine. `COPY.subtitle` says "verified engineering scales" (`:68`) and "Six verified"; "verified" is not a résumé claim for the survey or layers count.
- Employer/city: none printed in this study. City does not use the route box.

### Top 3 gaps, smallest first
1. Replace the 90 tower: the plan's figures are 530, ~250, 100+, 12, 6, 3 (6 projects, 3 papers). Remove the ≈90% tower and the 3-layer tower, add "6 projects" and "3 papers". Drop the invented 0.5% / 2.0% / 20.1% / 90.8% text and the linear 600 max, or drop the linear toggle.
2. Reduced-motion and phone: start at the bar chart under `prefers-reduced-motion` and give the phone SVG a taller viewBox so labels are readable.
3. Make the morph scroll-driven and end on a full-width "The figures, to scale." chart, so it works as a section in the home page.

---

## Summary of content claims not backed by the résumé facts
- Typist: reward values R, KL 0.84, "0 production tool traces", "0 multi-turn rollouts", per-token logits and advantages shown as measurements, GAE terminology; no "Illustrative" caption.
- Receipt: 0.95^20 = 35.8%, 0.992^20 = 85.2%, "-90%" derived from them, "NO. RL-2026-06", "MODEL RL-2026", memory-layer names, "VERIFIED PRODUCTION METRIC".
- City: a 90 count for a percentage, 0.5% / 2.0% / 20.1% / 90.8% / 88.3% proportions on an invented 600 max, survey topics, "20-step reality", "blast radius", "warehouse", "traces".
- Typist and receipt print "2025– · Alibaba" as the last route stop, which reads as a current employer.
