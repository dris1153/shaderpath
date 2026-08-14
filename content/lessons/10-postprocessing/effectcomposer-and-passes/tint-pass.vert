varying vec2 vUv;

void main() {
  vUv = uv;
  // Matches three.js's own ShaderPass convention (see CopyShader.js): the
  // fullscreen quad sits at z=0 in an orthographic [-1,1] camera, so this
  // multiplication is effectively identity — kept explicit to match the
  // real API instead of hand-waving a "pass-through" shortcut.
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
