# Damon Guo-Siyi — website

## Run locally

Install Node.js 20 or newer, then run from the repository root:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. On branch **`codex/particle-intelligence`**, `/` opens the new particle portfolio; `/particle` is an alias. The previous homepage is at `/classic`.

## Particle intelligence — separate branch

Based on the supplied Anchor AI HTML study, adapted to Damon's portfolio: an electric-blue particle sphere unfolds into a tree above a reflective ripple field, then scroll transforms the tree into a rotating particle cube. Research topics orbit the tree; four cards link to the existing project details.

- Real Three.js geometry, custom GPU shaders, pointer repulsion, camera parallax, and scroll-driven morphing.
- Responsive desktop and mobile composition, pause control, reduced-motion layout, and a local static scene image when WebGL is unavailable.
- No API key, remote assets, or additional dependencies required.

If the repository already exists on your computer, run these commands **inside that checkout**:

```bash
git fetch origin
git switch codex/particle-intelligence
git pull --ff-only
npm ci
npm run dev
```

Open Vite's printed address directly, without an extra route. If Git reports local changes that would be overwritten, commit or stash those changes before switching branches.

See [implementation and source notes](docs/particle-intelligence.md).

## Four studies from my GitHub stars

Open **`/lab`** for the comparison page and choose an experiment:

| Route | Direction | Interaction | Source |
| --- | --- | --- | --- |
| `/lab/observatory` | A cinematic research observatory | Three.js architecture, scroll camera rail and pointer parallax | ThreeUI |
| `/lab/tactile` | A tactile research desk | Three.js paper curl, shadows, drag and spring release | Sticker Forge |
| `/lab/gallery` | A spatial project archive | CSS 3D carousel, snapping drag and expanded project details | Cult UI |
| `/lab/signal` | Signal / Noise | Canvas field response and interactive research stages | Cursor Lab |

These are running browser interactions using the existing dependencies. They do not require a generation API key. The comparison images are captures of the implemented pages.

See [source notes](docs/star-lab-sources.md) for the actual starred lists, pinned upstream code, adaptation boundaries, and retained MIT licenses. Each experiment provides controls beyond pointer gestures and a reduced-motion experience.

## Oil Motion visual study

Open `/motion` for **From thought to action**: an ivory and cobalt portfolio built around a custom titanium-and-glass Agent Instrument. The closed and open keyframes, responsive layout, project links, and interactive reasoning section are implemented.

**The continuous opening video has not been generated.** This preview currently displays two generated still keyframes. It does not simulate the opening by blending those images. The scroll-to-video controller and local video importer are ready; they activate only when a valid clip is supplied in the manifest. Missing media, reduced motion, and media errors keep the static page usable.

See [motion-source/README.md](motion-source/README.md) for the Oil Motion reference, production contract, pending generation prerequisite, and importer instructions.

If you already cloned this repository, update your existing checkout instead of cloning into the same directory:

```bash
git fetch origin
git switch codex/three-concept-previews
git pull --ff-only
npm ci
npm run dev
```

## Earlier Three.js studies

The three earlier experimental portfolio directions are:

| Route | Direction | Interaction |
| --- | --- | --- |
| `/experiences/path` | The Agent’s Path | Select a decision stage on a moving orbital sculpture. |
| `/experiences/field-notes` | Field Notes | Unfold a stack of 3D research pages and inspect the trace. |
| `/experiences/world-model` | World Model | Select an agent decision to change the route through a miniature operational city. |

The bottom switcher moves between all three directions. Earlier concepts remain at `/concepts/editorial`, `/concepts/kinetic`, and `/concepts/sculpture`.

Move the pointer or scroll to explore each Three.js object from different angles. Touch movement also changes the view. The scenes respect your system's reduced-motion setting; if WebGL is unavailable, the original hero artwork appears instead.

To check the project, run `npm run build` and `npm run lint`.
