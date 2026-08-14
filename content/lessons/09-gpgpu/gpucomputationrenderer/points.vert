precision highp float;

uniform sampler2D texturePosition;
uniform sampler2D textureVelocity;
uniform float uPointSize;

attribute vec2 aReference;

varying float vSpeed;

void main() {
  vec3 pos = texture2D(texturePosition, aReference).xyz;
  vSpeed = length(texture2D(textureVelocity, aReference).xyz);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uPointSize * (200.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
