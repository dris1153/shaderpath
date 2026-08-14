precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uMode;     // 0 = potential, 1 = curl streaks, 2 = divergence comparison
uniform float uStrength;
uniform float uScale;
uniform float uAnimate;  // 0/1

const float EPS = 0.02;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 hash2(vec2 p) {
  return vec2(hash(p), hash(p + 19.19));
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// The scalar potential psi(p): a 4-octave FBM, slowly drifting when animated.
float potential(vec2 p) {
  p += vec2(uTime * 0.06, -uTime * 0.04) * uAnimate;
  float sum = 0.0;
  float amp = 0.55;
  for (int i = 0; i < 4; i++) {
    sum += amp * valueNoise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

// Central-difference gradient of psi — the NAIVE motion field (compresses).
vec2 gradPotential(vec2 p) {
  float dx = potential(p + vec2(EPS, 0.0)) - potential(p - vec2(EPS, 0.0));
  float dy = potential(p + vec2(0.0, EPS)) - potential(p - vec2(0.0, EPS));
  return vec2(dx, dy) / (2.0 * EPS);
}

// F = (dPsi/dy, -dPsi/dx): the gradient rotated 90 degrees. Its divergence
// is identically zero (see theory) — this is the whole curl-noise trick.
vec2 curlField(vec2 p) {
  vec2 g = gradPotential(p);
  return vec2(g.y, -g.x);
}

vec2 sampleField(vec2 p, float fieldType) {
  return fieldType < 0.5 ? gradPotential(p) : curlField(p);
}

// Numerical divergence of whichever field, via the same central-difference
// pattern used for the gradient itself.
float divergence(vec2 p, float fieldType) {
  vec2 fxp = sampleField(p + vec2(EPS, 0.0), fieldType);
  vec2 fxm = sampleField(p - vec2(EPS, 0.0), fieldType);
  vec2 fyp = sampleField(p + vec2(0.0, EPS), fieldType);
  vec2 fym = sampleField(p - vec2(0.0, EPS), fieldType);
  float ddx = (fxp.x - fxm.x) / (2.0 * EPS);
  float ddy = (fyp.y - fym.y) / (2.0 * EPS);
  return ddx + ddy;
}

float dotMask(vec2 local, vec2 center, float r) {
  return smoothstep(r, r * 0.35, length(local - center));
}

// Backward-integrates a hash-dot lattice a few steps along the curl field,
// each step leaving a fading dash behind — an LIC-style flow streak.
float flowStreak(vec2 p) {
  vec2 q = p;
  float streak = 0.0;
  const int STEPS = 8;
  for (int i = 0; i < STEPS; i++) {
    vec2 cell = floor(q);
    vec2 f = fract(q) - 0.5;
    vec2 jitter = (hash2(cell) - 0.5) * 0.7;
    float fade = 1.0 - float(i) / float(STEPS);
    streak = max(streak, dotMask(f, jitter, 0.18) * fade);
    vec2 v = curlField(q);
    q -= normalize(v + 1e-5) * uStrength * 0.05;
  }
  return streak;
}

// Advects each lattice point's REST position by the field sampled there.
// A naive (compressive) field visibly clumps points into sinks; a curl
// field, being divergence-free, keeps them evenly spread while they swirl.
float advectedDots(vec2 p, float amount, float fieldType) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float best = 1.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 b = vec2(float(i), float(j));
      vec2 restCell = cell + b;
      vec2 jitter = hash2(restCell) - 0.5;
      vec2 restLocal = b + jitter * 0.7;
      vec2 restWorld = restCell + jitter * 0.7;
      vec2 disp = clamp(sampleField(restWorld, fieldType) * amount, -0.85, 0.85);
      best = min(best, length(f - (restLocal + disp)));
    }
  }
  return smoothstep(0.13, 0.03, best);
}

void main() {
  vec2 p = (vUv - 0.5) * uScale;
  vec3 color;

  if (uMode < 0.5) {
    // (a) the potential field itself, as grayscale-to-warm
    float psi = potential(p);
    color = mix(vec3(0.05, 0.07, 0.13), vec3(0.97, 0.72, 0.32), psi);
  } else if (uMode < 1.5) {
    // (b) curl field visualized as moving dash streaks
    vec3 bg = mix(vec3(0.04, 0.05, 0.09), vec3(0.1, 0.13, 0.22), potential(p));
    float streak = flowStreak(p);
    color = mix(bg, vec3(0.55, 0.85, 1.0), streak);
  } else {
    // (c) split screen: left = naive gradient field, right = curl field.
    // Background tints by local divergence (red = expanding, blue =
    // compressing); dots additionally drift by field-at-rest-position —
    // together they show compression/clumping vs. even, swirling coverage.
    float side = vUv.x < 0.5 ? 0.0 : 1.0;
    float div = divergence(p, side);
    float t = clamp(div * 2.5 + 0.5, 0.0, 1.0);
    vec3 divColor = mix(vec3(0.25, 0.45, 0.9), vec3(0.9, 0.35, 0.25), t);
    vec3 bg = mix(vec3(0.05, 0.06, 0.09), divColor, 0.4);

    float amount = fract(uTime * 0.15 * uAnimate) * uStrength * 2.4;
    float dots = advectedDots(p, amount, side);
    color = mix(bg, vec3(0.97), dots);

    float seam = smoothstep(0.0015, 0.0, abs(vUv.x - 0.5));
    color = mix(color, vec3(1.0), seam);
  }

  gl_FragColor = vec4(color, 1.0);
}
