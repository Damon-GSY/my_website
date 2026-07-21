# Damon — Agent systems, under control

Personal portfolio for Damon Guan (publication name: Shengyue Guan), an LLM Algorithm Engineer working across agentic RL, post-training, evaluation, and production agent systems.

The homepage moves through a real Three.js optimization landscape before opening into selected work, research, field notes, and Damon's professional trajectory. Content is centralized in `lib/content.ts`; the legacy Vite application is not part of the current runtime.

## Stack

- Next.js 15 and React 19
- TypeScript
- Tailwind CSS 4
- Three.js with React Three Fiber
- Framer Motion

## Local development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4175/` for local review.

The development build uses `.next-dev`, so running `npm run build` does not overwrite the live development runtime.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

The `judge:*` scripts cover scene resilience, perceptual depth, portfolio content, case studies, field notes, navigation, mobile behavior, accessibility, metadata, performance, architecture, and design anti-patterns. They are regression gates—not a substitute for human visual review.

## Project map

- `app/` — Next routes, metadata, long-form notes, and case-study pages
- `components/` — homepage chapters and the scroll-driven WebGL scene
- `lib/content.ts` — verified profile, work, research, writing, and experience data
- `public/assets/` — optimized optimization-landscape imagery
- `scripts/` — project-specific regression judges

The production build currently generates the homepage, four case studies, seven field notes, a custom 404, sitemap, robots file, and a person-led Open Graph image.
