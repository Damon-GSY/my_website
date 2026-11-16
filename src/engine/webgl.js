// One probe for the whole page: can this browser make a WebGL context at all? Asking up front lets
// the films and the ink hero go straight to their static fallbacks instead of letting three.js log
// "could not create a WebGL context". three.js (r163+) needs WebGL2; the ink hero needs WebGL1.
let cache;
function probe() {
  if (cache) return cache;
  cache = { webgl2: false, webgl: false };
  try {
    const canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl2');
    if (gl) cache.webgl2 = cache.webgl = true;
    else {
      gl = canvas.getContext('webgl');
      cache.webgl = Boolean(gl);
    }
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    // no WebGL
  }
  return cache;
}

export const hasWebGL2 = () => probe().webgl2;
export const hasWebGL = () => probe().webgl;
