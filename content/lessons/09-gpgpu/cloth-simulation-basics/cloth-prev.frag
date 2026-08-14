// GPUComputationRenderer variable "texturePositionPrev" — its only job is
// to lag one frame behind "texturePosition" so cloth-integrate.frag always
// has both pos(t) and pos(t-1) to run Verlet integration.
//
// This variable's dependency is "texturePosition" — a DIFFERENT name than
// its own, so the renderer auto-declares "uniform sampler2D texturePosition;"
// and auto-fills its value every compute() call. Do not redeclare it below,
// that would collide with the auto-injected declaration.

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  gl_FragColor = texture2D(texturePosition, uv);
}
