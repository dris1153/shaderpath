uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float uMaxSpeed;

attribute vec2 aRef;

varying vec2 vDir;
varying float vSpeedT;

void main() {
  vec3 pos = texture2D(texturePosition, aRef).xyz;
  vec3 vel = texture2D(textureVelocity, aRef).xyz;
  vSpeedT = clamp(length(vel) / max(uMaxSpeed, 0.0001), 0.0, 1.0);

  // Project both the boid and a point slightly ahead of it (along its own
  // velocity) to screen space — the difference is the 2D heading the
  // fragment shader rotates the sprite's triangle silhouette toward.
  vec3 ahead = pos + normalize(vel + 1e-5) * 0.35;
  vec4 clipCenter = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  vec4 clipAhead = projectionMatrix * modelViewMatrix * vec4(ahead, 1.0);

  vec2 screenCenter = clipCenter.xy / clipCenter.w;
  vec2 screenAhead = clipAhead.xy / clipAhead.w;
  vec2 dir = screenAhead - screenCenter;
  vDir = length(dir) > 0.00001 ? normalize(dir) : vec2(0.0, 1.0);

  gl_Position = clipCenter;
  gl_PointSize = 12.0;
}
