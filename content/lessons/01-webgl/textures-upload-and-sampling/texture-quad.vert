#version 300 es

in vec2 aPosition;
in vec2 aUV;
uniform float uUVScale;
out vec2 vUV;

void main() {
  vUV = aUV * uUVScale;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
