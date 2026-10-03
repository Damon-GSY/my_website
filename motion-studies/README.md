# Motion studies

Three interactive studies use six image-generated poses per object, played as deliberate stop motion at 5 fps or selected by input. They adapt the concept contracts, resource budgeting, atlas rendering, and reduced-motion guidance from [Oil Motion](https://github.com/oil-oil/oil-motion), pinned to [`8e4d1c3d0eab6aedd656f4a1afcd16b6633f83ee`](https://github.com/oil-oil/oil-motion/tree/8e4d1c3d0eab6aedd656f4a1afcd16b6633f83ee).

| Study | Generated change | Input | Time control |
| --- | --- | --- | --- |
| Porcelain Observer | Ceramic head turns horizontally from −30° to +30° | Pointer position | Native-pose scrub |
| Silver Bloom | Silver petals open around a vermilion hub | Drag or range control | Native-pose scrub |
| Amber Assembly | Six amber blocks organize into two columns and three rows | State controls | Segment playback |

## Source and scope

The built-in image generator supplies each transparent pose atlas directly. No ZenMux request or AI video request is made. Six poses provide six distinct semantic states; playing them, reversing them, or repeating them does not create additional motion detail. This is a compact stop-motion study, with visible steps between poses.

The source contracts and briefs live in `source/{observer,bloom,core}/`. [The identity bible](source/identity-bible.md) records the features to keep fixed and the changes to inspect. The source PNGs, actual image measurements, asset hashes, and final manifests establish what was delivered; requested dimensions alone do not establish image quality.

Oil Motion's video-generation Pilot and video-frame-chain checks are not applicable to these directly generated image sequences. This adaptation does not claim to pass those gates and does not create a video approval record. Source pose inspection and browser checks instead cover the actual deliverable.

Each exported MP4 encodes these same six source poses: `0,1,2,3,4,5,4,3,2,1`, at 5 fps for two seconds. Its ten encoded frames contain six unique generated poses, without optical-flow interpolation. The primary page renderer uses the transparent atlas; the MP4 is a downloadable demonstration, not a second runtime renderer.

## Delivered files and reproduction

- `source/{observer,bloom,core}/atlas-source.png`: original generated RGBA sheet, 1536×1024 pixels.
- `build/*-motion-budget.json`: final passing budgets using actual 512×512 source cells.
- `build/*-timeline.json`: source/output SHA-256, exact cell order, actual decoded memory and measured MP4 metadata.
- `qa/*-source-analysis.json`: source transparency, nonblank cells and adjacent-frame difference checks.
- `../public/motion-studies/manifest.json`: runtime geometry and media paths.

With Python, Pillow, FFmpeg and ffprobe installed, run from the repository root:

```bash
python scripts/prepare-pose-studies.py
```

This only packages the retained source images. It does not call a generation service. The Observer sheet is read in reverse cell order so its visible turn follows left-to-right pointer movement. All three atlases are truly transparent; they are compressed at their native dimensions and remain under 340 KiB each.

## Atlas budget

The initial plan requests a 1536×1024 transparent atlas arranged in three columns and two rows, yielding six 512×512 cells. At a maximum 512×512 CSS-pixel display and target DPR 1, that layout occupies 6 MiB of decoded RGBA memory and fits within a single 4096-pixel texture. The target DPR is a clarity budget, not a change to the device's physical DPR.

Files named `build/*-planned-budget.json` describe that plan. Recheck the returned atlas dimensions and cell boundaries, then rerun the upstream budget with measured cell sizes and the actual maximum CSS display. If the returned cells are smaller, reduce the display limit or regenerate; upscaling does not add source detail. Source and measured reports must remain distinguishable.

For example, this command reproduces the **planned** Observer budget from the pinned upstream checkout:

```bash
python3 /tmp/oil-motion-reference/scripts/motion_budget.py \
  --frames 6 --display 512x512 --dpr 1 \
  --driver pointer --parameter-space linear --time-control scrub \
  --background-owner page --strict \
  --report motion-studies/build/observer-planned-budget.json
```

Use `--driver drag` for Bloom, and `--driver state --time-control segment-play` for Assembly. The final measured check also supplies `--source` and `--cell` using a single pose's actual pixel dimensions, not the dimensions of the entire sheet. These short sequences are not mapped across a long scrolling page.

## Rendering and verification

Use one decoded atlas and select a cell directly. Await `Image.decode()` before enabling it, preserve a stable fallback during loading, and cancel stale playback when input changes. Keep frame order, rest pose, playback rate, dimensions, and asset paths in the delivered manifest. Do not crossfade adjacent poses to imply new frames.

Inspect every source pose and adjacent pair for object identity, component count, framing, alpha edges, and the intended motion. Test the object over the actual page background as well as light and dark backgrounds. A transparency-channel check alone cannot detect an unwanted opaque patch inside the artwork.

Browser checks cover desktop and touch input, immediate reversal, pause/resume, hidden and offscreen suspension, failed assets, and the measured display size. With reduced motion enabled, show a static native pose; explicit controls may select another pose immediately without automatic playback or pointer scrubbing.

## Attribution

Oil Motion is by Lin Zhihuang and is licensed under MIT. Its unmodified budget utility is run from the pinned external checkout; no upstream artwork is bundled. The full notice is retained in [LICENSE](LICENSE). Project-specific generated media and implementation are documented separately from the upstream reference.
