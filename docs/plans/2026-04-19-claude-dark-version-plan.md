# Claude-Inspired Dark Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Claude DESIGN.md-inspired dark theme (default) with light/dark toggle, using the existing `.dark` CSS variable mechanism. Dark theme is the priority; light theme remains unchanged.

**Architecture:** Keep `:root` (light) tokens as-is. Populate the existing `.dark` block with Claude warm-dark values. Build a ThemeToggle component. Migrate all hardcoded Tailwind color classes to CSS variable references so both themes work. Replace legacy drop shadows with Claude ring-shadow system in dark mode.

**Tech Stack:** Vite, React 19, React Router, Tailwind CSS v4, Framer Motion, Lucide.

**Branch:** Create `feature/claude-dark-theme` from current `feature/ui-experiments`. All work on the new branch. Do not merge until Task 10 passes.

---

## 1) Scope

### In Scope
- Dark theme as default visual mode (Claude DESIGN.md warm-dark palette).
- Light/dark toggle via ThemeToggle component with `localStorage` persistence.
- Full route coverage: `/`, `/about`, `/projects`, `/blog`, `/blog/:slug`.
- Claude warm-dark palette, terracotta CTA hierarchy, ring-shadow depth model.
- Migration of all hardcoded Tailwind color classes to CSS variable references.
- UI primitive internal defaults update for dark compatibility.

### Out of Scope
- Light theme redesign (keep current light palette as-is).
- Typography/spacing/layout changes (keep current Cartograph CF + Geist stack).
- New page routes or content changes.

---

## 2) Token Contract

### 2.1 Light Theme (`:root`) — UNCHANGED
The existing light tokens remain as-is:
```
--bg: #faf7f2;  --surface: #fffdf9;  --surface-soft: #f3ede4;
--text: #111827;  --muted: #4b5563;  --muted-strong: #1f2937;
--line: #e8dfd3;  --primary: #2563eb;  --primary-strong: #1d4ed8;
--shadow-soft: 0 10px 25px rgba(0,0,0,0.05);
```

### 2.2 Dark Theme (`.dark`) — Claude DESIGN.md Values
Source: `DESIGN.md` Section 2 "Color Palette & Roles"

| Token | Value | DESIGN.md Role |
|-------|-------|----------------|
| `--bg` | `#141413` | Deep Dark — page background |
| `--surface` | `#1c1c1a` | Derived between Deep Dark and Dark Surface for card fills (avoids jarring jump to `#30302e`) |
| `--surface-soft` | `#262523` | Derived for subtle section contrast |
| `--surface-strong` | `#30302e` | Dark Surface — nav borders, heavy containers |
| `--text` | `#f5f4ed` | Parchment — primary text on dark |
| `--muted` | `#87867f` | Stone Gray — secondary/metadata text |
| `--muted-strong` | `#b0aea5` | Warm Silver — emphasized secondary text |
| `--line` | `#30302e` | Border Dark |
| `--primary` | `#c96442` | Terracotta Brand — primary CTA |
| `--primary-strong` | `#d97757` | Coral Accent — hover/active CTA |
| `--focus` | `#3898ec` | Focus Blue — the only cool color (accessibility) |

**Derived values note:** `--surface` and `--surface-soft` are interpolated between `#141413` and `#30302e`. DESIGN.md only defines these two endpoints; the intermediates are necessary for card/section layering without the visual jump `#30302e` creates against `#141413`.

### 2.3 Ring Shadow Tokens (`.dark` only)
Source: `DESIGN.md` Section 6, hex values from Section 2 "Semantic & Accent"

```
--ring: #d1cfc5              /* Ring Warm — default interactive ring */
--ring-strong: #c2c0b6       /* Ring Deep — hover/active ring */
--ring-accent: #c96442       /* Terracotta ring for primary CTA */
```

### 2.4 Shadow Depth Model (`.dark`)
Source: `DESIGN.md` Section 6 "Depth & Elevation" — 5 levels

| Level | Treatment | Use Case |
|-------|-----------|----------|
| Flat | No shadow | `--bg` background, inline text |
| Contained | `1px solid var(--line)` | Standard cards, section borders |
| Ring | `0 0 0 1px var(--ring)` | Interactive cards, buttons, hover |
| Whisper | `rgba(0,0,0,0.15) 0px 4px 24px` | Elevated feature cards, hero image |
| Inset | `inset 0 0 0 1px rgba(176,174,165,0.15)` | Active/pressed button states |

### 2.5 Nav Shadow Token (`.dark`)
```
--shadow-nav: 0 16px 40px -34px rgba(0,0,0,0.5)
--shadow-soft: rgba(0,0,0,0.15) 0px 4px 24px
```

