precision highp float;

varying vec2 vUv;
uniform sampler2D uTexturePosition;
uniform float uBounds;

// The "show state texture" toggle: state lives in [-uBounds, uBounds], with
// no meaning as color — remapping it to [0,1] is literally what makes the
// "state is just pixels" idea from the previous lesson visible on screen.
void main() {
  vec4 state = texture2D(uTexturePosition, vUv);
  vec3 color = state.xyz / (2.0 * uBounds) + 0.5;
  gl_FragColor = vec4(color, 1.0);
}
