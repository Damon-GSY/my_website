import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, URL } from 'node:url';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import console from 'node:console';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public', 'films');
const DURATION = 18;
const FPS = 30;
const PRESETS = { landscape: [1280, 720], portrait: [720, 1280], square: [900, 900] };
const SAMPLE_FRAMES = [21, 84, 150, 192, 264, 336, 378, 444, 513];
const HELP = `Render the real GDamon code film at deterministic timestamps.

node scripts/render-gdamon-film.mjs [--base-url http://localhost:4175]
  [--format landscape|portrait|square|all] [--frames 0,45,180,300,539]
  [--contactsheet] [--work-dir /tmp/gdamon-film] [--poster-frame 45]

Without --frames: capture all 540 frames, encode MP4/audio, posters and manifest.
With --frames: capture only those zero-based frame indices; no MP4 is encoded.
--contactsheet emits a three-column WebP inspection sheet in public/films.
PNG caches survive failures and successful exports, and are reused only when
source fingerprint, format, dimensions, duration and frame rate match.
Formats run serially. This command launches one Chromium process at a time.`;

function options(args) {
  const result = { baseURL: 'http://localhost:4175', format: 'landscape', frames: null, contactsheet: false, workDir: join(tmpdir(), 'gdamon-film'), posterFrame: 45 };
  const fields = { '--base-url': 'baseURL', '--format': 'format', '--frames': 'frames', '--work-dir': 'workDir', '--poster-frame': 'posterFrame' };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--contactsheet') { result.contactsheet = true; continue; }
    if (!fields[arg] || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Unknown or incomplete option: ${arg}`);
    result[fields[arg]] = args[++index];
  }
  if (!Object.hasOwn(PRESETS, result.format) && result.format !== 'all') throw new Error('Unknown format. Choose landscape, portrait, square or all.');
  const url = new URL(result.baseURL);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Base URL must be HTTP(S).');
  result.posterFrame = Number(result.posterFrame);
  if (!Number.isInteger(result.posterFrame) || result.posterFrame < 0 || result.posterFrame >= DURATION * FPS) throw new Error('Poster frame must be between 0 and 539.');
  if (result.frames !== null) {
    if (!/^\d+(,\d+)*$/.test(result.frames)) throw new Error('--frames must contain comma-separated zero-based frame numbers.');
    result.frames = [...new Set(result.frames.split(',').map(Number))].sort((a, b) => a - b);
    if (result.frames.some(frame => frame >= DURATION * FPS)) throw new Error('Frame indices must be between 0 and 539.');
  }
  return result;
}

function execute(command, args, capture = false) {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit', maxBuffer: 10 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(`${command} failed: ${result.error?.message || result.stderr?.slice(-2500) || result.status}`);
  return result.stdout;
}
const ffmpeg = args => execute('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-y', ...args]);
const exists = async path => { try { await access(path); return true; } catch { return false; } };
const hash = data => createHash('sha256').update(data).digest('hex');
const framePath = (directory, frame) => join(directory, `${String(frame).padStart(5, '0')}.png`);

function measureAudio(path) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', '-i', path, '-vn', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error('Encoded audio could not be measured.');
  const start = result.stderr.lastIndexOf('{');
  const end = result.stderr.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('Encoded audio loudness measurement is absent.');
  const measured = JSON.parse(result.stderr.slice(start, end + 1));
  return { integratedLUFS: Number(measured.input_i), truePeakDBTP: Number(measured.input_tp), rangeLU: Number(measured.input_lra) };
}

async function sourceFingerprint() {
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else files.push(path);
    }
  }
  await visit(join(ROOT, 'src', 'film'));
  files.push(join(ROOT, 'src', 'robot', 'robotScene.js'), join(ROOT, 'package-lock.json'));
  const digest = createHash('sha256');
  for (const file of files.sort()) { digest.update(file.slice(ROOT.length)); digest.update(await readFile(file)); }
  return digest.digest('hex');
}

async function validFrame(path, width, height) {
  try {
    const bytes = await readFile(path);
    return bytes.length > 32 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && bytes.readUInt32BE(16) === width && bytes.readUInt32BE(20) === height;
  } catch { return false; }
}

async function score() {
  const audio = join(PUBLIC, 'gdamon-score.wav');
  const metadata = audio.replace(/\.wav$/, '.json');
  const source = join(ROOT, 'scripts', 'synthesize-gdamon-score.py');
  let ready = false;
  if (await exists(audio) && await exists(metadata)) {
    const manifest = JSON.parse(await readFile(metadata, 'utf8'));
    ready = manifest.source_sha256 === hash(await readFile(source)) && manifest.sha256 === hash(await readFile(audio));
  }
  if (!ready) execute('python3', [source, '--output', audio]);
  return audio;
}

async function contactSheet(directory, frames, format) {
  const selected = frames.length === DURATION * FPS ? SAMPLE_FRAMES : frames.length > 12 ? Array.from({ length: 9 }, (_, index) => frames[Math.round(index * (frames.length - 1) / 8)]) : frames;
  const sheetDirectory = join(directory, 'contact');
  await mkdir(sheetDirectory, { recursive: true });
  for (let index = 0; index < selected.length; index++) await copyFile(framePath(directory, selected[index]), framePath(sheetDirectory, index));
  const columns = Math.min(3, selected.length);
  const rows = Math.ceil(selected.length / columns);
  const output = join(PUBLIC, `gdamon-${format}-contact.webp`);
  ffmpeg(['-framerate', '1', '-i', join(sheetDirectory, '%05d.png'), '-frames:v', '1', '-vf', `scale=360:-1,tile=${columns}x${rows}:nb_frames=${selected.length}:padding=8:margin=8:color=0x111a23`, '-c:v', 'libwebp', '-quality', '88', output]);
  await writeFile(join(PUBLIC, `gdamon-${format}-contact.json`), JSON.stringify({ format, columns, frames: selected, seconds: selected.map(frame => frame / FPS), source: 'Actual captured film frames; row-major order.' }, null, 2) + '\n');
  return output;
}

async function render(format, args, fingerprint, audio) {
  const [width, height] = PRESETS[format];
  const directory = resolve(args.workDir, `${format}-${fingerprint.slice(0, 16)}-${width}x${height}-${FPS}`);
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'capture.json'), JSON.stringify({ sourceSHA256: fingerprint, width, height, fps: FPS, duration: DURATION, format, baseURL: args.baseURL }, null, 2) + '\n');
  const frames = args.frames || Array.from({ length: DURATION * FPS }, (_, index) => index);
  const missing = [];
  for (const frame of frames) if (!(await validFrame(framePath(directory, frame), width, height))) missing.push(frame);
  console.log(`${format}: ${frames.length - missing.length}/${frames.length} frames cached; ${missing.length} to render. Cache: ${directory}`);
  let metrics = null;
  {
    const browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_EXECUTABLE || '/usr/bin/chromium', headless: true,
      args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
    });
    try {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      const url = new URL('/film?render=1', args.baseURL);
      await page.goto(url.href, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForFunction(() => globalThis.GDamonFilm?.capture && globalThis.GDamonFilm?.setSize, null, { timeout: 60000 });
      const duration = await page.evaluate(async ({ width, height }) => {
        await globalThis.document.fonts.ready;
        globalThis.GDamonFilm.setSize(width, height);
        return globalThis.GDamonFilm.duration;
      }, { width, height });
      if (duration !== DURATION) throw new Error(`Film duration ${duration} does not match the ${DURATION}-second production contract.`);
      const robotRenderer = await page.evaluate(() => {
        globalThis.GDamonFilm.seek(8.8);
        return globalThis.GDamonFilm.getMetrics()?.robot?.renderer;
      });
      if (robotRenderer !== 'three') throw new Error('The robot is not using its real Three.js renderer. Refusing to export a fallback scene.');
      for (let index = 0; index < missing.length; index++) {
        const frame = missing[index];
        const data = await page.evaluate(t => globalThis.GDamonFilm.capture(t), frame / FPS);
        if (typeof data !== 'string' || !data.startsWith('data:image/png;base64,')) throw new Error(`Frame ${frame} is not a PNG data URL.`);
        const path = framePath(directory, frame);
        await writeFile(path, Buffer.from(data.slice(data.indexOf(',') + 1), 'base64'));
        if (!(await validFrame(path, width, height))) throw new Error(`Frame ${frame} has invalid PNG dimensions.`);
        if ((index + 1) % 30 === 0 || index === missing.length - 1) console.log(`${format}: rendered ${index + 1}/${missing.length} missing frames (t=${(frame / FPS).toFixed(2)}s).`);
      }
      metrics = await page.evaluate(() => globalThis.GDamonFilm.getMetrics?.() || null);
      if (pageErrors.length) throw new Error(`Browser errors: ${pageErrors.join('; ')}`);
    } finally { await browser.close(); }
  }
  if (await sourceFingerprint() !== fingerprint) throw new Error('Film source changed during capture. Frames retained; rerun after source settles.');
  if (args.contactsheet) console.log(`Contact sheet: ${await contactSheet(directory, frames, format)}`);
  if (args.frames) { console.log('Selected-frame review finished; MP4 was not encoded.'); return; }

  const output = join(PUBLIC, `gdamon-${format}.mp4`);
  ffmpeg(['-framerate', String(FPS), '-i', join(directory, '%05d.png'), '-i', audio,
    '-map', '0:v:0', '-map', '1:a:0', '-frames:v', String(DURATION * FPS), '-t', String(DURATION),
    '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart',
    '-metadata', 'title=GDamon — Make it useful', '-metadata', 'comment=Original code-rendered film and synthesized score. No AI-generated video.', output]);
  ffmpeg(['-v', 'error', '-i', output, '-f', 'null', '-']);
  const poster = join(PUBLIC, `gdamon-${format}-poster.webp`);
  ffmpeg(['-i', framePath(directory, args.posterFrame), '-frames:v', '1', '-c:v', 'libwebp', '-quality', '90', poster]);
  if (format === 'landscape') await copyFile(poster, join(PUBLIC, 'gdamon-poster.webp'));
  const probe = JSON.parse(execute('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels,duration,nb_frames:format=duration,size', '-of', 'json', output], true));
  const video = probe.streams.find(stream => stream.codec_name === 'h264');
  const audioStream = probe.streams.find(stream => stream.codec_name === 'aac');
  if (!video || video.width !== width || video.height !== height || video.r_frame_rate !== '30/1' || Number(video.nb_frames) !== DURATION * FPS || Math.abs(Number(probe.format.duration) - DURATION) > .05) throw new Error('Encoded video failed duration, dimensions, codec, frame count or frame-rate verification.');
  if (!audioStream || audioStream.sample_rate !== '48000' || audioStream.channels !== 2) throw new Error('Encoded audio is not stereo 48 kHz AAC.');
  const encodedAudioLoudness = measureAudio(output);
  if (Math.abs(encodedAudioLoudness.integratedLUFS + 14) > .75 || encodedAudioLoudness.truePeakDBTP > -1.5) throw new Error(`Encoded AAC failed loudness verification: ${JSON.stringify(encodedAudioLoudness)}.`);
  const audioManifest = JSON.parse(await readFile(join(PUBLIC, 'gdamon-score.json'), 'utf8'));
  const manifest = {
    title: 'GDamon — Make it useful', format, width, height, fps: FPS, duration: DURATION, frames: DURATION * FPS,
    chapters: [{ name: 'Hello', start: 0 }, { name: 'Intelligence in motion', start: 6 }, { name: 'Make it useful', start: 12 }],
    production: 'Deterministic frames from the live Canvas/Three.js film; original synthesized audio. Not AI-generated video or interpolated still images.',
    source: 'src/film', sourceSHA256: fingerprint, file: `/films/gdamon-${format}.mp4`, poster: `/films/gdamon-${format}-poster.webp`,
    sha256: hash(await readFile(output)), audio: audioManifest, encodedAudioLoudness, probe, metrics, cache: directory,
  };
  await writeFile(join(PUBLIC, `gdamon-${format}.json`), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Verified export: ${output}`);
}

try {
  const args = options(process.argv.slice(2));
  if (args.help) console.log(HELP);
  else {
    await mkdir(PUBLIC, { recursive: true });
    const fingerprint = await sourceFingerprint();
    const audio = args.frames ? null : await score();
    for (const format of args.format === 'all' ? Object.keys(PRESETS) : [args.format]) await render(format, args, fingerprint, audio);
  }
} catch (error) {
  console.error(`Export stopped: ${error.message}\nCaptured frames have been retained for review/resume.`);
  process.exitCode = 1;
}