---

## 3) Implementation Tasks

### Task 1: Baseline Audit
**Files:** Verify only

**Steps:**
1. Run `npm run lint` and `npm run build`. Record pass/fail.
2. Run `npm run dev` and visually inspect all 5 routes.
3. Generate full hardcoded color migration list:
   ```bash
   rg -n "bg-white|text-blue-|hover:text-blue-|text-zinc-|bg-zinc-|bg-cyan-|bg-amber-|bg-emerald-|bg-pink-|text-red-|bg-sky-|bg-indigo-|text-sky-|text-indigo-|border-blue-|border-sky-|border-indigo-|bg-neutral-|text-neutral-|border-neutral-|shadow-md|shadow-\[|grayscale" src/components src/index.css
   ```

**Done when:**
- Baseline build/lint status recorded.
- Full migration list generated and saved.

---

### Task 2: Dark Theme Tokens in CSS
**Files:** Modify `src/index.css`

**Steps:**
1. Populate the existing `.dark` block with corrected token values from Section 2.2.
2. Add ring shadow tokens from Section 2.3.
3. Add shadow depth tokens from Section 2.4–2.5.
4. Add `--color-ring`, `--color-ring-strong`, `--color-ring-accent` aliases.
5. Keep `:root` (light theme) completely unchanged.
6. Verify `@custom-variant dark (&:is(.dark *));` is present at top of file.

**Done when:**
- `.dark` block contains all tokens from Section 2.2–2.5.
- Light theme renders identically to current state.
- `--surface` is `#1c1c1a`, `--muted` is `#87867f`, `--muted-strong` is `#b0aea5`.

---

### Task 3: ThemeToggle Component
**Files:** Create `src/components/ThemeToggle.jsx`

**Steps:**
1. Create a Sun/Moon toggle button using Lucide icons (`Sun`, `Moon`).
2. On mount: read `localStorage.getItem('theme')`, fall back to `prefers-color-scheme: dark` (dark as default).
3. On toggle: toggle `.dark` class on `<html>`, persist to `localStorage`.
4. Style: `bg-[var(--surface-soft)] rounded-full p-2 text-[var(--muted)] hover:text-[var(--text)]` with ring border.
5. Add to `Navbar.jsx` between nav links and Connect button.

**Done when:**
- Toggle switches between light and dark themes instantly.
- Preference persists across page reloads.
- Default is dark (new visitors see dark theme).
- Sun icon in dark mode, Moon icon in light mode.

---

### Task 4: Shell Conversion (Layout/Navbar/Footer)
**Files:**
- Modify: `src/components/Navbar.jsx`
- Modify: `src/components/Footer.jsx`

**Steps:**
1. **Navbar**: Replace `bg-white/86` → `bg-[var(--bg)]/86`, `bg-white/24` → `bg-[var(--bg)]/24`, `text-zinc-700` → `text-[var(--muted)]`, `text-zinc-900` → `text-[var(--text)]`.
2. **Navbar Connect button**: `bg-white text-zinc-900` → `bg-[var(--surface-soft)] text-[var(--muted-strong)]` with `0 0 0 1px var(--ring)` in dark.
3. **Navbar shadow**: Replace hardcoded `[box-shadow:rgba(19,19,22,...)]` → `shadow-[var(--shadow-nav)]` in dark.
4. **Footer**: Replace `bg-white` buttons → `bg-[var(--surface-soft)] text-[var(--muted-strong)]` with ring border. `text-zinc-500` → `text-[var(--muted)]`.
5. Insert ThemeToggle into Navbar.

**Done when:**
- `rg -n "bg-white|text-zinc-|hover:text-zinc" src/components/Navbar.jsx src/components/Footer.jsx` returns zero matches.
- Shell looks correct in both light and dark.

---

### Task 5: Hero + BackgroundPathsCTA Conversion
**Files:**
- Modify: `src/components/Hero.jsx`
- Modify: `src/components/ui/background-paths.tsx`

