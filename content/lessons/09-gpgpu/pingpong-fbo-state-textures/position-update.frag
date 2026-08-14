precision highp float;

varying vec2 vUv;

// uPosition is the OLD read buffer; uVelocity is this frame's FRESH output
// from velocity-update.frag — reading it here (not the old velocity buffer)
// keeps position and velocity in lockstep without ever reading the target
// this pass is currently writing to.
uniform sampler2D uPosition;
uniform sampler2D uVelocity;
uniform float uDelta;
uniform float uBounds;

void main() {
  vec4 posState = texture2D(uPosition, vUv);
  vec3 vel = texture2D(uVelocity, vUv).xyz;

  vec3 pos = posState.xyz + vel * uDelta;
  pos = clamp(pos, vec3(-uBounds), vec3(uBounds));

  gl_FragColor = vec4(pos, posState.a); // life/seed channel passes through untouched
}
