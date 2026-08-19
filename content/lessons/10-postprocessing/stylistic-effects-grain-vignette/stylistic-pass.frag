precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uTime;

uniform float uGrainAmount;
uniform float uAnimateGrain;
uniform float uVignetteDarkness;
uniform float uVignetteRadius;
uniform float uAberrationPx;

varying vec2 vUv;

// "Hash without sine" (Dave Hoskins) — the same polynomial hash covered in
// Track 7 (hash-functions-on-gpu): no sin(), so no mediump range-reduction
// banding on mobile, and cheap enough to run once per pixel every frame.
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// NOT named `luminance`: three injects its own `luminance()` into every
// ShaderMaterial's fragment prefix, and redefining it is a compile error that
// takes the whole pass down. Kept local rather than calling three's so this
// shader still works when pasted into a RawShaderMaterial or another engine.
float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

void main() {
  vec2 p = vUv - 0.5;
  float aspect = uResolution.x / uResolution.y;
  vec2 pAspect = vec2(p.x * aspect, p.y); // keeps vignette/CA circular instead of squashed on wide/tall canvases
  float dist = length(pAspect);
  vec2 dir = dist > 1e-5 ? pAspect / dist : vec2(0.0);

  // Chromatic aberration: R and B sample the SAME source at opposite radial
  // offsets, magnitude growing with distance from center — dispersion is
  // near-zero through the lens center, worst at the edges.
  vec2 offset = dir * (uAberrationPx / uResolution.x) * dist;
  float r = texture2D(tDiffuse, vUv + offset).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv - offset).b;
  vec3 color = vec3(r, g, b);

  // Film grain: hashed by uv AND time so the pattern never sits still (a
  // static hash reads as a dirty lens sticker, not film grain). Monochrome
  // by design — the same noise value hits all 3 channels, matching how
  // real film grain is a density fluctuation, not independent RGB noise.
  // Strength fades toward the highlights: grain lives in the shadows.
  float grainTime = uAnimateGrain > 0.5 ? uTime * 91.13 : 0.0;
  float n = hash(vUv * uResolution + grainTime) * 2.0 - 1.0;
  float grainFalloff = 1.0 - smoothstep(0.0, 0.6, luma(color));
  color += n * uGrainAmount * grainFalloff;

  // Vignette: smoothstep (not a hard cutoff or linear ramp) so the falloff
  // has no visible ring — darkness grows from uVignetteRadius out to the
  // aspect-corrected corner.
  float vig = 1.0 - uVignetteDarkness * smoothstep(uVignetteRadius, 1.0, dist);
  color *= vig;

  gl_FragColor = vec4(color, 1.0);
}
