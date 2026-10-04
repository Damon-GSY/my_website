# Rendering GDamon — Make it useful

The 18-second film uses the actual live Canvas/Three.js scene at explicit timestamps. Each of its three six-second chapters is aligned to the original 120 BPM score. This is code-to-video production, not an AI-generated clip or frame interpolation.

Start the website, then render through its dedicated API. Only run one Chromium capture at a time on the cloud software GPU.

```bash
npm run dev -- --host 0.0.0.0 --port 4175
node scripts/render-gdamon-film.mjs --base-url http://localhost:4175 \
  --format landscape --frames 21,84,150,192,264,336,378,444,513 --contactsheet
```

The review command captures nine actual PNG frames and a three-column contact sheet with 360-pixel-wide cells. Review the companion JSON for row-major timestamps. Selected-frame mode does not encode or replace an MP4. It creates the sample cache and contact sheet only.

After visual review, export each responsive composition serially:

```bash
node scripts/render-gdamon-film.mjs --format all --contactsheet
```

Presets are landscape 1280×720, portrait 720×1280 and square 900×900, all 540 frames at 30 fps. `--format` can select one preset. `--poster-frame` selects its zero-based poster frame; the default is frame 45 (1.5 seconds).

The viewer exposes `window.GDamonFilm = {duration, seek(t), setSize(w,h), capture(t), getMetrics()}` after its local fonts are ready. `/film?render=1` disables the live clock and viewport-driven resizing. `capture(t)` paints exactly `t` seconds and returns PNG bytes as a data URL, so slow rendering cannot change the animation timing.

Outputs live in `public/films/`:

- `gdamon-landscape.mp4`, `gdamon-portrait.mp4`, `gdamon-square.mp4`: H.264/yuv420p and AAC, faststart, native 30 fps.
- `gdamon-{format}-poster.webp`: actual frame posters; `gdamon-poster.webp` aliases landscape.
- `gdamon-{format}-contact.webp` and `.json`: actual frame sheets and their timestamps when `--contactsheet` is set.
- `gdamon-{format}.json`: measured FFprobe data, source/video hashes, audio provenance and render metrics.
- `gdamon-score.wav` and `.json`: the original stereo score and measured loudness.

The score uses deterministic synthesized kicks, noise hats, plucked notes, pads, two transition gestures and five mechanical accents aligned to the robot's actions. There are no downloaded or external audio samples. It resolves into a final hold and fades cleanly at 18 seconds. FFmpeg performs two-pass loudness normalization targeting −14 LUFS integrated and a −1.5 dBTP ceiling (the WAV normalization pass reserves 0.4 dB of headroom for AAC reconstruction). The exporter measures the actual encoded AAC and rejects a peak above −1.5 dBTP or integrated loudness more than 0.75 LU from the target. The web player starts muted; sound requires an explicit action.

```bash
python3 scripts/synthesize-gdamon-score.py --output public/films/gdamon-score.wav
```

PNG frames are cached under `/tmp/gdamon-film/`, keyed by film source SHA-256, format, dimensions and frame rate. `--work-dir` changes the parent directory. Re-running a command resumes valid existing PNGs; altered source uses a separate cache. A capture that detects source changes stops before encoding. Frames survive both success and failure so that visual errors can be inspected. Remove cache directories manually only after accepting the deliverables.

The exporter seeks to 8.8 seconds and requires `getMetrics().robot.renderer === 'three'` before accepting any capture session, even when all frames are cached. It refuses to publish the robot's emergency 2D fallback as a real 3D film. Every encoded file receives a full FFmpeg decode pass and FFprobe verification for dimensions, codec, duration and frame rate. Successful encoding alone does not establish visual quality: review chapter boundaries, arbitrary-time determinism, the final readable hold, and each responsive composition before publishing.

Run the reusable frame and player checks after the MP4s exist. Prefer a stable production preview when other contributors are editing source, so Vite hot reload does not interrupt browser captures.

```bash
npm run build
npm run preview -- --port 4176
node scripts/check-gdamon-film.mjs http://localhost:4176 /tmp/gdamon-film-review
node scripts/check-gdamon-player.mjs http://localhost:4176 /tmp/gdamon-player-review
```
