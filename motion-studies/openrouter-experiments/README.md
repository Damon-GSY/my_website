# GDamon / Oil Motion experiments

Three original personal-site directions use generated keyframes and real, continuous OpenRouter video. The page maps ordinary document scrolling to the video's measured frames. Copy, project links and navigation remain editable HTML. The scenes have no autoplay, scroll hijacking, synthetic frame interpolation or claim of seamless looping.

## Current delivery status

All three source clips have passed motion review, compilation from measured native frames and final integrated Chromium checks. Source acceptance and runtime behavior are recorded separately.

| Direction | Idea | Confirmed evidence | Delivery |
| --- | --- | --- | --- |
| Matter | A chrome pebble becomes a connected sculptural D. | K0/K1 reviewed; `pilot/connected.mp4` accepted; all 96 decoded frames reviewed; desktop/mobile media and actual timeline compiled; final browser checks passed. | Complete. |
| Archive | Translucent research folios open into a layered archive. | K0/K1 reviewed; `pilot/slide.mp4` (v3) accepted; desktop/mobile media and actual timeline compiled; final browser checks passed. | Complete. |
| Handoff | A small industrial arm turns reasoning into physical action. | K0/K1 reviewed; `pilot/original.mp4` accepted; gripper/parcel continuity checked; desktop/mobile media and actual timeline compiled; final browser checks passed. | Complete. |

Matter's first generated video, `pilot/original.mp4`, was rejected because its D separated into a detached bar. The revised `pilot/connected.mp4` is the accepted source. The rejected request, source and contact sheet remain review evidence; they are not the public motion asset. See [Matter approval](matter/pilot/approval.json), [first-version review](matter/qa/pilot-v1-review.json) and [browser pilot](matter/qa/pilot-browser.json).

Archive's `pilot/original.mp4` (v1) and `pilot/upright.mp4` (v2) were rejected because the front folio toppled about its bottom edge and moved back toward its starting arrangement. `pilot/slide.mp4` (v3) keeps the sheets upright and progresses to the open pose. Its [v1 review](archive/qa/pilot-v1-review.json), [v2 review](archive/qa/pilot-v2-review.json) and [accepted v3 review](archive/qa/pilot-v3-review.json) retain that evidence. Handoff passed on its first source, documented in [manual review](handoff/qa/manual-review.json).

The study browser is `/oil-lab`; all three directions are available at `/oil-lab/matter`, `/oil-lab/archive` and `/oil-lab/handoff` with their accepted media. The runtime's availability flag is reserved for withholding unfinished future clips.

Final per-study browser records are [Matter](matter/qa/browser-acceptance.json), [Archive](archive/qa/browser-acceptance.json) and [Handoff](handoff/qa/browser-acceptance.json). Each covers desktop 1440×900, phone 390×844, short landscape 844×390, reduced motion and blocked-media fallback: 15 distinct scenarios across the three studies. Forward/reverse seeking reached frames **0 → 48 → 95 → 19**, idle animation-frame callbacks settled to zero, and autoplay calls/events remained zero. The three homepage study links/images and the lazily loaded `/classic` route also passed regression checks. These are Chromium results; physical-device Safari was not tested.

## Models, credentials and billing records

The successful generation path uses `openai/gpt-image-2` for 16:9 medium-quality opaque keyframes and `google/veo-3.1-lite` for four-second, silent 720p transitions. OpenRouter authentication has succeeded with the cloud secret **`OPEN_ROUTER_KEY`**. The adapter accepts that name first and `OPENROUTER_API_KEY` as a fallback; the website itself needs neither secret.

The adapter uses `POST /api/v1/images` and asynchronous `POST /api/v1/videos`, then polls the saved job and downloads its content. It does not reuse Oil Motion's ZenMux wire protocol. Video requests provide the accepted K0/K1 as `frame_images` with `first_frame` and `last_frame`. The [official image-to-video cookbook](https://openrouter.ai/docs/cookbook/video-generation/image-to-video) requires directly downloadable public HTTPS frame URLs. Local paths and image data URIs are not accepted by this adapter's video validator.

Generation is never retried automatically. A video submission saves a sanitized `.job.json`; resume that job after an interrupted poll. Image requests save `.generation.json` beside their PNG, containing numeric cost/token usage, dimensions, provider/model and a safe generation ID when returned. Existing image metadata also blocks accidental resubmission. The original Matter keyframes predate image-usage persistence; their missing sidecars are not evidence of zero cost. Final accounting must use the recorded usage and provider billing, not a briefly unchanged key-balance response. No credential, image base64, prompt or signed URL is copied into usage sidecars.

The actual [generation accounting](generation-costs.json) totals **$0.944404 USD for six image generations and six video generations**, including the rejected attempts. Each video job recorded $0.1188. The first two Matter images are recorded together as a measured $0.077453 authenticated balance delta because their individual response usage was not retained; the remaining four images use their API usage metadata. The records distinguish these two measurement methods rather than inventing per-image costs for Matter.

## Reproduce a generation deliberately

Run from the repository root. Generation commands spend credits when `--dry-run` is omitted. Existing source files are protected against overwriting; choose a new experiment/output path when repeating a generation.

```bash
python3 scripts/openrouter-motion.py check

python3 scripts/openrouter-motion.py image \
  --request motion-studies/openrouter-experiments/matter/source/image-K0-request.json \
  --output /tmp/gdamon-matter-review/K0.png \
  --dry-run
```

After the new K0 has passed identity/composition review, generate K1 using that actual frame as its reference:

```bash
python3 scripts/openrouter-motion.py image \
  --request motion-studies/openrouter-experiments/matter/source/image-K1-request.json \
  --reference /tmp/gdamon-matter-review/K0.png \
  --output /tmp/gdamon-matter-review/K1.png \
  --dry-run
```

Remove `--dry-run` only for the intended new generation. Review both full images before making them available at public HTTPS URLs and preparing a video request. The saved `matter/source/video-request-v2.json` records the corrected request that produced the accepted Matter clip. This command creates a new paid result, not a re-download of the accepted job:

```bash
python3 scripts/openrouter-motion.py video \
  --request motion-studies/openrouter-experiments/matter/source/video-request-v2.json \
  --output /tmp/gdamon-matter-review/connected.mp4 \
  --dry-run
```

For a job already submitted under the experiment directory, download or continue it with a fresh local output path instead:

```bash
python3 scripts/openrouter-motion.py resume \
  --job motion-studies/openrouter-experiments/matter/pilot/connected.job.json \
  --output /tmp/gdamon-matter-review/connected.mp4
```

An HTTP rejection or exhausted polling deadline is not a reason to submit the same video again. `--dry-run` performs no authentication, generation or network request and does not validate live model availability.

## Compile the accepted source with Oil Motion

Each accepted source is **1280×720, four seconds, 24 fps, 96 native frames**. The compiler preserves those 96 frames and emits all-keyframe H.264 for reliable forward/reverse seeking. Desktop output is 1280×720 at CRF 18; mobile output is 720×404 at CRF 20, with its height rounded to an even encoding dimension. No extra source detail or intermediate motion is invented. The source paths are `matter/pilot/connected.mp4`, `archive/pilot/slide.mp4` and `handoff/pilot/original.mp4`.

Use Python with Pillow and NumPy, plus `ffmpeg`/`ffprobe`. The pinned Oil Motion checkout is external to this repository:

```bash
git clone https://github.com/oil-oil/oil-motion.git /tmp/oil-motion-reference
git -C /tmp/oil-motion-reference checkout 8e4d1c3d0eab6aedd656f4a1afcd16b6633f83ee

python3 /tmp/oil-motion-reference/scripts/motion_budget.py \
  --frames 96 --display 1280x720 --dpr 1 --source 1280x720 \
  --driver scroll --parameter-space linear --time-control scrub \
  --access random --background-owner video --scroll-pages 2 \
  --strict --report /tmp/gdamon-matter-budget.json

python3 /tmp/oil-motion-reference/scripts/compile_scroll_video.py \
  motion-studies/openrouter-experiments/matter/pilot/connected.mp4 \
  /tmp/gdamon-matter-compiled \
  --background-owner video --budget-report /tmp/gdamon-matter-budget.json \
  --frame-policy native --fps 24 --desktop-width 1280 --mobile-width 720 \
  --desktop-crf 18 --mobile-crf 20 \
  --initial-state-id form --segment resolve=0:95:96 \
  --timeline-output /tmp/gdamon-matter-timeline.json
```

Reuse an already-cloned pinned checkout rather than cloning into a nonempty directory. Use a fresh compile directory for another review. Inspect the compiler's actual `compile.json`, contact sheet and every source frame before installing its desktop/mobile media, poster and generated timeline together under `public/oil-lab/{direction}/`. Source contracts and motion briefs describe intent; the compiled report and timeline establish delivered frame count and timing.

The accepted Matter timeline identifies the first state at frame 0 and the final state at frame 95, at 95/24 seconds. Its end-exclusive time is four seconds. The browser chooses one desktop or mobile source, keeps a persistent paused video element, and seeks the measured frame corresponding to scroll progress. Stopping input holds that frame; reversing scroll reverses the same source. Reduced motion and media failure retain the poster and readable HTML. Background and lighting are baked into the clip, so the delivery is `baked-video` with a `frame-scrub` controller, not an alpha atlas.

## Browser checks and local viewing

```bash
npm ci
npm run dev -- --host 0.0.0.0 --port 4175
```

Open `http://localhost:4175/oil-lab`. All three accepted clips are now compiled, so the full browser checker can run against the preview:

```bash
node scripts/check-oil-lab.mjs http://localhost:4175 /tmp/oil-lab-checks all
```

The study selector follows the base URL and output directory; `all` is also its default, while `matter`, `archive`, `handoff` or a comma-separated subset narrows the run. An optional viewport selector follows it and also defaults to `all`. The delivered set passed the final scenarios documented above. Re-run the checks after changes to media or runtime behavior, including desktop/mobile layout, rapid forward/reverse seeking, resting frames, zero autoplay, poster fallback, reduced motion and real project destinations. A successful video encode alone does not establish physical continuity or usable interaction.

## Attribution

This workflow uses [Oil Motion](https://github.com/oil-oil/oil-motion), by **Lin Zhihuang**, pinned to [`8e4d1c3d0eab6aedd656f4a1afcd16b6633f83ee`](https://github.com/oil-oil/oil-motion/tree/8e4d1c3d0eab6aedd656f4a1afcd16b6633f83ee). Its unmodified `motion_budget.py` and `compile_scroll_video.py` run from the external checkout. `src/oil-lab/frameAnimator.js` adapts the frame-target scheduling from `assets/interactive-motion.ts` and carries the full MIT notice. The retained license is [motion-studies/LICENSE](../LICENSE), also available at [motion-source/licenses/oil-motion-MIT.txt](../../motion-source/licenses/oil-motion-MIT.txt).

The OpenRouter adapter, personal-site composition, source contracts and generated media are project-specific work. No upstream artwork is bundled. Keep the attribution and MIT notice with redistributed adaptations.
