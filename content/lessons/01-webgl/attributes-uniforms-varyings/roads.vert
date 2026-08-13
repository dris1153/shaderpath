#version 300 es

in vec2 aPosition;
in vec3 aColor;

out vec3 vColor;
out vec2 vUv;

void main() {
  vColor = aColor;
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
