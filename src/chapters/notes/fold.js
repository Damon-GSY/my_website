// The Notes device (assembly plan §3, chapter 6): a printed sheet that crumples into a ball and opens
// flat again. Ported from the Paper study (public/lab/paper/, which stays as the reference): the same
// mesh, fold targets, crease field and shading, in plain WebGL2, no three.js.
//
// What changed for the site:
// - two ends instead of three fixed sections: A (where the paper is at t = 0) and B (t = 1), each a
//   rectangle on screen with a picture of exactly what the DOM shows there (raster.js). A note row,
//   a note page, the next note page. The ball travels between them, so a list row can ball up, fly to
//   the middle and open as the page; played backwards, the page balls up and drops back into its row.
// - the context lives only for one transition: createFold() makes it, dispose() loses it.
//   At rest the page is DOM and there is no canvas at all.
// - at t = 0 and t = 1 the sheet is exactly flat, unshaded and crease-free, at whole pixels, so the
//   swap to the DOM text is at the same pixels.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const easeIn = (x) => x * x * x;
const easeOut = (x) => 1 - (1 - x) ** 3;
export const sstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// ---------- small math (from the study) ----------
const rng = (s) => () => {
  s = (s * 16807) % 2147483647;
  return (s - 1) / 2147483646;
};
const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const hash = (x, y, s) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
function vnoise(x, y, s) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const LIGHT = norm([-0.45, -0.6, 0.66]);
const PAPER = [0xf9 / 255, 0xf8 / 255, 0xf4 / 255];
function rotAxis(p, q, d, th) {
  const v = [p[0] - q[0], p[1] - q[1], p[2]];
  const k = [d[0], d[1], 0];
  const c = Math.cos(th);
  const s = Math.sin(th);
  const kv = dot(k, v);
  const kx = cross(k, v);
  return [
    q[0] + v[0] * c + kx[0] * s + k[0] * kv * (1 - c),
    q[1] + v[1] * c + kx[1] * s + k[1] * kv * (1 - c),
    v[2] * c + kx[2] * s + k[2] * kv * (1 - c),
  ];
}

