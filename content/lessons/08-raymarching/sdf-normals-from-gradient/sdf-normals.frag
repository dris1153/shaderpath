precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uEpsilon;
uniform float uTechnique; // 0 = central difference, 1 = tetrahedron
uniform float uShading;   // 0 = normal-as-color, 1 = Lambert, 2 = full 3-light rig

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

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

// The compound shape this lesson raymarches: sphere + box welded into a body,
// a torus fused on top. The box's sharp corners are what make epsilon rounding visible.
float map(vec3 p) {
  float sphere = sdSphere(p - vec3(-0.5, 0.0, 0.0), 0.55);
  float box = sdBox(p - vec3(0.45, -0.05, 0.0), vec3(0.4));
  float body = opSmoothUnion(sphere, box, 0.35);
  float torus = sdTorus(p - vec3(-0.05, 0.65, 0.0), vec2(0.5, 0.14));
  return opSmoothUnion(body, torus, 0.25);
}

// 6 taps: forward/backward difference sampled independently on each axis.
vec3 normalCentralDiff(vec3 p, float eps) {
  vec2 e = vec2(eps, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

// 4 taps: Quilez's tetrahedron trick (iquilezles.org/articles/normalsSDF) —
// same order of accuracy as central differences, 33% fewer map() calls.
vec3 normalTetrahedron(vec3 p, float eps) {
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * eps) +
    k.yyx * map(p + k.yyx * eps) +
    k.yxy * map(p + k.yxy * eps) +
    k.xxx * map(p + k.xxx * eps)
  );
}

vec3 calcNormal(vec3 p, float eps) {
  return uTechnique > 0.5 ? normalTetrahedron(p, eps) : normalCentralDiff(p, eps);
}

// Normals are only ever evaluated once per pixel below, at the hit point —
// never inside this loop. That's the whole "cost accounting" point of the lesson.
float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 100; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0006) return t;
    t += d;
    if (t > 20.0) break;
  }
  return -1.0;
}

vec3 shade(vec3 n, vec3 rd) {
  if (uShading < 0.5) {
    return n * 0.5 + 0.5; // raw gradient direction remapped to a color, no lighting math
  }

  vec3 albedo = vec3(0.82, 0.44, 0.22);
  vec3 lightDir = normalize(vec3(0.55, 0.65, 0.4)); // key light / "sun"
  float diff = max(dot(n, lightDir), 0.0);

  if (uShading < 1.5) {
    return albedo * (0.06 + diff); // flat Lambert, a thin ambient floor so shadow side isn't pure black
  }

  // Full raymarch rig: Lambert key + Blinn-Phong specular + sky fill (normal.y) + ground bounce
  vec3 viewDir = -rd;
  vec3 halfVec = normalize(lightDir + viewDir);
  float spec = pow(max(dot(n, halfVec), 0.0), 48.0);

  float sky = clamp(0.5 + 0.5 * n.y, 0.0, 1.0);
  float bounce = clamp(0.5 - 0.5 * n.y, 0.0, 1.0);

  vec3 color = albedo * diff * vec3(1.0, 0.94, 0.85);
  color += albedo * sky * vec3(0.2, 0.3, 0.45);
  color += albedo * bounce * vec3(0.18, 0.14, 0.1);
  color += spec * vec3(1.0, 0.98, 0.9);
  return color;
}

void main() {
  vec3 ro = vec3(2.6 * sin(uTime * 0.25), 1.3, 2.6 * cos(uTime * 0.25));
  vec3 ta = vec3(0.0, 0.2, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);

  vec2 p = (vUv - 0.5) * 2.0;
  vec3 rd = normalize(p.x * uu + p.y * vv + 1.8 * ww);

  vec3 col = vec3(0.05, 0.06, 0.09);
  float t = raymarch(ro, rd);
  if (t > 0.0) {
    vec3 hit = ro + rd * t;
    vec3 n = calcNormal(hit, uEpsilon);
    col = shade(n, rd);
  }

  gl_FragColor = vec4(col, 1.0);
}
