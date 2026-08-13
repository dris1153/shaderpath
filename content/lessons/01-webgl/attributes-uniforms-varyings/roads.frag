#version 300 es
precision highp float;

in vec3 vColor;
in vec2 vUv;

uniform vec3 uSolidColor;
uniform int uMode; // 0 = uniform, 1 = attribute, 2 = varying

out vec4 outColor;

void main() {
  vec3 color;
  if (uMode == 0) {
    color = uSolidColor;
  } else if (uMode == 1) {
    color = vColor;
  } else {
    color = vec3(vUv, 1.0 - vUv.x * vUv.y);
  }
  outColor = vec4(color, 1.0);
}
