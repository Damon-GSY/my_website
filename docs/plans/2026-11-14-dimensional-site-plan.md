# Dimensional site — plan

Status: **plan only, nothing built.** Branch: `claude/serene-cori-mookmf`.

## 0. Decisions already made

| Topic | Decision |
| --- | --- |
| Display name | Damon Guan |
| Versions | Three openings, then one full site |
| Old Vite app | Replaced on this branch (it stays in `main` and git history) |
| Content | Résumé/LinkedIn facts already in the repo, merged into one file. No new facts invented. Production numbers keep the label "internal measurement". |
| Brief | Awards-style, smooth 3D ↔ 2D, as surprising as possible |

Still open: the contact email (`hello@damon.ai` is used everywhere but unconfirmed) and whether a portrait exists. Neither blocks the openings.

## 1. Design position

Every earlier 3D study in this repo puts an object *beside* the page (particle cloud, robot, chrome sculpture). The object and the layout never become the same thing, so the 3D reads as decoration.

Rule for this build: **the 3D object and the 2D page are one object seen two ways.** Each direction gets exactly one reveal that breaks what the visitor assumed about the page. Everything else stays quiet so the reveal lands.

| | A. Descent | B. Rollout | C. Parcel |
| --- | --- | --- | --- |
| The object | A loss landscape | A tree of agent decisions | A shipping box |
| 3D ↔ 2D | Terrain ↔ contour map | Branching space ↔ one flat trace | Box ↔ unfolded net ↔ card grid |
| The surprise | The flat page you were reading was lying on a landscape | You were the policy; the site scored your episode | The page folds itself into a box and ships you to the next section |
| Mood | Paper, ink, one orange dot | Dark, cinematic | Kraft, labels, fluorescent sticker |
| Tied to Damon by | Post-training, RL, the AH dot | Multi-turn evaluation, compounding error | Supply chain, HGH/SIN/SYD/PEK |

## 2. Shared system

### 2.1 Stack

Vite + React 19 + plain `three` (no React Three Fiber: one canvas, one render loop, full control). No GSAP, no Lenis, no video, no models. Fonts self-hosted through `@fontsource`. The lockfile currently points at `registry.npmmirror.com`; it gets regenerated against `registry.npmjs.org`, which npm rewrites to whatever registry you configure locally.

### 2.2 Files

```
src/
  content.js            one bilingual content file (profile, work, papers, notes, path)
  i18n.jsx              zh/en provider, t({en, zh})
  engine/
    timeline.js         scroll -> damped progress, render on demand
    stage.js            renderer, pixel-space camera, flatten
    dock.js             DOM rect -> stage coordinates
  directions/
    descent/  rollout/  parcel/     each: Scene.js, Opening.jsx, style.css
  pages/                Chooser, Home, Case, Notes, Note, NotFound
  styles/               tokens.css, base.css
```

### 2.3 Engine starter code

**Timeline.** Native scroll, exactly reversible, stops rendering when idle.

```js
// src/engine/timeline.js
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const span = (p, a, b) => clamp((p - a) / (b - a));           // sub-range of progress
export const ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);       // smootherstep

export function createTimeline(track, onFrame, damping = 0.12) {
  let target = 0, current = 0, raf = 0;
  const tick = () => {
    current += (target - current) * damping;
    if (Math.abs(target - current) < 1e-4) current = target;
    onFrame(current);
    raf = current === target ? 0 : requestAnimationFrame(tick);
  };
  const read = () => {
    const r = track.getBoundingClientRect();
    target = clamp(-r.top / (r.height - innerHeight));
    if (!raf) raf = requestAnimationFrame(tick);
  };
  addEventListener('scroll', read, { passive: true });
  addEventListener('resize', read);
  read();
  return () => { removeEventListener('scroll', read); removeEventListener('resize', read); cancelAnimationFrame(raf); };
}
```

**Pixel-space stage and the flatten.** World units are CSS pixels and the page plane is `z = 0`. The camera distance is always chosen so the plane `z = 0` maps 1:1 to the screen, so anything lying on that plane never moves while perspective is removed. Only depth collapses. This is what lets a 3D object land exactly on a DOM element.

