import type { PlaygroundPreset } from "./types";

// These four read uPrev, which is what makes the playground allocate a
// ping-pong pair for them. Every one seeds itself at uFrame == 0: a resize or
// a quality-tier change throws the buffers away, so a preset that only looked
// right after a long warm-up would spend most of its life looking broken.

export const FEEDBACK_PRESETS: PlaygroundPreset[] = [
  {
    slug: "reaction-diffusion",
    title: { vi: "Reaction-diffusion (Gray-Scott)", en: "Reaction-Diffusion (Gray-Scott)" },
    source: `float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// @rdChannels
vec2 lap(vec2 uv, vec2 texel) {
  vec2 sum = vec2(0.0);
  sum += texture(uPrev, uv + vec2(-1.0, 0.0) * texel).xy * 0.2;
  sum += texture(uPrev, uv + vec2( 1.0, 0.0) * texel).xy * 0.2;
  sum += texture(uPrev, uv + vec2( 0.0,-1.0) * texel).xy * 0.2;
  sum += texture(uPrev, uv + vec2( 0.0, 1.0) * texel).xy * 0.2;
  sum += texture(uPrev, uv + vec2(-1.0,-1.0) * texel).xy * 0.05;
  sum += texture(uPrev, uv + vec2( 1.0,-1.0) * texel).xy * 0.05;
  sum += texture(uPrev, uv + vec2(-1.0, 1.0) * texel).xy * 0.05;
  sum += texture(uPrev, uv + vec2( 1.0, 1.0) * texel).xy * 0.05;
  return sum - texture(uPrev, uv).xy;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  // @rdCoarse
  vec2 texel = 2.5 / uResolution;

  if (uFrame == 0) {
    // @rdSeedEverywhere
    float b = step(0.55, hash21(floor(gl_FragCoord.xy / 14.0)));
    fragColor = vec4(1.0, b, 0.0, 1.0);
    return;
  }

  vec2 ab = texture(uPrev, uv).xy;
  vec2 d = lap(uv, texel);
  float reaction = ab.x * ab.y * ab.y;
  float f = 0.037;
  float k = 0.06;
  // @rdEquations
  float a = ab.x + (0.21 * d.x - reaction + f * (1.0 - ab.x));
  float bb = ab.y + (0.105 * d.y + reaction - (k + f) * ab.y);

  // @rdMousePoke
  float poke = smoothstep(0.06, 0.0, distance(uv, uMouse));
  bb = clamp(bb + poke * 0.6, 0.0, 1.0);

  fragColor = vec4(clamp(a, 0.0, 1.0), bb, 0.0, 1.0);
}
`,
  },
  {
    slug: "game-of-life",
    title: { vi: "Game of Life", en: "Game of Life" },
    source: `float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

// @lifeCellGrid
const float CELL = 6.0;

// @lifeStateChannel
float cellAt(vec2 cell) {
  vec2 uv = (cell * CELL + CELL * 0.5) / uResolution;
  return step(0.5, texture(uPrev, uv).g);
}

void main() {
  vec2 cell = floor(gl_FragCoord.xy / CELL);

  if (uFrame == 0) {
    // @lifeSeedDensity
    fragColor = vec4(vec3(step(0.62, hash21(cell))), 1.0);
    return;
  }

  float n = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      if (x == 0 && y == 0) continue;
      n += cellAt(cell + vec2(float(x), float(y)));
    }
  }

  float alive = cellAt(cell);
  // @lifeRule
  float next = alive > 0.5
    ? ((n > 1.5 && n < 3.5) ? 1.0 : 0.0)
    : ((n > 2.5 && n < 3.5) ? 1.0 : 0.0);

  // @lifeReseed
  float reseed = step(0.998, hash21(cell + float(uFrame)));
  next = max(next, reseed);

  fragColor = vec4(mix(vec3(0.05, 0.07, 0.12), vec3(0.55, 0.95, 0.75), next), 1.0);
}
`,
  },
  {
    slug: "paint-trails",
    title: { vi: "Vệt sơn theo con trỏ", en: "Cursor Paint Trails" },
    source: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;

  if (uFrame == 0) {
    // @trailSeedRings
    float r = length((uv - 0.5) * vec2(aspect, 1.0));
    fragColor = vec4(vec3(0.5 + 0.5 * sin(r * 40.0)) * vec3(0.9, 0.4, 0.7), 1.0);
    return;
  }

  // @trailAdvect
  vec2 drift = vec2(sin(uTime * 0.4 + uv.y * 6.0), cos(uTime * 0.3 + uv.x * 6.0));
  vec3 prev = texture(uPrev, uv - drift * 0.0016).rgb;

  // @trailDecay
  prev *= 0.985;

  vec2 d = (uv - uMouse) * vec2(aspect, 1.0);
  float brush = smoothstep(0.045, 0.0, length(d));
  vec3 ink = 0.5 + 0.5 * cos(uTime + vec3(0.0, 2.0, 4.0));

  fragColor = vec4(prev + brush * ink * 0.35, 1.0);
}
`,
  },
  {
    slug: "ripple-tank",
    title: { vi: "Bể sóng nước", en: "Ripple Tank" },
    source: `float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 texel = 1.5 / uResolution;

  if (uFrame == 0) {
    // @waveSeedDrops
    float d = length((uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0));
    float h = smoothstep(0.08, 0.0, d) - smoothstep(0.05, 0.0, abs(d - 0.3));
    fragColor = vec4(h * 0.5 + 0.5, 0.5, 0.0, 1.0);
    return;
  }

  // @waveTwoTimeSteps
  float here = texture(uPrev, uv).r * 2.0 - 1.0;
  float before = texture(uPrev, uv).g * 2.0 - 1.0;

  float sum =
      texture(uPrev, uv + vec2( texel.x, 0.0)).r
    + texture(uPrev, uv + vec2(-texel.x, 0.0)).r
    + texture(uPrev, uv + vec2(0.0,  texel.y)).r
    + texture(uPrev, uv + vec2(0.0, -texel.y)).r;
  // @waveDecode
  sum = sum * 2.0 - 4.0;

  // @waveEquation
  float next = sum * 0.5 - before;
  // @waveDamping
  next *= 0.996;

  // @waveDrip
  float beat = step(0.985, hash21(vec2(floor(uTime * 1.5), 7.0)));
  vec2 spot = fract(vec2(hash21(vec2(floor(uTime * 1.5), 1.0)),
                         hash21(vec2(floor(uTime * 1.5), 2.0))));
  next += beat * smoothstep(0.03, 0.0, distance(uv, spot)) * 0.9;
  next += smoothstep(0.03, 0.0, distance(uv, uMouse)) * 0.5;

  next = clamp(next, -1.0, 1.0);
  float shade = 0.5 + 0.5 * next;
  fragColor = vec4(shade, here * 0.5 + 0.5, 0.0, 1.0);
}
`,
  },
];
