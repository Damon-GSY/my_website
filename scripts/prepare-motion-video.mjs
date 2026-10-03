#!/usr/bin/env node
/** Import a licensed/local source clip. This command never submits a generation job. */
import { execFile } from 'node:child_process'
import console from 'node:console'
import { randomUUID } from 'node:crypto'
import { access, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import { promisify } from 'node:util'

const exec = promisify(execFile)
const root = fileURLToPath(new URL('../', import.meta.url))
const width = 1440
const height = 810
const fps = 30
const minimumFrames = 180

function usage() {
  console.log(`Usage: node scripts/prepare-motion-video.mjs /path/to/authorized-source.mp4 [--output-dir /tmp/motion-test]

Requires ffmpeg and ffprobe. Accepts a local 16:9 video, at least 1440×810,
at least 30 fps, and at least 6 seconds. The source is never upscaled.
The output is a silent 1440×810, 30 fps H.264 MP4 with every frame a keyframe.
--output-dir is intended for isolated importer verification; URLs remain /motion-assets/.
No network calls, generation requests, or credentials are used.`)
}

function ratio(value) {
  const [numerator, denominator = '1'] = String(value).split(/[:/]/)
  return Number(numerator) / Number(denominator)
}

async function exists(file) {
  try {
    await access(file)
    return true
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}

async function probe(file, frames = false) {
  const args = ['-v', 'error', '-of', 'json']
  if (frames) {
    args.push('-select_streams', 'v:0', '-show_frames', '-show_entries', 'frame=key_frame,pict_type,best_effort_timestamp_time')
  } else {
    args.push('-count_frames', '-show_streams', '-show_format')
  }
  args.push(file)
  const { stdout } = await exec('ffprobe', args, { maxBuffer: 64 * 1024 * 1024 })
  return JSON.parse(stdout)
}

function validateSource(metadata) {
  const video = metadata.streams.find((stream) => stream.codec_type === 'video')
  if (!video || video.disposition?.attached_pic) throw new Error('The source must have a motion video as its first video stream.')
  if (video.width < width || video.height < height) {
    throw new Error(`Source ${video.width}×${video.height} is below the required ${width}×${height}; upscaling is disabled.`)
  }
  const sampleAspect = ratio(video.sample_aspect_ratio || '1/1')
  const aspect = video.width / video.height
  if (!Number.isFinite(sampleAspect) || Math.abs(sampleAspect - 1) > 0.001 || Math.abs(aspect - 16 / 9) > 0.002) {
    throw new Error('The source must be 16:9 with square pixels; crop or compose it deliberately before importing.')
  }
  const rotation = video.side_data_list?.find((entry) => entry.rotation)?.rotation || 0
  if (rotation % 360 !== 0) throw new Error('The source has rotation metadata; normalize its orientation before importing.')
  const sourceFps = ratio(video.avg_frame_rate)
  const duration = Number(video.duration || metadata.format?.duration)
  const sourceFrames = Number(video.nb_read_frames)
  if (!Number.isFinite(sourceFps) || sourceFps < fps - 0.001) {
    throw new Error(`Source frame rate ${sourceFps} is below ${fps} fps; duplicated frames are not a motion substitute.`)
  }
  if (!Number.isFinite(duration) || duration < minimumFrames / fps - 0.001 || !Number.isSafeInteger(sourceFrames) || sourceFrames < minimumFrames) {
    throw new Error('The source must contain at least 180 native frames over at least 6 seconds.')
  }
}

function validateOutput(metadata, frameData) {
  const video = metadata.streams.find((stream) => stream.codec_type === 'video')
  const frames = frameData.frames
  if (metadata.streams.length !== 1 || video?.codec_name !== 'h264' || video.pix_fmt !== 'yuv420p') {
    throw new Error('Output must contain exactly one H.264 yuv420p video stream and no audio.')
  }
  if (video.width !== width || video.height !== height || Math.abs(ratio(video.avg_frame_rate) - fps) > 0.0001) {
    throw new Error('Output dimensions or frame rate do not match the motion contract.')
  }
  const frameCount = Number(video.nb_read_frames)
  const duration = Number(video.duration)
  if (!Number.isSafeInteger(frameCount) || frameCount < minimumFrames || frames.length !== frameCount) {
    throw new Error('Exact decoded frame count is missing, insufficient, or inconsistent.')
  }
  if (!Number.isFinite(duration) || Math.abs(duration - frameCount / fps) > 0.001) {
    throw new Error('Output duration does not match the decoded frame timeline.')
  }
  for (let index = 0; index < frames.length; index += 1) {
    const frame = frames[index]
    if (frame.key_frame !== 1 || frame.pict_type !== 'I') {
      throw new Error(`Frame ${index} is not an independent keyframe; reverse seeking would be unreliable.`)
    }
    const timestamp = Number(frame.best_effort_timestamp_time)
    if (!Number.isFinite(timestamp) || Math.abs(timestamp - index / fps) > 0.001) {
      throw new Error(`Frame ${index} has a missing or discontinuous timestamp.`)
    }
  }
  return { src: '/motion-assets/agent-motion.mp4', fps, frameCount, duration }
}

async function main() {
  const args = process.argv.slice(2)
  if (!args.length || args.includes('--help')) {
    usage()
    if (!args.length) process.exitCode = 1
    return
  }
  const source = path.resolve(args.shift())
  let outputDir = path.join(root, 'public/motion-assets')
  while (args.length) {
    const option = args.shift()
    if (option !== '--output-dir' || !args[0] || args[0].startsWith('--')) {
      throw new Error(`Unknown or incomplete option: ${option}`)
    }
    outputDir = path.resolve(args.shift())
  }
  const info = await stat(source)
  if (!info.isFile() || info.size === 0) throw new Error('Source must be a nonempty local video file.')
  validateSource(await probe(source))
  await mkdir(outputDir, { recursive: true })
  const id = randomUUID()
  const output = path.join(outputDir, 'agent-motion.mp4')
  const manifest = path.join(outputDir, 'manifest.json')
  const stagedVideo = path.join(outputDir, `.agent-motion-${id}.mp4`)
  const stagedManifest = path.join(outputDir, `.manifest-${id}.json`)
  const backupVideo = path.join(outputDir, `.agent-motion-${id}.backup.mp4`)
  let savedVideo = false
  let replacedVideo = false
  let committed = false
  try {
    await exec('ffmpeg', [
      '-hide_banner', '-loglevel', 'error', '-nostdin', '-n', '-i', source,
      '-map', '0:v:0', '-an', '-sn', '-dn', '-map_metadata', '-1', '-map_chapters', '-1',
      '-vf', `scale=${width}:${height}:flags=lanczos,setsar=1,fps=${fps},setpts=PTS-STARTPTS`,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
      '-g', '1', '-keyint_min', '1', '-sc_threshold', '0', '-bf', '0',
      '-r', String(fps), '-fps_mode', 'cfr', '-video_track_timescale', '30000', '-movflags', '+faststart',
      stagedVideo,
    ], { maxBuffer: 4 * 1024 * 1024 })
    const [metadata, frameData] = await Promise.all([probe(stagedVideo), probe(stagedVideo, true)])
    const video = validateOutput(metadata, frameData)
    let previous = {}
    if (await exists(manifest)) previous = JSON.parse(await readFile(manifest, 'utf8'))
    const nextManifest = {
      ...previous,
      poster: previous.poster || '/motion-assets/agent-closed.webp',
      endPoster: previous.endPoster || '/motion-assets/agent-open.webp',
      video,
    }
    await writeFile(stagedManifest, `${JSON.stringify(nextManifest, null, 2)}\n`, { flag: 'wx' })
    // Validation has completed. Stage in the same directory so each rename is atomic.
    // Keep the old video until the new manifest is installed; restore it on a write failure.
    if (await exists(output)) {
      await rename(output, backupVideo)
      savedVideo = true
    }
    await rename(stagedVideo, output)
    replacedVideo = true
    await rename(stagedManifest, manifest)
    committed = true
    console.log(`Imported ${video.frameCount} keyframes at ${video.fps} fps (${video.duration}s), ${width}×${height}.`)
    console.log(`Video: ${output}\nManifest: ${manifest}`)
    console.log('Review the actual closed → open motion, identity, lighting, and reverse scrubbing before publishing.')
  } catch (error) {
    if (!committed) {
      if (replacedVideo) await rm(output, { force: true })
      if (savedVideo) await rename(backupVideo, output)
    }
    throw error
  } finally {
    await Promise.all([stagedVideo, stagedManifest, ...(committed ? [backupVideo] : [])].map((file) => rm(file, { force: true })))
  }
}

main().catch((error) => {
  console.error(`Motion import failed: ${error.message}`)
  process.exitCode = 1
})
