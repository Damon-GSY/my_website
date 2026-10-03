import { useEffect, useRef, useState } from 'react';

const atlases = new Map();
const positive = (value, fallback) => Number.isFinite(value) && value > 0 ? value : fallback;

function loadAtlas(url) {
  if (atlases.has(url)) return atlases.get(url);

  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    let finished = false;
    let timeout;
    const cleanup = () => {
      clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
    };
    const fail = () => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(new Error('The motion artwork could not be decoded.'));
    };
    image.onload = async () => {
      try {
        if (typeof image.decode === 'function') await image.decode();
        if (finished) return;
        if (!image.naturalWidth || !image.naturalHeight) {
          fail();
          return;
        }
        finished = true;
        cleanup();
        resolve(image);
      } catch {
        fail();
      }
    };
    image.onerror = fail;
    timeout = setTimeout(fail, 20000);
    image.src = url;
  });
  // Share one decoded atlas across StrictMode mounts and visual instances.
  atlases.set(url, promise);
  promise.catch(() => {
    if (atlases.get(url) === promise) atlases.delete(url);
  });
  return promise;
}

function countFrames(study) {
  return Math.max(1, Math.floor(positive(
    study.frameCount,
    study.frames?.length || positive(study.columns, 1) * positive(study.rows, 1),
  )));
}

function sourceRect(study, requestedFrame, image) {
  const index = Math.min(countFrames(study) - 1, Math.max(0, Math.round(
    Number.isFinite(requestedFrame) ? requestedFrame : 0,
  )));
  if (study.frames?.length) return study.frames[Math.min(index, study.frames.length - 1)];

  const columns = Math.max(1, Math.floor(positive(study.columns, 1)));
  const rows = Math.max(1, Math.floor(positive(study.rows, Math.ceil(countFrames(study) / columns))));
  const width = positive(study.cellWidth, image.naturalWidth / columns);
  const height = positive(study.cellHeight, image.naturalHeight / rows);
  return { x: index % columns * width, y: Math.floor(index / columns) * height, width, height };
}

function ArtworkPlaceholder() {
  return (
    <svg viewBox="0 0 240 240" width="100%" height="100%" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".45">
        <ellipse cx="120" cy="120" rx="69" ry="28" transform="rotate(-35 120 120)" />
        <ellipse cx="120" cy="120" rx="69" ry="28" transform="rotate(35 120 120)" />
        <ellipse cx="120" cy="120" rx="69" ry="28" transform="rotate(90 120 120)" />
        <circle cx="120" cy="120" r="12" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export default function PoseCanvas({
  study, frame = 0, className = '', onReady, onError, interactive = false, onPointerFrame,
}) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const renderRef = useRef(null);
  const latestRef = useRef({ study, frame, onReady, onError });
  const [loadedAtlas, setLoadedAtlas] = useState(null);
  const [failedAtlas, setFailedAtlas] = useState(null);
  const atlas = study.atlas;
  const status = failedAtlas === atlas ? 'error' : loadedAtlas === atlas ? 'ready' : 'loading';
  const firstRect = study.frames?.[0];
  const aspect = positive(study.cellWidth, positive(firstRect?.width, 1))
    / positive(study.cellHeight, positive(firstRect?.height, 1));

  useEffect(() => {
    latestRef.current = { study, frame, onReady, onError };
    renderRef.current?.();
  }, [study, frame, onReady, onError]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return undefined;

    let destroyed = false;
    let asset = null;
    let ready = false;
    let failed = false;
    let lastDraw = '';
    const context = canvas.getContext('2d', { alpha: true });
    const fail = (error) => {
      if (destroyed || failed) return;
      failed = true;
      setFailedAtlas(atlas);
      latestRef.current.onError?.(error);
    };
    const draw = () => {
      if (destroyed || failed || !asset || !context) return;
      const { study: currentStudy, frame: currentFrame } = latestRef.current;
      if (currentStudy.atlas !== atlas) return;
      const rect = sourceRect(currentStudy, currentFrame, asset);
      if (!rect || ![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite)
        || rect.x < 0 || rect.y < 0 || rect.width <= 0 || rect.height <= 0
        || rect.x + rect.width > asset.naturalWidth + .1
        || rect.y + rect.height > asset.naturalHeight + .1) {
        fail(new Error('The motion artwork frame is outside its atlas.'));
        return;
      }
      const { width, height } = wrapper.getBoundingClientRect();
      if (!width || !height) return;
      const contain = Math.min(width / rect.width, height / rect.height);
      const drawWidth = rect.width * contain;
      const drawHeight = rect.height * contain;
      // Retina backing pixels stop at the source resolution; CSS keeps the
      // artwork centered without stretching frames with different crop sizes.
      const density = Math.min(positive(window.devicePixelRatio, 1), 1 / contain);
      const backingWidth = Math.max(1, Math.round(width * density));
      const backingHeight = Math.max(1, Math.round(height * density));
      const drawKey = [rect.x, rect.y, rect.width, rect.height, backingWidth, backingHeight].join(':');
      if (ready && drawKey === lastDraw) return;

      try {
        if (canvas.width !== backingWidth) canvas.width = backingWidth;
        if (canvas.height !== backingHeight) canvas.height = backingHeight;
        context.clearRect(0, 0, backingWidth, backingHeight);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        const scaleX = backingWidth / width;
        const scaleY = backingHeight / height;
        context.drawImage(asset, rect.x, rect.y, rect.width, rect.height,
          (width - drawWidth) / 2 * scaleX, (height - drawHeight) / 2 * scaleY,
          drawWidth * scaleX, drawHeight * scaleY);
        lastDraw = drawKey;
        if (!ready) {
          ready = true;
          setFailedAtlas(null);
          setLoadedAtlas(atlas);
          latestRef.current.onReady?.();
        }
      } catch (error) {
        fail(error);
      }
    };

    renderRef.current = draw;
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(draw) : null;
    observer?.observe(wrapper);
    window.addEventListener('resize', draw, { passive: true });

    if (!context || typeof atlas !== 'string' || !atlas) {
      fail(new Error('The motion artwork is unavailable.'));
    } else {
      loadAtlas(atlas).then((image) => {
        if (destroyed) return;
        asset = image;
        draw();
      }, fail);
    }

    return () => {
      destroyed = true;
      observer?.disconnect();
      window.removeEventListener('resize', draw);
      if (renderRef.current === draw) renderRef.current = null;
      asset = null;
    };
  }, [atlas]);

  const handlePointer = (event) => {
    if (!interactive || !onPointerFrame || (event.pointerType !== 'mouse' && !event.buttons)) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width) return;
    const progress = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    onPointerFrame(Math.round(progress * (countFrames(study) - 1)));
  };

  return (
    <div
      ref={wrapperRef}
      className={`motion-pose ${className}`.trim()}
      data-state={status}
      data-frame={Math.min(countFrames(study) - 1, Math.max(0, Math.round(Number.isFinite(frame) ? frame : 0)))}
      style={{ position: 'relative', width: '100%', maxWidth: positive(study.displaySize, 720), aspectRatio: aspect, touchAction: 'pan-y' }}
      onPointerMove={handlePointer}
      onPointerDown={handlePointer}
    >
      <canvas ref={canvasRef} className="motion-pose__canvas" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }} />
      {status !== 'ready' && (
        <div className="motion-pose__placeholder" aria-hidden="true" style={{ position: 'absolute', inset: '15%', pointerEvents: 'none' }}>
          <ArtworkPlaceholder />
        </div>
      )}
    </div>
  );
}
