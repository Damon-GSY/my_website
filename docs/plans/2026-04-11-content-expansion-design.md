# Content Expansion Design: Blog + Projects Pages

**Date**: 2026-04-11
**Status**: Draft
**Approach**: Content-First Extension (方案 A)

---

## Problem Statement

Current site has strong visual design but lacks content depth. Hero says "I build AI" but there's no proof — no projects, no writing. Users land, scroll, and leave with no reason to return. The narrative is a pitch deck without the portfolio.

## Design Principles

1. **Content drives structure** — pages exist to showcase work, not to fill space
2. **Zero visual regression** — keep current design tokens, fonts, animations
3. **Static-first data** — project/blog data as JS arrays, migrate to MDX later
4. **Incremental delivery** — each page ships independently

---

## Page Structure

### Routes

```
/               → Home (Hero → Now → Featured Projects → Writing Preview → CTA)
/about          → Timeline (keep as-is)
/projects       → Project showcase grid
/blog           → Blog post list
/blog/:slug     → Individual blog post
```

### Navbar Update

```
Damon.     Home | Projects | Blog | About     Connect
```

Add `Projects` and `Blog` as `Link` components (react-router-dom). Keep `Connect` as external LinkedIn link.

---

## Home Page Restructure

### Current Flow (4 sections, flat)
```
Hero → What I'm Doing Now (cards + images) → What I Do (services) → Proof of Work → CTA
```

### New Flow (5 sections, narrative arc)
```
Hero                    — Keep as-is (strong first impression)
↓
What I'm Doing Now      — Keep 3 text cards, remove the duplicate image row (lines 113-139)
↓
Featured Projects       — NEW: 3-4 project cards with title, description, tech tags, link
↓                         CTA: "View all projects →"
Writing Preview         — NEW: latest 3 blog post titles + dates
↓                         CTA: "Read more →"
Let's Build CTA         — Keep existing
```

**Narrative logic**: Hook attention → Show what's active → Prove capability → Show depth → Convert

### WhatIDo.jsx Changes

- Remove the image grid section (lines 113-139) — it reuses `heroImage` three times with slow zoom animations, adds visual noise without information
- Keep the "What I'm doing now" cards and "What I do" services
- Remove "Proof of work" section — replaced by Featured Projects
- Add two new sections: FeaturedProjects + WritingPreview

---

## Projects Page (`/projects`)

### Layout

Full-width bento-style grid using existing card patterns. NOT the dark-themed `BentoGrid` component (which uses zinc-800/900 backgrounds) — instead use light-theme cards consistent with current design tokens.

### Card Design

Each project card:
- Title: `type-headline`, `text-lg font-semibold`
- Description: 1-2 sentences, `text-[var(--muted)]`
- Tags: pill badges using `rounded-full border border-[var(--color-line)]` pattern (already used in WhatIDo)
- Link: external arrow icon + URL
- Hover: subtle elevation (`shadow-soft` + `translateY(-1px)`), matching Atlassian's elevation transition pattern

### Data Structure

```js
// src/data/projects.js
export const projects = [
  {
    id: 'agent-eval-benchmark',
    title: 'Agent Evaluation Benchmark',
    description: 'Multi-turn agent evaluation framework for supply-chain workflows.',
    tags: ['Python', 'RL', 'Evaluation'],
    category: 'research',      // research | open-source | side-project
    href: 'https://github.com/...',
    featured: true,
  },
  // ...
];
```

### Filtering

Simple pill-style filter tabs: All / Research / Open Source / Side Project. Client-side filter on `category` field.

---

## Blog Page (`/blog`)

### Layout

Chronological list with generous whitespace. Each entry:
- Title: `type-headline`, linked to `/blog/:slug`
- Date: monospace metadata treatment (per Vercel/Geist research finding) — `font-mono text-xs text-[var(--muted)]`
- Tags: same pill badges as projects
- Excerpt: 2-line preview

