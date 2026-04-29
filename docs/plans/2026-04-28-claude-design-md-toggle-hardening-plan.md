# Claude Design.md Toggle Hardening Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Keep the existing light/dark toggle architecture and harden the site using Claude DESIGN.md guidance, focusing on P0 UX/accessibility/tech-debt first.

**Architecture:** Treat current implementation as baseline (do not reset). Apply delta changes only: token quality fixes, mobile navigation, ARIA/SEO, animation/perf reductions, and dependency cleanup. Preserve FOUC guard + `localStorage` + `prefers-color-scheme` fallback.

**Tech Stack:** Vite, React 19, React Router, Tailwind CSS v4, Framer Motion.

---

## Direction Decision

1. Keep toggle system (existing work is valid).
2. Do not switch to pure-dark-only architecture in this iteration.
3. Prioritize P0 issues discovered by agents before additional visual refinements.

---

## Current Verified Baseline

1. Toggle exists and is wired:
   - `src/components/ThemeToggle.jsx`
   - `src/components/Navbar.jsx`
2. Dark token values already moved toward agent recommendations:
   - `--color-surface: #1e1d1b`
   - `--color-text-muted: #97968f`
   - `--color-line: #3d3c3a`
3. Both animation packages are currently in use:
   - `framer-motion` imports in route components
   - `motion/react` imports in multiple UI components (`blur-fade.tsx`, `spotlight.tsx`, `timeline.tsx`, etc.)
4. `package.json` contains removable or consolidatable deps pending audit (`motion`, `styled-components`, `three`, `next-themes`, `@splinetool/*`, `simplex-noise`, `@base-ui/react`).

---

## Task 1: Freeze Design Contract (No Rollback)

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/Projects.jsx`
- Modify: `src/components/ui/animated-gradient-text.tsx`
- Modify: `index.html` (FOUC script fix)

**Steps:**
1. Keep current dark token baseline (`#1e1d1b`, `#97968f`, `#3d3c3a`) — do NOT roll back.
2. Align both themes to terracotta family:
   - **Dark accent:**
     - `--color-accent: #c96442` (DESIGN.md Terracotta Brand)
     - `--color-accent-strong: #d97757` (DESIGN.md Coral Accent)
     - **Usage restriction:** `#c96442` for CTA buttons, brand moments, large text only (>=3:1). `#d97757` for text accents, links on all dark surfaces (>=4.5:1 on all backgrounds). Document this in CSS comments.
     - `#a8785c` / `#b88a72` demoted to **decorative-only** (ambient glow at <=25% opacity, image frame accents). Never used for interactive elements or gradient text.
   - **Light accent:**
     - `--color-accent: #9a4e2e` (deep terracotta, 5.609:1 on `#faf7f2`)
     - `--color-accent-strong: #9a4e2e` (same value in light mode — single safe token for both roles)
     - Remove `#2563eb` (blue) from `:root` entirely.
3. Replace all hardcoded accent hex values in `Hero.jsx`:
   - `bg-[#a8785c]/10` → `bg-[var(--primary)]/10` (ambient glow: token follows theme)
   - `bg-[#b88a72]/8` → `bg-[var(--primary-strong)]/8`
   - `colorFrom="#a8785c"` → `colorFrom="var(--primary)"` (gradient text: MUST use brand accent)
   - `colorTo="#b88a72"` → `colorTo="var(--primary-strong)"`
   - `from-[#a8785c]/15` → `from-[var(--primary)]/15` (spotlight tint)
   - `rgba(168,120,92,0.25)` → keep as decorative (image frame glow, subtle is correct here)
   - `rgba(184,138,114,0.24)` → keep as decorative
4. Replace hardcoded blue in `Projects.jsx`:
   - `rgba(14,165,233,0.08)` → `rgba(201,100,66,0.08)` (terracotta glow matching theme)
5. Update `animated-gradient-text.tsx` default props:
   - `colorFrom = "var(--primary)"`, `colorTo = "var(--primary-strong)"`
6. Update `@media print` accent values to match final terracotta tokens.
7. Fix FOUC script in `index.html` to include `prefers-color-scheme` fallback:
   ```js
   (function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.add(window.matchMedia('(prefers-color-scheme: light)').matches?'':'dark')}}catch(e){document.documentElement.classList.add('dark')}})()
   ```
8. Keep accessibility focus blue (`#3898ec`) unchanged.
9. Add CSS comments documenting ring policy and accent usage restrictions.

**Done when:**
- `npm run build` passes.
- `rg '#a8785c|#b88a72|#2563eb|#1d4ed8|rgba\(14,165,233' src/components src/index.css` returns zero matches in active route-tree files.
- Contrast ratios verified: `#c96442` on `#141413` >= 4.5:1, `#d97757` on `#1e1d1b` >= 4.5:1, `#9a4e2e` on `#faf7f2` >= 4.5:1.
- Toggle works in both directions.
- **Visual check:** Run `npm run dev` and visually verify both themes render correctly (terracotta accents visible, no broken gradients, no regressions from brown→terracotta shift).