// ---------- mesh: a jittered grid, two crumpled targets and crease fields (the study's buildMesh) ----------
const meshes = new Map();
function buildMesh(aspect, phone) {
  const key = `${aspect.toFixed(2)}:${phone}`;
  if (meshes.has(key)) return meshes.get(key);
  const GX = phone ? 26 : 40;
  const GY = phone ? 22 : 32;
  const R = rng(5);
  const V = [];
  const tris = [];
  for (let j = 0; j <= GY; j += 1)
    for (let i = 0; i <= GX; i += 1) {
      let u = i / GX;
      let v = j / GY;
      if (i > 0 && i < GX) u += ((R() - 0.5) * 0.6) / GX;
      if (j > 0 && j < GY) v += ((R() - 0.5) * 0.6) / GY;
      V.push({ u, v });
    }
  for (let j = 0; j < GY; j += 1)
    for (let i = 0; i < GX; i += 1) {
      const a = j * (GX + 1) + i;
      const b = a + 1;
      const c = a + GX + 1;
      const d = c + 1;
      if (R() < 0.5) tris.push([a, b, d], [a, d, c]);
      else tris.push([a, b, c], [b, d, c]);
    }
  function target(seed) {
    const r = rng(seed);
    const folds = [];
    for (let f = 0; f < 6; f += 1)
      folds.push({
        q: [(r() - 0.5) * aspect * 0.7, (r() - 0.5) * 0.7],
        a: r() * Math.PI,
        th: (0.5 + 0.45 * r()) * Math.PI * (r() < 0.5 ? -1 : 1),
      });
    const fold = (sc) =>
      V.map((v) => {
        const P = [(v.u - 0.5) * aspect, v.v - 0.5];
        let p = [P[0], P[1], 0];
        for (const f of folds) {
          const d = [Math.cos(f.a), Math.sin(f.a)];
          if (d[0] * (P[1] - f.q[1]) - d[1] * (P[0] - f.q[0]) > 0) p = rotAxis(p, f.q, d, f.th * sc);
        }
        return p;
      });
    const Q = fold(1);
    const Qr = fold(0.045);
    const Lf = fold(0.26);
    const c = [0, 0, 0];
    Q.forEach((p) => {
      c[0] += p[0] / Q.length;
      c[1] += p[1] / Q.length;
      c[2] += p[2] / Q.length;
    });
    const T = V.map((v, k) => {
      const lon = (v.u - 0.5) * 2 * Math.PI * 0.85;
      const lat = (v.v - 0.5) * Math.PI * 0.85;
      const A = [Math.sin(lon) * Math.cos(lat), Math.sin(lat), Math.cos(lon) * Math.cos(lat)];
      const g = norm(sub(Q[k], c));
      const dir = norm([
        A[0] + 0.55 * g[0] + 0.25 * (r() - 0.5),
        A[1] + 0.55 * g[1] + 0.25 * (r() - 0.5),
        A[2] + 0.55 * g[2] + 0.25 * (r() - 0.5),
      ]);
      const rad = 0.84 + 0.26 * vnoise(v.u * 5, v.v * 5, seed) + 0.08 * (r() - 0.5);
      return [dir[0] * rad, dir[1] * rad, dir[2] * rad];
    });
    let C = tris.map((t) => {
      const [a, b, d] = t.map((i) => Qr[i]);
      let n = norm(cross(sub(b, a), sub(d, a)));
      if (n[2] < 0) n = n.map((x) => -x);
      return dot(n, LIGHT) - LIGHT[2];
    });
    const m = C.reduce((s, x) => s + x, 0) / C.length;
    const sd = Math.sqrt(C.reduce((s, x) => s + (x - m) * (x - m), 0) / C.length) || 1;
    C = C.map((x) => clamp((x - m) / sd + 0.35 * (r() - 0.5) * 2, -1.6, 1.6));
    // loosely folded: a mostly flat sheet, gathered a little, with its edges curling up and in
    const Lo = V.map((v, k) => {
      const p = Lf[k];
      const e = Math.max(Math.abs((v.u - 0.5) * 2), Math.abs((v.v - 0.5) * 2));
      const cu = e ** 3;
      return [p[0] * (0.86 - 0.1 * cu), p[1] * (0.86 - 0.1 * cu), p[2] * 0.8 + 0.2 * cu + 0.03 * (vnoise(v.u * 6, v.v * 6, seed) - 0.5)];
    });
    return { T, C, Lo };
  }
  const X = [target(101), target(202)];
  const F = 18;
  const buf = new Float32Array(tris.length * 3 * F);
  let o = 0;
  tris.forEach((t, ti) =>
    t.forEach((i) => {
      const v = V[i];
      const e = Math.max(Math.abs(v.u - 0.5), Math.abs(v.v - 0.5)) * 2;
      const dl = clamp(0.62 * (1 - e) + 0.38 * vnoise(v.u * 4, v.v * 4, 9));
      buf.set([v.u, v.v, ...X[0].T[i], ...X[1].T[i], X[0].C[ti], X[1].C[ti], dl, e, ...X[0].Lo[i], ...X[1].Lo[i]], o);
      o += F;
    }),
  );
  const mesh = { buf, count: tris.length * 3 };
  meshes.set(key, mesh);
  return mesh;
}

