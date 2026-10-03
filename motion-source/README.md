# Agent Instrument motion source

This is a keyframe pilot inspired by [Oil Motion](https://github.com/oil-oil/oil-motion), pinned to commit `8e4d1c3d0eab6aedd656f4a1afcd16b6633f83ee`. The concept is one titanium shell opening vertically to expose cobalt glass layers. The camera, ivory studio background, pedestal, and lower assembly stay fixed.

**No continuous video has been generated. No paid video request has been submitted.** The current public manifest uses `video: null` and two generated still keyframes. Those keyframes are a design study, not evidence of continuous physical motion. The page can accept an actual clip once one exists.

`ZENMUX_API_KEY` is not configured in this environment. A future generation run requires a credential configured through a secure environment secret outside chat and source control, or an authorized clip created elsewhere. This repository contains no key and the local importer never calls a generation service.

## Production contract

- [concept-contract.yaml](concept-contract.yaml) records the subject, fixed visual anchors, and user interaction.
- [motion-brief.yaml](motion-brief.yaml) records the planned 180 native frames at 30 fps over 6 seconds, mapped to three viewport lengths of scrolling.
- [build/motion-budget.json](build/motion-budget.json) is the upstream budget result for that **planned** clip. It chooses `baked-video` with `frame-scrub`. It is not a report for an existing video.
- Maximum media display is 1440×810 CSS pixels at DPR 1. High DPR screens receive that same source resolution; this is an explicit performance target.

Budget command, run against the pinned upstream checkout:

```bash
python3 /tmp/oil-motion-reference/scripts/motion_budget.py \
  --frames 180 --display 1440x810 --dpr 1 \
  --driver scroll --parameter-space linear --time-control scrub \
  --background-owner video --scroll-pages 3 \
  --strict --report motion-source/build/motion-budget.json
```

The report deliberately omits `--source`: no actual video source has been measured yet. Its 180-frame estimate would require approximately 801 MiB if decoded as a full RGBA frame sequence; a single video avoids keeping that sequence resident.

## Generate and import the real clip

Use the approved closed and open keyframes as the first and last frame of one 16:9 source clip. Keep the lighting and camera locked. The upper shell rises on a straight vertical axis, revealing the existing inner glass layers without morphing or multiplying parts. No camera orbit, background transition, added text, or speed ramp is needed. Inspect the intermediate geometry and reverse motion before importing.

Install `ffmpeg` and `ffprobe`, then run from the repository root:

```bash
node scripts/prepare-motion-video.mjs /absolute/path/to/authorized-source.mp4
```

The importer checks the real source, requires 16:9 at least 1440×810, at least 30 fps, and at least 180 native frames over six seconds. It rejects insufficient source pixels or timing instead of upscaling or padding. It transcodes to a silent 1440×810, 30 fps H.264 clip with every frame a keyframe, then checks decoded frames, keyframe flags, timestamp spacing, duration, resolution, and codec with `ffprobe`.

Only after successful validation does it replace `public/motion-assets/agent-motion.mp4` and the manifest using staged files and atomic renames; a validation failure leaves the working assets unchanged. The manifest preserves the existing poster paths and stores measured `fps`, `frameCount`, and `duration`. A failed manifest install restores the previous video. Keep deployment atomic at the directory/build level as well: the two public files form one release.

For an isolated importer check, pass `--output-dir /tmp/motion-import-check`. Synthetic fixtures belong only in such a temporary directory and must never be published as the instrument animation.

The page must use one persistent video element. It maps progress to `round(progress * (frameCount - 1)) / fps`, holds the frame when input stops, and seeks backward when scrolling reverses. Reduced motion, load failure, or absent media retains a useful static keyframe comparison. If the approved source differs from the planned six seconds, rerun the budget with its measured frame count and recheck the scroll pacing.

The importer proves technical compatibility, not artistic continuity. Review the full motion, endpoints, every major intermediate state, and rapid forward/backward scrubbing before publishing the clip.

## Attribution

Oil Motion is by Lin Zhihuang and is distributed under the MIT License. We use its concept-contract / motion-budget approach and ran its unmodified budget utility from the external checkout. Frame-target scheduling in `src/motion/useMotionVideo.js` adapts its `createFrameAnimator` approach and includes the upstream MIT notice. The importer, page, and project-specific contracts are original implementations; no upstream media is bundled. The upstream MIT notice is also retained in [licenses/oil-motion-MIT.txt](licenses/oil-motion-MIT.txt).
