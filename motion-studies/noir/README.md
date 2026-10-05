# Noir / generated motion studies

Three independent black-studio sculptures accompany GDamon's research, deployed agent systems and evaluation work at `/oil-lab/noir`:

- **Seed**: one dense silver-grain seed opens into a twisting toroidal core.
- **Relay**: one folded silver-ribbon sculpture unfolds into an orbital connection structure.
- **Lens**: a compact concentric optical core opens into a layered evaluation aperture.

These are new generated image-to-video studies, separate from Matter, Archive and Handoff. They do not pretend to form a seamless three-clip chain. Each study keeps its own persistent paused media element, with native document scrolling mapped to its decoded timeline; readable copy and project links are HTML.

## Delivered source media

All three source clips passed a sequential review of all **288 native frames**. Each is four seconds at 24 fps, with 96 frames; the compiler preserves these frames and produces all-keyframe H.264 for reversible seeking. The timeline settles at frame 95 (3.958333 seconds), not the end-exclusive four-second boundary. Desktop delivery is 1280×720 and mobile delivery is 720×404, with the height rounded to an even encoding dimension. There is no source-detail upscaling or fabricated motion.

| Study | Desktop | Mobile | Source result |
| --- | ---: | ---: | --- |
| Seed | 5,876,736 bytes | 1,733,704 bytes | Grain seed opens into a twisted toroidal core. |
| Relay | 3,276,302 bytes | 804,992 bytes | Folded ribbons unfold into a coherent four-lobed orbital form. |
| Lens | 5,155,581 bytes | 1,176,495 bytes | Concentric ring depths and aperture proportions change progressively, then settle. |

The Seed pilot passed source review plus the actual desktop and mobile webpage before the other two video jobs were submitted. Its [upstream approval](seed/pilot/approval.json) records source hashes and [browser evidence](seed/qa/browser-pilot.json); [fallback evidence](seed/qa/browser-fallbacks.json) covers reduced motion, unavailable WebGL and blocked media. Final whole-page regression is tracked by the website QA separately.

[Generation accounting](generation-costs.json) records **$0.588684 USD** for six images and three videos, all first attempts. Each four-second video cost $0.1188; the image responses total $0.232284. There were no paid or automatic retries.

## Production contract

Each direction keeps `source/concept-contract.yaml`, `source/motion-brief.yaml`, the accepted K0/K1 review, sanitized API generation records, the original pilot video and the actual compiler reports. The budget selects `baked-video` plus `frame-scrub`. Background and light belong to the video: no chroma key, alpha claims or synthetic optical-flow interpolation.

The images are 1536×864 opaque PNGs generated with `openai/gpt-image-2`, with the accepted K0 used as an actual reference for K1. The user explicitly selected OpenRouter; `scripts/openrouter-motion.py` uses `OPEN_ROUTER_KEY` through the existing OpenRouter adapter, without modifying upstream Oil Motion's ZenMux implementation. The API key never ships to the client or request JSON.

Composition reviews record the actual focal bounds, including a larger-than-prompt sculpture scale. Subjects remain entirely in frame and keep the left 35% empty; the website uses contained media so they are not cropped on phones. Relay is accepted as one coherent four-lobed folded orbital sculpture rather than three separate literal ellipses. The records describe the delivered artwork.

Video intent uses a brief preparation, continuous arcing structural change, staggered follow-through, and a calm final settle. These are direction notes, not a claim that a generator mechanically guarantees every animation principle. The runtime's live particle choreography and typography implement the reversible interaction separately.

## Reproduction

Pinned [Oil Motion](https://github.com/oil-oil/oil-motion/tree/8e4d1c3d0eab6aedd656f4a1afcd16b6633f83ee), by Lin Zhihuang, supplies the unmodified budget, video compiler and production gate scripts. The existing repository MIT attribution applies; see [license](../LICENSE).

1. Authenticate with `python3 scripts/openrouter-motion.py check` without printing credentials.
2. Run the strict `motion_budget.py` contract before generation.
3. Generate each K0, review it, then generate K1 with `--reference` pointing at its accepted K0.
4. Publish only accepted keyframes at immutable public HTTPS URLs. Save these exact URLs in each video request.
5. Submit **Seed only** as the first pilot, review every native source frame, compile it and verify it in the actual webpage. Save the Oil Motion pilot approval before submitting Relay and Lens.
6. Compile each accepted source with `compile_scroll_video.py --frame-policy native --fps 24 --desktop-width 1280 --mobile-width 720 --desktop-crf 18 --mobile-crf 20 --initial-state-id form --segment resolve=0:95:96 --poster-source-frame 95`. Install the compiler-produced timeline together with the two media files. Save its final-state poster as `rest.webp`; separately decode native frame 0 into `poster.webp` for loading so ready-state entry never jumps from K1 back to K0. Reduced motion may use the final `rest.webp` while ordinary loading uses `poster.webp`.
7. Check forward/reverse seeking, resting frames, media failure, reduced motion and mobile layout in Chromium. Do not infer runtime acceptance from a successful encode.

Image/video requests are submitted once, never automatically retried. Interrupted video polls resume the recorded job. Billing records include rejected attempts if any; missing usage is never reported as free generation.
