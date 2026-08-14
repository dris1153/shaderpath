precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uSteps;
uniform float uDensityMul;
uniform float uSunAzimuth;
uniform float uJitter;

const int MAX_STEPS = 96;
const float BOUND_RADIUS = 1.6;
const float FALLOFF_RADIUS = 1.3;
const float NOISE_SCALE = 2.2;
const float THRESHOLD = 0.32;

float hash13(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
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

float fbm3(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise3(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

// cloud blob = smooth sphere falloff * fbm, minus a threshold to carve puffs
float densityAt(vec3 p) {
  float d = length(p);
  float falloff = 1.0 - smoothstep(0.0, FALLOFF_RADIUS, d);
  float n = fbm3(p * NOISE_SCALE + vec3(0.0, uTime * 0.04, 0.0));
  float shape = falloff * (0.6 + 0.6 * n) - THRESHOLD;
  return max(shape, 0.0) * uDensityMul;
}

// Cheap 1-2 tap "light march": how much density sits between p and the sun.
// Real scattering is far deeper (multiple bounces inside the cloud) — this
// is a single-scattering stand-in, not a light march.
vec3 lightAt(vec3 p, vec3 sunDir) {
  float thickness = densityAt(p + sunDir * 0.18) + densityAt(p + sunDir * 0.36);
  float shadow = exp(-thickness * 1.1);
  return mix(vec3(0.32, 0.36, 0.46), vec3(1.0, 0.95, 0.85), shadow);
}

void main() {
  vec3 ro = vec3(0.0, 0.0, 3.2);
  vec3 ta = vec3(0.0, 0.0, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);

  vec2 p = vUv * 2.0 - 1.0;
  vec3 rd = normalize(p.x * uu + p.y * vv + 1.7 * ww);

  float az = radians(uSunAzimuth);
  vec3 sunDir = normalize(vec3(cos(az), 0.45, sin(az)));

  vec3 bg = mix(vec3(0.04, 0.05, 0.09), vec3(0.13, 0.16, 0.24), p.y * 0.5 + 0.5);
  bg += vec3(1.0, 0.85, 0.6) * pow(max(dot(rd, sunDir), 0.0), 28.0) * 0.7;

  // ray vs. bounding sphere (a = 1 since rd is normalized)
  float b = dot(ro, rd);
  float c = dot(ro, ro) - BOUND_RADIUS * BOUND_RADIUS;
  float disc = b * b - c;

  vec3 color = bg;

  if (disc > 0.0) {
    float sq = sqrt(disc);
    float tNear = max(-b - sq, 0.0);
    float tFar = -b + sq;

    if (tFar > tNear) {
      int steps = int(uSteps);
      float stepLen = (tFar - tNear) / float(steps);
      float jitter = uJitter > 0.5 ? hash13(vec3(gl_FragCoord.xy, uTime)) : 0.0;
      float t = tNear + jitter * stepLen;

      float T = 1.0;
      vec3 acc = vec3(0.0);

      for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= steps) break; // iteration count is uniform-driven — free to branch on
        vec3 pos = ro + rd * t;
        float density = densityAt(pos);
        if (density > 0.001) {
          vec3 emitted = lightAt(pos, sunDir);
          // add THIS step's emission using T as it stands, THEN attenuate T
          acc += T * density * stepLen * emitted;
          T *= exp(-density * stepLen);
          if (T < 0.01) break;
        }
        t += stepLen;
      }

      color = acc + T * bg;
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