```js
// src/engine/stage.js
import * as THREE from 'three';
const K_PERSP = Math.tan(THREE.MathUtils.degToRad(35 / 2));
const K_FLAT  = Math.tan(THREE.MathUtils.degToRad(0.6 / 2));          // effectively orthographic

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const dir = new THREE.Vector3(0, 0, 1);                              // unit vector, target -> camera
  let w = 1, h = 1;

  function resize() {
    w = innerWidth; h = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
  }
  // flat: 0 = full perspective, 1 = orthographic. tilt/yaw in radians orbit the page plane.
  function setView({ flat = 0, tilt = 0, yaw = 0 }) {
    const k = THREE.MathUtils.lerp(K_PERSP, K_FLAT, flat);
    const dist = (h / 2) / k;
    dir.set(Math.sin(yaw) * Math.cos(tilt), -Math.sin(tilt), Math.cos(yaw) * Math.cos(tilt));
    camera.position.copy(dir).multiplyScalar(dist);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(k));
    camera.near = dist * 0.2; camera.far = dist * 3;
    camera.updateProjectionMatrix();
  }
  resize();
  return { renderer, scene, camera, resize, setView, render: () => renderer.render(scene, camera) };
}
```

**Dock.** Where a DOM element sits, in stage coordinates.

```js
// src/engine/dock.js
export function dockRect(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2 - innerWidth / 2, y: innerHeight / 2 - (r.top + r.height / 2), w: r.width, h: r.height };
}
```

Handoff rule: when `flat === 1` and the object sits on its dock, the DOM twin fades in over two frames and the mesh is hidden. Scrolling back reverses it.

### 2.4 Fallbacks and budgets

- Reduced motion or no WebGL: no pinned scroll, a complete static 2D page with the same content.
- Three is lazy-loaded after first paint; text is readable before the canvas exists.
- Pixel ratio capped at 2. Phones get shorter pins and lighter geometry.
- Bilingual zh/en toggle, remembered, default from browser language.

## 3. Direction A — Descent

**Idea.** Training is a walk downhill on a surface nobody can see. The site shows the surface.

**Surprise.** The first screen is a calm, flat typographic page: headline, a few thin curved rules, one orange dot after the last word. On the first scroll the page tilts back and the "decorative" rules turn out to be contour lines of a landscape the headline was lying on. The orange full stop rolls off the sentence and down the valley.

**Second surprise, at the end.** Your scroll was the training run. The footer draws the real loss curve of your visit (ball height against your scroll steps), labelled "run 1 · N steps · converged".

**Storyboard (opening, about 4 screens of scroll).**

| Progress | 3D | 2D |
| --- | --- | --- |
| 0.00–0.10 | Top-down, `flat = 1`. Contours look like flat ornament | Headline, name, role |
| 0.10–0.40 | Tilt to 55°, `flat → 0`, relief rises. Dot becomes a ball and rolls | Headline lifts with the terrain, then fades |
| 0.40–0.70 | Camera follows the ball through two basins (SFT, then RL) | Small map-legend captions pin to places on the surface |
| 0.70–0.90 | Camera rises, `flat → 1`, relief → 0 | Contours settle |
| 0.90–1.00 | Contour rings straighten into horizontal rules | Rules are now the Work list rows; ball docks as the flat dot on row 1 |

**Look.** Paper `#f4f0e7`, ink `#121212`, orange `#ff5a1f` (continuity with the AH site you approved). Serif display (Newsreader, light, very large), Cartograph CF for map-legend data: elevations, coordinates, step counts. Chinese in Noto Serif SC.

**Kernel.**

```js
// directions/descent/field.js: the same function is mirrored in GLSL
const BASINS = [ { x: -0.35, y: 0.15, a: 0.55, s: 0.28 }, { x: 0.3, y: -0.2, a: 1.0, s: 0.34 } ];
export function height(x, y) {
  let h = 0.12 * Math.sin(3.1 * x + 1.7) * Math.cos(2.3 * y);
  for (const b of BASINS) h -= b.a * Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / (b.s * b.s));
  return h;
}
export function descend(p, v, lr = 0.004, momentum = 0.9, e = 1e-3) {   // one optimiser step
  const gx = (height(p.x + e, p.y) - height(p.x - e, p.y)) / (2 * e);
  const gy = (height(p.x, p.y + e) - height(p.x, p.y - e)) / (2 * e);
  v.x = v.x * momentum - lr * gx; v.y = v.y * momentum - lr * gy;
  p.x += v.x; p.y += v.y;
}
```

```glsl
// vertex: relief disappears as the view flattens, contours do not
vH = height(position.xy);
vec3 p = position; p.z = vH * uRelief * (1.0 - uFlat);

// fragment: crisp iso-lines at any zoom
float f = vH * uLines;
float line = 1.0 - clamp(abs(fract(f - 0.5) - 0.5) / fwidth(f), 0.0, 1.0);
gl_FragColor = vec4(uInk, line * uAlpha);
```

