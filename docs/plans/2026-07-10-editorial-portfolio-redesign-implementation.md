# Editorial Portfolio Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an information-first editorial homepage whose optimization-landscape scene uses scroll-driven depth and light to guide attention through Damon’s real work.

**Architecture:** Keep the current React routes and data modules, but replace the homepage composition with five editorial sections. Isolate the image, GSAP perspective animation, dynamically imported p5 particles, and reduced-motion fallback in one visual component so content components stay simple and testable.

**Tech Stack:** React 19, Vite 6, Tailwind CSS 4, CSS, GSAP/ScrollTrigger, anime.js 4, p5.js 2, Framer Motion, Playwright browser verification.

---

### Task 1: Establish Ralph stories, dependencies, and the visual asset

**Files:**
- Create: `.omc/prd.json`
- Create: `.omc/progress.txt`
- Create: `src/assets/optimization-landscape.png`
- Modify: `package.json`
- Modify: `package-lock.json`

**Step 1: Write the Ralph PRD**

Create section-sized stories for foundation/hero, selected work, research,
writing/contact, and full regression. Every story must include concrete desktop,
mobile, reduced-motion, information-clarity, and screenshot-review criteria.

**Step 2: Record the baseline**

Write the current branch, passing baseline build/lint, supplied image path, and
the first pending story to `.omc/progress.txt`.

**Step 3: Install only the approved animation dependencies**

Run: `npm install p5 animejs`

Expected: both packages appear in `dependencies`; the install finishes without
peer dependency errors.

**Step 4: Copy the supplied image into the application**

Copy `/Users/damon/Downloads/gdamon0208_A_scientific_visualization_of_an_optimization_land_83636679-68fb-428b-a208-a08ad142daab_1.png`
to `src/assets/optimization-landscape.png` without recompression.

**Step 5: Verify the foundation**

Run: `npm run build`

Expected: Vite exits with code 0 and emits the image as a production asset.

**Step 6: Commit**

```bash
git add .omc/prd.json .omc/progress.txt package.json package-lock.json src/assets/optimization-landscape.png
git commit -m "chore: prepare editorial portfolio redesign"
```

### Task 2: Build the scroll-driven optimization landscape hero

**Files:**
- Create: `src/components/visuals/OptimizationLandscape.jsx`
- Modify: `src/components/Hero.jsx`
- Modify: `src/index.css`

**Step 1: Add a failing browser assertion**

Add a temporary verification that requires the first viewport to contain
“Damon Guo-Shiyu”, “LLM Engineer”, “Alibaba”, “Agent systems”, a projects link,
and an email/contact link. It must also require one landscape image and one
decorative canvas on motion-capable desktop.

**Step 2: Run it against the old homepage**

Expected: FAIL because the old hero does not expose Damon’s full name and has no
optimization-landscape scene.

**Step 3: Implement `OptimizationLandscape`**

- Render the supplied image as the base terrain plane.
- Add a soft reflected layer and a separate light-spot element.
- Use a scoped GSAP timeline with ScrollTrigger to adjust `rotateX`, `scale`,
  vertical translation, and light position over the hero scroll range.
- Dynamically import p5 and render sparse copper particles that follow a bounded
  terrain-like curve.
- Pass scroll progress through a ref so p5 does not trigger React renders.
- Remove the p5 instance and revert the GSAP context on unmount.
- Skip p5 and continuous transforms for `prefers-reduced-motion: reduce`.

**Step 4: Rewrite `Hero.jsx` around identity**

Place Damon’s full name, Alibaba role, location, focus sentence, selected-work
link, contact link, and compact factual proof in the image’s negative space.
Remove the research-desk dashboard, fake runtime metrics, live status copy,
marquee dependency, and other cockpit elements.

**Step 5: Add anime.js entrance choreography**

Animate only the hero eyebrow, name lines, description, and actions. Use opacity
and transform, scope selectors to the hero, and revert the scope on unmount.

**Step 6: Verify desktop, mobile, and reduced motion**

Expected:
- 1440 × 1000 contains the required identity facts and actions above the fold.
- 390 × 844 has no horizontal overflow and the image does not cover the text.
- Reduced motion shows the same content and a static landscape.
- No console errors occur during mount, scroll, route change, or unmount.

**Step 7: Capture screenshots and request Codex visual review**

The review prompt must require a literal description of the screenshot before
judging information clarity, visual harmony, and attention guidance.

**Step 8: Commit**

```bash
git add src/components/Hero.jsx src/components/visuals/OptimizationLandscape.jsx src/index.css
git commit -m "feat: build optimization landscape hero"
```

