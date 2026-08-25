varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  // World-space normal: the fragment stage dots this against a
  // world-space view vector (cameraPosition - vWorldPosition). normalMatrix
  // would yield a VIEW-space normal — mixing the spaces skews cos(theta)
  // whenever the camera rotates. mat3(modelMatrix) is valid here (uniform scale).
  vNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
