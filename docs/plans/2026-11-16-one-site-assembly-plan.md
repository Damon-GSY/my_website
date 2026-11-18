# One site — assembly plan

Status: **Phases A–E built (2026-11-17), G built (2026-11-18)**; F, H, I not started. It describes how to turn the twelve working studies, plus Damon's six, into a single website that reads as one piece of work, not a gallery.

## 1. The problem

There are now about eighteen studies in seven visual styles. The home page already combines four of them (ink hero, white carton, d20, Evidence), but the rest sit in `/lab` as separate pages, and several are stronger than what the home page uses. Putting more of them on one page would make it longer, not better.

What is missing is a reason for each piece to be where it is.

## 2. The idea: one visit, told as one run

Damon's work is a loop: state what the system should do, build it, test whether it holds up, show the evidence, write down what was learned. The site follows that loop, and each chapter uses the one study whose mechanism *means* that step.

Three rules hold it together:

1. **One device per chapter.** Each chapter has exactly one 3D ↔ 2D move, and it has to say something about that chapter's content. Everything else goes to `/lab`.
2. **One mark travels the whole site.** A single magenta dot appears in every chapter in a different role and is handed from one to the next (section 4). It is the visitor's thread.
3. **One system.** Off-white `#f4f4f2`, ink `#0d0d0d`, small text `#6f6f6c`, hairlines `#d9d9d5`, magenta `#ff2d8a` for the mark only (`#d6136c` when it is small text), Archivo for display, Cartograph CF for labels. Studies that arrive in another palette are re-skinned or stay in `/lab`.

## 3. The chapters