### Task 3: Replace the cockpit flow with selected work

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/sections/Work.jsx`
- Modify: `src/index.css`

**Step 1: Add a failing browser assertion**

Require a `Selected work` section with three project entries sourced from
`src/data/projects.js`, each exposing a title, real description/outcome, and a
route to more work.

**Step 2: Run it against the existing homepage**

Expected: FAIL because the current homepage is wrapped in the Agent OS rail and
the work presentation uses the cockpit/carousel language.

**Step 3: Simplify `HomePage`**

Compose Hero, Work, ResearchPath, Journal, and Contact directly. Remove the
marquee, Agent OS chapter state, sticky rail, Capabilities, and SystemShowcase
from the homepage composition without deleting reusable routes or data.

**Step 4: Rewrite `Work.jsx`**

Render an asymmetric editorial list using the first three representative
projects. Use problem/contribution/outcome hierarchy, restrained dividers, and
one clear link to `/projects`. Add a section light marker whose position updates
only when a project becomes active in the viewport.

**Step 5: Verify**

Expected: real projects are readable without interaction; links work; keyboard
focus is visible; mobile ordering matches DOM ordering; no horizontal carousel
is required to access content.

**Step 6: Screenshot and Codex review**

Require the critic to identify the project titles and state whether the visual
effect supports or obscures the project outcomes.

**Step 7: Commit**

```bash
git add src/App.jsx src/components/sections/Work.jsx src/index.css
git commit -m "feat: present selected work as editorial cases"
```

### Task 4: Add the research and experience narrative

**Files:**
- Create: `src/components/sections/ResearchPath.jsx`
- Modify: `src/index.css`

**Step 1: Add a failing browser assertion**

Require visible references to Alibaba, MSRA, NUS, UNSW, and the research count,
all sourced from `src/data/about.js`.

**Step 2: Run it**

Expected: FAIL because no dedicated homepage research/experience narrative
exists.

**Step 3: Implement `ResearchPath`**

Render the real timeline as an editorial sequence. Use one highlighted current
role, progressively quieter earlier entries, and a compact education/research
summary. Do not create cards for every year.

**Step 4: Add restrained reveal motion**

Use anime.js or the existing Framer Motion dependency for a short stagger when
the section first enters. Do not create another scroll-scrubbed scene.

**Step 5: Verify and review**

Expected: all institutions are visible, their chronology is understandable,
mobile reading order is correct, and Codex can describe Damon’s career path from
the screenshot.

**Step 6: Commit**

```bash
git add src/components/sections/ResearchPath.jsx src/index.css
git commit -m "feat: add research and experience narrative"
```

### Task 5: Unify writing, contact, and navigation

**Files:**
- Modify: `src/components/sections/Journal.jsx`
- Modify: `src/components/sections/Contact.jsx`
- Modify: `src/components/Navbar.jsx`
- Modify: `src/components/Footer.jsx`
- Modify: `src/index.css`

**Step 1: Add failing browser assertions**

Require latest post titles/dates, a link to `/blog`, the existing email address,
LinkedIn/GitHub/YouTube/Bilibili links, and the current-route navigation state.

**Step 2: Simplify visual language**

- Convert Journal to a spacious editorial index.
- Replace the aurora contact card with a direct concluding statement and channel
  row that uses the same copper light language.
- Remove the navbar’s live clock, online pulse, and rounded dashboard capsule.
- Keep the mobile menu, skip link, active-route indication, theme toggle, and
  keyboard behavior.
- Align the footer with the reduced navigation vocabulary.

**Step 3: Verify interaction and accessibility**

Expected: navigation and external links resolve; mobile menu opens/closes with
Escape; focus is visible; link names are meaningful; no dead `#` links exist.

**Step 4: Screenshot and Codex review**

Require a literal visual description plus a judgement on whether the homepage
now feels like one personal portfolio rather than assembled product components.

**Step 5: Commit**

```bash
git add src/components/sections/Journal.jsx src/components/sections/Contact.jsx src/components/Navbar.jsx src/components/Footer.jsx src/index.css
git commit -m "feat: unify portfolio writing and contact surfaces"
```

### Task 6: Full regression, deslop, and Ralph completion

**Files:**
- Modify: `.omc/prd.json`
- Modify: `.omc/progress.txt`
- Modify: only changed implementation files if fixes are required

**Step 1: Run static verification**

Run: `npm run lint`

Expected: exit code 0.

Run: `npm run build`

Expected: exit code 0 with no missing imports or oversized synchronous p5 chunk.

**Step 2: Run browser regression**

Verify `/`, `/about`, `/projects`, `/blog`, one `/blog/:slug`, `/uses`, and a
missing route at desktop and mobile sizes. Check console errors, horizontal
overflow, headings, links, and reduced motion.

**Step 3: Record motion evidence**

Capture the hero scroll sequence and confirm that the terrain moves in depth,
the light spot guides attention, and the effect never blocks text or scrolling.

**Step 4: Run the Codex critic against all acceptance criteria**

Include every changed file and related caller/data file. Ask whether a
meaningfully simpler or more maintainable solution exists and require PASS.

**Step 5: Run the scoped deslop pass and regress again**

Clean only files changed in this redesign. Re-run lint, build, browser checks,
and the final screenshot review after any cleanup edits.

**Step 6: Complete Ralph records**

Mark a story passing only after fresh evidence satisfies every criterion. Write
commands, screenshot paths, reviewer artifact, and key implementation learnings
to `.omc/progress.txt`, then clean transient Ralph state.

**Step 7: Commit**

```bash
git add .omc/prd.json .omc/progress.txt src package.json package-lock.json
git commit -m "feat: complete editorial portfolio redesign"
```

