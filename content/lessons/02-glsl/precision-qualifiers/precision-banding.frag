precision highp float;

varying vec2 vUv;
uniform float uLevels;
uniform float uTime;

// Real precision qualifiers on a desktop GPU almost always resolve to full
// 32-bit float regardless of what's declared, so this demo fakes the visual
// EFFECT of a low-mantissa mediump with explicit floor() quantization
// instead (labeled as a simulation/estimate in the theory).
vec3 rampColor(float v) {
  return mix(vec3(0.16, 0.55, 0.66), vec3(0.96, 0.64, 0.16), v);
}

void main() {
  float v = fract(vUv.y * 2.0 - uTime * 0.05);

  vec3 color;
  if (vUv.x < 0.5) {
    float quantized = floor(v * uLevels) / uLevels;
    color = rampColor(quantized);
  } else {
    color = rampColor(v);
  }

  // Divider line so the left (simulated) / right (full precision) split is unambiguous
  float divider = smoothstep(0.004, 0.0, abs(vUv.x - 0.5));
  color = mix(color, vec3(1.0), divider);

  gl_FragColor = vec4(color, 1.0);
}
