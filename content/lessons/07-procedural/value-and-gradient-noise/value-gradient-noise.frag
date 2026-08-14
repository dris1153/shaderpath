precision highp float;

varying vec2 vUv;
uniform float uField;     // 0 = value noise, 1 = gradient noise
uniform float uFade;      // 0 = linear, 1 = smoothstep, 2 = quintic
uniform float uScale;     // grid frequency
uniform float uGridLines; // 0/1 toggle for the cell-boundary overlay

// Sine-free hash from the previous lesson — corners must stay pure functions of position
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 fade(vec2 t) {
  if (uFade < 0.5) return t;                                // linear
  if (uFade < 1.5) return t * t * (3.0 - 2.0 * t);           // smoothstep
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);          // quintic
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));

  vec2 u = fade(f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Corner stores a direction, not a value — dot(gradient, offset to p) instead of the raw hash
vec2 gradientAt(vec2 gridPoint) {
  float angle = hash21(gridPoint) * 6.28318530718;
  return vec2(cos(angle), sin(angle));
}

float gradientNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float v00 = dot(gradientAt(i), f);
  float v10 = dot(gradientAt(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float v01 = dot(gradientAt(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float v11 = dot(gradientAt(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));

  vec2 u = fade(f);
  return mix(mix(v00, v10, u.x), mix(v01, v11, u.x), u.y);
}

void main() {
  vec2 p = vUv * uScale;

  // gradient noise centers on 0 (roughly [-0.7, 0.7]) — remap to [0, 1] to match value noise's range
  float n = uField > 0.5 ? gradientNoise(p) * 0.5 + 0.5 : valueNoise(p);
  vec3 color = vec3(n);

  if (uGridLines > 0.5) {
    vec2 g = fract(p);
    float edge = min(min(g.x, 1.0 - g.x), min(g.y, 1.0 - g.y));
    float line = 1.0 - smoothstep(0.0, 0.025, edge);
    color = mix(color, vec3(1.0, 0.35, 0.2), line * 0.6);
  }

  gl_FragColor = vec4(color, 1.0);
}
