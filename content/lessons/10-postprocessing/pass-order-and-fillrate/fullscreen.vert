// FullScreenQuad's geometry (Pass.js) ships an oversized triangle already in
// clip space, so no projectionMatrix/modelViewMatrix multiply is needed here.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
