precision highp float;

attribute vec2 aReference;

uniform sampler2D uTexturePosition;
uniform sampler2D uTextureVelocity;

varying float vSpeed;
varying float vAge;

void main() {
  vec4 posData = texture2D(uTexturePosition, aReference);
  vec3 vel = texture2D(uTextureVelocity, aReference).xyz;

  vSpeed = length(vel);
  vAge = posData.w;

  vec4 mvPosition = modelViewMatrix * vec4(posData.xyz, 1.0);
  gl_PointSize = 2.6 * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
