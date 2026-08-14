// Shared by every sim pass: raw NDC passthrough (position is already in
// [-1,1] on a PlaneGeometry(2,2)) — the same convention GPUComputationRenderer
// uses internally, ignoring camera matrices entirely.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
