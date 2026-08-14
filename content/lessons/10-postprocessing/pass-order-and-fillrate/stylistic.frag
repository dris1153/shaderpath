// Vignette + film grain merged into ONE pass — the "merge single-input
// effects" optimization this lesson teaches, applied to itself. Runs last:
// both simulate what happens to light AFTER it forms an image (lens falloff,
// film grain), matching the canonical order's final stylistic stage.
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uVignette;
uniform float uGrain;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec3 color = texture2D(tDiffuse, vUv).rgb;

  vec2 centered = vUv - 0.5;
  float vignette = 1.0 - dot(centered, centered) * uVignette;
  color *= clamp(vignette, 0.0, 1.0);

  float noise = hash(vUv * 3200.0 + uTime) - 0.5;
  color += noise * uGrain;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
