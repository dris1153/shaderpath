// Simple lift/contrast/tint grade, standing in for a full 3D LUT (see the
// color-grading-lut-tonemapping lesson). Runs AFTER OutputPass: a grade
// tuned by eye against a display-referred image expects [0,1] input.
uniform sampler2D tDiffuse;
uniform float uContrast;
uniform vec3 uTint;

varying vec2 vUv;

void main() {
  vec3 color = texture2D(tDiffuse, vUv).rgb;
  color = (color - 0.5) * uContrast + 0.5;
  color *= uTint;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
