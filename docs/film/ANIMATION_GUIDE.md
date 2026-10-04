# GDamon — Make it useful

Original 18-second personal-research film. Inspired by the user's complete code-to-video reference, not a reproduction of unviewed embedded videos. Use the existing GDamon robot and verified personal copy. No fabricated product screens, results or awards.

## Shared production contract

- Duration 18 seconds, three six-second chapters: INTRO [0,6), ROBOT [6,12), SIGNATURE [12,18]. 120 BPM, beat every 0.5s. Deliver 16:9 (1280x720), 9:16 (720x1280), 1:1 (900x900) if render budget permits. Native 30fps; no frame interpolation.
- `createFilm(canvas)` owns the final 2D compositor and invokes chapter.draw(ctx, localTime, layout). All chapters are pure functions of explicit localTime. No animation timers, incremental velocity, Math.random or DOM transitions in render mode. A separate live-player clock may advance time.
- Each chapter module exports factory `createIntroChapter()`, `createRobotChapter()` or `createSignatureChapter()` returning `{draw(ctx,t,layout),dispose?}`. ctx is a CanvasRenderingContext2D; t is 0..6 local seconds. layout is `{width,height,portrait,square,palette}`. Reset/save/restore your own drawing state. Paint your complete opaque background every frame. Width/height can change; adapt composition rather than cropping.
- Shared exports from `src/film/motion.js`: `clamp(value,min=0,max=1)`, `mix(a,b,t)`, `smooth(value)`, `spring(t,frequency=3,damping=1)`, `track(t,keys,frequency=3,damping=1)`, `seeded(seed)`, `fitText(ctx,text,font,maxWidth,maxSize,minSize=10)`, `PALETTE`, `DURATION=18`. spring is normalized damped second-order response, pure time. The font argument for fitText is e.g. `400 {size}px Anton` (helper replaces {size}), returns font size and leaves ctx.font at fitted value. Palette keys: blue#0757ed, paper#f2f0e6, lime#d8fc59, orange#ff6c24, ink#111a23, muted#9baaaf.
- Typography: Anton 400 display; Arial/Helvetica sans body. Both fully local. Display text always fitted/measured and remains crisp. No tiny corner tech labels or frame borders. Body text should remain readable at360px preview width. Avoid broad fade transitions; use masks, physical movement, circular wipes, and directed point movement.
- Intro starts with a readable hook immediately. Every 1.5–3 seconds has a visual payoff; body copy gets time to read. Do not move every element equally or use constant-speed slides.
- Chapters render independently; compositor will use a fast .22s directional wipe at6s and12s. Intro ends blue, robot paints ivory, signature paints ink then resolves into blue. The final frame is an intentional branded hold, not falsely advertised as seamless loop.
- Original audio is synthesized on this same beat grid, not sampled/copyrighted. Muted by default in web player; explicit sound control. Poster+manualplay for reduced motion. Separate real MP4 export available.

## Chapter content and direction

### Intro / 0–6s

Oversized cream HELLO. on cobalt, lime geometric asterisk with weight and rotation. Shift into I'M DAMON. and clear AI RESEARCHER / LLM ENGINEER identity. Finish THINK. / BUILD. / REPEAT. with directed typography, repeating rings/stripes used as intentional transition motif. No mock software UI. In portrait, stack and reflow; do not merely shrink landscape text.

### Robot / 6–12s

Use actual ceramic robot geometry from /robot. Move from complete character to exploded shell/core and back. Visor must open far enough to expose processor. Explicit deterministic camera/pose, no accumulated idle. Film should contain large editorial words PLAN, ACT, LEARN sequenced with mechanical actions. Keep every part inside safe frame in all formats. Overall title INTELLIGENCE, IN MOTION may be used if it fits. Preserve brand identity and genuine depth.

### Signature / 12–18s

Organized signals become a neural network, then thousands of directed points resolve into GDAMON. Follow with legible brand/contact payoff LET’S MAKE IT USEFUL. and damon.ai; research line Agentic RL / Post-training / Evaluation. Transitions must reveal structure, not generic particle explosions. Avoid tiny unreadable data or unsupported claims. The final 1s is readable branded hold, with subtle deterministic movement.

## Delivery / QA

One `window.GDamonFilm.seek(t)` paints arbitrary timestamps. Repeat selected timestamps out of order and compare PNG hashes. Before full export, examine three stills per chapter plus 360px-wide contact sheet, fix concrete issues. Final decode test, measured duration/resolution/fps, sound loudness, rapid seek/reverse, reduced motion, unavailable WebGL, and responsive player checks. Source screenshots and actual film remain distinguishable from AI image/video generation.
