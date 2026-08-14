precision highp float;

varying vec2 vUv;
uniform vec2 uResolution;
uniform float uTime;
uniform float uBoundingVolume; // 1.0 = ray-box early-out before marching
uniform float uRelax;          // 1.0 = plain sphere tracing, >1.0 = over-relaxed
uniform float uDistScaledEps;  // 1.0 = epsilon *= t, 0.0 = fixed epsilon
uniform float uHeatmap;        // 1.0 = colorize by step count

const int MAX_STEPS = 96;
const float MAX_DIST = 40.0;
const float CELL = 1.6;
const float GROUND_Y = -1.0;
const vec3 BOX_MIN = vec3(-6.0, -1.2, -6.0);
const vec3 BOX_MAX = vec3(6.0, 2.0, 6.0);

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Domain-repeated pillar field (bài trước: domain-repetition) + ground plane.
// This is the "expensive" per-step scene function every march iteration pays for.
float sdScene(vec3 p) {
  float ground = p.y - GROUND_Y;

  vec3 q = p;
  q.xz = mod(q.xz + 0.5 * CELL, CELL) - 0.5 * CELL;
  float h = 1.1 + 0.5 * sin(p.x * 0.35) * cos(p.z * 0.35);
  float pillar = sdBox(q - vec3(0.0, GROUND_Y + h * 0.5, 0.0), vec3(0.28, h * 0.5, 0.28));

  return min(ground, pillar);
}

// Classic slab method: per-axis entry/exit interval, intersected across axes.
vec2 intersectBox(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax) {
  vec3 invD = 1.0 / rd;
  vec3 t0s = (bmin - ro) * invD;
  vec3 t1s = (bmax - ro) * invD;
  vec3 tsm = min(t0s, t1s);
  vec3 tbg = max(t0s, t1s);
  float tNear = max(max(tsm.x, tsm.y), tsm.z);
  float tFar = min(min(tbg.x, tbg.y), tbg.z);
  return vec2(tNear, tFar);
}

vec3 sceneNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    sdScene(p + e.xyy) - sdScene(p - e.xyy),
    sdScene(p + e.yxy) - sdScene(p - e.yxy),
    sdScene(p + e.yyx) - sdScene(p - e.yyx)
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  // Fixed virtual camera: low and grazing, so a large chunk of the frame is
  // open sky above the pillar field's bounding box (§ theory: bounding volume).
  vec3 ro = vec3(0.0, 0.15, 6.5);
  vec3 target = vec3(0.0, 0.3, -2.0);
  vec3 fwd = normalize(target - ro);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 rd = normalize(uv.x * right + uv.y * up + 1.1 * fwd);

  vec2 tBox = intersectBox(ro, rd, BOX_MIN, BOX_MAX);
  bool canHitBox = tBox.y >= max(tBox.x, 0.0) && tBox.y > 0.0;
  bool shouldMarch = (uBoundingVolume < 0.5) || canHitBox;

  float tStart = (uBoundingVolume > 0.5) ? max(tBox.x, 0.0) : 0.0;
  float tEnd = (uBoundingVolume > 0.5) ? min(tBox.y, MAX_DIST) : MAX_DIST;

  float t = tStart;
  int steps = 0;
  bool hit = false;

  if (shouldMarch) {
    float prevD = 1.0e9;
    float prevStep = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
      if (t >= tEnd) break;
      steps++;

      vec3 p = ro + rd * t;
      float d = sdScene(p);
      float eps = (uDistScaledEps > 0.5) ? 0.001 * max(t, 1.0) : 0.001;
      if (d < eps) {
        hit = true;
        break;
      }

      float stepLen = d * uRelax;
      // Step-back heuristic (simplified Enhanced Sphere Tracing, Keinert et al.
      // 2014): an over-relaxed step is only safe while it stays inside the
      // sphere the PREVIOUS sample guaranteed empty. When it doesn't, fall
      // back to a conservative step instead of risking a skipped-over surface.
      if (uRelax > 1.01 && (d + prevD) < prevStep) {
        stepLen = max(prevStep - prevD, eps);
      }
      prevD = d;
      prevStep = stepLen;
      t += stepLen;
    }
  }

  vec3 col;
  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = sceneNormal(p);
    float diff = max(dot(n, normalize(vec3(0.5, 0.7, 0.3))), 0.0);
    vec3 base = mix(vec3(0.55, 0.5, 0.45), vec3(0.3, 0.55, 0.4), n.y * 0.5 + 0.5);
    float fog = exp(-t * 0.05);
    col = mix(vec3(0.6, 0.7, 0.85), base * (0.3 + 0.7 * diff), fog);
  } else {
    col = mix(vec3(0.6, 0.7, 0.85), vec3(0.15, 0.25, 0.45), clamp(rd.y * 0.6 + 0.2, 0.0, 1.0));
  }

  if (uHeatmap > 0.5) {
    float heat = float(steps) / float(MAX_STEPS);
    vec3 heatColor = mix(vec3(0.0, 0.3, 1.0), vec3(1.0, 0.15, 0.0), clamp(heat * 1.8, 0.0, 1.0));
    col = mix(col, heatColor, 0.75);
  }

  // Step count encoded in alpha (unused for blending, material stays opaque)
  // so a tiny offscreen readback can measure a real average — not a guess.
  gl_FragColor = vec4(col, float(steps) / float(MAX_STEPS));
}
