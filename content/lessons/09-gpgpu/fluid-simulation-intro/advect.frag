// Semi-Lagrangian advection (Stam 1999): trace backward along uVelocity to
// find where this texel's quantity came from, sample it there. Unconditionally
// stable for any uDt, at the cost of numerical diffusion — see theory.
precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform float uDt;
uniform float uDissipation;

void main() {
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  vec2 coord = vUv - uDt * velocity;
  vec3 result = texture2D(uSource, coord).xyz;
  gl_FragColor = vec4(result * uDissipation, 1.0);
}
