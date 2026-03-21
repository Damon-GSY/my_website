# Website Redesign - Design Document

Date: 2026-03-21

## Overview

Personal website for Damon - minimalist, dark theme, with strategic visual impact.

## Architecture

- **Framework**: Vite + React (keep existing)
- **Routing**: None - single page with anchor navigation
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: English only (i18n deferred)

## Page Structure

```
Hero → About → Projects → Footer
```

### 1. Hero Section

**Components:**
- Shader animation (background layer, low opacity)
- GlowyWaves (foreground wave effect)
- VaporizeText (text cycle: "I Build AI" → "I Share AI" → "I Love AI")
- TextShimmer (subtitle)
- CTA button

**Design Principle:** Text is the hero, effects are background. Readability first.

### 2. About Section

Brief personal introduction. Simple, clean typography.

### 3. Projects Section

**Layout:** Bento Grid (irregular card grid)

**Source:** 21st.dev BentoGridWithFeatures component

**Content:** Project cards with title, description, and visual

### 4. Footer

- Social links
- Copyright

## Components to Use

| Component | Source | Section |
|-----------|--------|---------|
| Shader Animation | 21st.dev | Hero background |
| GlowyWaves | 21st.dev | Hero foreground |
| VaporizeText | 21st.dev | Hero title animation |
| TextShimmer | 21st.dev | Hero subtitle |
| Bento Grid | 21st.dev | Projects |

## Dark Theme Strategy

All components from 21st.dev target light themes. Adaptation required:
- Replace hardcoded light colors with CSS variables
- Use Tailwind dark: variants where possible
- Test all components on dark background

## Deferred Features

- i18n (Chinese language support)
- Contact form
- Videos section
- Newsletter
- Blog

## File Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui + custom components
│   ├── sections/
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Projects.jsx
│   │   └── Footer.jsx
│   └── Layout.jsx
├── data/
│   └── projects.js   # Project data for Bento Grid
├── App.jsx
└── main.jsx
```

## Success Criteria

1. Hero section renders with all effects without performance issues
2. Bento Grid displays projects responsively
3. Dark theme is consistent across all sections
4. Page loads fast (lazy load heavy components)
5. Mobile responsive
