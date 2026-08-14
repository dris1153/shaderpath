varying vec2 vUv;

// Shared by every offscreen pass in this lesson (seed, compute, debug view) —
// the quad spans NDC exactly, so vUv covers 0..1 with one fragment per texel.
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
