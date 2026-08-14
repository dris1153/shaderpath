precision highp float;

varying vec2 vUv;
uniform sampler2D uSource;

// Used once at construction (and again on reset) to blit a CPU-built
// DataTexture into a render target — the only way to put initial data into
// a WebGLRenderTarget's texture without a real draw call.
void main() {
  gl_FragColor = texture2D(uSource, vUv);
}
