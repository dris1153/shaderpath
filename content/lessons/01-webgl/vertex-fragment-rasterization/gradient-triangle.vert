#version 300 es

in vec2 aPosition;
in vec3 aColor;
out vec3 vColor;

void main() {
  vColor = aColor;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
