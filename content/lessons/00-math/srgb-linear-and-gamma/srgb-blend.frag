precision highp float;

varying vec2 vUv;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSwapHalves;

// Approximate sRGB <-> linear with pow(2.2). The exact piecewise curve is
// covered in the lesson text; this shorthand is what the demo visualizes.
vec3 srgbToLinear(vec3 c) {
  return pow(c, vec3(2.2));
}

vec3 linearToSrgb(vec3 c) {
  return pow(c, vec3(1.0 / 2.2));
}

void main() {
  float t = vUv.x;

  // WRONG: mix directly on the gamma-encoded sRGB values.
  vec3 srgbBlend = mix(uColorA, uColorB, t);

  // CORRECT: decode -> mix in linear -> encode back for display.
  vec3 linearBlend = linearToSrgb(
    mix(srgbToLinear(uColorA), srgbToLinear(uColorB), t)
  );

  // Top half shows the sRGB blend, bottom the linear blend — uSwapHalves flips them.
  float top = step(0.5, vUv.y);
  float srgbOnTop = 1.0 - uSwapHalves;
  float isSrgbHalf = 1.0 - abs(top - srgbOnTop);
  vec3 color = mix(linearBlend, srgbBlend, isSrgbHalf);

  // Thin divider so the two halves read as one side-by-side comparison.
  float divider = smoothstep(0.004, 0.0, abs(vUv.y - 0.5));
  color = mix(color, vec3(1.0), divider);

  gl_FragColor = vec4(color, 1.0);
}
