#version 300 es
precision highp float;

in vec3 vColor;
out vec4 outColor;

void main() {
  // The gradient IS the interpolated varying — no texture, no math here.
  outColor = vec4(vColor, 1.0);
}
