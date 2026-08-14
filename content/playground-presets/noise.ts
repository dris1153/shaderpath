import type { PlaygroundPreset } from "./types";

// Shared GLSL text: each preset must stand alone in the editor, so the helper
// source is inlined per preset rather than imported at runtime.
const VALUE_NOISE = `float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);   // @fadeCurve
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
`;

const FBM = `float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * valueNoise(p);
    p *= 2.0;      // lacunarity
    amp *= 0.5;    // gain
  }
  return sum;
}
`;

export const NOISE_PRESETS: PlaygroundPreset[] = [
  {
    slug: "value-noise-fbm",
    title: { vi: "Value noise → FBM", en: "Value Noise → FBM" },
    source: `${VALUE_NOISE}
${FBM}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.x *= uResolution.x / uResolution.y;

  float n = fbm(uv * 4.0 + vec2(uTime * 0.15, 0.0));
  vec3 color = mix(vec3(0.06, 0.09, 0.16), vec3(0.85, 0.9, 1.0), n);
  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "voronoi-cells",
    title: { vi: "Voronoi & viền tế bào", en: "Voronoi & Cell Borders" },
    source: `vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.x *= uResolution.x / uResolution.y;

  vec2 grid = uv * 6.0;
  vec2 cell = floor(grid);
  vec2 local = fract(grid);

  // @scanNeighbours
  float f1 = 8.0;
  float f2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 point = hash22(cell + offset);
      point = 0.5 + 0.5 * sin(uTime * 0.6 + 6.28318 * point);
      float d = length(offset + point - local);
      if (d < f1) {
        f2 = f1;
        f1 = d;
      } else if (d < f2) {
        f2 = d;
      }
    }
  }

  float border = smoothstep(0.0, 0.08, f2 - f1);   // @f2f1Border
  vec3 color = mix(vec3(1.0), vec3(0.15, 0.45, 0.75), border);
  fragColor = vec4(color * (0.35 + 0.65 * f1), 1.0);
}
`,
  },
  {
    slug: "domain-warp",
    title: { vi: "Domain warping", en: "Domain Warping" },
    source: `${VALUE_NOISE}
${FBM}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.x *= uResolution.x / uResolution.y;
  vec2 p = uv * 3.0;

  // @quilezWarp
  vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + uTime * 0.08),
                fbm(p + 4.0 * q + vec2(8.3, 2.8)));
  float f = fbm(p + 4.0 * r);

  vec3 color = mix(vec3(0.08, 0.12, 0.28), vec3(0.95, 0.75, 0.4), f);
  color = mix(color, vec3(0.2, 0.6, 0.7), clamp(length(q) * 0.6, 0.0, 1.0));
  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "curl-flow",
    title: { vi: "Curl noise & dòng chảy", en: "Curl Noise Flow" },
    source: `${VALUE_NOISE}
${FBM}
// @curlDivFree
vec2 curl(vec2 p) {
  float e = 0.01;
  float dx = fbm(p + vec2(e, 0.0)) - fbm(p - vec2(e, 0.0));
  float dy = fbm(p + vec2(0.0, e)) - fbm(p - vec2(0.0, e));
  return vec2(dy, -dx) / (2.0 * e);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.x *= uResolution.x / uResolution.y;

  vec2 p = uv * 3.0;
  float acc = 0.0;
  for (int i = 0; i < 12; i++) {
    p -= curl(p) * 0.004;                 // @walkUpstream
    acc += 0.5 + 0.5 * sin(p.x * 12.0 + uTime);
  }
  acc /= 12.0;

  vec3 color = mix(vec3(0.04, 0.07, 0.14), vec3(0.4, 0.85, 0.95), acc);
  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "plasma-classic",
    title: { vi: "Plasma cổ điển", en: "Classic Plasma" },
    source: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.x *= uResolution.x / uResolution.y;
  float t = uTime * 0.7;

  // @plasmaSum
  float v = sin(uv.x * 10.0 + t);
  v += sin((uv.y * 10.0 + t) * 0.7);
  v += sin((uv.x * 8.0 + uv.y * 8.0 + t) * 0.5);
  vec2 c = uv * 6.0 + vec2(sin(t * 0.4), cos(t * 0.3)) * 2.0;
  v += sin(length(c) * 2.0 + t);
  v *= 0.25;

  vec3 color = 0.5 + 0.5 * cos(6.28318 * (v + vec3(0.0, 0.33, 0.67)));
  fragColor = vec4(color, 1.0);
}
`,
  },
];