**Steps:**
1. **Hero ambient glow**: `bg-cyan-300/25` → `bg-[#c96442]/15`, `bg-amber-300/20` → `bg-[#d97757]/12`.
2. **Hero white overlay**: `rgba(255,255,255,0.9)` → use CSS variable or `rgba(var(--bg-rgb),0.9)`. Alternative: override with `.dark` class using `rgba(20,20,19,0.9)`.
3. **Status badge**: `border-[var(--color-line)]` already tokenized, OK.
4. **AnimatedGradientText**: Change `colorFrom="#0ea5e9"` → `colorFrom="#c96442"`, `colorTo="#ef4444"` → `colorTo="#d97757"` in dark mode.
5. **ShimmerButton** ("Work With Me"): Already dark, keep as-is.
6. **"Watch on YouTube" button**: `bg-white text-zinc-900` → `bg-[var(--surface-soft)] text-[var(--muted-strong)]` with ring border.
7. **Social pills**: `text-zinc-700 hover:bg-zinc-900 hover:text-zinc-50` → `text-[var(--muted)] hover:bg-[var(--primary)] hover:text-[var(--surface)]`.
8. **Hero image**: Spotlight `from-cyan-200` → `from-[#c96442]/20` in dark. Gradient overlay `from-zinc-950/35 to-white/25` → `from-black/50 to-transparent` in dark.
9. **BackgroundPathsCTA**: "Start a conversation" → `bg-[var(--primary)] text-[#faf9f5]` with `0 0 0 1px var(--ring-accent)`. "Watch on YouTube" → `bg-[var(--surface-soft)]/60 text-[var(--muted-strong)]`.

**Done when:**
- `rg -n "cyan|amber|bg-white|text-zinc" src/components/Hero.jsx src/components/ui/background-paths.tsx` returns zero matches.
- Hero feels warm-editorial in dark, unchanged in light.

---

### Task 6: Home Content Sections
**Files:**
- Modify: `src/components/sections/WhatIDo.jsx`
- Modify: `src/components/sections/FeaturedProjects.jsx`
- Modify: `src/components/sections/WritingPreview.jsx`

**Steps:**
1. Replace `text-blue-700` → `text-[var(--primary)]`, `hover:text-blue-800` → `hover:text-[var(--primary-strong)]` in all three files.
2. Replace `hover:shadow-md` → `hover:shadow-[0_0_0_1px_var(--ring-strong)]` on cards.
3. Replace outlined buttons (`text-zinc-900 [box-shadow:rgba(24,24,27,...)] hover:bg-zinc-900 hover:text-zinc-50`) → `text-[var(--text)] [box-shadow:0_0_0_1px_var(--ring)] hover:bg-[var(--primary)] hover:text-[var(--surface)]`.
4. Replace `group-hover:text-blue-700` → `group-hover:text-[var(--primary)]`.

**Done when:**
- `rg -n "text-blue-|hover:text-blue-|text-zinc-|shadow-md" src/components/sections/` returns zero matches.
- Cards use ring shadows, CTAs use terracotta.

---

### Task 7: Inner Pages (Projects/Blog/BlogPost)
**Files:**
- Modify: `src/components/Projects.jsx`
- Modify: `src/components/Blog.jsx`
- Modify: `src/components/BlogPost.jsx`

**Steps:**
1. Same pattern as Task 6: blue → `--primary`, zinc → tokens, shadow-md → ring.
2. Convert filter pills to `border-[var(--line)] text-[var(--muted)]` with ring hover.
3. Convert search inputs to `bg-[var(--surface)] border-[var(--line)] text-[var(--text)]` with `--focus` ring on focus.
4. Convert article cards to `bg-[var(--surface)]` + ring shadow hover.

**Done when:**
- `rg -n "text-blue-|bg-white|text-zinc-|shadow-md" src/components/Projects.jsx src/components/Blog.jsx src/components/BlogPost.jsx` returns zero matches.
- Inner pages match homepage visual language.

---

### Task 8: About + Timeline
**Files:**
- Modify: `src/components/About.jsx`
- Modify: `src/components/ui/timeline.tsx`

**Steps:**
1. **About.jsx TRACK_STYLES** (lines 13–44): Replace all `border-blue-*`, `bg-blue-*`, `border-sky-*`, `bg-sky-*`, `border-indigo-*`, `bg-indigo-*`, `text-sky-700`, `text-indigo-700` with warm palette variants. Map: blue → `--primary` (terracotta), sky → `#3d8c7a` (muted warm green), indigo → `#8b6f47` (warm brown).
2. **About.jsx layout**: Replace `border-zinc-200/90`, `text-zinc-950`, `text-zinc-500`, `text-zinc-600` → tokenized equivalents.
3. **timeline.tsx**: Replace `bg-white dark:bg-black` → `bg-[var(--surface)]`. Replace `bg-neutral-200 dark:bg-neutral-800` → `bg-[var(--surface-soft)]`. Replace `border-neutral-*` → `border-[var(--line)]`. Replace `text-neutral-500` → `text-[var(--muted)]`. Replace `from-sky-500 via-blue-500` → `from-[var(--primary)] via-[var(--primary-strong)]`.

