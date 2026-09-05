# Damon Guan — Curiosity, made useful.

Personal portfolio for Damon Guan (publication name: Shengyue Guan), an LLM Algorithm Engineer working across agentic RL, post-training, evaluation, and production agent systems.

An editorial portfolio in warm paper, forest green, and terracotta. A pointer- and scroll-responsive mathematical surface introduces four project case studies, three papers, seven field notes, and Damon's background. Content is centralized in `lib/content.ts`; the legacy Vite application is not part of the current runtime.

## Stack

- Next.js 15 and React 19
- TypeScript
- Tailwind CSS 4
- Three.js with React Three Fiber
- Locally hosted Instrument Serif and DM Sans

## Local development

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:4193/` for this isolated worktree review. The previous 4175 and 4187 previews are not used by this branch.

The development build uses `.next-dev`, so running `npm run build` does not overwrite the live development runtime.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm run test:fieldwork
npm run test:fieldwork:audit
```

Browser tests require a running server and Playwright Chromium. They accept `BASE_URL` and `QA_OUTPUT`; the default report directory is `/tmp/fieldwork-qa`. To test production, run `npm start -- --hostname 127.0.0.1 --port 4193` after building (stop the dev server first).

The current acceptance set covers 10 end-to-end flows and 42 route/viewport combinations, including automated accessibility checks. Historical `judge:*` scripts describe previous designs and are retained for reference, not as this branch's design contract. See [the architecture and verification notes](docs/fieldwork-redesign.md).

## Project map

- `app/` — Next routes, metadata, long-form notes, and case-study pages
- `components/fieldwork/` — the current homepage, shared shell, and on-demand WebGL scene
- `lib/content.ts` — verified profile, work, research, writing, and experience data
- `public/fonts/` — self-hosted typography and OFL licenses
- `scripts/fieldwork-*.mjs` — the current browser regression suites

The production build currently generates the homepage, four case studies, seven field notes, a custom 404, sitemap, robots file, and a person-led Open Graph image.
