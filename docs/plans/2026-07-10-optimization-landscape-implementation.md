# Optimization Landscape Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use frontend-design and browser:control-in-app-browser to implement and verify this plan task-by-task.

**Goal:** Rebuild Damon's portfolio as a cinematic, scroll-driven single-page journey through an optimization landscape while preserving the personal facts and contact routes from `main`.

**Architecture:** A 520vh document contains one sticky 100svh viewport. `src/App.tsx` owns the scene data, scroll-progress state, eased animation loop, layered image transforms, two narrative phases, responsive navigation, and accessible reduced-motion fallback. Four local raster assets are composited with screen blending, masks, depth-specific scale/translation, atmosphere, and optical falloff to simulate a dolly through one continuous mathematical world.

**Tech Stack:** React 19, TypeScript 5, Tailwind CSS 4, Vite 6, browser-native `requestAnimationFrame` and CSS transforms.

---

### Task 1: Establish the visual branch and assets

1. Create a branch from `main` without touching unrelated work.
2. Copy the four supplied images into deterministic project asset names.
3. Verify dimensions and optimize delivery size after visual validation.

### Task 2: Build the sticky viewport

1. Add the TypeScript app entry and keep interaction logic in `src/App.tsx`.
2. Drive four image layers, particles, light, camera scale, and text transitions from one eased scroll value.
3. Preserve Damon's verified role, location, education, focus areas, and contact routes.
4. Keep all component styling co-located as `CSSProperties`; use Tailwind only for responsive visibility and layout.

### Task 3: Verify

1. Run TypeScript, ESLint, and the production build.
2. Inspect the beginning, middle, end, and mobile layout in a browser when local browser security permits.
3. Confirm no runtime errors and document any verification constraint.
