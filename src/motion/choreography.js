const clamp = (value) => Math.max(0, Math.min(1, value));

// A pose is a function of scroll, so a reversal retraces the same choreography.
export function choreographyState(progress) {
  const phase = clamp(progress);
  const envelope = Math.sin(Math.PI * phase) ** 2;
  const x = 1 - .12 * envelope;
  const z = 1 - .08 * envelope;
  const beat = phase === 0 || phase === 1 ? 'hold' : phase < .16 ? 'prepare' : phase < .76 ? 'transport' : 'settle';
  return { phase, beat, envelope, compression: x, stretch: 1 / (x * z), depth: z };
}

export const particleChoreography = /* glsl */ `
  float motionEase(float t) {
    t = clamp(t, 0., 1.);
    return t * t * t * (t * (t * 6. - 15.) + 10.);
  }

  vec3 motionPose(vec3 start, vec3 finish, float phase, float seed, float extent) {
    if (phase <= 0.) return start;
    if (phase >= 1.) return finish;

    // Higher parts lead; four small cohorts let the rest follow through.
    float rank = clamp(.5 - start.y / (extent * 2.4), 0., 1.);
    float cohort = floor(seed * 4.) / 3.;
    float delay = .035 + .085 * (rank * .65 + cohort * .35);
    float local = clamp((phase - delay) / (.95 - delay), 0., 1.);
    float travel = motionEase(local);
    float settle = sin(3.141593 * clamp((local - .68) / .32, 0., 1.));
    float reach = travel + .045 * settle * settle;

    vec3 delta = finish - start;
    vec3 p = mix(start, finish, reach);
    float prepare = sin(3.141593 * clamp(phase / .18, 0., 1.));
    p -= delta * (.025 * prepare * prepare * (1. - travel));

    // A coherent arc carries the mass; a smaller ribbon follows its wake.
    float arc = sin(3.141593 * travel);
    arc *= arc;
    vec2 tangent = normalize(vec2(-delta.y, delta.x) + vec2(.0001));
    float side = mix(-1., 1., step(.5, seed));
    p.xy += tangent * side * arc * extent * (.13 + .09 * seed);
    p.z += sin(seed * 6.283185 + .7) * arc * extent * .22;
    p += vec3(sin(seed * 19. + travel * 6.283185), cos(seed * 13. + travel * 6.283185), 0.)
      * arc * extent * .018;

    // Compression preserves volume rather than collapsing the cloud to a line.
    float envelope = sin(3.141593 * phase);
    envelope *= envelope;
    float sx = 1. - .12 * envelope;
    float sz = 1. - .08 * envelope;
    p *= vec3(sx, 1. / (sx * sz), sz);
    return p;
  }
`;
