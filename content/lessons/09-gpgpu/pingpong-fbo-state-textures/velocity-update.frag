precision highp float;

varying vec2 vUv;

// Both READ from the current frame's buffer — this pass writes only the
// velocity WRITE target, so it never touches the texture it samples.
uniform sampler2D uPosition;
uniform sampler2D uVelocity;
uniform float uDelta;
uniform float uGravity;
uniform float uBounce;
uniform float uBounds;

void main() {
  vec4 posState = texture2D(uPosition, vUv);
  vec4 velState = texture2D(uVelocity, vUv);

  vec3 vel = velState.xyz;
  vel.y -= uGravity * uDelta;

  // Predict next position just to decide a bounce — the actual integration
  // happens in position-update.frag, reading THIS pass's fresh output.
  vec3 predicted = posState.xyz + vel * uDelta;
  if (predicted.x > uBounds || predicted.x < -uBounds) vel.x = -vel.x * uBounce;
  if (predicted.y > uBounds || predicted.y < -uBounds) vel.y = -vel.y * uBounce;
  if (predicted.z > uBounds || predicted.z < -uBounds) vel.z = -vel.z * uBounce;

  gl_FragColor = vec4(vel, velState.a);
}
