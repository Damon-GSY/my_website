# Personal portfolio adaptations

The pasted designs are visual references for Damon's personal website. Their adapted pages use the existing biography, research, projects, writing, and contact destinations rather than the reference brands or product claims.

## Pages

- `/particle`: the blue particle sphere, tree, reflective water, and cube lead into a personal portfolio with selected projects, biography, notes, and contact.
- `/robot`: the cobalt and white helmet assembly becomes an agent-themed personal portfolio with selected work, research background, notes, and contact.
- `/html-studies/index.html`: comparison of the two personal sites, with smaller links to the preserved original references.
- `/`: the motion-study index exposes direct links to both personal sites above the image experiments.

The original `/html-studies/anchor-original.html` and `/future-machine.html` remain reference artifacts. Future Machine's no-scroll, single-file constraint applies to that original; its personal adaptation is a complete scrolling portfolio.

## Content sources

| Content | Existing source |
| --- | --- |
| Alibaba work, NUS and UNSW education, earlier experience | `src/data/about.js` |
| Selected work and project descriptions | `src/data/projects.js` |
| Article titles, excerpts, and destinations | `src/data/posts.js` |
| Email, GitHub, YouTube, Bilibili | `src/components/sections/Contact.jsx` |

Use the displayed name Damon Guo-Siyi. Do not infer degree titles or add publication URLs absent from the data. Project links use the existing `/projects#id` sections; article links use `/blog/:slug`. The existing email address is reused, not independently verified. The LinkedIn URL has a different name in its slug and is omitted from these new sections until clarified.

## Motion

The particle page uses actual Three.js geometry and shaders. The helmet page uses the supplied SVG pieces and coordinated assembly animation; it is not a Three.js model. Both pages must retain readable final states with reduced motion and meaningful links on narrow screens.

Browser review evidence and implementation limits are recorded in `design-qa.md`.
