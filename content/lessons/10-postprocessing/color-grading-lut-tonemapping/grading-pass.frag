varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform sampler3D uLut;
uniform float uLutSize;
uniform float uIntensity;
uniform float uSplit;

void main() {
  vec4 base = texture2D(tDiffuse, vUv);

  // Half-texel inset: base.rgb=0 or 1 must land on the CENTER of the corner
  // cell, not its outer edge — same pixel-center reasoning as Track 0's
  // pixelToUV, just extended to three axes instead of two.
  float cell = 1.0 / uLutSize;
  vec3 uvw = base.rgb * (1.0 - cell) + cell * 0.5;
  vec3 graded = texture(uLut, uvw).rgb;

  vec3 result = mix(base.rgb, graded, uIntensity);

  if (uSplit > 0.5) {
    float right = step(0.5, vUv.x);
    result = mix(base.rgb, result, right);
    float seam = 1.0 - smoothstep(0.0, 0.0015, abs(vUv.x - 0.5));
    result = mix(result, vec3(1.0), seam);
  }

  gl_FragColor = vec4(result, base.a);
}
