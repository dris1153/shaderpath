// Same convention as FullScreenQuad's own passes (Pass.js/ShaderPass.js):
// the triangle geometry is already in clip space, no matrix multiply needed.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
