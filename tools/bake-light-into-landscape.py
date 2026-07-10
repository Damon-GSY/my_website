#!/usr/bin/env python3
"""Bake the `light` (terracotta glow path) layer into `landscape` so the runtime
can drop a separate screen-blend + masked fullscreen composite (GPU-bound perf).

Reads:  src/assets/optimization-landscape.png, src/assets/optimization-light.png
Writes: public/assets/optimization-landscape.webp  (landscape with the glow baked in)

The glow is screen-blended onto landscape, gated by a radial alpha that
approximates the runtime mask `radial-gradient(ellipse at 56% 70%, ... 42% ... 82%)`,
so the bright path shows but the non-black edges don't wash the scene.
"""
from __future__ import annotations
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'src' / 'assets'
DST = ROOT / 'public' / 'assets'

STRENGTH = 0.45      # ~ runtime peak opacity of the light layer
TARGET_W = 2048

land = Image.open(SRC / 'optimization-landscape.png').convert('RGB')
light = Image.open(SRC / 'optimization-light.png').convert('RGB')
if land.size != light.size:
    raise SystemExit(f'size mismatch: {land.size} vs {light.size}')

L = np.asarray(land, np.float32)
G = np.asarray(light, np.float32)
h, w = L.shape[:2]

# Radial alpha ~ CSS mask: opaque near (0.56, 0.70), fades out.
cx, cy = 0.56 * w, 0.70 * h
rx, ry = 0.42 * w, 0.42 * h
nx = (np.arange(w) - cx) / rx
ny = (np.arange(h) - cy) / ry
NX, NY = np.meshgrid(nx, ny)
d = np.sqrt(NX ** 2 + NY ** 2)
alpha = np.clip(1 - (d - 0.5) / 0.7, 0, 1)        # 1 inside, 0 outside the ellipse
a = (alpha[..., None] * STRENGTH)                  # H, W, 1

# screen blend: 255 - (255-L)(255-G)/255, weighted by a
screen = 255.0 - (255.0 - L) * (255.0 - G) / 255.0
out = L * (1 - a) + screen * a
out = np.clip(out, 0, 255).astype(np.uint8)

baked = Image.fromarray(out)
new_h = round(baked.size[1] * TARGET_W / baked.size[0])
baked = baked.resize((TARGET_W, new_h), Image.LANCZOS)
baked.save(DST / 'optimization-landscape.webp', 'WEBP', quality=84, method=6)
print(f'baked glow into landscape -> {DST/"optimization-landscape.webp"}  {baked.size}  {((DST/"optimization-landscape.webp").stat().st_size//1024)}KB')
