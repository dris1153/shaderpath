uniform float uDelta;
uniform float uTime;
uniform float uFieldScale;
uniform float uStrength;
uniform float uDamping;

// texturePosition / textureVelocity are auto-declared by GPUComputationRenderer
// (see setVariableDependencies in demo.tsx) — do not redeclare them here.

const float STEER_RATE = 2.2; // 1/s: how fast velocity chases the field direction

float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

// Trilinear value noise over the unit cube's 8 corners.
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0.0, 0.0, 0.0)), hash(i + vec3(1.0, 0.0, 0.0)), u.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), u.x), u.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), u.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), u.x), u.y),
    u.z
  );
}

// Three independent scalar potentials psi_x, psi_y, psi_z (separated by
// fixed offsets so they don't correlate) — the 3D generalization of the
// Curl Noise & Flow Field lesson (Track 7). F = curl(Psi) is divergence-free
// by construction, so particles following it swirl without ever clumping.
const vec3 OFFSET_X = vec3(0.0);
const vec3 OFFSET_Y = vec3(37.2, 91.1, 13.7);
const vec3 OFFSET_Z = vec3(71.4, 5.3, 62.8);
const float EPS = 0.06;

vec3 curlNoise(vec3 p) {
  vec3 dx = vec3(EPS, 0.0, 0.0);
  vec3 dy = vec3(0.0, EPS, 0.0);
  vec3 dz = vec3(0.0, 0.0, EPS);

  float dPsiZ_dy = (noise3(p + OFFSET_Z + dy) - noise3(p + OFFSET_Z - dy)) / (2.0 * EPS);
  float dPsiY_dz = (noise3(p + OFFSET_Y + dz) - noise3(p + OFFSET_Y - dz)) / (2.0 * EPS);
  float dPsiX_dz = (noise3(p + OFFSET_X + dz) - noise3(p + OFFSET_X - dz)) / (2.0 * EPS);
  float dPsiZ_dx = (noise3(p + OFFSET_Z + dx) - noise3(p + OFFSET_Z - dx)) / (2.0 * EPS);
  float dPsiY_dx = (noise3(p + OFFSET_Y + dx) - noise3(p + OFFSET_Y - dx)) / (2.0 * EPS);
  float dPsiX_dy = (noise3(p + OFFSET_X + dy) - noise3(p + OFFSET_X - dy)) / (2.0 * EPS);

  return vec3(
    dPsiZ_dy - dPsiY_dz,
    dPsiX_dz - dPsiZ_dx,
    dPsiY_dx - dPsiX_dy
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;

  // Slowly drift the sample point through a 4th "time" axis so the field
  // itself evolves, not just the particles moving through a frozen field.
  vec3 fieldDir = curlNoise(pos * uFieldScale + vec3(0.0, 0.0, uTime * 0.05));
  vec3 desired = normalize(fieldDir + 1e-5) * uStrength;

  // Full steering: mix the velocity TOWARD the field direction rather than
  // adding the field as a force — see theory for why that reads as
  // "obedient" flow instead of an unbounded, ever-accelerating one.
  float steer = clamp(uDelta * STEER_RATE, 0.0, 1.0);
  vel = mix(vel, desired, steer);
  vel *= uDamping;

  gl_FragColor = vec4(vel, 0.0);
}
