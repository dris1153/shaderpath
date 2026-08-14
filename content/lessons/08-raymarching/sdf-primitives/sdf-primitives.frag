precision highp float;

varying vec2 vUv;
uniform float uPrimitive; // 0 sphere, 1 box, 2 torus, 3 capsule
uniform float uContour;
uniform float uOffsetX;
uniform float uRotY;

const int STEP_CAP = 96;
const float EPSILON = 0.001;
const float MAX_DIST = 20.0;

// The four exact SDFs — formulas match iquilezles.org/articles/distfunctions
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// Transform the QUERY point by the inverse of the primitive's placement —
// translate back, then rotate back — instead of transforming the shape.
vec3 toLocal(vec3 p) {
  p.x -= uOffsetX;
  float a = radians(-uRotY);
  float c = cos(a);
  float s = sin(a);
  p.xz = mat2(c, -s, s, c) * p.xz;
  return p;
}

float map(vec3 p) {
  vec3 lp = toLocal(p);
  int id = int(uPrimitive);
  if (id == 0) return sdSphere(lp, 0.75);
  if (id == 1) return sdBox(lp, vec3(0.55));
  if (id == 2) return sdTorus(lp, vec2(0.65, 0.22));
  return sdCapsule(lp, vec3(0.0, -0.55, 0.0), vec3(0.0, 0.55, 0.0), 0.3);
}

vec3 rayDirection(vec2 uv, vec3 ro, vec3 ta, float fovDeg) {
  vec3 fwd = normalize(ta - ro);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  float halfFov = radians(fovDeg) * 0.5;
  return normalize(fwd + (uv.x * tan(halfFov)) * right + (uv.y * tan(halfFov)) * up);
}

float march(vec3 ro, vec3 rd, out bool hit) {
  float t = 0.0;
  hit = false;
  for (int i = 0; i < STEP_CAP; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < EPSILON) {
      hit = true;
      break;
    }
    t += d;
    if (t > MAX_DIST) break;
  }
  return t;
}

// Inigo Quilez-style banded coloring: makes the zero contour AND the
// surrounding iso-distance lines directly visible on a flat cross-section —
// the "color slice-plane contours" way of verifying an SDF from the theory.
vec3 contourColor(float d) {
  vec3 col = vec3(1.0) - sign(d) * vec3(0.1, 0.4, 0.7);
  col *= 1.0 - exp(-3.0 * abs(d));
  col *= 0.8 + 0.2 * cos(140.0 * d);
  col = mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.015, abs(d)));
  return col;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;

  if (uContour > 0.5) {
    // Sample the SAME map() on the world z = 0 plane — a direct slice
    // through the primitive, offset/rotation included, no raymarch needed.
    vec3 samplePoint = vec3(uv.x * 1.6, uv.y * 1.6, 0.0);
    float d = map(samplePoint);
    gl_FragColor = vec4(contourColor(d), 1.0);
    return;
  }

  vec3 ro = vec3(2.6, 1.6, 3.0);
  vec3 ta = vec3(0.0, 0.0, 0.0);
  vec3 rd = rayDirection(uv, ro, ta, 40.0);

  bool hit;
  float t = march(ro, rd, hit);

  vec3 skyTop = vec3(0.55, 0.7, 0.92);
  vec3 skyBottom = vec3(0.85, 0.88, 0.95);
  vec3 color = mix(skyBottom, skyTop, clamp(rd.y * 0.5 + 0.3, 0.0, 1.0));

  if (hit) {
    color = vec3(0.9, 0.5, 0.2);
    float fog = 1.0 - exp(-t * 0.06);
    color = mix(color, mix(skyBottom, skyTop, 0.3), fog);
  }

  gl_FragColor = vec4(color, 1.0);
}
