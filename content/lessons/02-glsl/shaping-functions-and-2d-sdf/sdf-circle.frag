precision highp float;

varying vec2 vUv;
uniform float uEdge0;
uniform float uEdge1;
uniform float uRadius;
uniform float uTime;
uniform float uPulse;

// Both edges are free sliders, and smoothstep is undefined for edge0 >= edge1.
// Swapped edges give the inverted mask drivers happen to produce anyway.
float edgeMask(float e0, float e1, float x) {
  if (e0 == e1) return step(e0, x);
  return e0 < e1 ? smoothstep(e0, e1, x) : 1.0 - smoothstep(e1, e0, x);
}

void main() {
  vec2 p = vUv - 0.5;
  float r = uRadius + uPulse * 0.05 * sin(uTime * 2.0);

  // Signed distance to a circle: negative inside, positive outside
  float d = length(p) - r;

  // smoothstep(edge0, edge1, d) is THE shaping function of this lesson
  float m = edgeMask(uEdge0, uEdge1, d);
  vec3 inside = vec3(0.98, 0.45, 0.2);
  vec3 outside = vec3(0.08, 0.12, 0.2);
  vec3 color = mix(inside, outside, m);

  // Faint iso-contours make the distance field itself visible
  float iso = abs(fract(d * 20.0) - 0.5);
  color = mix(color, vec3(1.0), (1.0 - smoothstep(0.0, 0.08, iso)) * 0.15);

  gl_FragColor = vec4(color, 1.0);
}