### Data Structure

```js
// src/data/posts.js
export const posts = [
  {
    slug: 'why-agent-evaluation-is-hard',
    title: 'Why Agent Evaluation Is Hard',
    date: '2026-04-10',
    excerpt: 'Lessons from building multi-turn evaluation benchmarks for real workflows.',
    tags: ['Agents', 'Evaluation'],
    content: '...',  // Markdown/HTML string for now
  },
  // ...
];
```

### Blog Post Page (`/blog/:slug`)

Simple article layout:
- Max-width prose container (640px)
- Title + date + tags at top
- HTML content rendered below
- Back to blog link at bottom
- Use `dangerouslySetInnerHTML` for static content now, migrate to MDX later

---

## Implementation Details

### New Files

```
src/
  data/
    projects.js              — Static project data array
    posts.js                 — Static blog post data array
  components/
    Navbar.jsx               — MODIFIED: add Projects, Blog links
    sections/
      WhatIDo.jsx            — MODIFIED: remove image grid, remove Proof of Work
      FeaturedProjects.jsx   — NEW: homepage featured projects section
      WritingPreview.jsx     — NEW: homepage blog preview section
    Projects.jsx             — NEW: /projects page
    Blog.jsx                 — NEW: /blog list page
    BlogPost.jsx             — NEW: /blog/:slug detail page
  App.jsx                    — MODIFIED: add routes
```

### Design Token Usage

All new components use existing CSS variables:
- `var(--color-background)` (#faf7f2) for page backgrounds
- `var(--color-surface)` (#fffdf9) for card backgrounds
- `var(--color-line)` (#e8dfd3) for borders
- `var(--color-text-primary)` (#111827) for headings
- `var(--color-text-muted)` (#4b5563) for body text
- `var(--font-display)` for section titles
- `var(--font-headline)` for card titles

### Animation Pattern

Follow existing Framer Motion pattern from WhatIDo.jsx:
```js
const reveal = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1],
};
```

Use `motion.div` with `whileInView`, `viewport={{ once: true }}`, and staggered delays.

---

## Acceptance Criteria

- [ ] `/projects` renders project cards from `src/data/projects.js`
- [ ] `/blog` renders post list from `src/data/posts.js`
- [ ] `/blog/:slug` renders individual post content
- [ ] Homepage includes Featured Projects section (3-4 cards)
- [ ] Homepage includes Writing Preview section (3 posts)
- [ ] Homepage image grid section removed from WhatIDo
- [ ] Navbar shows Home | Projects | Blog | About links
- [ ] All new pages use existing design tokens (no new CSS custom properties)
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Mobile responsive (tested at 375px, 768px, 1024px)

---

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Content gap — no real projects/posts to show | Use 3-4 placeholder entries, clearly marked as "coming soon" |
| BentoGrid component is dark-themed | Don't use it. Build light-theme cards with existing token system |
| Blog post rendering complexity | Start with HTML strings, migrate to MDX when needed |
| Over-engineering filtering | Simple client-side `.filter()` on category field, no state management library |

---

## Research Synthesis

From 3 parallel research agents studying design systems:

### Applicable Patterns (Using Now)
- **Subtle card elevation** (Vercel/Geist): `border-color` transition + minimal shadow on hover
- **Monospace metadata** (Vercel/Geist): dates, tags, tech stack in `font-mono` at reduced opacity
- **Framer Motion stagger** (existing pattern): consistent `reveal` animation across new sections

### Deferred Patterns (Later)
- **Dark mode tokens** (shadcn): site already has `.dark` tokens defined, implement toggle later
- **Command palette** (shadcn): useful when content grows, overkill now
- **Timeline component** (Primer): already have timeline in About page

### Rejected Patterns
- **Atlassian elevation system**: 4 levels is overkill for a personal site
- **OKLCH color space**: current HSL/RGB tokens work fine
- **Compound Card components**: unnecessary abstraction for static data display
