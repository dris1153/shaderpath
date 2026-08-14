precision highp float;

varying vec2 vUv;
uniform float uMaxSteps;
uniform float uEpsilon;
uniform float uHeatmap;
uniform float uOrbitAngle;

const int STEP_CAP = 128;
const float MAX_DIST = 20.0;

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// Scene function f(p): one sphere sitting above a ground plane at y = -0.85.
// The whole "geometry" of this demo is this single min() of two SDFs.
float map(vec3 p) {
  float sphere = sdSphere(p - vec3(0.0, 0.35, 0.0), 0.85);
  float plane = p.y + 0.85;
  return min(sphere, plane);
}

// Standard camera basis: fwd/right/up from ray origin + look target, then
// scale screen-space uv by tan(fov/2) — see theory for the full derivation.
vec3 rayDirection(vec2 uv, vec3 ro, vec3 ta, float fovDeg) {
  vec3 fwd = normalize(ta - ro);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  float halfFov = radians(fovDeg) * 0.5;
  return normalize(fwd + (uv.x * tan(halfFov)) * right + (uv.y * tan(halfFov)) * up);
}

// The sphere tracing loop: step by f(p) each time (guaranteed safe), stop on
// hit (d < eps) or miss (steps exhausted or t past maxDist).
float march(vec3 ro, vec3 rd, int maxSteps, float eps, out int usedSteps, out bool hit) {
  float t = 0.0;
  hit = false;
  usedSteps = maxSteps;
  for (int i = 0; i < STEP_CAP; i++) {
    if (i >= maxSteps) break; // iteration count is uniform-driven — free to branch on
    vec3 p = ro + rd * t;
    float d = map(p);
    if (d < eps) {
      hit = true;
      usedSteps = i + 1;
      break;
    }
    t += d;
    if (t > MAX_DIST) {
      usedSteps = i + 1;
      break;
    }
  }
  return t;
}

// Cheap blue -> cyan -> yellow -> red ramp for the step-count heatmap.
vec3 heatColor(float t) {
  vec3 c0 = vec3(0.05, 0.05, 0.35);
  vec3 c1 = vec3(0.1, 0.65, 0.75);
  vec3 c2 = vec3(0.95, 0.85, 0.2);
  vec3 c3 = vec3(0.9, 0.15, 0.1);
  float t1 = clamp(t * 3.0, 0.0, 1.0);
  float t2 = clamp(t * 3.0 - 1.0, 0.0, 1.0);
  float t3 = clamp(t * 3.0 - 2.0, 0.0, 1.0);
  vec3 col = mix(c0, c1, t1);
  col = mix(col, c2, t2);
  col = mix(col, c3, t3);
  return col;
}

void main() {
  // Square viewport (Demo ratio = 1) so aspect = 1 and uv.x needs no extra
  // scale factor — on a non-square canvas you'd multiply uv.x by W/H.
  vec2 uv = vUv * 2.0 - 1.0;

  float angle = radians(uOrbitAngle);
  vec3 ro = vec3(sin(angle) * 3.4, 1.4, cos(angle) * 3.4);
  vec3 ta = vec3(0.0, 0.1, 0.0);
  vec3 rd = rayDirection(uv, ro, ta, 42.0);

  int maxSteps = int(uMaxSteps);
  int usedSteps;
  bool hit;
  float t = march(ro, rd, maxSteps, uEpsilon, usedSteps, hit);

  vec3 skyTop = vec3(0.55, 0.7, 0.92);
  vec3 skyBottom = vec3(0.85, 0.88, 0.95);
  vec3 sky = mix(skyBottom, skyTop, clamp(rd.y * 0.5 + 0.3, 0.0, 1.0));

  vec3 color = sky;
  if (hit) {
    vec3 p = ro + rd * t;
    float sphereD = sdSphere(p - vec3(0.0, 0.35, 0.0), 0.85);
    float planeD = p.y + 0.85;
    if (sphereD < planeD) {
      color = vec3(0.85, 0.35, 0.2);
    } else {
      float checker = mod(floor(p.x) + floor(p.z), 2.0);
      color = mix(vec3(0.25, 0.27, 0.32), vec3(0.75, 0.77, 0.8), checker);
    }
    float fog = 1.0 - exp(-t * 0.05);
    color = mix(color, sky, fog);
  }

  if (uHeatmap > 0.5) {
    float ratio = float(usedSteps) / float(maxSteps);
    color = heatColor(ratio);
  }

  gl_FragColor = vec4(color, 1.0);
}