**Done when:**
- `rg -n "blue-|sky-|indigo-|zinc-|neutral-|bg-white" src/components/About.jsx src/components/ui/timeline.tsx` returns zero matches.
- Timeline and track colors are warm-toned in dark mode.

---

### Task 9: UI Primitive Defaults
**Files:**
- Modify: `src/components/ui/animated-gradient-text.tsx`
- Modify: `src/components/ui/spotlight.tsx`

**Steps:**
1. **AnimatedGradientText**: Change default `colorFrom`/`colorTo` to warm tones. Or accept override props (Hero already passes custom colors).
2. **Spotlight**: Change default gradient `from-zinc-50 via-zinc-100 to-zinc-200` → accept className prop override or change defaults to warm neutrals.

**Excluded (do NOT modify):**
- `shimmer-button.tsx` — Hero passes custom props, defaults don't matter.
- `bento-grid.tsx` — Not used in current pages.
- `animated-loading-skeleton.tsx` — Not used in current pages.

**Done when:**
- Spotlight and AnimatedGradientText render correctly in dark mode without manual prop overrides on every usage.

---

### Task 10: Full Hardcoded Color Sweep + QA
**Files:** Search scope: `src/components/**/*.jsx`, `src/components/**/*.tsx`

**Steps:**
1. Run comprehensive grep:
   ```bash
   rg -n "bg-white|text-blue-|hover:text-blue-|text-zinc-|bg-zinc-|bg-cyan-|bg-amber-|bg-emerald-|bg-pink-|text-red-500|bg-sky-|bg-indigo-|text-sky-|text-indigo-|border-blue-|border-sky-|border-indigo-|bg-neutral-|text-neutral-|border-neutral-|shadow-md" src/components src/index.css
   ```
2. Verify remaining matches are only in excluded UI primitives or intentional exceptions.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Manual responsive pass at `375px`, `768px`, `1280px` in both light and dark.
6. Keyboard focus pass on all interactive elements in dark mode.
7. Contrast check: `--text` on `--bg` (target ≥ 4.5:1), `--muted` on `--surface` (target ≥ 3:1), CTA states.
8. Toggle test: switch theme on each route, verify no flash of wrong theme, verify persistence.

**Done when:**
- `npm run lint` and `npm run build` pass.
- All routes correct in both themes.
- No hardcoded cool-tone color classes remain in page components.
- Focus indicators visible on all interactive elements.

---

## 4) Acceptance Criteria

- Dark theme is the default for new visitors.
- ThemeToggle switches light ↔ dark instantly, persists in `localStorage`.
- Token contract in `.dark` matches Section 2.2 exactly.
- `BackgroundPathsCTA` uses terracotta CTA + ring-shadow in dark.
- Legacy `shadow-md` replaced with ring shadows in dark.
- Zero hardcoded `text-blue-*`, `bg-white`, `text-zinc-*` in page components (UI primitives excluded).
- All routes visually consistent in both themes on mobile/tablet/desktop.
- `npm run lint` and `npm run build` pass.

---

## 5) Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Old utility classes reintroduce cool tones | Grep gate in Task 10 catches all Tailwind color classes |
| Flat look after removing drop shadows | Ring hierarchy (`--ring`, `--ring-strong`, `--ring-accent`) + whisper shadow for elevated cards |
| Contrast drops with Stone Gray body copy | Use `--muted-strong` (`#b0aea5`) for body blocks; `--muted` (`#87867f`) for metadata only. Verify ≥ 3:1 contrast |
| Task 2 `.dark` tokens break nothing | `.dark` only activates when `<html>` has `.dark` class. Light theme untouched until toggle |
| UI primitives with hardcoded light defaults | Task 9 covers the two that matter (Spotlight, AnimatedGradientText) |
| About page track colors look wrong with warm palette | Use three distinct warm tones (terracotta, muted green, warm brown) instead of blue/sky/indigo |
| Theme flash on page load (FOUC) | ThemeToggle reads `localStorage` synchronously in `<script>` or useEffect with `useSyncExternalStore` |

---

## 6) Execution Order

```
Task 1  → Baseline audit
Task 2  → CSS dark tokens (safe: only activates with .dark class)
Task 3  → ThemeToggle component
Task 4  → Shell (Navbar, Footer)
Task 5  → Hero + BackgroundPathsCTA
Task 6  → Home sections (WhatIDo, FeaturedProjects, WritingPreview)
Task 7  → Inner pages (Projects, Blog, BlogPost)
Task 8  → About + Timeline
Task 9  → UI primitives (Spotlight, AnimatedGradientText)
Task 10 → Full sweep + QA
```

Tasks 6–8 can run in parallel. Task 9 can run in parallel with 6–8. Task 10 must be last.
