precision highp float;

uniform float uForce;
uniform float uDamping;
uniform float uDelta;

// textureVelocity + texturePosition uniforms are auto-declared by
// setVariableDependencies() at init() time — do not redeclare them here.

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 vel = texture2D(textureVelocity, uv);
  vec4 pos = texture2D(texturePosition, uv);

  // Tangential force around the Y axis: perpendicular to the XZ radius vector.
  vec2 radial = pos.xz;
  float r = length(radial);
  vec2 tangent = r > 0.0001 ? vec2(-radial.y, radial.x) / r : vec2(0.0);
  vel.xz += tangent * uForce * uDelta;

  // Weak spring back to the y = 0 plane so the swirl stays a flat disc
  // instead of drifting apart vertically.
  vel.y += -pos.y * 0.5 * uDelta;

  // uDamping is calibrated "per 1/60s tick" — raise it to the actual number
  // of ticks elapsed this frame so the decay stays frame-rate independent.
  vel.xyz *= pow(uDamping, uDelta * 60.0);

  gl_FragColor = vel;
}
