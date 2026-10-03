#!/usr/bin/env python3
"""Package the three approved native pose sheets. Requires Pillow and FFmpeg."""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "motion-studies" / "source"
OUTPUT = ROOT / "public" / "motion-studies"
BUILD = ROOT / "motion-studies" / "build"
SETTINGS = {
    "observer": ("Porcelain Observer", [5, 4, 3, 2, 1, 0], 2, "0x084fe4"),
    "bloom": ("Silver Bloom", list(range(6)), 0, "0xf5f0e5"),
    "core": ("Amber Assembly", list(range(6)), 0, "0x1e1f1b"),
}


def run(*args: str) -> str:
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def prepare(study_id: str, settings: tuple) -> dict:
    name, order, rest, matte = settings
    source = SOURCE / study_id / "atlas-source.png"
    with Image.open(source) as image:
        if image.mode != "RGBA" or image.width % 3 or image.height % 2:
            raise ValueError(f"{study_id}: expected RGBA sheet with a regular 3×2 grid")
        width, height = image.size
        cell_width, cell_height = width // 3, height // 2
        if cell_width != cell_height or cell_width < 512:
            raise ValueError(f"{study_id}: approved 512px square cells required, no upscaling")
        alpha = image.getchannel("A")
        if any(alpha.getpixel(point) != 0 for point in [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]):
            raise ValueError(f"{study_id}: sheet corners must be truly transparent")
        cells = []
        for index in order:
            x, y = index % 3 * cell_width, index // 3 * cell_height
            plane = alpha.crop((x, y, x + cell_width, y + cell_height))
            bounds = plane.point(lambda value: 255 if value > 16 else 0).getbbox()
            if not bounds:
                raise ValueError(f"{study_id}: blank pose {index}")
            cells.append({"x": x, "y": y, "width": cell_width, "height": cell_height,
                          "sourceCell": index, "visibleBounds": bounds})

    atlas = OUTPUT / f"{study_id}.webp"
    run("ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
        "-c:v", "libwebp", "-quality", "92", "-frames:v", "1", str(atlas))
    with Image.open(atlas) as compressed:
        if compressed.size != (width, height) or compressed.mode != "RGBA":
            raise ValueError(f"{study_id}: encoded atlas lost dimensions or alpha")

    # Export the actual six source poses forward and backward. Repeated indices
    # are a playback pattern, never claimed to be newly generated motion frames.
    sequence = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1]
    video = OUTPUT / f"{study_id}-preview.mp4"
    with tempfile.TemporaryDirectory(prefix=f"{study_id}-poses-") as directory:
        work = Path(directory)
        for position, cell in enumerate(cells):
            run("ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
                "-vf", f"crop={cell_width}:{cell_height}:{cell['x']}:{cell['y']}",
                "-frames:v", "1", str(work / f"pose-{position}.png"))
        for position, pose in enumerate(sequence):
            shutil.copyfile(work / f"pose-{pose}.png", work / f"sequence-{position:02d}.png")
        run("ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-framerate", "5",
            "-i", str(work / "sequence-%02d.png"), "-f", "lavfi", "-i",
            f"color=c={matte}:s={cell_width}x{cell_height}:r=5",
            "-filter_complex", "[1:v][0:v]overlay=shortest=1:format=auto,format=yuv420p[output]",
            "-map", "[output]", "-an", "-c:v", "libx264", "-crf", "18",
            "-r", "5", "-g", "1", "-keyint_min", "1", "-sc_threshold", "0",
            "-frames:v", str(len(sequence)), "-movflags", "+faststart", str(video))
    probe = json.loads(run("ffprobe", "-v", "error", "-count_frames", "-show_streams", "-show_format", "-of", "json", str(video)))
    stream = next(item for item in probe["streams"] if item["codec_type"] == "video")
    if int(stream["nb_read_frames"]) != len(sequence) or stream["avg_frame_rate"] != "5/1":
        raise ValueError(f"{study_id}: unexpected export frame count or rate")
    write_json(BUILD / f"{study_id}-timeline.json", {
        "source": f"source/{study_id}/atlas-source.png", "sourceSha256": digest(source),
        "uniqueNativePoses": 6, "framePolicy": "native", "interpolation": False,
        "atlas": {"width": width, "height": height, "decodedBytes": width * height * 4,
                  "bytes": atlas.stat().st_size, "sha256": digest(atlas)},
        "frames": cells,
        "preview": {"path": f"/motion-studies/{video.name}", "codec": stream["codec_name"],
                    "fps": 5, "frameCount": int(stream["nb_read_frames"]),
                    "duration": float(probe["format"]["duration"]), "poseOrder": sequence,
                    "bytes": video.stat().st_size, "sha256": digest(video),
                    "type": "Encoded native-pose demonstration, not AI-generated video"},
    })
    return {"id": study_id, "name": name, "atlas": f"/motion-studies/{atlas.name}",
            "columns": 3, "rows": 2, "frameCount": 6, "cellWidth": cell_width,
            "cellHeight": cell_height, "displaySize": 512, "targetDPR": 1,
            "restFrame": rest, "frames": cells, "previewVideo": f"/motion-studies/{video.name}",
            "nativePoses": 6, "playbackFPS": 5}


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    studies = [prepare(study_id, settings) for study_id, settings in SETTINGS.items()]
    write_json(OUTPUT / "manifest.json", {"version": 1, "mode": "native-pose-studies", "studies": studies})
    print(json.dumps({study["id"]: {"atlas": study["atlas"], "video": study["previewVideo"]} for study in studies}, indent=2))


if __name__ == "__main__":
    main()