| # | Chapter | What it says | Device | Source study | Change needed |
| --- | --- | --- | --- | --- | --- |
| 0 | Arrival | A name | A hairline opens into a pill of moving ink, which widens until it *is* the ink layer under the hero | Pill → Ink | Join the two: the pill's final frame hands over to the ink hero's canvas |
| 1 | Claim | "I train language agents, then measure whether they hold up on real work." | The sentence is written token by token, with rejected words standing in depth | Typist (Damon's) | Reduce to the one sentence, scroll-driven, system colours, "Illustrative probabilities" caption |
| 2 | Work | Six things shipped | A carton folds, travels and unpacks onto a shelf; each parcel unfolds in place into its case study | Parcel film + Parcels | Case studies open inside the page, not on a separate route |
| 3 | Test | Reliability compounds | The visitor rolls a d20 twenty times; the die unfolds into a tally of their own run | d20 | None |
| 4 | Evidence | Eight real figures | The type board's figures rise into towers, then the camera levels them into a labelled chart | Evidence + City (Damon's) | Use only résumé figures; log scale labelled; the ≈90% rate is not drawn as a count |
| 5 | Path | Where it was learned | A typographic table; the mark moves down it as the timeline | Path | Small: the mark as the "now" marker |
| 6 | Notes | What was written down | Opening a note un-crumples a printed sheet; leaving it crumples it away | Paper | Apply the crumple to note pages instead of to sections |
| 7 | Close | A record, and a way to reply | The visit prints as a receipt: chapters as line items, the d20 result, a tear-off stub with the email | Receipt (Damon's) | Print real visit data; drop invented values; stamp wording confirmed by Damon |

Three studies become **modes** of the whole site instead of chapters:

| Mode | What it does | Source | Where it lives |
| --- | --- | --- | --- |
| Guided | "Let the agent drive": the page operates itself, asks before anything risky, and ends as a trace | Agent | A button in the top bar; off by default |
| Short | The 60-second version for someone in a hurry: one stage, six live cards | Bento | `/short`, linked from the hero and the top bar |
| Night | The same site after hours: dark palette, particle sky behind the hero | Night | A theme switch; follows the system setting once, then remembers |

Left in `/lab` as studies, not part of the site: Descent, Rollout, the brown Parcel, Shadow, Arena, the eight concept boards. Shadow theatre is the one exception worth a second use: the 404 page (a wire whose shadow spells "404").

Damon's **Studio Lens** stays as the way to swap a chapter for an alternative take, reachable from `/lab` and from a quiet control, never shown by default.

## 4. The mark

One magenta dot, about 14 px at rest. It is the only use of magenta on the page.

| Chapter | The mark is… | Handoff to the next chapter |
| --- | --- | --- |
| Arrival | the point where the hairline starts | stays as the cursor's ink source |
| Claim | the full stop of the sentence | drops off the line as the page scrolls |
| Work | the round sticker on the carton | peels off the last parcel |
| Test | the "1" face of the die | the face flattens into a dot in the tally |
| Evidence | the dagger marking internal measurements | slides to the head of the Path table |
| Path | the "now" marker | follows the reader into Notes as the bullet of the latest note |
| Notes | the pin holding the sheet | lands on the receipt |
| Close | the stamp on the receipt | — |

Implementation: one fixed, absolutely positioned element driven by scroll, docking to a `data-mark` target in each chapter (the docking helper in `src/engine/dock.js` already does this for the films). Where a chapter draws the mark inside WebGL (sticker, die face), the DOM element hides while the mesh shows, and they swap at the same pixel position, as the films already do for text.

## 5. Architecture

**One chapter contract.** Every chapter is a React component that:
- renders a complete static version first (readable with reduced motion, without WebGL, and to a screen reader);
- upgrades to its film when it is about one viewport away (the `Deferred` wrapper on the home page already does this);
- exposes `data-mark` targets for the mark;
- owns at most one canvas, inside its own pinned viewport.

**One WebGL context at a time.** Chapters release their renderer when they are more than two viewports away. This matters on phones, which lose contexts when there are several.

**Porting.** Pill, Parcels, Agent and Paper are standalone vanilla pages. Their logic moves into `src/chapters/<name>/` behind the contract; the standalone pages stay in `/lab` untouched as the reference. Typist, City and Receipt are already React but timer- and button-driven; they get a scroll-driven chapter wrapper and lose the invented values.

**Routes.** `/` (the run), `/work/<slug>` (deep link that opens a parcel), `/notes/<slug>`, `/short`, `/lab`, and a real 404. Deep links must work on a static host; the redirect files already exist.

**State.** One small store for: language, theme (day/night), mode (guided or not), the d20 seed and result, and the list of chapters visited. The receipt and the agent's trace both read from it.

**Budgets.**

| Measure | Target |
| --- | --- |
| JS before first paint on `/` | ≤ 100 kB gzip (now 97) |
| three.js | never loaded before the Work chapter is near |
| Live WebGL contexts | ≤ 1 |
| Total scroll length of `/` | ≤ 30 viewports on desktop, ≤ 22 on phones |
| Each film | reversible from scroll; rests without rendering |

## 6. Phases

Each phase ends with something to look at, and the site stays shippable after every one.

| Phase | What gets built | Size | Done when |
| --- | --- | --- | --- |
| A. Skeleton ✅ done 2026-11-17 | Chapter contract, the mark as a DOM element docking through the *existing* home page, the store, `/short` route pointing at Bento | Small | The mark travels hero → statement → carton sticker → die → Evidence → Path → Contact with no jumps, forward and back |
| B. Work in place ✅ done 2026-11-17 | Parcels shelf and case studies inside `/`; `/work/<slug>` deep links | Medium | All six parcels open and close in the page by mouse, keyboard and URL; the standalone `/lab/parcels/` still works |
| C. Close ✅ done 2026-11-17 | Receipt as the last chapter, printing the real visit (chapters seen, d20 result) with the email stub | Medium | The receipt's lines match what the visitor actually did; no invented values |
| D. Arrival ✅ done 2026-11-17 | Pill reveal handing over to the ink hero | Small | One continuous opening under 2.5 s, skippable, shown once per session |
| E. Claim ✅ done 2026-11-17 | The typed sentence replaces the grey-to-black statement | Medium | Written within 1.5 screens of scroll; plain text at rest; un-writes on scroll back |
| F. Evidence | Type board → towers → chart | Medium | The final frame is a correct labelled chart; the axis is visible in every state |
| G. Notes ✅ done 2026-11-18 | Crumpled-sheet transition on note pages | Medium | Opening and leaving a note are reversible; text is real DOM at rest |
| H. Modes | Guided (agent) and Night | Medium each | Guided never moves before the visitor has oriented and always shows "Take over"; Night passes the same contrast audit as day |
| I. Finish | Whole-site check, accessibility audit, phone pass, performance | Small | The checks in `docs/reviews/2026-11-15-site-qa.md` pass on the assembled site |

Suggested order: A, B, C first. Those three alone turn the current page into a site with a beginning, a middle that opens up, and an ending that remembers the visit. D–G each replace one existing chapter with a stronger one and can be judged one at a time. H is optional.

## 7. What gets cut, and why

- **Descent and Rollout** make the same point as the d20 (reliability, measured). One is enough, and the die is the one visitors act on.
- **The brown Parcel** is superseded by the white carton.
- **Arena and Shadow** stay studies; Shadow gets the 404.
- **The type-only Statement** is replaced by the typed sentence, if phase E is judged better. It stays as that chapter's static fallback.
- **"More ways in"** shrinks to one line linking to `/lab`, since the best studies are now in the site itself.

## 8. Risks

| Risk | What to do about it |
| --- | --- |
| Too many effects in a row | The rule of one device per chapter, a hard scroll-length budget, and calm chapters (Path, Notes list) between heavy ones |
| It feels like a demo reel, not a person | Every device carries a real fact; the receipt and trace reflect the visitor's own visit |
| Phones | Static-first chapters, one WebGL context, shorter pins; test on a real phone before phase D |
| Porting four vanilla pages breaks them | Keep the originals in `/lab` as the reference and compare screenshots |
| Invented numbers creeping back in | Only values from `src/content.js`; anything illustrative is captioned as such |
| Guided mode annoys | Off by default; first step waits; any input pauses it |

## 9. Decisions needed from Damon before building

1. Is the eight-chapter run in section 3 the right spine, or should a chapter be dropped or swapped?
2. Magenta as the single mark: yes, or another colour (tangerine was the original dot)?
3. Typist, City and Receipt are his studies. May they be adapted as described (scroll-driven, system colours, résumé values only)?
4. Night as a theme of the same site, or kept as a separate study?
5. The receipt stamp: "PAID IN EVIDENCE", other wording, or none.
6. Still open from before: current employer and city, the real email, the domain and host.

## 9a. Decisions made (2026-11-16)

Damon answered: 1 and 2 "try to impress me" (Claude chooses), 3 yes, 4 Night stays a separate study, 5 "impress me" (Claude chooses).

| # | Decision |
| --- | --- |
| 1 | The eight-chapter run in section 3 stands as the spine. |
| 2 | The mark is **magenta** `#ff2d8a`. It is already the carton's sticker and the die's failing face, so two handoffs exist before any new work; tangerine stays out of the site. |
| 3 | Typist, City and Receipt may be adapted: scroll-driven, system colours, résumé values only. Damon's originals stay at their routes. |
| 4 | **Night is not a mode.** It stays at `/lab/night/`. Section 3's mode table is now Guided and Short only, and phase H is Guided only. |
| 5 | The receipt stamp reads **"HELD UP ON REAL WORK"**, the last words of his own sentence, so the site ends by stamping the claim it opened with. It is the mark's final form. |

## 10. Size

Phases A–C are roughly the size of one earlier round (three subagent builds). D–G are one build each. H is two. I is one pass. At the pace so far that is three to four working sessions under the 70% usage rule, with a judgement point for Damon after A–C and after each of D–G.
