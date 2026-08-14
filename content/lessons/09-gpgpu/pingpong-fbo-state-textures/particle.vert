precision highp float;

// aReference is the UV into the state texture, NOT a 3D coordinate — the
// standard trick this lesson teaches. `position` still exists on the
// geometry (Three.js needs it for the vertex count / bounding sphere) but
// its contents are never read here.
attribute vec2 aReference;
uniform sampler2D uTexturePosition;
uniform float uPointSize;

varying float vLife;

void main() {
  vec4 state = texture2D(uTexturePosition, aReference);
  vLife = state.a;

  vec4 mvPosition = modelViewMatrix * vec4(state.xyz, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uPointSize * (300.0 / -mvPosition.z);
}
