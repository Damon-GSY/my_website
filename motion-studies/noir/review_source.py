#!/usr/bin/env python3
"""Decode every native source frame into four review sheets; never change motion."""
import argparse
import json
from pathlib import Path
import subprocess
import tempfile

import numpy as np
from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument('video', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames', '-show_entries', 'stream=width,height,r_frame_rate,nb_read_frames,duration', '-of', 'json', str(args.video)]))['streams'][0]
records = []
with tempfile.TemporaryDirectory(prefix='noir-native-review-') as temporary:
    folder = Path(temporary)
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(args.video), '-vsync', '0', '-vf', 'scale=320:180', str(folder / '%04d.png')], check=True)
    paths = sorted(folder.glob('*.png'))
    previous = None
    for start in range(0, len(paths), 24):
        sheet = Image.new('RGB', (1280, 1200), '#111111')
        label = ImageDraw.Draw(sheet)
        for index, path in enumerate(paths[start:start+24]):
            frame = Image.open(path).convert('RGB')
            data = np.asarray(frame).astype(float)
            ys, xs = np.where(data.max(2) > 35)
            records.append({'frame':start+index, 'mean_absolute_delta':float(np.abs(data-previous).mean()) if previous is not None else 0, 'subject_bounds':[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)] if len(xs) else None})
            previous = data
            x, y = (index % 4)*320, (index//4)*200
            sheet.paste(frame, (x, y))
            label.text((x+8, y+184), f'frame {start+index:02d}', fill='white')
        sheet.save(args.output / f'native-frames-{start:02d}-{min(start+23,len(paths)-1):02d}.jpg', quality=94)
    Image.open(paths[0]).save(args.output / 'decoded-first.png')
    Image.open(paths[-1]).save(args.output / 'decoded-last.png')
report = {'source':str(args.video),'probe':probe,'reviewed_sequence':'every source frame shown in order; these metrics do not replace visual review','decoded_frames':len(records),'adjacent_frames':records}
(args.output/'native-frame-analysis.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'{len(records)} native frames decoded; {len(range(0,len(records),24))} review sheets saved.')
