#version 300 es

in vec2 aPosition; // unit quad corners, [-1,1] x [-1,1]
uniform vec2 uScale;
uniform vec2 uOffset;
uniform float uZ; // NDC depth in [-1, 1] — computed on the CPU from the depth(d) formula

void main() {
  vec2 p = aPosition * uScale + uOffset;
  gl_Position = vec4(p, uZ, 1.0);
}
