# Fieldwork portfolio

Independent rebuild for Damon Guan. Branch: codex/fieldwork-portfolio.
The older worktree and its uncommitted changes were left untouched.

## Direction

An editorial research portfolio: warm paper, deep green, terracotta, Instrument
Serif and DM Sans. The mathematical surface connects research to practice;
it supports the introduction instead of replacing it.

The site has a native-scrolling homepage, four case studies, seven essays, and
a matching 404. Research and career information comes from lib/content.ts,
which was not rewritten in this redesign. Case-study evidence retains its
internal scope and disclosure. Card diagrams illustrate concepts, not
measurements or production interfaces.

## Structure

- app/page.tsx composes the shared shell, hero, selected work, research, notes,
  and biography.
- components/fieldwork owns the current design. Older components are retained
  but not mounted by the new pages.
- Most page content renders on the server. Client islands are the mobile menu,
  clipboard button, and dynamically imported hero scene.
- surface-math.ts supplies both WebGL geometry and the SVG fallback.
- The R3F canvas uses on-demand rendering, a capped device pixel ratio, and
  pointer/scroll interpolation. Listeners clean up with their Canvas instance.
- Mobile widths, reduced motion, absent JavaScript, and WebGL failures preserve
  the complete content and a static mathematical study.
- Fonts are local; their OFL licenses are included in public/fonts.

## Run and verify

Development: npm run dev (127.0.0.1:4193).
Production: npm run build, then npm start -- --hostname 127.0.0.1 --port 4193.

- npm run lint
- npm run typecheck
- npm run build
- npm run test:fieldwork
- npm run test:fieldwork:audit

Both browser scripts accept BASE_URL and QA_OUTPUT environment variables.
They require an installed Playwright Chromium browser. The flow suite covers
pointer-driven rendering and idle frames, real link clicks, case and note
reading, clipboard, keyboard, mobile menu, rapid resizing, reduced motion,
context loss, and no-JavaScript content.

The audit derives all public routes from the sitemap, includes a real 404,
and checks 320px, 768px, and 1440px widths. It verifies response status,
unique headings, overflow, fragment targets, browser errors, and automated
WCAG A/AA checks using axe. Automated accessibility checks do not replace
manual screen-reader testing.

## Review

An independent review reproduced and caught a stale WebGL context-loss
listener during rapid responsive changes, plus insufficient contrast in
small labels. Both were corrected and retested. Primary visuals were
inspected at desktop and phone sizes after fonts and motion settled.

Existing judge:* scripts describe previous designs and are retained for
reference; test:fieldwork and test:fieldwork:audit are the current regression
contract. External papers and social destinations are preserved from the
existing content source; this pass does not reverify their published claims.

## Final verification — 2026-09-05

- TypeScript, ESLint, and the production build passed.
- 10 browser end-to-end flows passed against the production server on 4193.
- 14 routes × 3 widths = 42 layout/route checks passed.
- Automated WCAG A/AA checks passed across all 14 routes.
- No unhandled browser errors were observed.
- Independent review found no remaining P1/P2 findings after remediation.
- Desktop, mobile, work, paper, note, biography, footer, and sharing-card
  screenshots were inspected. No external messages or deployment were made.
