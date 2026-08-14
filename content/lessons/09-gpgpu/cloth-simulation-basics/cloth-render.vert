uniform sampler2D texturePosition;
uniform vec2 uTexel;

varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 pos = texture2D(texturePosition, uv).xyz;

  // Same finite-difference normal trick as the compute shader — the
  // visible mesh's shading uses the just-simulated shape, not a normal
  // baked at rest.
  vec3 right = texture2D(texturePosition, uv + vec2(uTexel.x, 0.0)).xyz;
  vec3 left = texture2D(texturePosition, uv - vec2(uTexel.x, 0.0)).xyz;
  vec3 up = texture2D(texturePosition, uv + vec2(0.0, uTexel.y)).xyz;
  vec3 down = texture2D(texturePosition, uv - vec2(0.0, uTexel.y)).xyz;
  vec3 n = normalize(cross(right - left, up - down) + vec3(0.0, 0.0, 1e-5));
  vNormal = normalize(normalMatrix * n);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
