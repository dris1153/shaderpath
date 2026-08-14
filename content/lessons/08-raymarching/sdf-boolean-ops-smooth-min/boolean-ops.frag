precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uOp;      // 0 = union, 1 = subtract, 2 = intersect, 3 = smooth union
uniform float uK;       // smooth-min blend radius (world units)
uniform float uOffset;  // shape B's slide along X, through shape A
uniform float uShowSeparately;

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float opUnion(float d1, float d2) { return min(d1, d2); }
float opSubtract(float d1, float d2) { return max(d1, -d2); } // carve d2 out of d1
float opIntersect(float d1, float d2) { return max(d1, d2); }

// Quilez h-form polynomial smooth min. k is clamped away from 0 so the
// division below never produces NaN when the slider is dragged to its floor.
float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

// .x = signed distance, .y = material weight (0 = shape A, 1 = shape B)
vec2 map(vec3 p) {
  float dA = sdSphere(p, 0.85);
  float dB = sdBox(p - vec3(uOffset, 0.0, 0.0), vec3(0.55));
  float k = max(uK, 0.0001);

  if (uShowSeparately > 0.5) {
    // Ignores the selected op entirely — plain union, tagged per-shape, so
    // both primitives read as distinct solids regardless of what's selected above.
    return dA < dB ? vec2(dA, 0.0) : vec2(dB, 1.0);
  }

  if (uOp < 0.5) {
    return vec2(opUnion(dA, dB), dA < dB ? 0.0 : 1.0);
  } else if (uOp < 1.5) {
    return vec2(opSubtract(dA, dB), 0.0);
  } else if (uOp < 2.5) {
    return vec2(opIntersect(dA, dB), 0.5);
  }

  // Same h weight drives both the geometry blend and the material blend —
  // color crossfades exactly where the surface itself crossfades.
  float h = clamp(0.5 + 0.5 * (dB - dA) / k, 0.0, 1.0);
  return vec2(opSmoothUnion(dA, dB, k), h);
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0015, 0.0);
  return normalize(vec3(
    map(p + e.xyy).x - map(p - e.xyy).x,
    map(p + e.yxy).x - map(p - e.yxy).x,
    map(p + e.yyx).x - map(p - e.yyx).x
  ));
}

void main() {
  vec3 ro = vec3(3.2 * sin(uTime * 0.2), 1.3, 3.2 * cos(uTime * 0.2));
  vec3 ta = vec3(0.0, 0.1, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);

  vec2 p = (vUv - 0.5) * 2.0;
  vec3 rd = normalize(p.x * uu + p.y * vv + 1.8 * ww);

  vec3 bg = mix(vec3(0.04, 0.05, 0.08), vec3(0.1, 0.11, 0.16), vUv.y);
  vec3 color = bg;

  float t = 0.0;
  float matId = -1.0;
  for (int i = 0; i < 100; i++) {
    vec3 pos = ro + rd * t;
    vec2 res = map(pos);
    if (res.x < 0.0006) {
      matId = res.y;
      break;
    }
    t += res.x;
    if (t > 14.0) break;
  }

  if (matId >= 0.0) {
    vec3 hit = ro + rd * t;
    vec3 n = calcNormal(hit);
    vec3 lightDir = normalize(vec3(0.6, 0.8, 0.35));
    float diff = max(dot(n, lightDir), 0.0);

    vec3 colorA = vec3(0.95, 0.5, 0.22);
    vec3 colorB = vec3(0.25, 0.55, 0.95);
    vec3 base = mix(colorA, colorB, clamp(matId, 0.0, 1.0));

    color = base * (0.22 + diff * 0.85);
    color = mix(color, bg, smoothstep(7.0, 14.0, t));
  }

  gl_FragColor = vec4(color, 1.0);
}
