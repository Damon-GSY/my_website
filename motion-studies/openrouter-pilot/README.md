# OpenRouter / Oil Motion robot pilot

This directory preserves the original robot-greeting pilot plan. **That specific robot clip has not been generated.** OpenRouter authentication now works through the cloud secret `OPEN_ROUTER_KEY`, and the separate [Oil Motion experiments](../openrouter-experiments/README.md) have produced accepted Matter, Archive and Handoff source videos with compiled desktop/mobile media and completed integrated Chromium verification. Their generation and acceptance records belong to that experiment directory, not this older pilot. Physical-device Safari was not tested.

The adapter reads `OPEN_ROUTER_KEY` first and `OPENROUTER_API_KEY` as a fallback. Keep credentials in the cloud environment's Secrets settings, outside browser bundles, command arguments, repository files and chat. The normal website preview does not need a generation key. `qa/preflight.json` is the historical pre-authentication preparation record; it is not a statement about the current environment.

## Pilot

Use the existing GDamon character as an identity reference. Generate and inspect one 16:9 studio keyframe; then generate one four-second clip in which the robot blinks, nods, and returns to the same pose. There is no batch generation and no new preview entry until a real clip passes review.

Oil Motion's unchanged budget tool selected `baked-video` with `autonomous-playback`: 96 planned native frames at 24 fps, 1280×720 at DPR1, a fixed cobalt studio background, and no chroma key. Native video dimensions, frame rate and duration must replace the plan after generation. The same accepted K0 is used as both first and last frame, but this pilot plays once; seamless looping is not claimed.

The four sources remain separate:

- `source/concept-contract.json`: subject, visual intent, continuity and destination.
- `source/motion-brief.json`: derived production plan.
- `build/motion-budget.json`: actual budget-tool result.
- `build/timeline.json`: intentionally absent until there is a real decoded video.

The image request's candidate model is `openai/gpt-image-2`; the video candidate is `google/veo-3.1-lite`. Both have since been used successfully for the three separate experiments. The image model accepts 16:9, medium quality, opaque background and an input reference, so this prepared request uses those fields instead of an unlisted explicit pixel size. Veo supports four seconds, 720p, 16:9 and both first/last frames. Its reviewed 720p no-audio price is $0.03 per second, approximately $0.12 for this pilot, excluding the image request; the completed experimental jobs each recorded $0.1188. The [six-image/six-video experiment ledger](../openrouter-experiments/generation-costs.json) totals $0.944404 including rejected attempts. Recheck capabilities and pricing before a new submission. Do not silently drop first/last-frame constraints or change models after an API rejection.

## Prepared CLI

The stdlib-only helper reads the key from the environment. Its read-only preflight and local request validation are separate from paid generation:

```bash
python3 scripts/openrouter-motion.py check
python3 scripts/openrouter-motion.py image \
  --request motion-studies/openrouter-pilot/source/image-request.json \
  --reference public/robot-assets/robot-still.webp \
  --output motion-studies/openrouter-pilot/pilot/K0.png \
  --dry-run
```

After the live preflight succeeds, the same image command without `--dry-run` submits one image request. Review the generated frame before preparing a video request. The video JSON must set `model`, `prompt`, `duration: 4`, `resolution: "720p"`, `aspect_ratio: "16:9"`, `generate_audio: false`, and two `frame_images` entries using the accepted K0 HTTPS URL and `frame_type: "first_frame"` / `"last_frame"`.

```bash
python3 scripts/openrouter-motion.py video \
  --request motion-studies/openrouter-pilot/pilot/video-request.json \
  --output motion-studies/openrouter-pilot/pilot/greeting.mp4
```

Video submission validates the current catalog first, submits once, and writes a sanitized `.job.json` before polling. For an interrupted submitted job, continue it rather than generating another:

```bash
python3 scripts/openrouter-motion.py resume \
  --job motion-studies/openrouter-pilot/pilot/greeting.job.json \
  --output motion-studies/openrouter-pilot/pilot/greeting.mp4
```

`--dry-run` validates local inputs without authentication, generation or network access. It does not establish model availability. Existing output files are not overwritten. The helper never prints API response bodies, key values, image base64 or signed download links, and forwards authorization only to the fixed OpenRouter origin. Image billing numbers and dimensions are saved in adjacent `.generation.json` files; video jobs use `.job.json`. Neither path retries a paid request automatically. This robot pilot's generated video request, frames and clip remain absent until it is actually produced.

## API differences

The current OpenRouter APIs are `POST /api/v1/images` and asynchronous `POST /api/v1/videos`. Video first/last images use `frame_images` and `frame_type`; jobs complete with `status: completed`, followed by an authenticated content download. Oil Motion's default ZenMux scripts use different paths, fields and success states. Replacing only the URL would be incorrect.

The preparation follows [Oil Motion](https://github.com/oil-oil/oil-motion), pinned to [`8e4d1c3d0eab6aedd656f4a1afcd16b6633f83ee`](https://github.com/oil-oil/oil-motion/tree/8e4d1c3d0eab6aedd656f4a1afcd16b6633f83ee), and its pilot/identity/QA workflow. Oil Motion is by Lin Zhihuang under the [MIT License](../LICENSE). API details were verified from official OpenRouter documentation mirrored in its public GitHub repository:

- [Image generation](https://github.com/OpenRouterTeam/docs/blob/main/guides/overview/multimodal/image-generation.mdx)
- [Video generation](https://github.com/OpenRouterTeam/docs/blob/main/guides/overview/multimodal/video-generation.mdx)
- [Image-to-video cookbook](https://openrouter.ai/docs/cookbook/video-generation/image-to-video)

## Acceptance before page integration

Inspect the opening keyframe against `source/identity-bible.md`. Provide accepted first/last frame images as directly downloadable HTTPS URLs. Check the full generated clip, its actual first/last frames, and neighboring frames for identity changes, extra parts, drifting camera, cuts or exposure changes. Probe the file with ffprobe, compile an optimized MP4 and poster, then build the runtime timeline from the measured output. Only then add the planned route and gallery card, with pause/replay, reduced motion, offscreen suspension and a poster fallback.

## Verified preparation

The initial preparation passed 19 mocked protocol, error and credential-handling checks, including image decoding, pending-to-completed video state, persisted failed jobs, resume without another POST, missing credentials, unsupported capabilities, write protection and redirect handling. At that historical checkpoint, the public catalogs worked but authentication was blocked by the missing original variable. The current helper also has verified credential-alias handling and numeric-only image-usage persistence; live authentication and all three experimental source generations have now succeeded. This pilot's image dry run, planned Oil Motion budget and Python syntax checks do not constitute acceptance of an ungenerated robot clip.
