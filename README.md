# Damon Guo-Siyi — website

## GDamon — AI particle morph

Open [`public/kernelcode/index.html`](public/kernelcode/index.html) directly in a browser with an Internet connection, or visit **`/kernelcode/index.html`** on the local preview server. This standalone HTML adapts the four-screen experiment to GDamon's AI research: a 30,000-point cloud morphs from an intelligence core sphere into a neural network and then the **GDAMON** signature. Its copy draws on the existing profile's agentic RL, post-training, evaluation, and production agent work.

CSS and JavaScript are inline, with Schibsted Grotesk and Three.js 0.169 loaded from their CDNs; no framework or build step is needed. Wheel, touch, and keyboard input move one screen at a time. The homepage and comparison directory link to this version and the preserved original.

The literal **KernelCode reference** remains at [`public/kernelcode/reference.html`](public/kernelcode/reference.html), or **`/kernelcode/reference.html`** locally. It keeps the original copy, four CloudFront images, draggable voxel `<K>`, and sphere → keyboard photograph → `<K>` particle sequence.

## Personal websites adapted from the pasted HTML

Open **`/html-studies/index.html`** to compare the complete personal websites and three new particle directions. The homepage also links directly to each preview.

| Page | Route | What is included |
| --- | --- | --- |
| Matrix | `/particle?scene=matrix` (default) | Layered character rain gathers into DAMON, then a digital system |
| DAMON | `/particle?scene=signature` | Violet particle ribbons weave into the name, then an orbital structure |
| Neural | `/particle?scene=neural` | Amber/cyan connected nodes and traveling signals resolve into DAMON |
| Tree baseline | `/particle?scene=tree` | Original Three.js sphere/tree/cube scene |
| Agent Assembly | `/robot` | Panel assembly, pointer depth, scroll-controlled exploded diagram, and motion throughout the personal portfolio |

All particle modes include selected work, biography, notes, creator channels, and contact. Use **Reveal DAMON** to go directly to the name formation, or scroll through the sequence. The robot page offers **Pause motion** and **Replay**. Both pages respect reduced motion. See [scene and motion notes](docs/particle-directions.md).

For a fresh checkout of this preview branch:

```bash
git clone --branch codex/oil-motion-frame-studies --single-branch https://github.com/Damon-GSY/my_website.git damon-motion
cd damon-motion
npm ci
npm run dev -- --port 4175
```

Both adaptations use the existing project and article data and real destinations from this repository. See [content and implementation notes](docs/personal-portfolio-adaptations.md). The exact original references remain available at `/html-studies/anchor-original.html` and `/future-machine.html` from smaller links below the personal-site previews.

The two pasted-text attachments contain identical Anchor AI documents (SHA-256 `f955679e011440034e887db004277172b1c6b94cfc713e3e924433e812efc62c`). The original's 15 external CloudFront SVG logos and badges currently fail to load in the cloud preview, and several navigation anchors have no sections in the supplied source. The preserved original retains those dependencies and links. The Damon adaptation uses local assets and portfolio destinations. Future Machine intentionally contains one screen; its original specification forbids scrolling.

## Oil Motion — three generated frame studies

Branch: **`codex/oil-motion-frame-studies`**. The homepage `/` and `/motion-lab` open the comparison page.

| Route | Visual direction | Interaction |
| --- | --- | --- |
| `/motion-lab/observer` | Porcelain Observer: white ceramic robot on cobalt | Horizontal pointer gaze and pose controls |
| `/motion-lab/bloom` | Silver Bloom: a metal bud on warm ivory | Drag to open or close the petals |
| `/motion-lab/core` | Amber Assembly: glass blocks on black | Assemble, scatter, and reverse from the current pose |

Each object has **six actual image-generated poses**. The pages select those native images directly, with no crossfade or invented in-between frames. The exported MP4s show the same poses forward and backward at 5 fps. This is deliberate stop-motion exploration, not continuous AI-generated video. No generation key is needed to run it.

```bash
git fetch origin
git switch codex/oil-motion-frame-studies
git pull --ff-only
npm ci
npm run dev
```

Open the address printed by Vite. Source PNGs, measured budgets, encoded-video provenance, and the reproducible media script are documented in [motion-studies/README.md](motion-studies/README.md). The particle portfolio remains at `/particle`.

## Future Machine — standalone HTML experiment

Branch: **`codex/future-machine-standalone`**.

Download or open [`public/future-machine.html`](public/future-machine.html) directly in a browser. This is a complete standalone file: inline CSS, JavaScript, SVG helmet and favicon, system fonts, and no external requests. No install, build, or server is required. If you already run this repository's Vite server, the same file is available at `/future-machine.html`.

The page follows the supplied Future Machine specification, including the mechanical assembly entrance, aspect-ratio layout rules, reduced-motion support, and replay on a persisted `pageshow` event.

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
