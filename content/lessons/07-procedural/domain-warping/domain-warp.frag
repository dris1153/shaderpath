precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uAnimate;
uniform float uWarpStrength;
uniform float uLayers; // 0 = none, 1 = one warp layer (q), 2 = nested (q then r)
uniform float uColorByIntermediate;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 p = (vUv - 0.5) * 3.0;
  // uAnimate gates the drift without touching the frame loop itself (§8.4).
  float t = uTime * uAnimate * 0.12;
  p += vec2(t, -t * 0.6);

  vec2 q = vec2(0.0);
  vec2 r = vec2(0.0);
  float f;

  if (uLayers < 0.5) {
    // 0 layers: plain fbm, no domain warp at all — the "before" baseline.
    f = fbm(p);
  } else if (uLayers < 1.5) {
    // 1 layer: q = fbm(p + offsets), then fbm(p + strength * q).
    q = vec2(
      fbm(p + vec2(0.0, 0.0)),
      fbm(p + vec2(5.2, 1.3))
    );
    f = fbm(p + uWarpStrength * q);
  } else {
    // 2 layers: r is built from a warp using q, then f warps by r.
    q = vec2(
      fbm(p + vec2(0.0, 0.0)),
      fbm(p + vec2(5.2, 1.3))
    );
    r = vec2(
      fbm(p + uWarpStrength * q + vec2(1.7, 9.2)),
      fbm(p + uWarpStrength * q + vec2(8.3, 2.8))
    );
    f = fbm(p + uWarpStrength * r);
  }

  vec3 colorA = vec3(0.05, 0.08, 0.2);
  vec3 colorB = vec3(0.95, 0.55, 0.2);
  vec3 color = mix(colorA, colorB, clamp(f, 0.0, 1.0));

  // Quilez's trick: color by the intermediate warp fields, not just f.
  if (uColorByIntermediate > 0.5) {
    color = mix(color, vec3(0.1, 0.45, 0.9), clamp(q.x, 0.0, 1.0) * 0.5);
    color = mix(color, vec3(0.9, 0.15, 0.25), clamp(r.y, 0.0, 1.0) * 0.5);
  }

  gl_FragColor = vec4(color, 1.0);
}
