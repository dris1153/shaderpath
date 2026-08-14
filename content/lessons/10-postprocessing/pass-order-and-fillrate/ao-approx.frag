// Cheap stand-in for AO: darkens texels whose 4-neighbor average is
// brighter than the center (a crevice/edge cue), NOT real occlusion
// sampling — see the SSAO lesson for the real depth/normal kernel technique.
// Positioned right after RenderPass so it multiplies still-linear HDR light,
// never a tone-mapped or graded image (see the canonical-order section).
uniform sampler2D tDiffuse;
uniform vec2 uTexel;
uniform float uStrength;

varying vec2 vUv;

const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

void main() {
  vec3 center = texture2D(tDiffuse, vUv).rgb;

  vec3 neighborSum = vec3(0.0);
  neighborSum += texture2D(tDiffuse, vUv + uTexel * vec2(1.0, 0.0)).rgb;
  neighborSum += texture2D(tDiffuse, vUv - uTexel * vec2(1.0, 0.0)).rgb;
  neighborSum += texture2D(tDiffuse, vUv + uTexel * vec2(0.0, 1.0)).rgb;
  neighborSum += texture2D(tDiffuse, vUv - uTexel * vec2(0.0, 1.0)).rgb;

  float centerLuma = dot(center, LUMA);
  float neighborLuma = dot(neighborSum * 0.25, LUMA);
  float occlusion = clamp((neighborLuma - centerLuma) * uStrength, 0.0, 0.6);

  gl_FragColor = vec4(center * (1.0 - occlusion), 1.0);
}
