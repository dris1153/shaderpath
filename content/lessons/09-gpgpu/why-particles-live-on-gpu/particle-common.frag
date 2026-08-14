precision highp float;

// Shared by both the CPU and GPU panels — proving "same visual" honestly:
// if the fragment shader is byte-identical, any visible difference between
// the two panels comes from the vertex stage's position source, nothing else.
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;

  float alpha = smoothstep(0.5, 0.35, d);
  gl_FragColor = vec4(0.4, 0.7, 1.0, alpha);
}
