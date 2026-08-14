precision highp float;

uniform float uPointSize;

// The CPU path: `position` is a real per-vertex attribute, rewritten every
// frame by the JS loop in demo.tsx and re-uploaded via needsUpdate.
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uPointSize * (300.0 / -mvPosition.z);
}
