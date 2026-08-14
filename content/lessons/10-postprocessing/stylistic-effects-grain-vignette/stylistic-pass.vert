// Matches Three's own ShaderPass convention (see CopyShader.js/OutputShader.js
// in node_modules) — the FullScreenQuad still runs through the standard
// projection/modelView chain even though its geometry already sits in NDC.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
