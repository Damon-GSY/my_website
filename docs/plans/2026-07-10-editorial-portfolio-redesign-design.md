# Editorial portfolio redesign

## Goal

Turn Damon’s current product-dashboard-like homepage into an editorial personal
portfolio that explains who he is, what he researches, what he has shipped, and
how to contact him. Motion must guide attention through that information rather
than compete with it.

## Core decision

Keep the existing React application, routes, theme system, and real data files.
Replace the homepage composition and its visual language. The `/about`,
`/projects`, `/blog`, `/blog/:slug`, and `/uses` routes remain compatible.

The supplied optimization-landscape image is the visual anchor. It is not a
decorative full-page wallpaper. It sits in the hero as a layered 2.5D scene:

- the original image provides the photographic terrain and copper light;
- GSAP maps scroll progress to perspective, scale, and depth transforms;
- a controlled light spot travels along the terrain and toward the active content;
- p5 renders a small number of ridge-following particles above the image;
- anime.js handles short text and list entrances that are independent of scroll;
- reduced-motion users see a composed static image with no loss of content.

This gives the requested 3D feeling without adding Three.js, a custom WebGL
shader, or a large new rendering system.

## Homepage information architecture

### 1. Identity / hero

The first viewport must answer four questions without scrolling:

1. Who: Damon Guo-Shiyu.
2. Current role: LLM Engineer at Alibaba, based in Hangzhou.
3. Focus: agent systems, post-training, evaluation, and agentic RL.
4. Next action: view selected work or make contact.

The optimization landscape occupies the lower and right portions of the hero.
Typography remains readable in the image’s black negative space. No terminal,
live clock, fake runtime state, or synthetic metric dashboard remains.

### 2. Selected work

Show three representative projects from `src/data/projects.js`. Each item uses
the same truthful structure: problem/context, contribution, measurable outcome,
and project category. The section links to the full projects route.

The moving light spot leaves the hero and becomes a restrained section marker,
guiding the eye to the currently revealed project rather than following the
cursor continuously.

### 3. Research and experience

Use `timelineData` and `aboutProfile` from `src/data/about.js` to connect Alibaba,
MSRA, NUS, UNSW, and the research record. This is an editorial sequence, not a
card grid or simulated control surface.

### 4. Writing

Use the latest real entries from `src/data/posts.js`. Keep dates, excerpts, and
reading times visible. Link to the complete blog.

### 5. Contact

State the collaboration areas directly and keep the existing email and social
channels. The CTA should feel like the conclusion of the same visual story, not
an unrelated aurora card.

## Visual system

- Background: near-black with a warm charcoal surface family.
- Accent: the supplied image’s copper/amber highlight.
- Typography: Cartograph CF for expressive editorial headings, Geist for body,
  mono only for small factual labels and numbers.
- Layout: asymmetric two-column hero followed by spacious editorial rows.
- Surfaces: mostly borderless; use rules and changes in rhythm instead of cards.
- Texture: the landscape image, its soft reflected glow, and sparse particles.
- Mobile: collapse to one readable column; the landscape remains a cropped
  lower-half scene and never blocks touch scrolling.

## Component and data architecture

- `App.jsx` composes the new homepage sections and removes the Agent OS rail from
  the homepage only.
- `Hero.jsx` becomes the identity-first hero and owns the scroll scene boundary.
- A new `OptimizationLandscape.jsx` isolates the image, GSAP ScrollTrigger,
  dynamic p5 import, cleanup, and reduced-motion fallback.
- `Work.jsx` becomes an editorial selected-work list based on the existing
  projects array.
- A new `ResearchPath.jsx` renders real timeline/profile data.
- `Journal.jsx`, `Contact.jsx`, and `Navbar.jsx` are visually simplified while
  preserving their links and accessibility contracts.
- `index.css` holds shared tokens and the new layout/scene styles. Old Agent OS
  CSS may remain temporarily only if another route still needs it; unused
  homepage markup will be removed.

## Performance and failure behavior

- Dynamically import p5 after the hero content has rendered.
- Keep the source image responsive and use the browser’s image decoding path.
- Cap particle count by viewport size and device pixel ratio.
- Use transforms and opacity only for continuous animation.
- Remove all listeners, p5 instances, GSAP contexts, and ScrollTriggers on
  unmount.
- If p5 fails or motion is reduced, the original image and all information remain
  visible and usable.

## Verification

- `npm run build` and `npm run lint` pass.
- Desktop viewport at 1440 × 1000 shows identity, role, focus, and both primary
  actions in the first viewport.
- Mobile viewport at 390 × 844 has no horizontal overflow, blocked scrolling, or
  clipped primary text.
- Scroll screenshots cover hero, selected work, research, writing, and contact.
- Reduced-motion mode retains the full content hierarchy.
- Codex visual review must first describe what is visible in each screenshot,
  then explicitly judge information clarity, visual harmony, and whether the
  light/3D effect guides rather than distracts. A PASS is required.

