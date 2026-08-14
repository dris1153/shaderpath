precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

// Custom uniforms only — cameraPosition below is Three's built-in,
// re-declaring it here would be a redefinition compile error (see theory).
uniform float uTime;
uniform sampler2D uNoiseMap;
uniform float uRim;
uniform float uPulse;
uniform float uTex;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);

  // Source 1: rim lighting driven by the built-in cameraPosition uniform
  float rim = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5) * uRim;

  // Source 2: a custom uTime uniform, mutated in JS every frame
  float pulse = (0.5 + 0.5 * sin(uTime * 2.0)) * uPulse;

  // Source 3: a custom texture uniform (procedural DataTexture)
  vec3 texColor = texture2D(uNoiseMap, vUv * 3.0).rgb * uTex;

  vec3 color = vec3(0.05, 0.07, 0.12);
  color += texColor * 0.6;
  color += vec3(0.3, 0.6, 1.0) * rim;
  color += vec3(1.0, 0.55, 0.2) * pulse * 0.35;

  gl_FragColor = vec4(color, 1.0);
}
