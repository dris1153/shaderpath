import type { PlaygroundPreset } from "./types";

// Every preset here shows the same fact from a different side: the number in a
// file is not the amount of light. They are meant to be read, so each one
// stays short enough to hold in your head at once.

export const COLOR_PRESETS: PlaygroundPreset[] = [
  {
    slug: "srgb-vs-linear-mix",
    title: { vi: "Trộn sRGB vs linear", en: "sRGB vs Linear Mixing" },
    source: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 a = vec3(1.0, 0.0, 0.0);
  vec3 b = vec3(0.0, 1.0, 0.0);

  // @srgbNaive
  vec3 naive = mix(a, b, uv.x);

  // @srgbCorrect
  vec3 correct = pow(
    mix(pow(a, vec3(2.2)), pow(b, vec3(2.2)), uv.x),
    vec3(1.0 / 2.2)
  );

  // @srgbSplit
  vec3 color = uv.y > 0.5 ? naive : correct;
  color = mix(color, vec3(1.0), 1.0 - smoothstep(0.0, 0.004, abs(uv.y - 0.5)));
  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "tone-map-curves",
    title: { vi: "Ba cách nén vùng sáng", en: "Three Ways to Compress Highlights" },
    source: `float aces(float x) {
  // @acesFit
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

float plot(float y, float v) {
  return 1.0 - smoothstep(0.0, 0.014, abs(y - v));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // @toneAxes
  float hdr = uv.x * 4.0;
  float y = (uv.y - 0.08) / 0.84;

  // @toneClip
  float clipped = clamp(hdr, 0.0, 1.0);
  // @toneReinhard
  float reinhard = hdr / (1.0 + hdr);

  vec3 color = vec3(0.05, 0.06, 0.09);
  // @toneOneLine
  color += vec3(0.18) * (1.0 - smoothstep(0.0, 0.004, abs(y - 1.0)));
  color += vec3(0.95, 0.95, 0.95) * plot(y, clipped);
  color += vec3(0.95, 0.5, 0.25) * plot(y, reinhard);
  color += vec3(0.35, 0.8, 0.95) * plot(y, aces(hdr));

  fragColor = vec4(color, 1.0);
}
`,
  },
  {
    slug: "bayer-dither",
    title: { vi: "Bayer dithering", en: "Bayer Dithering" },
    source: `// @bayerMatrix
const float BAYER[16] = float[16](
   0.0,  8.0,  2.0, 10.0,
  12.0,  4.0, 14.0,  6.0,
   3.0, 11.0,  1.0,  9.0,
  15.0,  7.0, 13.0,  5.0
);

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float shade = uv.x;

  // @bayerLevels
  float levels = 4.0;

  // @bayerThreshold
  ivec2 cell = ivec2(mod(gl_FragCoord.xy, 4.0));
  float threshold = BAYER[cell.y * 4 + cell.x] / 16.0;

  float plain = floor(shade * levels) / (levels - 1.0);
  float dithered = floor(shade * levels + threshold) / (levels - 1.0);

  float out_ = uv.y > 0.5 ? plain : dithered;
  fragColor = vec4(vec3(clamp(out_, 0.0, 1.0)), 1.0);
}
`,
  },
  {
    slug: "banding-and-levels",
    title: { vi: "Banding & số mức", en: "Banding and Bit Depth" },
    source: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // @bandingMouse
  float levels = pow(2.0, floor(mix(1.0, 6.0, uMouse.x)));

  // @bandingRamp
  vec3 ramp = 0.5 + 0.5 * cos(uv.x * 3.0 + vec3(0.0, 1.6, 3.2));

  // @bandingQuantise
  vec3 stepped = floor(ramp * levels) / levels;

  vec3 color = uv.y > 0.5 ? stepped : ramp;
  color = mix(color, vec3(1.0), 1.0 - smoothstep(0.0, 0.003, abs(uv.y - 0.5)));
  fragColor = vec4(color, 1.0);
}
`,
  },
];
