#version 300 es

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aVelocity;

uniform float uPointSize;

out float vSpeed;

void main() {
  vSpeed = length(aVelocity);
  gl_Position = vec4(aPosition, 0.0, 1.0);
  gl_PointSize = uPointSize;
}
