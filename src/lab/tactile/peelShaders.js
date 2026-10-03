/*! @license
MIT License

Copyright (c) 2026 CatsJuice

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/*
 * Cylindrical peel deformation and projected shadow adapted from
 * CatsJuice/sticker-forge, lib/shaders.ts (MIT).
 * Revision: 068caa49eef69745564a5debbc01bab3fcd31042.
 * Copyright (c) 2026 CatsJuice.
 * Full license: docs/licenses/sticker-forge-MIT.txt.
 */
const deformation = /* glsl */ `
  uniform float uDepth;
  uniform float uRadius;
  uniform vec2 uOrigin;
  uniform vec2 uDirection;
  varying vec2 vUv;
  varying vec3 vPaperNormal;
  varying float vElevation;

  vec3 curl(vec3 base) {
    vec2 direction = normalize(uDirection);
    float along = dot(base.xy - uOrigin, direction);
    float distance = uDepth - along;
    if (distance <= 0.0) return base;
    float radius = max(uRadius, 0.001);
    float maxAngle = 2.95;
    float angle = min(distance / radius, maxAngle);
    float projected = -radius * sin(angle);
    float elevation = radius * (1.0 - cos(angle));
    if (distance > radius * maxAngle) {
      float freeLength = distance - radius * maxAngle;
      projected -= freeLength * cos(maxAngle);
      elevation += freeLength * sin(maxAngle);
    }
    vec2 crease = base.xy + direction * distance;
    return vec3(crease + direction * projected, elevation);
  }

  vec3 paperNormal(vec3 base) {
    float distance = uDepth - dot(base.xy - uOrigin, normalize(uDirection));
    float angle = min(max(distance, 0.0) / max(uRadius, 0.001), 2.95);
    return normalize(vec3(normalize(uDirection) * sin(angle), cos(angle)));
  }
`;

export const paperVertex = /* glsl */ `
  ${deformation}
  void main() {
    vUv = uv;
    vec3 deformed = curl(position);
    vElevation = deformed.z;
    vPaperNormal = normalize(normalMatrix * paperNormal(position));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(deformed, 1.0);
  }
`;

export const paperFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uBack;
  varying vec2 vUv;
  varying vec3 vPaperNormal;
  varying float vElevation;
  void main() {
    vec3 normal = normalize(vPaperNormal) * (gl_FrontFacing ? 1.0 : -1.0);
    vec3 light = normalize(vec3(-0.45, 0.65, 1.5));
    float diffuse = max(dot(normal, light), 0.0);
    vec3 printColor = texture2D(uMap, vUv).rgb;
    float grain = fract(sin(dot(vUv * 1200.0, vec2(12.9898, 78.233))) * 43758.5453);
    vec3 backing = uBack + (grain - 0.5) * 0.024;
    float stripe = step(0.97, fract((vUv.x + vUv.y) * 18.0));
    backing *= 1.0 - stripe * 0.045;
    vec3 color = gl_FrontFacing ? printColor : backing;
    color *= 0.64 + 0.36 * diffuse;
    float specular = pow(max(dot(normal, normalize(light + vec3(0.0, 0.0, 1.0))), 0.0), 34.0);
    color += specular * min(vElevation * 0.3, 0.11);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const shadowVertex = /* glsl */ `
  ${deformation}
  void main() {
    vUv = uv;
    vec3 deformed = curl(position);
    vElevation = deformed.z;
    deformed.xy += vec2(0.23, -0.3) * (deformed.z + 0.16);
    deformed.z = -0.018;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(deformed, 1.0);
  }
`;

export const shadowFragment = /* glsl */ `
  varying vec2 vUv;
  varying float vElevation;
  void main() {
    float edge = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float feather = smoothstep(0.0, 0.03 + vElevation * 0.022, edge);
    gl_FragColor = vec4(0.10, 0.09, 0.07, feather * (0.20 / (1.0 + vElevation * 0.5)));
    #include <colorspace_fragment>
  }
`;
