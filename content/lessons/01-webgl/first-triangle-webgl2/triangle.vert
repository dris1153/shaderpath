#version 300 es

in vec2 aPosition;
in vec3 aColor;
uniform float uAngle;
out vec3 vColor;

void main() {
  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 p = mat2(c, s, -s, c) * aPosition;
  vColor = aColor;
  gl_Position = vec4(p, 0.0, 1.0);
}
