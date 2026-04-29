# Claude Design.md Pure Dark Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the website into a single-theme, Claude DESIGN.md-inspired warm dark experience (no runtime light/dark toggle), while preserving current content and routes.

**Architecture:** Centralize all visual semantics into one dark token system in `src/index.css`, then migrate components route-by-route from hardcoded colors/shadows to token-driven styles. Replace heavy/glossy shadows with Claude-style ring depth and reduce continuous animations to keep the editorial reading rhythm.

**Tech Stack:** Vite, React 19, React Router, Tailwind CSS v4, Framer Motion, Lucide.

---

## Source of Truth (Design References)

Use only the following as style authority:

1. `reference/awesome-design-md/design-md/claude/DESIGN.md` Section 2 (Color Palette & Roles)
2. `reference/awesome-design-md/design-md/claude/DESIGN.md` Section 3 (Typography Rules)
3. `reference/awesome-design-md/design-md/claude/DESIGN.md` Section 4 (Buttons, cards, nav)
4. `reference/awesome-design-md/design-md/claude/DESIGN.md` Section 6 (Depth & Elevation)
5. `reference/awesome-design-md/design-md/claude/DESIGN.md` Section 7 (Do/Don’t)

---

## Guardrails

1. Single theme only: no toggle, no `localStorage` theme preference, no runtime `html.dark` switching.
2. No cool-gray primary neutrals; warm neutrals only.
3. Terracotta (`#c96442`) is CTA/accent color, not a general text color.
4. Ring-depth first: prefer `0 0 0 1px` ring over floating `shadow-md`.
5. Typography hierarchy: serif authority for major headings, sans for UI/body.

---

## Token Contract (Pure Dark)

Implement these as the active default semantic tokens:

1. `--bg: #141413`
2. `--surface: #1c1c1a`
3. `--surface-soft: #262624`
4. `--surface-strong: #30302e`
5. `--text: #faf9f5`
6. `--muted: #87867f`
7. `--muted-strong: #b0aea5`
8. `--line: #30302e`
9. `--primary: #c96442`
10. `--primary-strong: #d97757`
11. `--focus: #3898ec`
12. `--ring: rgba(176,174,165,0.22)`
13. `--ring-strong: rgba(176,174,165,0.34)`
14. `--ring-accent: rgba(201,100,66,0.42)`

---

## Task 1: Baseline Audit and Inventory

**Files:**
- Verify only: repo root

**Steps:**
1. Run `npm run lint`.
2. Run `npm run build`.
3. Run color/shadow inventory:
   - `rg -n "bg-white|text-zinc-|bg-zinc-|text-blue-|hover:text-blue-|shadow-md|shadow-\\[" src/components src/index.css`
4. Record baseline screenshots for:
   - `/`
   - `/about`
   - `/projects`
   - `/blog`
   - `/blog/:slug`

**Done when:**
- Baseline quality and migration list are documented.

---

## Task 2: CSS Token Unification

**Files:**
- Modify: `src/index.css`

**Steps:**
1. Make pure dark semantic tokens active in `:root`.
2. Remove dual-theme ambiguity from `.dark` branch (or leave inert compatibility block, but no runtime dependency).
3. Keep typography variables and container/radius scale intact.
4. Add explicit ring/focus helper variables used by components.

**Done when:**
- Global style renders dark correctly without adding a `.dark` class.
- Token values exactly match the contract above.

---

## Task 3: Remove Theme Switching Surface

**Files:**
- Modify: `src/components/Navbar.jsx`
- Delete or archive: `src/components/ThemeToggle.jsx`

**Steps:**
1. Remove `ThemeToggle` import and usage from navbar.
2. Delete unused toggle component if no references remain.
3. Confirm no theme persistence logic remains.

**Done when:**
- `rg -n "ThemeToggle|localStorage\\.getItem\\('theme'\\)|classList\\.add\\('dark'\\)" src` returns no active theme-switch usage.

---

## Task 4: Shell Styling (Layout, Navbar, Footer)

**Files:**
- Modify: `src/components/Layout.jsx`
- Modify: `src/components/Navbar.jsx`
- Modify: `src/components/Footer.jsx`

**Steps:**
1. Convert shell backgrounds and text to tokenized classes (`--bg`, `--surface-soft`, `--text`, `--muted`).
2. Update Connect/Follow buttons to ring model:
   - default: `0 0 0 1px var(--ring)`
   - hover: `0 0 0 1px var(--ring-strong)`
3. Keep nav sticky behavior, reduce blur intensity if readability/performance drops.

