precision highp float;

varying vec3 vNormal;
varying vec3 vWorldPosition;

// F0/baseColor/envColor are vec3 so the SAME shader drives both scalar
// dielectric presets (r=g=b) and tinted metal presets (Schlick 1994, see theory).
uniform vec3 uF0;
uniform float uUseSchlick; // 1.0 = Schlick F(theta), 0.0 = constant F0 (demo toggle)
uniform vec3 uBaseColor;
uniform vec3 uEnvColor;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPosition);
  float cosTheta = clamp(dot(N, V), 0.0, 1.0);

  vec3 schlick = uF0 + (1.0 - uF0) * pow(1.0 - cosTheta, 5.0);
  vec3 F = mix(uF0, schlick, uUseSchlick);

  // Fixed key light, just enough shading so spheres read as 3D shapes —
  // the point of this lesson is F(theta), not full lighting.
  vec3 L = normalize(vec3(0.4, 0.8, 0.5));
  float diffuse = max(dot(N, L), 0.0);
  vec3 lit = uBaseColor * (0.35 + 0.65 * diffuse);

  vec3 color = mix(lit, uEnvColor, F);
  gl_FragColor = vec4(color, 1.0);
}
