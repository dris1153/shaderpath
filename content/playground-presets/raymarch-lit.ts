import type { PlaygroundPreset } from "./types";

// The lit half of the raymarching group, split from raymarch.ts only to keep
// both files readable — index.ts concatenates them into one group. Each builds
// on the one before: normals, then shadows and AO on top, then fog, then a
// medium with no surface at all.
//
// Showcase budget: longer and more lightly commented than the teaching groups.
// The camera helper repeats in each because a preset must stand alone in the
// editor, exactly as the noise helpers do.

export const RAYMARCH_LIT_PRESETS: PlaygroundPreset[] = [
  {
    slug: "raymarch-lighting",
    title: { vi: "Đèn từ normal của SDF", en: "Lighting from SDF Normals" },
    source: `float scene(vec3 p) {
  float ball = length(p - vec3(0.0, 0.2, 0.0)) - 1.0;
  return min(ball, p.y + 1.0);
}

// @sdfNormalGradient
vec3 normal(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    scene(p + e.xyy) - scene(p - e.xyy),
    scene(p + e.yxy) - scene(p - e.yxy),
    scene(p + e.yyx) - scene(p - e.yyx)
  ));
}

vec3 rayDir(vec2 uv, vec3 ro, float zoom) {
  vec2 q = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  vec3 fwd = normalize(-ro);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  return normalize(fwd * zoom + right * q.x + cross(fwd, right) * q.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float a = uTime * 0.3;
  vec3 ro = vec3(sin(a) * 4.0, 1.4, cos(a) * 4.0);
  vec3 rd = rayDir(uv, ro, 1.5);

  float t = 0.0;
  float hit = 0.0;
  for (int i = 0; i < 90; i++) {
    float d = scene(ro + rd * t);
    if (d < 0.001) { hit = 1.0; break; }
    t += d;
    if (t > 30.0) break;
  }

  vec3 color = vec3(0.05, 0.07, 0.11);
  if (hit > 0.5) {
    vec3 p = ro + rd * t;
    vec3 n = normal(p);
    vec3 l = normalize(vec3(0.7, 0.9, 0.4));
    // @lambertTerm
    float diff = max(dot(n, l), 0.0);
    // @blinnPhong
    float spec = pow(max(dot(n, normalize(l - rd)), 0.0), 48.0);
    color = vec3(0.5, 0.6, 0.75) * (0.12 + 0.88 * diff) + spec * 0.6;
  }
  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "raymarch-shadows-ao",
    title: { vi: "Bóng mềm & AO", en: "Soft Shadows and Ambient Occlusion" },
    source: `float scene(vec3 p) {
  float ball = length(p - vec3(0.0, 0.3, 0.0)) - 0.9;
  float pillar = max(length(vec2(p.x - 2.1, p.z + 0.6)) - 0.3, -p.y - 2.4);
  return min(min(ball, pillar), p.y + 1.0);
}

vec3 normal(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    scene(p + e.xyy) - scene(p - e.xyy),
    scene(p + e.yxy) - scene(p - e.yxy),
    scene(p + e.yyx) - scene(p - e.yyx)
  ));
}

// @softShadowRatio
float softShadow(vec3 ro, vec3 rd, float k) {
  float res = 1.0;
  float t = 0.05;
  for (int i = 0; i < 48; i++) {
    float h = scene(ro + rd * t);
    if (h < 0.001) return 0.0;
    res = min(res, k * h / t);
    t += clamp(h, 0.02, 0.4);
    if (t > 12.0) break;
  }
  return res;
}

// @aoSampleAlong
float ao(vec3 p, vec3 n) {
  float sum = 0.0;
  for (int i = 1; i <= 5; i++) {
    float d = 0.06 * float(i);
    sum += (d - scene(p + n * d)) / d;
  }
  return clamp(1.0 - sum * 0.18, 0.0, 1.0);
}

