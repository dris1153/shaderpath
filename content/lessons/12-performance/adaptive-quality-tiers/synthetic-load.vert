// Bypasses modelViewMatrix/projectionMatrix on purpose: gl_Position is set
// directly from local position (already -1..1 for a PlaneGeometry(2,2)), so
// this quad always covers the exact full screen regardless of camera.
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
