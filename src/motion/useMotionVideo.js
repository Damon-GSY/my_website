/*
 * Frame-target scheduling adapted from createFrameAnimator in Oil Motion:
 * https://github.com/oil-oil/oil-motion/blob/main/assets/interactive-motion.ts
 * Copyright (c) 2026 Lin Zhihuang
 *
 * MIT License
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { useEffect, useRef, useState } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Scrub one persistent, paused video through its manifest's integer frames.
 * Keep the <video ref={videoRef}> mounted, without a src or autoPlay prop, and
 * show it over the poster only when status is "ready". No video is fetched when
 * manifest.video is null or the initial preference requests reduced motion.
 * Status is "poster", "loading", "ready", or "error" (retain the poster).
 */
export default function useMotionVideo({ manifest, progress, enabled = true }) {
  const videoRef = useRef(null);
  const controllerRef = useRef(null);
  const progressRef = useRef(progress);
  const enabledRef = useRef(enabled);
  const [status, setStatus] = useState('poster');
  const { src, fps, frameCount, duration } = manifest?.video ?? {};

  useEffect(() => {
    progressRef.current = progress;
    controllerRef.current?.sync();
  }, [progress]);

  useEffect(() => {
    enabledRef.current = enabled;
    controllerRef.current?.sync();
  }, [enabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!src || !video) {
      setStatus('poster');
      return undefined;
    }
    if (typeof src !== 'string' || !Number.isFinite(fps) || fps <= 0
      || !Number.isInteger(frameCount) || frameCount < 1
      || !Number.isFinite(duration) || duration <= 0) {
      setStatus('error');
      return undefined;
    }

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = preference.matches;
    let visible = true;
    let destroyed = false;
    let failed = false;
    let scheduled = 0;
    let inFlight = false;
    let submittedFrame = -1;
    let completedFrame = -1;
    let hasFrame = false;
    let watchdog = 0;
    let watchdogPhase = '';

    const pause = () => { video.pause(); };
    const cancelScheduled = () => {
      if (scheduled) cancelAnimationFrame(scheduled);
      scheduled = 0;
    };
    const clearWatchdog = () => {
      if (watchdog) window.clearTimeout(watchdog);
      watchdog = 0;
      watchdogPhase = '';
    };
    const isActive = () => !destroyed && !failed && !reduced
      && visible && !document.hidden && enabledRef.current;
    const targetFrame = () => Math.round(
      clamp(Number.isFinite(progressRef.current) ? progressRef.current : 0, 0, 1)
      * (frameCount - 1),
    );
    const timeForFrame = (frame) => {
      const mediaDuration = Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(duration, video.duration) : duration;
      // Avoid seeking to duration itself, which may expose an empty end frame.
      return Math.min(frame / fps, Math.max(0, mediaDuration - 1 / fps));
    };

    const fail = () => {
      if (destroyed) return;
      failed = true;
      cancelScheduled();
      clearWatchdog();
      pause();
      setStatus('error');
    };

    const watchForFrame = () => {
      if (!isActive() || (hasFrame && !inFlight && !video.seeking)) {
        clearWatchdog();
        return;
      }
      const phase = inFlight || video.seeking ? 'seek' : 'load';
      if (watchdog && watchdogPhase === phase) return;
      clearWatchdog();
      watchdogPhase = phase;
      // A stalled request/decoder does not always emit a media error. Bound
      // the wait so the page can return to its ordinary poster layout. Hidden
      // tabs, offscreen media, and reduced motion do not consume this budget.
      watchdog = window.setTimeout(fail, phase === 'load' ? 12000 : 8000);
    };

    const flush = () => {
      scheduled = 0;
      if (!isActive() || inFlight || video.seeking || video.readyState < 1) return;
      const nextFrame = targetFrame();
      if (nextFrame === completedFrame && hasFrame) return;
      const nextTime = timeForFrame(nextFrame);
      if (Math.abs(video.currentTime - nextTime) < 0.25 / fps) {
        // At metadata time, assigning currentTime=0 to an existing zero can
        // produce no seeked event. Wait for loadeddata instead of locking.
        if (video.readyState < 2) return;
        completedFrame = nextFrame;
        hasFrame = true;
        clearWatchdog();
        setStatus('ready');
        pause();
        return;
      }
      // Only one currentTime assignment is outstanding. A new scroll target
      // replaces the pending target instead of building a queue of stale seeks.
      inFlight = true;
      submittedFrame = nextFrame;
      try {
        video.currentTime = nextTime;
        watchForFrame();
      } catch {
        inFlight = false;
        fail();
      }
    };

    const sync = () => {
      if (!isActive()) {
        cancelScheduled();
        clearWatchdog();
        pause();
        return;
      }
      watchForFrame();
      if (!inFlight && !scheduled && (!hasFrame || targetFrame() !== completedFrame)) {
        scheduled = requestAnimationFrame(flush);
      }
    };

    const onSeeked = () => {
      if (destroyed || failed) return;
      if (inFlight) completedFrame = submittedFrame;
      inFlight = false;
      hasFrame = video.readyState >= 2;
      clearWatchdog();
      if (hasFrame && !reduced) setStatus('ready');
      pause();
      sync();
    };
    const onData = () => {
      if (destroyed || failed) return;
      // loadeddata alone must not expose frame 0 when the initial scroll
      // position requests a later frame; flush verifies the target first.
      sync();
    };
    const attachSource = () => {
      if (destroyed || failed || reduced) return;
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      pause();
      if (video.getAttribute('src') !== src) {
        video.src = src;
        video.load();
      }
      setStatus(hasFrame ? 'ready' : 'loading');
      sync();
    };
    const onPreference = () => {
      reduced = preference.matches;
      if (reduced) {
        cancelScheduled();
        clearWatchdog();
        pause();
        setStatus('poster');
      } else {
        attachSource();
      }
    };

    video.addEventListener('loadedmetadata', onData);
    video.addEventListener('loadeddata', onData);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', fail);
    // A browser or external control must never start autonomous playback.
    video.addEventListener('play', pause);
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', onPreference);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    const controller = { sync };
    controllerRef.current = controller;
    if (reduced) setStatus('poster');
    else attachSource();

    return () => {
      destroyed = true;
      cancelScheduled();
      clearWatchdog();
      pause();
      observer.disconnect();
      video.removeEventListener('loadedmetadata', onData);
      video.removeEventListener('loadeddata', onData);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', fail);
      video.removeEventListener('play', pause);
      document.removeEventListener('visibilitychange', sync);
      preference.removeEventListener('change', onPreference);
      if (controllerRef.current === controller) controllerRef.current = null;
      // Retain src on the same element through StrictMode's effect replay.
      // Resize never swaps the source or creates another decoder.
    };
  }, [src, fps, frameCount, duration]);

  return { videoRef, status };
}
