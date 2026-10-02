# Damon Guo-Siyi — website

## Run locally

Install Node.js 20 or newer, then run from the repository root:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. The original homepage is at `/`.

The latest three experimental portfolio directions are:

| Route | Direction | Interaction |
| --- | --- | --- |
| `/experiences/path` | The Agent’s Path | Choose a decision stage and follow its illuminated trace. |
| `/experiences/field-notes` | Field Notes | Unfold a research trace and select tools in the case study. |
| `/experiences/world-model` | World Model | Select an agent decision and watch its route through the miniature world. |

The bottom switcher moves between all three directions. Earlier concepts remain at `/concepts/editorial`, `/concepts/kinetic`, and `/concepts/sculpture`.

The experimental pages use WebGL for animated details and respect your system's reduced-motion setting. The main visual composition remains visible without WebGL.

To check the project, run `npm run build` and `npm run lint`.