The ball path is precomputed (run `descend` a few hundred steps at load) so scroll position maps to a fixed step and reverses exactly.

**Risk.** Rings straightening into rules needs a per-line morph (each contour sampled to N points, lerped to a straight segment). Keep it to the 6–8 lines that become rows.

## 4. Direction B — Rollout

**Idea.** A 95%-reliable step, repeated 20 times, succeeds 36% of the time. That gap is Damon's job, and the page makes the visitor feel it.

**Surprise.** The site is an episode and the visitor is the policy. Each scroll notch is a step. The space ahead keeps branching in 3D; branches you pass die. A live counter, `P(success) = 0.95ⁿ`, falls as you go, and the headline (a variable-width font) physically narrows with it. At the end the camera swings side-on, the whole 3D tree collapses into one flat line, and that line is your trace: scored step by step, then reused as the page's progress bar and section index.

**Storyboard.**

| Progress | 3D | 2D |
| --- | --- | --- |
| 0.00–0.08 | One point of light, dead centre | Headline at full width, `P = 100%` |
| 0.08–0.60 | Fly forward along the chosen path; side branches grow, dim, fall behind | Counter drops; three chapter cards hang on real branch nodes (Train, Deploy, Evaluate) |
| 0.60–0.85 | Yaw 90°, `flat → 1`; every node's depth collapses to `z = 0` | Counter freezes at the final value |
| 0.85–1.00 | Tree is a single horizontal trace with tick marks | Ticks become section markers; trace docks under the header as the progress line |

**Look.** Near-black `#0b0d0c`, bone `#e9e6dc`, dead branches `#3a3f3c`, live path `#ff5a1f`. Archivo variable (width axis 62–125) for display, Cartograph CF for the counter and step labels.

**Kernel.**

```js
// directions/rollout/tree.js
export function growTree(steps = 20, seed = 7) {
  const rnd = mulberry32(seed), nodes = [];
  let pos = new THREE.Vector3();
  for (let d = 0; d <= steps; d++) {
    nodes.push({ depth: d, pos3: pos.clone(), live: true });
    for (let k = 0; k < 2; k++) {                                     // two dead siblings per step
      const off = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, -0.4).multiplyScalar(260);
      nodes.push({ depth: d + 1, pos3: pos.clone().add(off), live: false, parent: d });
    }
    pos = pos.clone().add(new THREE.Vector3((rnd() - 0.5) * 180, (rnd() - 0.5) * 120, -320));
  }
  return nodes;
}
export const flatX = (depth, steps, width) => (depth / steps - 0.5) * width;
// per frame: node.pos.lerpVectors(node.pos3, new Vector3(flatX(node.depth, steps, w * 0.8), 0, 0), collapse)
export const pSuccess = (p, n) => Math.pow(p, n);
// headline: el.style.fontVariationSettings = `"wdth" ${62 + 63 * pSuccess(0.95, n)}`
```

Lines are drawn as instanced thin quads (not `gl.LINES`) so they stay crisp at 2× and can carry a width that tapers with depth.

**Risk.** Dark sites with glowing lines are common. This one earns it only if the counter and the narrowing type are legible in the first second; that gets tested first.

## 5. Direction C — Parcel

**Idea.** Damon builds agents for supply chains. The site is a parcel, and the visitor is what gets shipped.

**Surprise.** The hero is a real, well-set 2D page laid out as six panels. On scroll it creases along its grid and **folds itself into a cardboard box**: the layout was a cube net all along. The box turns, shows a shipping label (routing `SYD → SIN → PEK → HGH`, his actual path), travels, lands, and **unfolds into the next section**, its six faces sliding apart into the six Work cards. Every section change is a fold and an unfold. Nothing fades.

**Details that make it his.**
- The label is typeset like a real one: tracking number built from dates, a working Code-128-style barcode of the page title, a fluorescent orange sticker (the AH dot, now a round label).
- Counts are physical: the research section unfolds into a stack of ~250 thin sheets (the survey), which fan out and flatten into the taxonomy diagram.
- Handling marks carry his principles: "Evaluate before training", "This side up".

**Storyboard.**

| Progress | 3D | 2D |
| --- | --- | --- |
| 0.00–0.12 | `flat = 1`, `fold = 0`. A flat page in the shape of a cross | Six printed panels: name, role, headline, location, three numbers |
| 0.12–0.45 | `flat → 0`, tilt 50°, `fold → 1`. Flaps rise, lid closes | Printed type rides the faces |
| 0.45–0.70 | Box rotates to show the label, slides along a single line | Label data counts through cities |
| 0.70–0.90 | `fold → 0`, tilt → 0, `flat → 1` | The net lies flat again |
| 0.90–1.00 | Six faces slide from the cross to the grid | Faces dock on the six Work cards; DOM takes over |

