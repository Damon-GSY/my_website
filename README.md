# Damon Guo-Siyi — website

## Run locally

Install Node.js 20 or newer, then run from the repository root:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. The original homepage is at `/`.

## Latest study: Oil Motion

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
