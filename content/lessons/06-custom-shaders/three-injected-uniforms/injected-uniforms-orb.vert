varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  // World-space normal: the rim math in the fragment stage runs in world
  // space (cameraPosition, vWorldPosition). normalMatrix would give a
  // VIEW-space normal; mat3(modelMatrix) is fine for this uniform scale.
  vNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
