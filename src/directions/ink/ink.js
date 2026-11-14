// Ink reveal: the pointer paints a gooey trail that uncovers a moving ink layer under the page.
// Raw WebGL, no libraries. The ink is a local video when /ink/ink.mp4 exists, otherwise generated.
const TRAIL_SCALE = 0.25;
const FADE_TAIL = 1.4;

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
varying vec2 vUv;
uniform sampler2D uTrail, uVideo, uVideoNext, uText;
uniform float uMix, uTime, uHasVideo;
uniform vec2 uRes, uVideoRes, uTextOff;

vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float trailAt(vec2 uv){ return texture2D(uTrail, vec2(uv.x, 1.0 - uv.y)).r; }
vec2 coverUv(vec2 uv){
  float sr = uRes.x / uRes.y, vr = uVideoRes.x / uVideoRes.y;
  vec2 s = sr > vr ? vec2(1.0, vr / sr) : vec2(sr / vr, 1.0);
  return (uv - 0.5) * s + 0.5;
}
// generated ink clouds: cobalt, magenta and tangerine on black
vec3 ink(vec2 uv, vec2 asp){
  vec2 q = uv * asp * 1.5; float tt = uTime * 0.07;
  vec2 w1 = vec2(snoise(q + vec2(tt, 0.0)), snoise(q + vec2(5.2, -tt)));
  vec2 w2 = vec2(snoise(q * 1.7 + w1 * 1.2 + 3.1), snoise(q * 1.7 + w1 * 1.2 - 7.7 + tt));
  float a = snoise(q * 1.2 + w2 * 0.9) * 0.5 + 0.5;
  float b = snoise(q * 2.0 - w2 * 1.1 + 9.0) * 0.5 + 0.5;
  float c = snoise(q * 0.9 + w1 * 1.5 - 4.0) * 0.5 + 0.5;
  vec3 col = vec3(0.01, 0.01, 0.04);
  col += vec3(0.05, 0.22, 1.0) * smoothstep(0.3, 0.8, a);
  col = mix(col, vec3(1.0, 0.1, 0.55), smoothstep(0.5, 0.88, b) * 0.92);
  col = mix(col, vec3(1.0, 0.5, 0.08), smoothstep(0.6, 0.93, c) * 0.88);
  return col;
}
void main(){
  vec2 uv = vUv;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float t = uTime * 0.25;
  vec2 n  = vec2(snoise(uv * asp * 3.2 + vec2(t, -t)), snoise(uv * asp * 3.2 + vec2(-t, t) + 17.0));
  vec2 n2 = vec2(snoise(uv * asp * 9.0 + t * 2.0), snoise(uv * asp * 9.0 - t * 2.0 + 5.0));
  vec2 wuv = uv + n * 0.03 + n2 * 0.006;
  float v = trailAt(wuv);
  float mask = smoothstep(0.42, 0.445, v);
  float vg = trailAt(wuv + vec2(-0.008, 0.010));
  float rim = smoothstep(0.33, 0.35, vg) * (1.0 - mask);
  float e = 1.5 / uRes.x;
  vec2 grad = vec2(trailAt(uv + vec2(e * 4.0, 0.0)) - trailAt(uv - vec2(e * 4.0, 0.0)),
                   trailAt(uv + vec2(0.0, e * 4.0)) - trailAt(uv - vec2(0.0, e * 4.0)));
  vec2 ruv = uv + grad * 0.06;
  vec2 vuv = coverUv(ruv); vuv.y = 1.0 - vuv.y;
  vec3 vid = mix(texture2D(uVideo, vuv).rgb, texture2D(uVideoNext, vuv).rgb, uMix);
  vid = mix(ink(ruv, asp), vid, uHasVideo);
  vid = pow(vid, vec3(0.92)) * 1.06;
  vec2 tuv = vec2(uv.x, 1.0 - uv.y);
  float txt = texture2D(uText, tuv - uTextOff).a;
  float txt2 = texture2D(uText, tuv - uTextOff * 2.2).a;
  vid = mix(vid, vec3(1.0), max(txt, txt2 * 0.35));
  vec3 rimCol = vec3(0.86, 0.86, 0.90);
  gl_FragColor = vec4(vid * mask + rimCol * rim * 0.55, mask + rim * 0.55);
}`;

export function initInk(hero) {
  const $ = (sel) => hero.querySelector(sel);
  const wordSpan = $('[data-word] span');
  const baselineEl = $('[data-baseline]');
  const canvas = $('canvas');
  const videos = [...hero.querySelectorAll('video')];
  const cursor = document.querySelector('[data-ink-cursor]');
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return () => {};
  gl.getExtension('OES_standard_derivatives');

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uTrail', 'uVideo', 'uVideoNext', 'uText', 'uMix', 'uRes', 'uVideoRes', 'uTime', 'uHasVideo', 'uTextOff'].forEach(
    (name) => (U[name] = gl.getUniformLocation(prog, name)),
  );
  const tex = [0, 1, 2, 3].map((unit) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    return t;
  });
  gl.uniform1i(U.uTrail, 0);
  gl.uniform1i(U.uVideo, 1);
  gl.uniform1i(U.uText, 2);
  gl.uniform1i(U.uVideoNext, 3);
  const upload = (unit, source) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex[unit]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  };

  let W = 1;
  let H = 1;
  let DPR = 1;
  let trail = document.createElement('canvas');
  let tctx = trail.getContext('2d');
  const textCanvas = document.createElement('canvas');
  const xctx = textCanvas.getContext('2d');

  function drawText() {
    const cs = getComputedStyle(wordSpan);
    const hr = hero.getBoundingClientRect();
    xctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    xctx.clearRect(0, 0, W, H);
    xctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    xctx.fillStyle = '#fff';
    xctx.textBaseline = 'alphabetic';
    const spacing = parseFloat(cs.letterSpacing) || 0;
    let x = wordSpan.getBoundingClientRect().left - hr.left;
    const y = baselineEl.getBoundingClientRect().bottom - hr.top;
    for (const ch of wordSpan.textContent) {
      xctx.fillText(ch, x, y);
      x += xctx.measureText(ch).width + spacing;
    }
    upload(2, textCanvas);
  }

  function fit() {
    const hr = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(hr.width));
    H = Math.max(1, Math.round(hr.height));
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    wordSpan.style.fontSize = '100px';
    const w = wordSpan.getBoundingClientRect().width;
    wordSpan.style.fontSize = `${(100 * W * 0.9) / w}px`;
    canvas.width = textCanvas.width = Math.round(W * DPR);
    canvas.height = textCanvas.height = Math.round(H * DPR);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const next = document.createElement('canvas');
    next.width = Math.max(1, Math.round(W * TRAIL_SCALE));
    next.height = Math.max(1, Math.round(H * TRAIL_SCALE));
    const nctx = next.getContext('2d');
    nctx.fillStyle = '#000';
    nctx.fillRect(0, 0, next.width, next.height);
    if (trail.width > 1) nctx.drawImage(trail, 0, 0, next.width, next.height);
    trail = next;
    tctx = nctx;
    tctx.globalCompositeOperation = 'lighter';
    drawText();
  }

  function stamp(x, y, r, a) {
    const sx = x * TRAIL_SCALE;
    const sy = y * TRAIL_SCALE;
    const sr = r * TRAIL_SCALE;
    const g = tctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.5, `rgba(255,255,255,${a * 0.75})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    tctx.fillStyle = g;
    tctx.beginPath();
    tctx.arc(sx, sy, sr, 0, Math.PI * 2);
    tctx.fill();
  }

  // pointer
  const mouse = { x: 0, y: 0, px: 0, py: 0, active: false, fresh: true };
  const moveTo = (cx, cy) => {
    const hr = hero.getBoundingClientRect();
    mouse.x = cx - hr.left;
    mouse.y = cy - hr.top;
    if (!mouse.active || mouse.fresh) {
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.fresh = false;
    }
    mouse.active = true;
  };
  const onPointerMove = (e) => {
    if (e.pointerType !== 'touch') moveTo(e.clientX, e.clientY);
    if (cursor) cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  };
  const onTouch = (e) => {
    if (e.touches[0]) moveTo(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onLeave = () => {
    mouse.active = false;
    mouse.fresh = true;
  };
  const tryPlay = () => videos[cur].play().catch(() => {});
  hero.addEventListener('pointermove', onPointerMove);
  hero.addEventListener('pointerleave', onLeave);
  hero.addEventListener('touchstart', onTouch, { passive: true });
  hero.addEventListener('touchmove', onTouch, { passive: true });
  hero.addEventListener('touchend', onLeave);
  hero.addEventListener('pointerdown', tryPlay);
  const hoverables = [...hero.querySelectorAll('[data-big]')];
  const big = () => cursor?.classList.add('big');
  const small = () => cursor?.classList.remove('big');
  hoverables.forEach((el) => {
    el.addEventListener('pointerenter', big);
    el.addEventListener('pointerleave', small);
  });

  // video pair, cross-faded into a seamless loop
  let cur = 0;
  let mix = 0;
  let hasVideo = 0;
  tryPlay();

  let vx = 0;
  let vy = 0;
  let offX = 0;
  let offY = 0;
  let phase = 0;
  let drops = [];
  let last = performance.now();
  let raf = 0;
  const start = last;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(48, now - last) / 16.667;
    last = now;
    tctx.globalCompositeOperation = 'source-over';
    tctx.fillStyle = `rgba(0,0,0,${0.022 * dt})`;
    tctx.fillRect(0, 0, trail.width, trail.height);
    tctx.globalCompositeOperation = 'lighter';
    phase += 0.03 * dt;
    const base = Math.min(W, H) * 0.075;
    if (mouse.active) {
      const dx = mouse.x - mouse.px;
      const dy = mouse.y - mouse.py;
      const dist = Math.hypot(dx, dy);
      vx += (dx - vx) * 0.25;
      vy += (dy - vy) * 0.25;
      const speed = Math.hypot(vx, vy);
      const rad = base + Math.min(speed, 60) * 1.6 + Math.sin(phase * 2.3) * base * 0.15;
      const steps = Math.max(1, Math.ceil(dist / (rad * 0.25)));
      for (let i = 1; i <= steps; i++) stamp(mouse.px + (dx * i) / steps, mouse.py + (dy * i) / steps, rad, 0.22);
      if (dist < 0.5) stamp(mouse.x, mouse.y, base * 1.1, 0.06);
      if (speed > 8 && Math.random() < 0.12 * dt) {
        const angle = Math.atan2(vy, vx) + Math.PI + (Math.random() - 0.5) * 2.2;
        const v = 1 + Math.random() * 2;
        drops.push({
          x: mouse.x + Math.cos(angle) * rad * 1.3,
          y: mouse.y + Math.sin(angle) * rad * 1.3,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          r: base * (0.18 + Math.random() * 0.25),
          life: 1,
        });
      }
      mouse.px = mouse.x;
      mouse.py = mouse.y;
    } else {
      vx *= 0.9;
      vy *= 0.9;
    }
    drops = drops.filter((d) => {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vx *= 0.96;
      d.vy *= 0.96;
      d.life -= 0.012 * dt;
      stamp(d.x, d.y, d.r, 0.35 * Math.max(0, d.life));
      return d.life > 0;
    });

    // loop the video by cross-fading into its twin
    const A = videos[cur];
    const B = videos[1 - cur];
    // readiness is read from the element each frame, so a missed 'playing' event cannot stall the loop
    hasVideo = A.readyState >= 2 && A.videoWidth > 0 && !A.error ? 1 : 0;
    if (hasVideo && A.paused && !A.ended) A.play().catch(() => {});
    if (hasVideo && A.duration) {
      const tail = A.duration - FADE_TAIL;
      if (A.currentTime >= tail || A.ended) {
        if (B.paused) {
          B.currentTime = 0;
          B.play().catch(() => {});
        }
        mix = Math.min(1, (A.currentTime - tail) / FADE_TAIL);
      }
      if (A.ended || mix >= 1) {
        A.pause();
        cur = 1 - cur;
        mix = 0;
      }
    }
    upload(0, trail);
    const now0 = videos[cur];
    if (hasVideo) {
      try {
        upload(1, now0);
        if (mix > 0) upload(3, videos[1 - cur]);
      } catch {
        hasVideo = 0;
      }
    }
    offX += (vx * 0.35 - offX) * 0.12;
    offY += (vy * 0.12 - offY) * 0.12;
    gl.uniform1f(U.uMix, mix);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uVideoRes, now0.videoWidth || 16, now0.videoHeight || 9);
    gl.uniform1f(U.uTime, (now - start) / 1000);
    gl.uniform1f(U.uHasVideo, hasVideo);
    gl.uniform2f(U.uTextOff, offX / W, offY / H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  fit();
  window.addEventListener('resize', fit);
  document.fonts.load('900 100px "Archivo Variable"').then(fit);
  document.fonts.ready.then(fit);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', fit);
    hero.removeEventListener('pointermove', onPointerMove);
    hero.removeEventListener('pointerleave', onLeave);
    hero.removeEventListener('touchstart', onTouch);
    hero.removeEventListener('touchmove', onTouch);
    hero.removeEventListener('touchend', onLeave);
    hero.removeEventListener('pointerdown', tryPlay);
    hoverables.forEach((el) => {
      el.removeEventListener('pointerenter', big);
      el.removeEventListener('pointerleave', small);
    });
    videos.forEach((v) => v.pause());
  };
}
