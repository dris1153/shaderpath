// Central-difference divergence of uVelocity, grid-unit convention (h=1,
// GPU Gems ch.38) — no division by texelSize, kept consistent with
// pressure.frag and project.frag which use the same convention.
precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;

void main() {
  float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
  float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
  float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
  float divergence = 0.5 * ((R - L) + (T - B));
  gl_FragColor = vec4(divergence, 0.0, 0.0, 1.0);
}