**Look.** Kraft `#b98a5a`, label white `#f6f3ea`, black `#111`, fluorescent orange `#ff5a1f`. Archivo ExtraBold for display, Cartograph CF for label data. Soft contact shadow under the box; no other effects.

**Kernel.**

```js
// directions/parcel/net.js: base face on z = 0, four flaps and a lid
export function makeNet(s, makeMaterial) {
  const root = new THREE.Group(), h = s / 2, hinges = [];
  const face = (i) => new THREE.Mesh(new THREE.PlaneGeometry(s, s), makeMaterial(i));
  root.add(face(0));
  const flap = (parent, hx, hy, fx, fy, axis, dir, i) => {
    const hinge = new THREE.Group(); hinge.position.set(hx, hy, 0);
    const f = face(i); f.position.set(fx, fy, 0);
    hinge.add(f); parent.add(hinge); hinge.userData = { axis, dir }; hinges.push(hinge);
    return hinge;
  };
  flap(root,  h, 0,  h, 0, 'y', -1, 1);                               // east
  flap(root, -h, 0, -h, 0, 'y',  1, 2);                               // west
  const north = flap(root, 0, h, 0, h, 'x', 1, 3);
  flap(root, 0, -h, 0, -h, 'x', -1, 4);                               // south
  flap(north, 0, s, 0, h, 'x', 1, 5);                                 // lid, hinged on north's far edge
  root.userData.fold = (t) => hinges.forEach((g) => { g.rotation[g.userData.axis] = g.userData.dir * t * Math.PI / 2; });
  return root;
}
```

Each face's material is a canvas texture drawn from the same strings as the DOM panel, at 2× the docked size, so the swap to real DOM text is invisible. For the net-to-grid step the six faces are re-parented to the scene and lerped to `dockRect(card[i])`.

**Risk.** Text on textures must match DOM text metrics. Draw the canvas only after `document.fonts.ready`, and take line breaks from the DOM twin's measured lines instead of re-wrapping.

## 6. The full site (after you pick)

One scroll film, then ordinary fast pages.

| Section | Content | Dimensional moment |
| --- | --- | --- |
| Opening | Name, role, thesis | The direction's reveal |
| Work | Supply-chain agent system, dynamic tool resolution, domain LLM, multi-objective RL, M365 Copilot memory | Object docks into the list |
| Research | Multi-turn evaluation survey, SupChain-Bench, VisualDeltas, with links | Flat diagram lifts into layers and settles back |
| Path | UNSW, NUS, AI Visual, Meituan, MSRA, Alibaba | One measured time axis |
| Notes | The seven existing notes plus the Chinese learning article | None; reading stays calm |
| Contact | Email, GitHub, LinkedIn, YouTube, Bilibili | The object comes to rest |

Routes: `/`, `/work/:slug`, `/notes`, `/notes/:slug`, 404. Case and note pages have no WebGL.

## 7. Phases, sized for a token budget

Each phase ends with something you can look at, and you can stop after any of them.

| Phase | Output | Size |
| --- | --- | --- |
| 1. Foundation | Clean branch, `content.js`, tokens, engine (the three files above), chooser page | Small |
| 2C. Parcel opening | Fold, ship, unfold into Work cards | Medium |
| 2A. Descent opening | Tilt reveal, ball descent, contours into rows | Medium |
| 2B. Rollout opening | Branching flight, counter, collapse into trace | Medium |
| 3. Full site | The chosen direction through all sections, zh/en, mobile, fallback | Large |
| 4. Polish | Screenshots at 1440 and 390, forward/reverse scroll check, lint, build | Small |

Suggested order is C, A, B: most surprising first, so if the budget runs out you already hold the strongest candidate. To save tokens I will write each opening once, check it with a handful of screenshots, and send you three or four frames instead of long reports.

## 8. Acceptance checks

- At every flatten, a screenshot one frame before and one frame after the DOM handoff differ by less than a few pixels.
- Scrolling to a position from above and from below renders the same frame.
- No rendering while idle; no horizontal scroll at 390 px.
- Reduced motion and WebGL-off both give a complete, readable page.
- `npm run lint` and `npm run build` pass.

## 9. What I need from you

1. Approve this plan, or mark what to change.
2. Say which phases to run now (for example "1 + 2C", or "1 + all three").
3. Confirm the contact email when convenient.
