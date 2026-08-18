// GPUComputationRenderer variable "texturePosition" — depends on itself
// (pos at t) and on "texturePositionPrev" (pos at t-1, a second variable,
// see cloth-prev.frag). init() prepends "uniform sampler2D <name>;" for
// every dependency, the self-reference included, so neither sampler may be
// declared here: a second declaration is a duplicate-definition error.

uniform sampler2D uInitial; // xyz = rest position (flat grid), w = pin flag
uniform vec2 uTexel;
uniform float uDt;
uniform float uDamping;
uniform vec3 uGravity;
uniform float uWindStrength;
uniform float uTime;

// Cheap "gusty" signal: three non-harmonic sine waves summed, roughly in
// [-1, 1] — smooth in both space and time, unlike a raw hash (which jumps
// discontinuously between texels/frames and reads as flicker, not wind).
float gust(vec2 p, float t) {
  return sin(t * 1.3 + p.x * 1.7) * 0.5
    + sin(t * 0.7 - p.y * 2.3 + 1.7) * 0.3
    + sin(t * 2.1 + p.x * 0.6 + p.y * 0.9) * 0.2;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 initial = texture2D(uInitial, uv);

  // Pinned texels skip integration entirely — locked to their rest
  // position every frame, regardless of gravity/wind.
  if (initial.w > 0.5) {
    gl_FragColor = vec4(initial.xyz, 0.0);
    return;
  }

  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 prev = texture2D(texturePositionPrev, uv).xyz;

  // Cloth normal from neighboring texels (finite difference, same trick as
  // a heightfield normal) — approximates the surface without a separate
  // normal buffer. Uses last frame's confirmed shape, one step behind.
  vec3 right = texture2D(texturePosition, uv + vec2(uTexel.x, 0.0)).xyz;
  vec3 left = texture2D(texturePosition, uv - vec2(uTexel.x, 0.0)).xyz;
  vec3 up = texture2D(texturePosition, uv + vec2(0.0, uTexel.y)).xyz;
  vec3 down = texture2D(texturePosition, uv - vec2(0.0, uTexel.y)).xyz;
  vec3 normal = normalize(cross(right - left, up - down) + vec3(0.0, 0.0, 1e-5));

  // Wind = directional gust, projected onto the local normal so it only
  // ever pushes the cloth along its face — never straight through it.
  float g = 0.5 + 0.5 * gust(pos.xy, uTime);
  vec3 windDir = vec3(1.0, 0.0, 0.35);
  vec3 wind = windDir * uWindStrength * g;
  vec3 windForce = normal * max(dot(normal, wind), 0.0) * length(wind);

  vec3 accel = uGravity + windForce;

  // Verlet: velocity is implicit in (pos - prev), never stored explicitly.
  // uDamping < 1 bleeds a little energy each step so the cloth settles
  // instead of oscillating forever.
  vec3 next = pos + (pos - prev) * uDamping + accel * uDt * uDt;

  gl_FragColor = vec4(next, 0.0);
}
