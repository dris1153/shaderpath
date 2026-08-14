varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uStrength;
uniform float uScale;
uniform vec2 uResolution;

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;

  // Two decorrelated sine waves (different axis, different phase/frequency)
  // read as heat haze instead of one obviously-repeating ripple.
  float wave1 = sin(uv.y * uScale * aspect + uTime);
  float wave2 = sin(uv.x * uScale + uTime * 1.3 + 1.7);

  uv.x += wave1 * uStrength * 0.03;
  uv.y += wave2 * uStrength * 0.015;

  // Clamp instead of wrapping — sampling past the edge would smear in the
  // opposite side of the render, an easy artifact to miss at low uStrength.
  uv = clamp(uv, vec2(0.001), vec2(0.999));
  gl_FragColor = texture2D(tDiffuse, uv);
}
