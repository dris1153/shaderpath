import type { PlaygroundPreset } from "./types";

// Showcase group: these are allowed to run long and comment lightly. They earn
// it by being the thing that makes someone stay in the playground rather than
// close the tab.

export const FRACTAL_PRESETS: PlaygroundPreset[] = [
  {
    slug: "mandelbrot-zoom",
    title: { vi: "Mandelbrot, phóng dần", en: "Mandelbrot, Zooming" },
    source: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 q = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

  // @mandelZoom
  float zoom = exp(-1.0 - mod(uTime * 0.18, 5.0));
  vec2 target = vec2(-0.743643887, 0.131825904);
  vec2 c = target + q * 3.0 * zoom;

  vec2 z = vec2(0.0);
  float i = 0.0;
  const float MAX = 220.0;
  for (float n = 0.0; n < MAX; n++) {
    // @mandelSquare
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if (dot(z, z) > 256.0) break;
    i = n;
  }

  if (i >= MAX - 1.0) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // @mandelSmooth
  float smoothed = i + 1.0 - log(log(length(z)) / log(2.0)) / log(2.0);
  // @mandelPalette
  float k = sqrt(smoothed) * 0.7;
  vec3 color = 0.5 + 0.5 * cos(k + vec3(4.1, 4.7, 5.6));
  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "julia-on-the-cursor",
    title: { vi: "Julia theo con trỏ", en: "Julia Set on the Cursor" },
    source: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 z = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * 3.0;

  // @juliaConstant
  vec2 c = vec2(-0.79, 0.15) + (uMouse - 0.5) * 0.45;

  float i = 0.0;
  const float MAX = 180.0;
  for (float n = 0.0; n < MAX; n++) {
    // @juliaIterate
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    if (dot(z, z) > 64.0) break;
    i = n;
  }

  // @juliaInside
  if (i >= MAX - 1.0) {
    fragColor = vec4(0.02, 0.02, 0.05, 1.0);
    return;
  }

  // @juliaSmooth
  float smoothed = i + 1.0 - log(log(length(z)) / log(2.0)) / log(2.0);
  vec3 color = 0.5 + 0.5 * cos(sqrt(smoothed) * 1.1 + vec3(0.4, 1.9, 3.4));
  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "mandelbulb",
    title: { vi: "Mandelbulb", en: "Mandelbulb" },
    source: `float scene(vec3 pos) {
  vec3 z = pos;
  float dr = 1.0;
  float r = 0.0;
  // @bulbPower
  float power = 8.0;

  for (int i = 0; i < 8; i++) {
    r = length(z);
    if (r > 2.0) break;

    // @bulbToPolar
    float theta = acos(z.z / r);
    float phi = atan(z.y, z.x);
    dr = pow(r, power - 1.0) * power * dr + 1.0;

    // @bulbRaisePower
    float zr = pow(r, power);
    theta *= power;
    phi *= power;

    z = zr * vec3(sin(theta) * cos(phi), sin(phi) * sin(theta), cos(theta));
    z += pos;
  }
  // @bulbDistanceEstimate
  return 0.5 * log(r) * r / dr;
}

vec3 normal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    scene(p + e.xyy) - scene(p - e.xyy),
    scene(p + e.yxy) - scene(p - e.yxy),
    scene(p + e.yyx) - scene(p - e.yyx)
  ));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 q = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);

  float a = uTime * 0.2;
  vec3 ro = vec3(sin(a) * 2.6, 0.6, cos(a) * 2.6);
  vec3 fwd = normalize(-ro);
  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  vec3 rd = normalize(fwd * 1.5 + right * q.x + cross(fwd, right) * q.y);

  float t = 0.0;
  float glow = 0.0;
  float hit = 0.0;
  for (int i = 0; i < 80; i++) {
    vec3 p = ro + rd * t;
    float d = scene(p);
    // @bulbGlow
    glow += 0.012 / (1.0 + d * 40.0);
    if (d < 0.0012) { hit = 1.0; break; }
    t += d * 0.9;
    if (t > 6.0) break;
  }

  vec3 color = vec3(0.02, 0.03, 0.05) + glow * vec3(0.35, 0.18, 0.5);
  if (hit > 0.5) {
    vec3 p = ro + rd * t;
    vec3 n = normal(p);
    float diff = max(dot(n, normalize(vec3(0.5, 0.8, 0.3))), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    color = (0.2 + 0.8 * diff) * vec3(0.85, 0.6, 0.35) + rim * vec3(0.3, 0.4, 0.9);
  }
  fragColor = vec4(color, 1.0);
}
`,
  },
];
