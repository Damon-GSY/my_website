# Particle directions and robot motion

These studies continue the personal portfolio, using real-time browser animation and the existing project, biography, and writing data.

## Compare the scenes

| URL | Direction |
| --- | --- |
| `/particle?scene=matrix` | Depth-layered digital character rain that gathers into DAMON |
| `/particle?scene=signature` | Blue and violet particle streams forming a personal signature |
| `/particle?scene=neural` | Connected nodes and traveling signals resolving into DAMON |
| `/particle?scene=tree` | The earlier sphere, tree, water reflection, and cube composition |

Matrix is the default at `/particle`. The scene controls update the URL so a direction can be shared or revisited. “Reveal DAMON” selects the middle of the cinematic scroll section; scrolling onward reaches selected work, followed by the biography, notes, and contact sections.

The three new scenes use procedural Three.js geometry, shaders, and a locally drawn glyph atlas. They have no video-generation service, downloaded model, or external font requirement. The renderer contract supports progress, pause, reduced motion, and disposal, matching the earlier particle scene. Reference images and exported frame-study videos elsewhere in the repository are separate experiments.

## Robot motion

`/robot` now opens **Hello, human.**, a complete personal portfolio built around a procedural Three.js ceramic robot. The head and eyes follow the pointer, the character blinks, and **Say hello** triggers a nod. Scrolling or choosing **Meet the system** opens the shell to reveal the processor and mechanical core, connecting **Plan / Act / Learn** to Damon's work. The page continues through cream project panels, a dark navy biography, notes, and a cobalt contact section.

**Reassemble** returns to the introduction; **Replay** restarts the entrance, and **Pause** stops the character's motion. Reduced motion presents a static pose and readable content. The earlier SVG helmet implementation has been superseded on `/robot`; the original SVG reference remains at `/future-machine.html`.

## Review

The comparison directory is `/html-studies/index.html`; the homepage also exposes the individual directions. Screenshots depict actual browser states. Verification details, measured limitations, and device coverage are recorded in [design-qa.md](../design-qa.md).
