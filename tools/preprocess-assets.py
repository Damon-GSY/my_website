#!/usr/bin/env python3
"""Resize + compress the 4 optimization-landscape PNGs to WebP.

Reads:  src/assets/optimization-{foreground,landscape,depth,light}.png
Writes: public/assets/optimization-{foreground,landscape,depth,light}.webp

Idempotent. Each layer has a size budget (KB); the script exits non-zero if any
output exceeds its budget — that budget IS the regression test. Re-run after
tuning QUALITY/BUDGET until everything prints OK.
"""
from __future__ import annotations
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "assets"
DST = ROOT / "public" / "assets"
DST.mkdir(parents=True, exist_ok=True)

TARGET_W = 2048  # perf: was 2560; smaller textures cut GPU composite bandwidth

# (quality, budget_KB). Alpha layers (foreground/light) carry soft edges, so a
# slightly higher budget. Hero world (landscape) gets the biggest allowance.
SPECS = {
    "landscape":  dict(quality=84, budget_kb=600),
    "depth":      dict(quality=82, budget_kb=500),
    "foreground": dict(quality=82, budget_kb=500),
    "light":      dict(quality=80, budget_kb=450),
}


def compress(name: str, quality: int, budget_kb: int) -> tuple[str, int]:
    src = SRC / f"optimization-{name}.png"
    dst = DST / f"optimization-{name}.webp"
    im = Image.open(src)
    src_size = im.size
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)

    new_h = round(im.size[1] * TARGET_W / im.size[0])
    im2 = im.resize((TARGET_W, new_h), Image.LANCZOS)
    im2.save(dst, "WEBP", quality=quality, method=6)

    kb = dst.stat().st_size // 1024
    flag = "OK " if kb <= budget_kb else "OVER"
    print(f"  {name:12} {src_size[0]}x{src_size[1]} -> {TARGET_W}x{new_h}  "
          f"alpha={has_alpha!s:5}  {kb:>4}KB / {budget_kb}KB  [{flag}]")
    return flag, kb


def main() -> int:
    print(f"target width = {TARGET_W}px, output = {DST.relative_to(ROOT)}/")
    over = 0
    for name, spec in SPECS.items():
        flag, _ = compress(name, spec["quality"], spec["budget_kb"])
        if flag == "OVER":
            over += 1
    total = sum((DST / f"optimization-{n}.webp").stat().st_size for n in SPECS) // 1024
    print(f"  {'TOTAL':12} {'':>21}{'':>15}{total:>4}KB")
    if over:
        print(f"\nFAIL: {over} layer(s) over budget. Tune QUALITY/BUDGET and re-run.", file=sys.stderr)
        return 1
    print("\nOK: all layers within budget.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
