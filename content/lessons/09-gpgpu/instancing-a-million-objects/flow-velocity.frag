uniform float uStrength;
uniform float uScale;
uniform float uTime;

float hash13(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(
      mix(hash13(i + vec3(0.0, 0.0, 0.0)), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
      mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x),
      f.y
    ),
    mix(
      mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
      mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x),
      f.y
    ),
    f.z
  );
}

// Three independently-seeded scalar fields stand in for a vector potential
// psi = (Fx, Fy, Fz) — curl(psi) below is the divergence-free flow field
// (same trick as curl-noise-flow-fields, extended from 2D to 3D).
vec3 potential(vec3 p) {
  return vec3(
    noise3(p + vec3(37.2, 11.1, 0.0)),
    noise3(p + vec3(4.7, 91.3, 17.0)),
    noise3(p + vec3(72.1, 3.4, 55.6))
  );
}

vec3 curlNoise(vec3 p) {
  const float e = 0.09;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  vec3 px0 = potential(p - dx);
  vec3 px1 = potential(p + dx);
  vec3 py0 = potential(p - dy);
  vec3 py1 = potential(p + dy);
  vec3 pz0 = potential(p - dz);
  vec3 pz1 = potential(p + dz);

  float cx = (py1.z - py0.z) - (pz1.y - pz0.y);
  float cy = (pz1.x - pz0.x) - (px1.z - px0.z);
  float cz = (px1.y - px0.y) - (py1.x - py0.x);

  return normalize(vec3(cx, cy, cz) / (2.0 * e) + 1e-5);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 pos = texture2D(texturePosition, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;

  vec3 field = curlNoise(pos * uScale + vec3(0.0, 0.0, uTime * 0.06));
  // Damp toward the field instead of snapping to it, so instances drift
  // smoothly frame to frame instead of jittering whenever noise changes.
  vec3 newVel = mix(vel, field * uStrength, 0.12);
  gl_FragColor = vec4(newVel, 1.0);
}
