precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uDensity;       // extinction coeff (uniform fog) / base density 'a' (height fog)
uniform float uHeightFalloff; // 'b' in the height-fog closed form
uniform float uSunAzimuth;    // degrees
uniform float uFogType;       // 0 = uniform, 1 = height

const int MAX_STEPS = 96;
const float MAX_DIST = 40.0;
const float EPS = 0.0015;
const float CELL = 4.0;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Ground plane + a domain-repeated field of pillars with per-cell height —
// "repeated objects" terrain, kept as a true SDF (unlike a heightfield
// march) so sphere tracing stays exact.
float pillarField(vec3 p) {
  vec2 cellId = floor(p.xz / CELL);
  vec2 local = mod(p.xz, CELL) - CELL * 0.5;
  float h = mix(0.5, 3.0, hash21(cellId));
  vec3 q = vec3(local.x, p.y - h * 0.5, local.y);
  return sdBox(q, vec3(0.55, h * 0.5, 0.55));
}

float map(vec3 p) {
  float ground = p.y;
  float pillars = pillarField(p);
  return min(ground, pillars);
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(1.0, -1.0) * 0.0005;
  return normalize(
    e.xyy * map(p + e.xyy) +
    e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) +
    e.xxx * map(p + e.xxx)
  );
}

vec3 sunDirection() {
  float az = radians(uSunAzimuth);
  return normalize(vec3(cos(az) * 0.9, 0.55, sin(az) * 0.9));
}

// Preetham-flavored cheap sky: an artistic pow() gradient + glow term, NOT
// real Rayleigh/Mie scattering (see theory + GPU Gems 2 ch16 for the real thing).
vec3 skyColor(vec3 rd, vec3 sunDir) {
  vec3 zenith = vec3(0.22, 0.42, 0.82);
  vec3 horizon = vec3(0.72, 0.80, 0.88);
  vec3 sky = mix(horizon, zenith, pow(clamp(rd.y, 0.0, 1.0), 0.55));

  float sunAmount = max(dot(rd, sunDir), 0.0);
  sky += vec3(1.0, 0.85, 0.55) * pow(sunAmount, 48.0) * 1.6;
  sky += vec3(1.0, 0.65, 0.35) * pow(sunAmount, 4.0) * 0.35;
  return sky;
}

// Closed-form height-fog integral (Quilez): density(y) = a * exp(-b*y),
// integrated along the ray from ro to ro + t*rd.
float heightFogAmount(vec3 ro, vec3 rd, float t, float a, float b) {
  float rdy = abs(rd.y) < 0.001 ? 0.001 : rd.y;
  float amt = (a / b) * exp(-ro.y * b) * (1.0 - exp(-t * rdy * b)) / rdy;
  return clamp(amt, 0.0, 1.0);
}

void main() {
  // Slow forward drift keeps the fog boundary visibly moving through the
  // infinite pillar field — ro and ta drift together (see track convention
  // in sphere-tracing-principle/shadows-ao demos: ro/ta -> ww/uu/vv basis).
  vec3 ro = vec3(0.0, 1.2, -uTime * 0.6);
  vec3 ta = ro + vec3(0.0, -0.08, -1.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);

  vec2 p = vUv * 2.0 - 1.0;
  vec3 rd = normalize(p.x * uu + p.y * vv + 1.5 * ww);

  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 pos = ro + rd * t;
    float d = map(pos);
    if (d < EPS) { hit = true; break; }
    t += d;
    if (t > MAX_DIST) break;
  }

  vec3 sunDir = sunDirection();
  vec3 shaded;

  if (hit) {
    vec3 pos = ro + rd * t;
    vec3 n = calcNormal(pos);
    float groundD = pos.y;
    float pillarD = pillarField(pos);
    float isPillar = step(pillarD, groundD);
    vec3 albedo = mix(vec3(0.18, 0.32, 0.14), vec3(0.55, 0.5, 0.46), isPillar);

    float diffuse = max(dot(n, sunDir), 0.0);
    float ambient = 0.18;
    shaded = albedo * (ambient + diffuse * 0.85);
  } else {
    shaded = skyColor(rd, sunDir);
  }

  float fogAmount = uFogType > 0.5
    ? heightFogAmount(ro, rd, t, uDensity, uHeightFalloff)
    : 1.0 - exp(-t * uDensity);

  float sunAmount = max(dot(rd, sunDir), 0.0);
  vec3 fogCool = vec3(0.62, 0.68, 0.78);
  vec3 fogWarm = vec3(0.95, 0.78, 0.6);
  vec3 fogColor = mix(fogCool, fogWarm, pow(sunAmount, 8.0));

  vec3 color = hit ? mix(shaded, fogColor, fogAmount) : shaded;

  gl_FragColor = vec4(color, 1.0);
}
