#version 300 es

in vec2 aPosition;
uniform float uW;

void main() {
  // uW stands in for a homogeneous w — shared across all 3 vertices here to
  // keep the demo legible, unlike a real perspective divide (which varies
  // per-vertex with depth). See the theory lesson's "one vertex" walkthrough.
  gl_Position = vec4(aPosition, 0.0, uW);
}
