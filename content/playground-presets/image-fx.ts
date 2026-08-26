import type { PlaygroundPreset } from "./types";

// Post-processing without a texture to post-process. Each preset builds its own
// source image in a few lines and then abuses it, which is what keeps this kind
// of effect inside a playground whose only inputs are uTime, uResolution and
// uMouse.

export const IMAGE_FX_PRESETS: PlaygroundPreset[] = [
  {
    slug: "crt-scanlines",
    title: { vi: "Màn hình CRT", en: "CRT Screen" },
    source: `vec3 scene(vec2 p) {
  // @crtBars
  float bars = floor(p.x * 7.0);
  vec3 color = 0.5 + 0.5 * cos(bars + vec3(0.0, 2.0, 4.0));
  return color * (0.35 + 0.65 * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // @crtCurve
  vec2 c = uv * 2.0 - 1.0;
  c *= 1.0 + 0.08 * dot(c, c);
  vec2 warped = c * 0.5 + 0.5;

  // @crtOffscreen
  if (warped.x < 0.0 || warped.x > 1.0 || warped.y < 0.0 || warped.y > 1.0) {
    fragColor = vec4(0.02, 0.02, 0.03, 1.0);
    return;
  }

  vec3 color = scene(warped);

  // @crtScanline
  color *= 0.75 + 0.25 * sin(gl_FragCoord.y * 1.6 + uTime * 8.0);

  // @crtMask
  float phase = mod(gl_FragCoord.x, 3.0);
  color *= vec3(step(phase, 1.0), step(1.0, phase) * step(phase, 2.0), step(2.0, phase)) * 2.0 + 0.35;

  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "chromatic-aberration",
    title: { vi: "Quang sai màu", en: "Chromatic Aberration" },
    source: `float scene(vec2 p) {
  vec2 q = (p - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float ring = smoothstep(0.02, 0.0, abs(length(q) - 0.28));
  float bar = smoothstep(0.01, 0.0, abs(q.y)) * step(abs(q.x), 0.45);
  return max(ring, bar);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // @caRadial
  vec2 dir = uv - 0.5;
  float amount = 0.09 * length(dir) * (0.4 + uMouse.x);

  // @caThreeSamples
  float r = scene(uv + dir * amount);
  float g = scene(uv);
  float b = scene(uv - dir * amount);

  fragColor = vec4(vec3(r, g, b), 1.0);
}
`,
  },
  {
    slug: "vignette-and-grain",
    title: { vi: "Vignette & hạt phim", en: "Vignette and Film Grain" },
    source: `float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 color = 0.5 + 0.5 * cos(uv.xyx * 3.0 + vec3(0.0, 2.0, 4.0));

  // @vignetteFalloff
  vec2 q = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  color *= smoothstep(0.85, 0.25, length(q));

  // @grainAnimated
  float grain = hash21(gl_FragCoord.xy + floor(uTime * 24.0));
  color += (grain - 0.5) * 0.12;

  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "halftone",
    title: { vi: "Halftone", en: "Halftone" },
    source: `float scene(vec2 p) {
  vec2 q = (p - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float ball = smoothstep(0.32, 0.0, length(q - vec2(0.0, 0.05)));
  return clamp(ball * (0.4 + 0.6 * (1.0 - p.y)) + 0.12, 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float shade = scene(uv);

  // @halftoneRotate
  float a = radians(30.0);
  vec2 rotated = mat2(cos(a), -sin(a), sin(a), cos(a)) * gl_FragCoord.xy;

  // @halftoneDotSize
  vec2 cell = fract(rotated / 8.0) - 0.5;
  float dot_ = smoothstep(0.5 * shade, 0.5 * shade - 0.06, length(cell));

  fragColor = vec4(vec3(1.0 - dot_), 1.0);
}
`,
  },
];
