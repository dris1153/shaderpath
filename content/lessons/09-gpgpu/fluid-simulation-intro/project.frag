// Projection: subtract the pressure gradient from velocity so the result is
// divergence-free (Helmholtz decomposition, u = w - grad(p)).
precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform vec2 uTexelSize;

void main() {
  float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity -= 0.5 * vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
