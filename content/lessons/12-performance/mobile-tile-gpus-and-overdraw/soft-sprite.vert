varying vec2 vUv;

void main() {
  vUv = uv;
  // Manual instanceMatrix apply: this is a plain ShaderMaterial (not one of
  // Three's built-ins), so nothing auto-applies per-instance transforms.
  vec4 worldPosition = instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
}
