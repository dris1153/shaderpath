uniform float uDelta;
uniform float uBounds;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  vec3 next = pos + vel * uDelta;
  // Wrap at the box edges — the swarm recycles instead of draining away, a
  // cheap edge policy for a demo that has to run unattended indefinitely.
  next = mod(next + uBounds, 2.0 * uBounds) - uBounds;
  gl_FragColor = vec4(next, 1.0);
}
