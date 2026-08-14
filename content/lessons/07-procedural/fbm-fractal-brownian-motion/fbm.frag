precision highp float;

varying vec2 vUv;
uniform float uOctaves;
uniform float uLacunarity;
uniform float uGain;
uniform float uVariant; // 0 = standard, 1 = ridged, 2 = turbulence
uniform float uTime;
uniform float uAnimate;

const int MAX_OCTAVES = 8;

// ---- Simplex noise (2D) — Ashima Arts / Stefan Gustavson, webgl-noise ----
// https://github.com/stegu/webgl-noise (MIT). One octave = one feature
// scale; fbm() below layers this at rising frequencies, falling amplitudes.
vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float simplex2D(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );

  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

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

// The FBM loop: amplitude *= gain, frequency *= lacunarity, each octave.
// Divides by the max-possible amplitude sum so the result stays in a
// stable range regardless of octave count (spec: normalization).
float fbm(vec2 p, int octaves, float lacunarity, float gain, float variant) {
  float sum = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float maxAmplitude = 0.0;

  for (int i = 0; i < MAX_OCTAVES; i++) {
    if (i >= octaves) break; // iteration count is uniform-driven — free to branch on

    float n = simplex2D(p * frequency);
    if (variant > 1.5) {
      n = abs(n); // turbulence: sharp creases at every zero-crossing
    } else if (variant > 0.5) {
      n = 1.0 - abs(n); // ridged: those same zero-crossings become bright ridges
    }

    sum += amplitude * n;
    maxAmplitude += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return sum / maxAmplitude;
}

void main() {
  vec2 p = (vUv - 0.5) * 4.0;
  p += uAnimate * vec2(uTime * 0.1, uTime * 0.06);

  int octaves = int(uOctaves);
  float n = fbm(p, octaves, uLacunarity, uGain, uVariant);

  float v = clamp(n * 0.5 + 0.5, 0.0, 1.0);
  vec3 color = mix(vec3(0.06, 0.08, 0.14), vec3(0.95, 0.72, 0.35), v);

  gl_FragColor = vec4(color, 1.0);
}