---

## Task 2: P0 Mobile Navigation

**Files:**
- Modify: `src/components/Navbar.jsx`

**Steps:**
1. Add hamburger menu trigger button for `< sm` breakpoints using `Menu` icon from lucide-react.
2. Implement accessible slide-out sheet:
   - `aria-expanded` on trigger button
   - `aria-controls` linking to sheet panel
   - `role="dialog"` and `aria-modal="true"` on sheet
   - Escape key closes sheet
   - Backdrop click closes sheet
   - Body scroll lock when open
3. Sheet contains all primary navigation links (Home, Projects, Blog, About).
4. Clicking a link closes the sheet and navigates.
5. Match dark/light token styles, no separate palette.
6. Place hamburger before ThemeToggle + Connect in the right flex container.

**Done when:**
- All 5 routes accessible on viewports < 640px.
- Keyboard-only users can open/close via Tab + Enter + Escape.
- `aria-expanded` toggles correctly.

---

## Task 3: P0 Accessibility Sweep

**Files:**
- Modify: `src/components/Navbar.jsx` — add `aria-label="Main navigation"`
- Modify: `src/components/Hero.jsx` — add `aria-labelledby="hero-heading"` to section, `id="hero-heading"` to h1
- Modify: `src/components/Blog.jsx` — add `aria-label="Search articles"` to search input
- Modify: `src/components/Footer.jsx` — add `aria-label="Social links"` to footer nav
- Review: `src/components/sections/*.jsx`, `src/components/Projects.jsx`, `src/components/BlogPost.jsx`

**Steps:**
1. Add missing `aria-label` to all icon-only buttons and links.
2. Ensure no clickable `div` — use `<button>` or `<a>` with proper semantics.
3. Ensure `focus-visible` ring (`var(--focus)`) is consistent and visible in both themes.
4. Confirm `aria-pressed` on ThemeToggle remains correct.
5. Verify card components have consistent click targets (entire card vs title-only).

**Done when:**
- `rg 'role="button"|onClick.*div' src/components` returns zero results for interactive divs.
- Every `<nav>` has a unique `aria-label`.
- Every `<input>` has `aria-label` or associated `<label>`.

---

## Task 4: SEO Foundation

**Files:**
- Modify: `index.html`

**Steps:**
1. Update `<title>` tag to reflect branding (e.g., "Damon — Agent Systems & AI Research").
2. Update meta description to match Hero content (Agent Systems, RL, AI Research — not generic "productivity").
3. Add Open Graph tags:
   - `og:type`, `og:title`, `og:description`, `og:image`, `og:url`
3. Add Twitter Card tags:
   - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
4. Add `<link rel="canonical">` placeholder.
5. Add JSON-LD structured data for Person profile.

**Done when:**
- All OG and Twitter tags present with non-empty content.
- JSON-LD validates at validator.schema.org.

---

## Task 5: CTA Hierarchy Cleanup (P1)

