#!/usr/bin/env python3
"""Synthesize the original 18-second GDamon score, then normalize with FFmpeg."""

import argparse
from array import array
import hashlib
import json
import math
from pathlib import Path
import random
import subprocess
import tempfile
import wave


RATE = 48000
DURATION = 18
BPM = 120
TAU = math.tau


def run(command):
    result = subprocess.run(command, text=True, capture_output=True, check=False)
    if result.returncode:
        raise RuntimeError(result.stderr[-3000:])
    return result


def measurement(stderr):
    start = stderr.rfind('{')
    end = stderr.rfind('}')
    if start < 0 or end < start:
        raise RuntimeError('FFmpeg did not return a loudness measurement.')
    return json.loads(stderr[start:end + 1])


def synthesize(destination):
    samples = RATE * DURATION
    left = array('f', [0.0]) * samples
    right = array('f', [0.0]) * samples
    random_source = random.Random(707120)
    events = {'kick': 0, 'hat': 0, 'pluck': 0, 'pad': 0, 'transition': 0, 'mechanical': 0}

    def voice(start, length, signal, amplitude=1.0, pan=0.0):
        offset = round(start * RATE)
        count = min(round(length * RATE), samples - offset)
        balance_l = math.sqrt((1 - pan) / 2)
        balance_r = math.sqrt((1 + pan) / 2)
        for index in range(max(0, count)):
            t = index / RATE
            value = signal(t, index) * amplitude
            left[offset + index] += value * balance_l
            right[offset + index] += value * balance_r

    def kick(t, _):
        envelope = (1 - math.exp(-t * 1800)) * math.exp(-t * 17)
        phase = TAU * (47 * t + 85 * (1 - math.exp(-t * 38)) / 38)
        return math.sin(phase) * envelope

    def hat(t, _):
        return (random_source.random() * 2 - 1) * math.exp(-t * 85) * (1 - math.exp(-t * 5000))

    def pluck(frequency):
        def signal(t, _):
            attack = 1 - math.exp(-t * 850)
            envelope = attack * math.exp(-t * 7.5)
            fundamental = math.sin(TAU * frequency * t)
            harmonics = .26 * math.sin(TAU * frequency * 2 * t) + .10 * math.sin(TAU * frequency * 3 * t)
            return (fundamental + harmonics) * envelope
        return signal

    # Three related D-minor voicings, each exactly twelve beats long.
    chords = [(146.8324, 220, 293.6648), (130.8128, 174.6141, 261.6256), (146.8324, 220, 349.2282)]
    for chapter, chord in enumerate(chords):
        for index, frequency in enumerate(chord):
            def pad(t, _, frequency=frequency):
                envelope = min(1, t / .55) * min(1, max(0, (6 - t) / .8))
                oscillator = math.sin(TAU * frequency * t) + .24 * math.sin(TAU * frequency * 1.0025 * t)
                return oscillator * envelope
            voice(chapter * 6, 6, pad, .062, (index - 1) * .55)
            events['pad'] += 1

    motif = [293.6648, 440, 349.2282, 440, 261.6256, 349.2282, 293.6648, 440]
    for beat in range(34):
        at = beat * .5
        if beat < 30 or beat % 2 == 0:
            voice(at, .55, kick, .53 if beat % 4 == 0 else .35)
            events['kick'] += 1
        if 4 <= beat < 31:
            voice(at + .25, .11, hat, .055, -.20 if beat % 2 else .20)
            events['hat'] += 1
        if beat % 2 == 0 or 12 <= beat < 29:
            frequency = motif[beat % len(motif)] * (1 if beat < 24 else 2)
            voice(at, .70, pluck(frequency), .15 if beat < 24 else .11, -.30 if beat % 3 else .30)
            events['pluck'] += 1

    for at in (5.55, 11.55):
        def transition(t, _):
            envelope = math.sin(math.pi * min(1, t / .75)) ** 2
            noise = random_source.random() * 2 - 1
            tone = math.sin(TAU * (180 * t + 600 * t * t))
            return envelope * (noise * .28 + tone * .15)
        voice(at, .75, transition, .10)
        events['transition'] += 1

    for at, frequency in ((7.05, 880), (7.6, 660), (9.2, 990), (10.3, 550), (10.6, 1320)):
        def mechanical(t, _, frequency=frequency):
            return (math.sin(TAU * frequency * t) + .22 * math.sin(TAU * frequency * 2.73 * t)) * math.exp(-t * 42) * (1 - math.exp(-t * 3000))
        voice(at, .15, mechanical, .09, -.15 if frequency < 880 else .15)
        events['mechanical'] += 1

    peak = max(max(abs(value) for value in left), max(abs(value) for value in right))
    normalization = .86 / peak
    pcm = array('h')
    for index in range(samples):
        remaining = (samples - 1 - index) / RATE
        fade = min(1, index / (RATE * .008), remaining / .65)
        pcm.append(round(max(-1, min(1, left[index] * normalization * fade)) * 32767))
        pcm.append(round(max(-1, min(1, right[index] * normalization * fade)) * 32767))
    import sys
    if sys.byteorder != 'little':
        pcm.byteswap()
    with wave.open(str(destination), 'wb') as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(RATE)
        output.writeframes(pcm.tobytes())
    return events


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path('public/films/gdamon-score.wav'))
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='gdamon-score-') as directory:
        raw = Path(directory) / 'raw.wav'
        events = synthesize(raw)
        analysis = run(['ffmpeg', '-hide_banner', '-nostdin', '-i', str(raw), '-af',
                        'loudnorm=I=-14:TP=-1.9:LRA=11:print_format=json', '-f', 'null', '-'])
        measured = measurement(analysis.stderr)
        normalize = ('loudnorm=I=-14:TP=-1.9:LRA=11:linear=true:print_format=json'
                     f":measured_I={measured['input_i']}:measured_TP={measured['input_tp']}"
                     f":measured_LRA={measured['input_lra']}:measured_thresh={measured['input_thresh']}"
                     f":offset={measured['target_offset']}")
        run(['ffmpeg', '-hide_banner', '-nostdin', '-y', '-i', str(raw), '-af', normalize,
             '-ar', str(RATE), '-ac', '2', '-c:a', 'pcm_s16le', str(args.output)])
    final = measurement(run(['ffmpeg', '-hide_banner', '-nostdin', '-i', str(args.output), '-af',
                             'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-']).stderr)
    manifest = {
        'title': 'Make it useful — original score',
        'production': 'Original deterministic synthesized audio; no external samples or generated-provider audio.',
        'source': 'scripts/synthesize-gdamon-score.py',
        'source_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        'sha256': hashlib.sha256(args.output.read_bytes()).hexdigest(),
        'duration': DURATION, 'bpm': BPM, 'sampleRate': RATE, 'channels': 2,
        'chapterStarts': [0, 6, 12], 'events': events,
        'loudness': {'integratedLUFS': float(final['input_i']), 'truePeakDBTP': float(final['input_tp']),
                     'rangeLU': float(final['input_lra']), 'targetLUFS': -14, 'ceilingDBTP': -1.5},
    }
    args.output.with_suffix('.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps({'output': str(args.output), 'duration': DURATION, 'loudness': manifest['loudness']}, indent=2))


if __name__ == '__main__':
    main()