// ---------- shaders ----------
// Positions are CSS pixels from the centre of the viewport, y down, z towards the viewer.
const VS = `#version 300 es
in vec2 aUV;in vec3 aT0;in vec3 aT1;in vec2 aC;in float aD;in float aE;in vec3 aL0;in vec3 aL1;
uniform vec2 uView;uniform vec4 uSheet;uniform vec3 uBall;
uniform float uC,uWhich,uR,uF,uCurl,uLoose,uRotY,uRotX;
out vec3 vP;out vec2 vUV;out float vCr;out float vAO;
void main(){
  // flat -> loosely folded -> ball; the centre lags the edges, so opening runs from the centre out
  float a=clamp((uC-.3*aD)/.7,0.,1.);
  float a1=smoothstep(0.,1.,clamp(a/.55,0.,1.)),a2=smoothstep(0.,1.,clamp((a-.55)/.45,0.,1.));
  vec3 t=mix(aT0,aT1,uWhich);
  float cy=cos(uRotY),sy=sin(uRotY),cx=cos(uRotX),sx=sin(uRotX);
  vec3 r=vec3(t.x*cy+t.z*sy,t.y,-t.x*sy+t.z*cy);
  r=vec3(r.x,r.y*cx-r.z*sx,r.y*sx+r.z*cx);
  vec3 flatP=vec3(uSheet.xy+(aUV-.5)*uSheet.zw,0.);
  vec3 ball=uBall+r*uR;
  vec3 lo=mix(aL0,aL1,uWhich);
  vec3 loose=vec3(mix(uSheet.xy,uBall.xy,.5)+lo.xy*uLoose,lo.z*uLoose);
  vec3 p=mix(mix(flatP,loose,a1),ball,a2);
  p.z+=pow(aE,2.5)*uCurl*sin(3.14159*a1)*(1.-a2);
  vP=p;vUV=aUV;vCr=mix(aC.x,aC.y,uWhich);vAO=a2*clamp((1.-length(t))*2.5,0.,1.)*.22;
  float w=(uF-p.z)/uF;
  gl_Position=vec4(p.x/(uView.x*.5),-p.y/(uView.y*.5),-p.z/4000.*w,w);
}`;
const FS = `#version 300 es
precision highp float;
in vec3 vP;in vec2 vUV;in float vCr;in float vAO;
uniform sampler2D uTex0,uTex1;uniform float uMix,uCAmt;uniform vec3 uL,uPaper;
out vec4 o;
void main(){
  vec3 n=-normalize(cross(dFdx(vP),dFdy(vP)));if(n.z<0.)n=-n;
  float cr=clamp(vCr*uCAmt,-.06,.06);
  vec4 ov=cr<0.?vec4(0.,0.,0.,-cr):vec4(cr);
  vec3 col=mix(texture(uTex0,vUV).rgb,texture(uTex1,vUV).rgb,uMix);
  if(!gl_FrontFacing)col=mix(uPaper*.985,col,.06);
  float s=dot(n,uL)-uL.z;
  // softer than the study's: matte paper, not foil
  col*=1.+.5*max(min(s,0.),-1.)-vAO;
  col=mix(col,vec3(1.),clamp(s,0.,1.)*.28);
  o=vec4(col*(1.-ov.a)+ov.rgb,1.);
}`;
const SVS = `#version 300 es
in vec2 aQ;uniform vec2 uView;uniform vec3 uS;out vec2 vQ;
void main(){vQ=aQ;vec2 p=uS.xy+aQ*uS.z*vec2(1.,.82);gl_Position=vec4(p.x/(uView.x*.5),-p.y/(uView.y*.5),.9,1.);}`;
const SFS = `#version 300 es
precision highp float;in vec2 vQ;uniform float uA;out vec4 o;
void main(){float d=dot(vQ,vQ);o=vec4(0.,0.,0.,uA*exp(-3.2*d)*(1.-smoothstep(.85,1.,d)));}`;

const ATTRS = [
  ['aUV', 2],
  ['aT0', 3],
  ['aT1', 3],
  ['aC', 2],
  ['aD', 1],
  ['aE', 1],
  ['aL0', 3],
  ['aL1', 3],
];

// The ball made from a sheet of this size (radius, CSS px): a row makes a small one, a page a big one.
const ballR = (r) => clamp(0.17 * Math.sqrt(r.w * r.h), 26, 180);

