#version 300 es
precision highp float;

uniform vec3 uColor;
uniform float uAlpha;
out vec4 outColor;

void main() {
  outColor = vec4(uColor, uAlpha);
}
