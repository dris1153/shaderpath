precision highp float;

varying vec2 vUv;
uniform float uScale;
uniform float uVariant; // 0 = Perlin, 1 = Simplex
uniform float uTime;
uniform float uAnimate;

// ---- Hash: deterministic pseudo-random value per lattice corner ----
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// ---- Classic Perlin noise (2D) — Perlin 1985 gradients, 2002 quintic fade ----
vec2 perlinGradient(vec2 corner) {
  float angle = hash21(corner) * 6.28318530718;
  return vec2(cos(angle), sin(angle)); // unit gradient, hash-derived (no permutation table)
}

vec2 perlinFade(vec2 t) {
  // Ken Perlin, "Improving Noise" (2002): 6t^5 - 15t^4 + 10t^3, C2-continuous
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlin2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  // One dot product per lattice corner: gradient(corner) . (sample - corner)
  float a = dot(perlinGradient(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0));
  float b = dot(perlinGradient(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(perlinGradient(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(perlinGradient(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

  vec2 u = perlinFade(f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y); // bilinear (n-linear in 2D)
}

// ---- Simplex noise (2D) — Ashima Arts / Stefan Gustavson, webgl-noise ----
// https://github.com/stegu/webgl-noise (MIT). Skewed triangular lattice:
// n+1 = 3 corners per cell, radial kernel falloff instead of interpolation.
vec3 simplexPermute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float simplex2D(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187, // G2 = (3-sqrt(3))/6
    0.366025403784439, // F2 = (sqrt(3)-1)/2
    -0.577350269189626, // -1 + 2*G2
    0.024390243902439 // 1 / 41
  );

  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod(i, 289.0);
  vec3 p = simplexPermute(
    simplexPermute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );
  m = m * m;
  m = m * m;

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

void main() {
  vec2 p = vUv * uScale;
  // Animation here is a plain domain scroll — a deliberate simplification;
  // the "Noise in 3D/4D over time" lesson explains why this drifts artificially.
  p += uAnimate * vec2(uTime * 0.15, uTime * 0.08);

  float n = uVariant < 0.5 ? perlin2D(p) : simplex2D(p);

  // Both variants are ~zero-centered; remap the (roughly [-0.7,0.7] for
  // Perlin, ~[-1,1] for Simplex) range to [0,1] for display.
  float v = clamp(n * 0.5 + 0.5, 0.0, 1.0);

  vec3 color = mix(vec3(0.07, 0.08, 0.13), vec3(0.96, 0.55, 0.22), v);
  gl_FragColor = vec4(color, 1.0);
}