// ---------- the context, for one transition ----------
let seq = 0;
// Returns null where WebGL2 is not available (the caller then crossfades).
export function createFold() {
  const canvas = document.createElement('canvas');
  canvas.className = 'nt-gl';
  canvas.setAttribute('aria-hidden', 'true');
  let gl = null;
  try {
    gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: true });
  } catch {
    gl = null;
  }
  if (!gl) return null;

  function prog(vs, fs) {
    const p = gl.createProgram();
    for (const [type, src] of [
      [gl.VERTEX_SHADER, vs],
      [gl.FRAGMENT_SHADER, fs],
    ]) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      gl.attachShader(p, sh);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
    const U = {};
    for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i += 1) {
      const name = gl.getActiveUniform(p, i).name;
      U[name] = gl.getUniformLocation(p, name);
    }
    return { p, U };
  }
  let MP;
  let SP;
  try {
    MP = prog(VS, FS);
    SP = prog(SVS, SFS);
  } catch {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }
  const svao = gl.createVertexArray();
  gl.bindVertexArray(svao);
  const sb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aQ = gl.getAttribLocation(SP.p, 'aQ');
  gl.enableVertexAttribArray(aQ);
  gl.vertexAttribPointer(aQ, 2, gl.FLOAT, false, 0, 0);

  let vao = null;
  let mesh = null;
  let vw = 0;
  let vh = 0;
  const tex = [null, null];
  let ends = null;
  const which = seq++ % 2; // alternate the two crumpled shapes from one transition to the next

  function mkTex(src) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  function size() {
    vw = document.documentElement.clientWidth;
    vh = window.innerHeight;
    const dpr = Math.min(3, window.devicePixelRatio || 1, 4096 / Math.max(window.innerWidth, window.innerHeight));
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
  }

  // a: { rect: {x, y, w, h} in viewport px, img } (t = 0); b: the same (t = 1), or null for 'away'.
  // kind: 'open' (a row opens into a page), 'next' (one page rolls off, the next rolls in),
  // 'away' (the page balls up and drops out of the window). side: 1 or -1, which way 'next' rolls.
  function setEnds(a, b, kind, side = 1) {
    size();
    const big = b && b.rect.w * b.rect.h > a.rect.w * a.rect.h ? b : a;
    const aspect = clamp(big.rect.w / big.rect.h, 0.4, 3);
    const m = buildMesh(aspect, vw < 700);
    if (m !== mesh) {
      mesh = m;
      if (vao) gl.deleteVertexArray(vao);
      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, m.buf, gl.STATIC_DRAW);
      let off = 0;
      for (const [name, n] of ATTRS) {
        const loc = gl.getAttribLocation(MP.p, name);
        if (loc >= 0) {
          gl.enableVertexAttribArray(loc);
          gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 72, off * 4);
        }
        off += n;
      }
    }
    tex.forEach((t) => t && gl.deleteTexture(t));
    tex[0] = mkTex(a.img);
    tex[1] = b ? mkTex(b.img) : tex[0];
    const end = (e) => {
      const r = e.rect;
      // the loose wad keeps the sheet's area, whatever its shape (a long row bunches up)
      return { ...r, cx: r.x + r.w / 2, cy: r.y + r.h / 2, R: ballR(r), loose: Math.sqrt((r.w * r.h) / aspect) * (vw < 700 ? 0.82 : 1) };
    };
    ends = { a: end(a), b: b ? end(b) : null, kind, side };
  }

  // Where everything is at time t (0 = A flat, 1 = B flat). Pure, so playing it backwards is exact.
  function pose(t) {
    const { a, b, kind, side } = ends;
    if (kind === 'away') {
      const c = ease(clamp(t / 0.42));
      const u = clamp((t - 0.34) / 0.66);
      const R = a.R;
      const x = a.cx - 0.12 * vw * u * side;
      const y = a.cy + (vh - a.cy + R * 2.6) * easeIn(u);
      return { c, end: a, x, y, z: R, R, mix: 0, rotY: (x - a.cx) / R + 0.35 * c, rotX: -0.3 * c - (y - a.cy) / R };
    }
    if (kind === 'next') {
      const c = t < 0.5 ? ease(clamp(t / 0.3)) : 1 - ease(clamp((t - 0.68) / 0.32));
      const end = t < 0.5 ? a : b;
      const R = end.R;
      let x;
      if (t < 0.5) x = lerp(a.cx, side > 0 ? -1.5 * R : vw + 1.5 * R, easeIn(clamp((t - 0.24) / 0.26)));
      else x = lerp(side > 0 ? vw + 1.5 * R : -1.5 * R, b.cx, easeOut(clamp((t - 0.5) / 0.24)));
      const hop = Math.abs(Math.sin(Math.PI * clamp((t - 0.24) / 0.5))) * R * 0.25;
      const y = end.cy - hop;
      return { c, end, x, y, z: R, R, mix: t < 0.5 ? 0 : 1, rotY: (x - end.cx) / R + 0.35 * c, rotX: -0.3 * c };
    }
    // 'open': A balls up where it is, rises (comes closer, so it grows), flies to B and opens there
    const c = t < 0.5 ? ease(clamp(t / 0.32)) : 1 - ease(clamp((t - 0.5) / 0.5));
    const u = ease(clamp((t - 0.18) / 0.4));
    const R = lerp(a.R, b.R, u);
    const dx = b.cx - a.cx;
    const dy = b.cy - a.cy;
    const len = Math.hypot(dx, dy) || 1;
    const bow = Math.min(120, len * 0.16) * Math.sin(Math.PI * u);
    const x = lerp(a.cx, b.cx, u) + (-dy / len) * bow;
    const y = lerp(a.cy, b.cy, u) + (dx / len) * bow;
    const z = R + b.R * 0.9 * Math.sin(Math.PI * u);
    return {
      c,
      end: t < 0.5 ? a : b,
      x,
      y,
      z,
      R,
      mix: sstep(0.36, 0.5, t),
      rotY: (x - a.cx) / Math.max(R, 40) + 0.35 * c,
      rotX: -0.3 * c - (y - a.cy) / Math.max(R, 40) * 0.5,
    };
  }

  function draw(t) {
    if (!ends || gl.isContextLost()) return;
    const P = pose(t);
    const e = P.end;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const ox = vw / 2;
    const oy = vh / 2;
    // the ball's soft shadow on the table, further and fainter the higher it is
    const lift = Math.max(0, P.z - P.R) / Math.max(P.R, 1);
    const sa = 0.3 * sstep(0.2, 0.9, P.c) / (1 + lift * 0.8);
    if (sa > 0.002) {
      gl.useProgram(SP.p);
      gl.disable(gl.DEPTH_TEST);
      gl.bindVertexArray(svao);
      gl.uniform2f(SP.U.uView, vw, vh);
      gl.uniform3f(SP.U.uS, P.x - ox + P.R * (0.28 + lift * 0.3), P.y - oy + P.R * (0.42 + lift * 0.45), P.R * 1.35 * (1 + lift * 0.3));
      gl.uniform1f(SP.U.uA, sa);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.useProgram(MP.p);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.frontFace(gl.CW);
    gl.bindVertexArray(vao);
    const U = MP.U;
    gl.uniform2f(U.uView, vw, vh);
    gl.uniform4f(U.uSheet, e.cx - ox, e.cy - oy, e.w, e.h);
    gl.uniform3f(U.uBall, P.x - ox, P.y - oy, P.z);
    gl.uniform1f(U.uC, P.c);
    gl.uniform1f(U.uWhich, which);
    gl.uniform1f(U.uR, P.R);
    gl.uniform1f(U.uF, 2.4 * Math.max(vw, vh));
    gl.uniform1f(U.uCurl, 0.16 * Math.min(e.w, e.h));
    gl.uniform1f(U.uLoose, e.loose);
    gl.uniform1f(U.uRotY, P.rotY);
    gl.uniform1f(U.uRotX, P.rotX);
    // creases show while the paper is crumpled and are gone once it is flat
    gl.uniform1f(U.uCAmt, 0.016 * sstep(0, 0.35, P.c));
    gl.uniform1f(U.uMix, P.mix);
    gl.uniform3f(U.uL, ...LIGHT);
    gl.uniform3f(U.uPaper, ...PAPER);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex[0]);
    gl.uniform1i(U.uTex0, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex[1]);
    gl.uniform1i(U.uTex1, 1);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }

  function dispose() {
    tex.forEach((t) => t && gl.deleteTexture(t));
    tex[0] = tex[1] = null;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
  }

  // The top of the ball on screen at time t, through the same perspective as the shader (the pin rides
  // it), with that perspective's scale k and how balled up the paper is (c).
  function ballTop(t) {
    if (!ends) return null;
    const P = pose(t);
    const F = 2.4 * Math.max(vw, vh);
    const k = F / Math.max(1, F - P.z);
    return { x: vw / 2 + (P.x - vw / 2) * k, y: vh / 2 + (P.y - 0.86 * P.R - vh / 2) * k, k, c: P.c };
  }

  return { canvas, setEnds, draw, pose: (t) => (ends ? pose(t) : null), ballTop, dispose };
}

