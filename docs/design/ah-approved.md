# AH · 行动之间

Approved personal-site design, published on `codex/ah-approved` from base commit `fa5695d`.

This branch adds the AH static site and its local runtime assets. It keeps the existing production homepage and seven English notes unchanged. It does not include other design directions, comparison controls, rendered study videos, or the separate particle website. Pushing this branch is not a production-root replacement or a deployment command.

## Run locally

```sh
npm ci
npm run dev
```

The project uses port 4175 by default:

- Home: <http://localhost:4175/design-lab/creative.html?view=home>
- Blog: <http://localhost:4175/design-lab/creative.html?view=blog>
- Article: <http://localhost:4175/design-lab/creative.html?view=article>
- Closing: <http://localhost:4175/design-lab/creative.html?view=home#ah-contact>

Existing links containing `variant=AH` still work. Add `lang=en` for the English interface; the Chinese article retains its original language. The language switch, motion setting, and footer cursor control are available in the interface.

The featured learning article and its four illustrations are included locally. Seven English Blog entries continue to open the existing `/notes/*` pages. The featured article’s source link opens the original GitHub repository, not an unpublished `/notes/how-to-learn` route.

## Verification

These checks use Node.js and need no browser or running server:

```sh
node scripts/ah-publication-check.mjs
node scripts/ah-opening-flow-check.mjs
node scripts/ah-tools-motion-check.mjs
node scripts/ah-site-motion-check.mjs
node scripts/ah-motion-redesign-check.mjs
node scripts/ah-navigation-check.mjs
node scripts/ah-closing-check.mjs
```

The publication check resolves packaged resources, parses the motion renderer, verifies article images and existing note destinations, and executes the standalone loader with both supported URL forms. Motion checks cover deterministic forward/reverse seeks, handoffs, route geometry, and the closing dot-to-contact-arrow transition. They do not replace browser review of navigation, typography, scrolling, or responsive layout.

## Implementation map

- `public/design-lab/creative.html` and `creative-loader.js`: standalone AH entry.
- `public/design-lab/creative/ah.html`, `ah.css`, `ah.js`: personal-site content, layout, and scroll orchestration.
- `ah-journey.mjs`, `ah-site-motion.mjs`, `ah-bridge.mjs`: motion geometry and scene handoffs.
- `public/design-lab/storyboard-v3/tools-motion.mjs`: approved tool-list sequence.
- `ah-film.html`: opening renderer, embedded into the actual website.
- `ah-navigation.js`, `ah-reading.js`, `ah-reading.css`: segmented navigation and reading interface.
- `public/design-lab/shared.js`, `blog-system.js`, `learning-guide.html`: local view routing and Blog/article content.

Font and cursor license files ship alongside their assets. Existing `public/fonts/CartographCF-Regular.woff2` and `public/favicon.svg` are reused from the base site.
