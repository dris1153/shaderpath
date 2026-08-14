#version 300 es

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aVelocity;

uniform float uStrength;
uniform float uDelta;

out vec2 vPosition;
out vec2 vVelocity;

void main() {
  vec2 toAttractor = -aPosition;
  float rawDist = length(toAttractor);
  vec2 dir = rawDist > 0.0001 ? toAttractor / rawDist : vec2(0.0);
  float dist = rawDist + 0.05; // softening: keeps the pull finite near the attractor
  vec2 pull = dir * uStrength / (dist * dist);

  // Semi-implicit Euler: update velocity first, then use the NEW velocity to
  // move the position — cheap and stable enough for a visual demo.
  vec2 vel = (aVelocity + pull * uDelta) * pow(0.999, uDelta * 60.0);
  vec2 pos = aPosition + vel * uDelta;

  vPosition = pos;
  vVelocity = vel;

  // RASTERIZER_DISCARD drops this before rasterization: GLSL requires
  // gl_Position to be written, but the value itself is never used.
  gl_Position = vec4(0.0);
}
