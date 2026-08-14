precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uSpeed;
uniform float uMode;       // 0 = scroll, 1 = slice, 2 = loop
uniform float uLoopPeriod; // seconds per loop (loop mode only)
uniform float uSideBySide; // 0 = single mode, 1 = split scroll | slice

// Classic sin/dot hash (see the Hash Functions lesson), overloaded per
// dimension — GLSL resolves the right one from the argument type.
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
float hash(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}
float hash(vec4 p) {
  return fract(sin(dot(p, vec4(12.9898, 78.233, 37.719, 19.213))) * 43758.5453);
}

// Value noise: hash the grid corners, blend with a smoothstep-shaped weight.
float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Same idea, trilinear over the cube's 8 corners.
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float c000 = hash(i + vec3(0.0, 0.0, 0.0));
  float c100 = hash(i + vec3(1.0, 0.0, 0.0));
  float c010 = hash(i + vec3(0.0, 1.0, 0.0));
  float c110 = hash(i + vec3(1.0, 1.0, 0.0));
  float c001 = hash(i + vec3(0.0, 0.0, 1.0));
  float c101 = hash(i + vec3(1.0, 0.0, 1.0));
  float c011 = hash(i + vec3(0.0, 1.0, 1.0));
  float c111 = hash(i + vec3(1.0, 1.0, 1.0));
  float x00 = mix(c000, c100, u.x);
  float x10 = mix(c010, c110, u.x);
  float x01 = mix(c001, c101, u.x);
  float x11 = mix(c011, c111, u.x);
  float y0 = mix(x00, x10, u.y);
  float y1 = mix(x01, x11, u.y);
  return mix(y0, y1, u.z);
}

// Same idea again, quadrilinear over the hypercube's 16 corners: split into
// two trilinear blends (w=0 slice, w=1 slice), then mix those by u.w.
float noise4(vec4 p) {
  vec4 i = floor(p);
  vec4 f = fract(p);
  vec4 u = f * f * (3.0 - 2.0 * f);

  float c0000 = hash(i + vec4(0.0, 0.0, 0.0, 0.0));
  float c1000 = hash(i + vec4(1.0, 0.0, 0.0, 0.0));
  float c0100 = hash(i + vec4(0.0, 1.0, 0.0, 0.0));
  float c1100 = hash(i + vec4(1.0, 1.0, 0.0, 0.0));
  float c0010 = hash(i + vec4(0.0, 0.0, 1.0, 0.0));
  float c1010 = hash(i + vec4(1.0, 0.0, 1.0, 0.0));
  float c0110 = hash(i + vec4(0.0, 1.0, 1.0, 0.0));
  float c1110 = hash(i + vec4(1.0, 1.0, 1.0, 0.0));

  float c0001 = hash(i + vec4(0.0, 0.0, 0.0, 1.0));
  float c1001 = hash(i + vec4(1.0, 0.0, 0.0, 1.0));
  float c0101 = hash(i + vec4(0.0, 1.0, 0.0, 1.0));
  float c1101 = hash(i + vec4(1.0, 1.0, 0.0, 1.0));
  float c0011 = hash(i + vec4(0.0, 0.0, 1.0, 1.0));
  float c1011 = hash(i + vec4(1.0, 0.0, 1.0, 1.0));
  float c0111 = hash(i + vec4(0.0, 1.0, 1.0, 1.0));
  float c1111 = hash(i + vec4(1.0, 1.0, 1.0, 1.0));

  float x00_0 = mix(c0000, c1000, u.x);
  float x10_0 = mix(c0100, c1100, u.x);
  float x01_0 = mix(c0010, c1010, u.x);
  float x11_0 = mix(c0110, c1110, u.x);
  float y0_0 = mix(x00_0, x10_0, u.y);
  float y1_0 = mix(x01_0, x11_0, u.y);
  float z0 = mix(y0_0, y1_0, u.z);

  float x00_1 = mix(c0001, c1001, u.x);
  float x10_1 = mix(c0101, c1101, u.x);
  float x01_1 = mix(c0011, c1011, u.x);
  float x11_1 = mix(c0111, c1111, u.x);
  float y0_1 = mix(x00_1, x10_1, u.y);
  float y1_1 = mix(x01_1, x11_1, u.y);
  float z1 = mix(y0_1, y1_1, u.z);

  return mix(z0, z1, u.w);
}

// Fixed wind-like direction (unit length) for the scroll mode.
const vec2 SCROLL_DIR = vec2(0.866, 0.5);
const float SCALE = 4.0;

float sampleMode(vec2 p, float mode, float t) {
  if (mode < 0.5) {
    // Scroll: the field itself never changes, only the sample window slides.
    return noise2(p * SCALE + SCROLL_DIR * t);
  } else if (mode < 1.5) {
    // Slice: t is a real coordinate of a 3D volume, so every t reads a
    // different slab — features grow, shrink and split instead of sliding.
    return noise3(vec3(p * SCALE, t));
  } else {
    // Loop: the two extra dimensions trace a circle of period uLoopPeriod,
    // so t = 0 and t = uLoopPeriod land on the exact same 4D sample point.
    float omega = 6.28318530718 / max(uLoopPeriod, 0.001);
    return noise4(vec4(p * SCALE, cos(omega * t), sin(omega * t)));
  }
}

vec3 shade(float n) {
  vec3 low = vec3(0.06, 0.09, 0.16);
  vec3 high = vec3(0.95, 0.75, 0.35);
  return mix(low, high, clamp(n, 0.0, 1.0));
}

void main() {
  vec2 p = vUv - 0.5;
  float t = uTime * uSpeed;

  float n;
  if (uSideBySide > 0.5) {
    // Left half = scroll, right half = slice, each re-centered in its own
    // half so both sides show the same amount of noise detail.
    if (vUv.x < 0.5) {
      vec2 pl = vec2(vUv.x * 2.0 - 0.5, vUv.y - 0.5);
      n = sampleMode(pl, 0.0, t);
    } else {
      vec2 pr = vec2((vUv.x - 0.5) * 2.0 - 0.5, vUv.y - 0.5);
      n = sampleMode(pr, 1.0, t);
    }
  } else {
    n = sampleMode(p, uMode, t);
  }

  vec3 color = shade(n);

  if (uSideBySide > 0.5) {
    float divider = smoothstep(0.002, 0.0, abs(vUv.x - 0.5));
    color = mix(color, vec3(1.0), divider);
  }

  gl_FragColor = vec4(color, 1.0);
}