**Files:**
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/ui/background-paths.tsx`
- Modify: `src/components/Footer.jsx`

**Steps:**
1. Dedup LinkedIn links: Hero "Work With Me" and BackgroundPathsCTA "Start a conversation" both go to LinkedIn. Keep Hero CTA, simplify BackgroundPathsCTA to a different action (e.g., email or remove duplicate).
2. Each section keeps max 1 primary CTA + 1 secondary CTA.
3. Social links (LinkedIn, Bilibili, YouTube) remain in Hero but with reduced visual weight (no larger than body text).
4. Standardize CTA button styles:
   - Primary: `bg-[var(--primary)] text-[var(--bg)]` with `ring-accent`
   - Secondary: `bg-[var(--surface-soft)] text-[var(--muted-strong)]` with `ring`

**Done when:**
- LinkedIn URL appears max 2 times on homepage (Hero + Footer).
- No two visually identical primary buttons compete in same viewport.

---

## Task 6: Dependency and Dead-Code Cleanup

**Files:**
- Modify: `package.json`
- Delete: `src/components/Button/`, `src/components/Card/`, `src/components/Loader/`, `src/components/Social/`
- Delete: `src/components/index.js` (barrel file, never imported by routes)
- Delete: dead UI components (see list below)
- Modify: all files importing from `motion/react` → migrate to `framer-motion`

**Steps:**
1. Delete dead component directories:
   - `src/components/Button/` (AnatomyButton, ColorPicker, ShinyButton, ReactionButton)
   - `src/components/Card/` (MapCard)
   - `src/components/Loader/` (RingLoader)
   - `src/components/Social/` (SocialButtons)
   - `src/components/index.js` barrel file
2. Delete dead UI components:
   - `src/components/ui/aceternity/` (entire directory)
   - `src/components/ui/magicui/` (entire directory — duplicates root-level components)
   - `src/components/ui/animated-beam.tsx`
   - `src/components/ui/animated-loading-skeleton.tsx`
   - `src/components/ui/bento-grid.tsx`
   - `src/components/ui/button.tsx`
   - `src/components/ui/shader-animation.tsx`
   - `src/components/ui/shape-landing-hero.tsx`
   - `src/components/ui/spline.tsx`
   - `src/components/ui/vaporize-text.tsx`
   - `src/components/ui/wavy-background.tsx`
   - `src/components/ui/magic-card.tsx` (uses `next-themes`, not in route tree)
   - `src/components/ui/container-scroll-animation.tsx` (not in route tree)
3. Unify animation imports — migrate all `motion/react` imports to `framer-motion`:
   - `blur-fade.tsx`
   - `spotlight.tsx`
   - `timeline.tsx`
   - `animated-gradient-text.tsx`
   - Validate with `rg "from ['\"]motion" src/` returning zero.
4. Remove unused dependencies from `package.json`:
   - `motion` (unified to `framer-motion`)
   - `styled-components`
   - `three`
   - `next-themes`
   - `@splinetool/react-spline`
   - `@splinetool/runtime`
   - `simplex-noise`
   - `@base-ui/react`
5. Run `npm install` to regenerate `package-lock.json`.
6. Run `npm run build` to verify no import errors.

**Done when:**
- `npm run build` passes.
- `rg "from ['\"]motion/" src/` returns zero (all unified to `framer-motion`).
- `rg "styled-components|next-themes|@splinetool|simplex-noise|@base-ui" src/` returns zero.
- Bundle gzip size reduced by >= 100KB (three.js alone is ~600KB uncompressed).
- `src/components/Button/`, `Card/`, `Loader/`, `Social/`, `index.js` directories deleted.

---

## Task 7: Animation and Performance Hardening (P1)

**Files:**
- Modify: `src/components/ui/spotlight.tsx`
- Modify: `src/components/ui/background-paths.tsx`

**Steps:**
1. Fix `spotlight.tsx` event listener lifecycle leak:
   - Store `mouseenter` and `mouseleave` handler references in `useRef` or `useCallback` with stable identity
   - `removeEventListener` must reference the exact same function that was added
   - Verify cleanup runs on unmount
2. Reduce `background-paths.tsx` path count from 72 to 24 (12 per direction):
   - Keep visual density similar by spreading remaining paths
   - Reduce `strokeOpacity` max from ~0.85 to ~0.5
3. Ensure `prefers-reduced-motion` path is respected (already global in index.css — verify).

**Done when:**
- Spotlight listeners attach/detach correctly (verify with DevTools Event Listeners panel).
- BackgroundPaths renders <= 24 animated paths.
- `npm run build` passes.

---

## Task 8: Verification Gates

**Files:**
- Verify only: full app

**Steps:**
1. Run:
   - `npm run lint`
   - `npm run build`
2. Build size comparison gate:
   - Record current build output sizes before starting
   - Compare with final build: report total gzip delta and largest chunk delta
   - Target: gzip reduction >= 100KB
3. Run grep gates:
   - `rg '#a8785c|#b88a72|#2563eb|rgba\(14,165,233' src/components src/index.css` — zero matches
   - `rg "from ['\"]motion/" src/` — zero matches
   - `rg 'aria-label="Main navigation"' src/components/Navbar.jsx` — one match
   - `rg 'aria-label="Search articles"' src/components/Blog.jsx` — one match
4. Manual smoke test:
   - Desktop: toggle between themes, verify both look correct
   - Mobile (< 640px): hamburger menu opens/closes, all routes accessible
   - Keyboard-only: Tab through all interactive elements, verify focus ring visible
   - All 5 routes render without console errors

**Done when:**
- All grep gates pass.
- All manual smoke tests pass.
- Bundle impact measured and documented.
- No P0 issue remains open.

---

## Execution Order

1. Task 1 (design contract freeze + FOUC fix)
2. Task 2 (mobile navigation)
3. Task 3 (accessibility sweep)
4. Task 4 (SEO)
5. Task 5 (CTA cleanup)
6. Task 6 (dead-code/dependency cleanup)
7. Task 7 (perf hardening)
8. Task 8 (final verification)

---

## Contrast Ratio Reference

Verified by color contrast expert (WCAG 2.x):

| Foreground | Background | Ratio | AA Normal | AA Large |
|---|---|---|---|---|
| `#c96442` | `#141413` (dark bg) | 4.726:1 | PASS | PASS |
| `#c96442` | `#1e1d1b` (dark surface) | 4.316:1 | FAIL | PASS |
| `#c96442` | `#2a2926` (dark surface-soft) | 3.731:1 | FAIL | PASS |
| `#d97757` | `#141413` | 5.906:1 | PASS | PASS |
| `#d97757` | `#1e1d1b` | 5.393:1 | PASS | PASS |
| `#9a4e2e` | `#faf7f2` (light bg) | 5.607:1 | PASS | PASS |
| `#9a4e2e` | `#f5f4ed` (DESIGN.md Parchment) | 5.437:1 | PASS | PASS |
| `#9a4e2e` (light accent-strong) | `#faf7f2` (light bg) | 5.609:1 | PASS | PASS |
