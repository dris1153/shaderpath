import type { PlaygroundPreset } from "./types";

// Camera rig + march loop shared by the 3D presets (inlined per preset so each
// one still runs standalone when pasted into the editor).
const CAMERA = `vec3 rayDirection(vec2 p, vec3 ro, vec3 ta, float zoom) {
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  return normalize(p.x * uu + p.y * vv + zoom * ww);
}
`;

const NORMAL = `vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}
`;

export const RAYMARCH_PRESETS: PlaygroundPreset[] = [
  {
    slug: "raymarch-sphere",
    title: { vi: "Raymarch quả cầu", en: "Raymarched Sphere" },
    source: `// @sceneIsFunction
float map(vec3 p) {
  float sphere = length(p) - 1.0;
  float ground = p.y + 1.0;
  return min(sphere, ground);
}

${NORMAL}
${CAMERA}
void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;

  float angle = uTime * 0.4;
  vec3 ro = vec3(sin(angle) * 4.0, 1.3, cos(angle) * 4.0);
  vec3 rd = rayDirection(p, ro, vec3(0.0), 1.6);

  // @sphereTracing
  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < 96; i++) {
    float d = map(ro + rd * t);
    if (d < 0.001) { hit = true; break; }
    t += d;
    if (t > 30.0) break;
  }

  vec3 color = vec3(0.05, 0.07, 0.12);
  if (hit) {
    vec3 pos = ro + rd * t;
    vec3 n = calcNormal(pos);
    vec3 lig = normalize(vec3(0.6, 0.8, 0.4));
    float dif = clamp(dot(n, lig), 0.0, 1.0);
    float sky = 0.5 + 0.5 * n.y;
    color = vec3(0.35, 0.55, 0.85) * dif + vec3(0.08, 0.1, 0.16) * sky;
  }
  color = mix(color, vec3(0.05, 0.07, 0.12), 1.0 - exp(-0.02 * t * t));
  fragColor = vec4(sqrt(color), 1.0);
}
`,
  },
  {
    slug: "raymarch-sculpture",
    title: { vi: "Điêu khắc smooth-min", en: "Smooth-Min Sculpture" },
    source: `float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdTorus(vec3 p, vec2 t) {
  return length(vec2(length(p.xz) - t.x, p.y)) - t.y;
}

float map(vec3 p) {
  float body = length(p) - 0.85;
  float head = length(p - vec3(0.0, 0.9 + sin(uTime) * 0.1, 0.0)) - 0.45;
  float collar = sdTorus(p - vec3(0.0, 0.35, 0.0), vec2(0.85, 0.12));
  float shape = smin(body, head, 0.35);       // @weldShapes
  shape = smin(shape, collar, 0.2);
  return min(shape, p.y + 1.2);
}

${NORMAL}
${CAMERA}
void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;

  float angle = uTime * 0.3;
  vec3 ro = vec3(sin(angle) * 3.6, 1.0, cos(angle) * 3.6);
  vec3 rd = rayDirection(p, ro, vec3(0.0, 0.1, 0.0), 1.7);

  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < 110; i++) {
    float d = map(ro + rd * t);
    if (d < 0.001) { hit = true; break; }
    t += d;
    if (t > 30.0) break;
  }

  vec3 color = vec3(0.04, 0.05, 0.09);
  if (hit) {
    vec3 pos = ro + rd * t;
    vec3 n = calcNormal(pos);
    vec3 lig = normalize(vec3(-0.4, 0.9, 0.5));
    float dif = clamp(dot(n, lig), 0.0, 1.0);
    float rim = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);
    color = vec3(0.9, 0.55, 0.35) * dif + vec3(0.2, 0.35, 0.6) * rim;
  }
  color = mix(color, vec3(0.04, 0.05, 0.09), 1.0 - exp(-0.015 * t * t));
  fragColor = vec4(sqrt(color), 1.0);
}
`,
  },
  {
    slug: "raymarch-repetition",
    title: { vi: "Lặp không gian vô hạn", en: "Infinite Domain Repetition" },
    source: `float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 p) {
  // @repeatSpace
  vec3 c = vec3(4.0, 0.0, 4.0);
  vec3 q = p;
  q.xz = p.xz - c.xz * round(p.xz / c.xz);

  float pillar = sdBox(q - vec3(0.0, -0.2, 0.0), vec3(0.45, 1.0, 0.45));
  return min(pillar, p.y + 1.2);
}

${NORMAL}
${CAMERA}
void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;

  vec3 ro = vec3(uTime * 0.8, 0.9, uTime * 0.5);
  vec3 rd = rayDirection(p, ro, ro + vec3(1.0, -0.15, 0.6), 1.5);

  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < 110; i++) {
    float d = map(ro + rd * t);
    if (d < 0.002) { hit = true; break; }
    t += d * 0.85;          // @cautiousStep
    if (t > 40.0) break;
  }

  vec3 color = vec3(0.06, 0.08, 0.13);
  if (hit) {
    vec3 pos = ro + rd * t;
    vec3 n = calcNormal(pos);
    vec3 lig = normalize(vec3(0.5, 0.85, -0.3));
    float dif = clamp(dot(n, lig), 0.0, 1.0);
    color = vec3(0.55, 0.65, 0.8) * (0.15 + 0.85 * dif);
  }
  color = mix(color, vec3(0.06, 0.08, 0.13), 1.0 - exp(-0.006 * t * t));
  fragColor = vec4(sqrt(color), 1.0);
}
`,
  },
];