// ---------- a reversible clock ----------
// t runs towards a target at 1/dur per ms; to() again (the other way) reverses it from where it is.
// The promise resolves true when the target is reached, false if another to() took over first.
export function createClock(onFrame) {
  let t = 0;
  let raf = 0;
  let target = 0;
  let rate = 0;
  let last = 0;
  let done = null;
  let held = false;
  const step = (now) => {
    raf = 0;
    if (held) return;
    const dt = Math.min(48, now - last);
    last = now;
    const d = target - t;
    const s = rate * dt;
    t = Math.abs(d) <= s ? target : t + Math.sign(d) * s;
    onFrame(t);
    if (t === target) {
      const fn = done;
      done = null;
      fn?.(true);
    } else raf = requestAnimationFrame(step);
  };
  return {
    get t() {
      return t;
    },
    set(v) {
      t = v;
      onFrame(t);
    },
    to(next, dur) {
      done?.(false);
      target = next;
      rate = 1 / Math.max(1, dur);
      return new Promise((resolve) => {
        done = resolve;
        if (held) return;
        last = performance.now();
        if (!raf) raf = requestAnimationFrame(step);
      });
    },
    // verification: freeze at a given t, then let it run again
    hold(v) {
      held = true;
      cancelAnimationFrame(raf);
      raf = 0;
      t = v;
      onFrame(t);
    },
    release() {
      held = false;
      last = performance.now();
      if (done && !raf) raf = requestAnimationFrame(step);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      done?.(false);
      done = null;
    },
  };
}