**Done when:**
- No hardcoded `zinc`/`white` colors in shell components.
- Shell hierarchy is visually coherent with Claude dark.

---

## Task 5: Hero + Background CTA Strip

**Files:**
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/ui/background-paths.tsx`
- Optional simplify: `src/components/ui/shimmer-button.tsx`
- Optional simplify: `src/components/ui/spotlight.tsx`
- Optional simplify: `src/components/ui/blur-fade.tsx`

**Steps:**
1. Replace cool neon accents with terracotta/coral warm accents.
2. Convert CTA styles:
   - primary: terracotta + accent ring
   - secondary: surface + neutral ring
3. Reduce continuous animation complexity:
   - remove heavy infinite path animations
   - keep one subtle ambient motion at most
4. Preserve clear information hierarchy (headline, subtext, CTA).

**Done when:**
- Hero reads editorial warm dark, not neon/glossy.
- CTA strip follows same button system as navbar/footer.

---

## Task 6: Home Sections Migration

**Files:**
- Modify: `src/components/sections/WhatIDo.jsx`
- Modify: `src/components/sections/FeaturedProjects.jsx`
- Modify: `src/components/sections/WritingPreview.jsx`

**Steps:**
1. Replace blue link accents with `--primary` and `--primary-strong`.
2. Replace card `shadow-md` patterns with ring hover patterns.
3. Normalize tags/chips to warm neutral borders and muted text tokens.

**Done when:**
- Home sections no longer use blue/zinc utility colors.
- Hover feedback is subtle and consistent.

---

## Task 7: Secondary Pages Migration

**Files:**
- Modify: `src/components/Projects.jsx`
- Modify: `src/components/Blog.jsx`
- Modify: `src/components/BlogPost.jsx`

**Steps:**
1. Convert filters/cards/inputs/links to tokenized dark styles.
2. Ensure search/focus states use `--focus` (visible, accessible).
3. Keep metadata hierarchy clear:
   - title: `--text`
   - body: `--muted-strong`
   - metadata/tag/date: `--muted`

**Done when:**
- Secondary pages match home visual language.
- No legacy white/blue/zinc classes remain.

---

## Task 8: About + Timeline Harmonization

**Files:**
- Modify: `src/components/About.jsx`
- Modify: `src/components/ui/timeline.tsx`

**Steps:**
1. Remove light-card islands; use `--surface`/`--surface-soft`.
2. Replace cool track chips with warm palette variants.
3. Ensure timeline spine/dot contrast works on dark background.

**Done when:**
- About page is no longer visually detached from the rest of the site.

---

## Task 9: Motion and Accessibility Pass

**Files:**
- Review all major interactive components

**Steps:**
1. Keep motion mostly `opacity + transform`.
2. Remove/limit expensive infinite animations.
3. Add or verify `focus-visible` ring (`--focus`) on all keyboard-reachable controls.
4. Verify `prefers-reduced-motion` fallback behavior.
5. Confirm tap targets at least `44x44` where practical.

**Done when:**
- Keyboard navigation and focus clarity are reliable.
- Motion no longer harms readability or performance.

---

## Task 10: Verification and Release Gate

**Files:**
- Verify only: full app

**Steps:**
1. Run `npm run lint`.
2. Run `npm run build`.
3. Run targeted grep gates:
   - `rg -n "text-blue-|hover:text-blue-|bg-white|text-zinc-|bg-zinc-|shadow-md" src/components`
4. Manual smoke pass all 5 routes on desktop and mobile width.
5. Compare against DESIGN.md principles:
   - warm neutral palette
   - terracotta CTA hierarchy
   - ring-depth model
   - serif/sans hierarchy

**Done when:**
- All gates pass and visual output matches Claude dark intent.

---

## Risks and Mitigations

1. Risk: Overusing terracotta weakens emphasis.
- Mitigation: restrict terracotta to CTA and high-signal links.

2. Risk: Flat appearance after removing heavy shadows.
- Mitigation: rely on ring contrast, spacing rhythm, and section layering.

3. Risk: Legacy utility classes reintroduce cool tones.
- Mitigation: enforce grep gate before merge.

4. Risk: Performance issues from decorative animation.
- Mitigation: reduce infinite animations and keep one ambient motion max.

---

## Recommended Execution Rhythm

1. Day 1: Task 1-3 (baseline + token unification + remove toggle)
2. Day 2: Task 4-5 (shell + hero + CTA strip)
3. Day 3: Task 6-8 (home + secondary pages + about/timeline)
4. Day 4: Task 9-10 (a11y/perf pass + final verification)