vec3 rayDir(vec2 uv, vec3 ro, float zoom) {
  vec2 q = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  vec3 fwd = normalize(-ro);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  return normalize(fwd * zoom + right * q.x + cross(fwd, right) * q.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float a = uTime * 0.25;
  vec3 ro = vec3(sin(a) * 7.0, 2.6, cos(a) * 7.0);
  vec3 rd = rayDir(uv, ro, 1.1);

  float t = 0.0;
  float hit = 0.0;
  for (int i = 0; i < 100; i++) {
    float d = scene(ro + rd * t);
    if (d < 0.001) { hit = 1.0; break; }
    t += d;
    if (t > 40.0) break;
  }

  vec3 color = vec3(0.06, 0.08, 0.12);
  if (hit > 0.5) {
    vec3 p = ro + rd * t;
    vec3 n = normal(p);
    vec3 l = normalize(vec3(0.8, 0.7, 0.3));
    // @shadowSharpness
    float k = mix(4.0, 48.0, uMouse.x);
    float sh = softShadow(p + n * 0.01, l, k);
    color = vec3(0.55, 0.6, 0.7) * max(dot(n, l), 0.0) * sh;
    color += vec3(0.1, 0.13, 0.2) * ao(p, n);
  }
  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "atmospheric-fog",
    title: { vi: "Sương theo độ cao", en: "Height Fog" },
    source: `float scene(vec3 p) {
  float ground = p.y + 1.0 + 0.5 * sin(p.x * 0.5) * sin(p.z * 0.5);
  float spire = length(vec2(p.x, p.z)) - 0.4 + p.y * 0.12;
  return min(ground, spire);
}

vec3 normal(vec3 p) {
  vec2 e = vec2(0.004, 0.0);
  return normalize(vec3(
    scene(p + e.xyy) - scene(p - e.xyy),
    scene(p + e.yxy) - scene(p - e.yxy),
    scene(p + e.yyx) - scene(p - e.yyx)
  ));
}

vec3 rayDir(vec2 uv, vec3 ro, float zoom) {
  vec2 q = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  vec3 fwd = normalize(vec3(0.0, 0.3, 0.0) - ro);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  return normalize(fwd * zoom + right * q.x + cross(fwd, right) * q.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float a = uTime * 0.15;
  vec3 ro = vec3(sin(a) * 7.0, 1.6, cos(a) * 7.0);
  vec3 rd = rayDir(uv, ro, 1.4);

  float t = 0.0;
  float hit = 0.0;
  for (int i = 0; i < 110; i++) {
    float d = scene(ro + rd * t);
    if (d < 0.004) { hit = 1.0; break; }
    t += d * 0.85;
    if (t > 45.0) break;
  }

  vec3 sky = mix(vec3(0.86, 0.8, 0.72), vec3(0.45, 0.55, 0.72), clamp(rd.y * 2.0, 0.0, 1.0));
  vec3 color = sky;
  if (hit > 0.5) {
    vec3 p = ro + rd * t;
    vec3 n = normal(p);
    color = vec3(0.35, 0.4, 0.45) * (0.2 + 0.8 * max(dot(n, normalize(vec3(0.6, 0.7, 0.2))), 0.0));

    // @fogHeightFalloff
    float density = mix(0.05, 0.5, uMouse.x) * exp(-max(p.y + 1.0, 0.0) * 1.4);
    // @fogBeerLambert
    float f = 1.0 - exp(-density * t);
    color = mix(color, sky, clamp(f, 0.0, 1.0));
  }
  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "volumetric-clouds",
    title: { vi: "Mây thể tích", en: "Volumetric Clouds" },
    source: `float hash31(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

// @cloudDensityFbm
float density(vec3 p) {
  p *= 0.55;
  p.x += uTime * 0.09;
  float d = 0.5 * noise3(p) + 0.25 * noise3(p * 2.03) + 0.125 * noise3(p * 4.01);
  float slab = smoothstep(0.9, 0.1, abs(p.y - 0.35));
  return clamp((d - 0.34) * 4.5, 0.0, 1.0) * slab;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 q = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

  vec3 ro = vec3(0.0, -0.9, -4.0);
  vec3 rd = normalize(vec3(q, 1.1));

  vec3 sun = normalize(vec3(0.7, 0.5, -0.3));
  vec3 sky = mix(vec3(0.35, 0.5, 0.75), vec3(0.85, 0.85, 0.9), uv.y);
  sky += pow(max(dot(rd, sun), 0.0), 24.0) * vec3(0.6, 0.45, 0.25);

  vec3 color = sky;
  float transmittance = 1.0;

  // @cloudMarchFixedStep
  for (int i = 0; i < 48; i++) {
    vec3 p = ro + rd * (1.0 + float(i) * 0.19);
    float d = density(p);
    if (d > 0.001) {
      // @cloudLightSample
      float lit = 1.0 - density(p + sun * 0.35) * 0.9;
      vec3 shade = mix(vec3(0.16, 0.19, 0.28), vec3(1.0, 0.96, 0.9), lit * lit);
      float alpha = d * 0.6;
      color = mix(color, shade, alpha * transmittance);
      transmittance *= 1.0 - alpha;
      if (transmittance < 0.02) break;
    }
  }
  fragColor = vec4(color, 1.0);
}
`,
  },
];
