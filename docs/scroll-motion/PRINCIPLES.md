# Scroll motion direction

The default `/film` and `/oil-lab/matter` are interactive websites. Their poses come from the rendered native scroll position, rather than an autoplay clock. Scrolling back retraces the choreography, and resting stops the render loop. Film's archived player/export is a separate experience and is unchanged.

The new `/oil-lab/noir` uses the same transport for its silver-grain core → toroidal signal → tool constellation → GDAMON hero. Its four held poses share a scroll-controlled camera, bounded pointer response and synchronized text. Three separate generated chapters then connect Seed, Relay and Lens to actual training, deployment and evaluation work. Those clips use their native decoded frames; the shared shader does not alter or synthesize their motion. Generated preparation, arcing motion and staggered settling were reviewed in the source videos and in the webpage, rather than assumed from prompts.

`src/motion/choreography.js` supplies the shared GPU transport. A form holds, gathers back slightly, travels along curved paths in small overlapping cohorts, reaches just beyond its destination, and settles. The beginning and end of every morph return the source and destination positions exactly. The maximum horizontal compression is 12%; depth compresses by 8% while height compensates so the three scale factors multiply to one. These are restrained signals of mass, not cartoon elasticity.

## The twelve principles in this implementation

| Principle | Application and boundary |
| --- | --- |
| Squash and stretch | Volume-compensated compression gives the cloud a sense of mass during transport. Stable poses retain their proportions. |
| Anticipation | The first part of the transition pulls each grain back by at most 2.5% of its travel vector before it leaves. |
| Staging | Film retains a separate artwork rectangle and persistent identity, with project evidence outside the artwork. Matter retains its exact image coordinates through the chrome handoff, then reframes on phones using the measured space between copy and evidence. The camera pulls back further during transport, leaving reading room on short screens. Text fades remain controlled by the same scroll position. |
| Straight ahead and pose to pose | This is a **pose-to-pose** design: training lattice, helmet, and signature in Film; sampled chrome D, tool network, and evaluation rings in Matter. Both approaches need not run simultaneously. Exact endpoints make backward scrolling reliable. |
| Follow through and overlapping action | Vertical position and four particle cohorts introduce small departure differences. A late, restrained reach settles into the new pose; no independently ticking spring keeps the page moving after input stops. |
| Slow in and slow out | The trajectory uses a quintic ease with zero endpoint velocity and acceleration, in addition to the existing short frame-rate-independent scroll smoothing. |
| Arcs | Grains travel along perpendicular curved paths with depth, rather than straight interpolation. Arc displacement vanishes at both ends. |
| Secondary action | A small ribbon motion rides on the main transport envelope. It is subordinate to the silhouette and only exists during a transition. It creates no extra canvas or particle draw call. |
| Timing | Film retains the 5.2–6.8 and 11.2–12.8 narrative transition intervals. Matter retains its decoded final-frame handoff, 0.43–0.66 D-to-network and 0.75–0.94 network-to-rings intervals. The visitor controls traversal speed. |
| Exaggeration | Curvature and depth make the transformation legible; a small overshoot gives it a finish. Their amplitudes remain bounded so the content keeps priority. |
| Solid drawing | Film's helmet is sampled from articulated 3D geometry. Matter's first particle form is sampled from the actual chrome D image, followed by three-dimensional nodes and tilted rings. Shape design and depth provide solidity without inventing autonomous motion. |
| Appeal | The Film stage uses near-black tones, ivory grains, and limited lime detail. Matter keeps its cobalt generated opening and settles into a black particle stage. Recognizable forms and a consistent motion language support the personal work story. |

## Implementation and verification constraints

- The shared shader changes positions on the GPU. Particle buffers are generated once and, for Matter, updated only on resize. There is one particle draw call per scene.
- Film keeps 24,000 grains. Matter keeps 22,000 on desktop and 13,500 on smaller initial viewports.
- The existing clocks, deep-link restoration, paused generated frame sequence, media seek deduplication, context-loss fallback, and idle/offscreen rendering behavior remain in place.
- Reduced-motion mode continues to show readable static content without a long pinned animation. WebGL failure retains the project information and links.
- `flow.choreography` and `particle.choreography` identify this trajectory in the existing diagnostic APIs. They also expose transition phase, compression, stretch, draw calls, and geometry version for browser checks.
- Check forward and reverse boundaries, exact resting forms, direct Film chapter links, media-to-particle alignment, phone/landscape staging, context loss, reduced motion, and render counts at rest. Screenshots establish composition; measured browser rendering is required for performance claims.

The principles describe the design choices, not twelve separate effects added indiscriminately. Staging, solid drawing, pose planning, and appeal are composition and design decisions as much as animation.
