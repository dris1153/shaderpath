// Additive gaussian blob at uPoint — reused for both velocity (uValue.xy =
// force) and dye (uValue.xyz = color) splats, driven by pointer drag.
precision highp float;

varying vec2 vUv;
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec3 uValue;
uniform float uRadius;

void main() {
  vec2 p = vUv - uPoint;
  float falloff = exp(-dot(p, p) / uRadius);
  vec3 base = texture2D(uTarget, vUv).xyz;
  gl_FragColor = vec4(base + uValue * falloff, 1.0);
}
