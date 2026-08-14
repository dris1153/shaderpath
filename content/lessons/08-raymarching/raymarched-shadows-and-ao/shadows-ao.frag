precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uShadowMode;  // 0 = none, 1 = hard, 2 = soft
uniform float uSoftK;       // soft shadow penumbra width (2 = very soft, 32 = near-hard)
uniform float uAoEnabled;   // 0/1 toggle
uniform float uAoStrength;  // 0..1 blend between no AO and full AO
uniform float uLightAngle;  // sun elevation in degrees, low = grazing/long shadow

float sdPlane(vec3 p) {
  return p.y;
}

float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

// Ground plane + a sphere/box blob floating above it — the blob casts onto the plane.
float map(vec3 p) {
  float ground = sdPlane(p);
  float sphere = sdSphere(p - vec3(0.0, 1.0, 0.0), 0.55);
  float box = sdBox(p - vec3(0.0, 0.55, 0.0), vec3(0.35));
  float blob = opSmoothUnion(sphere, box, 0.3);
  return min(ground, blob);
}

// Tetrahedron technique from the previous lesson — normals are cheap, reused as-is here.
vec3 calcNormal(vec3 p) {
  const float eps = 0.0006;
  const vec2 k = vec2(1.0, -1.0);
  return normalize(
    k.xyy * map(p + k.xyy * eps) +
    k.yyx * map(p + k.yyx * eps) +
    k.yxy * map(p + k.yxy * eps) +
    k.xxx * map(p + k.xxx * eps)
  );
}

float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 100; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0006) return t;
    t += d;
    if (t > 30.0) break;
  }
  return -1.0;
}

// Any hit between mint and maxt means the light is fully blocked — binary in/out.
float hardShadow(vec3 ro, vec3 rd, float mint, float maxt) {
  float t = mint;
  for (int i = 0; i < 48; i++) {
    if (t >= maxt) break;
    float h = map(ro + rd * t);
    if (h < 0.0008) return 0.0;
    t += h;
  }
  return 1.0;
}

// Quilez's improved soft shadow: tracks the minimum penumbra ratio k*d/t along the ray,
// using the previous step's height to interpolate the closest approach instead of just h/t.
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  float res = 1.0;
  float t = mint;
  float ph = 1e10;
  for (int i = 0; i < 48; i++) {
    if (t >= maxt) break;
    float h = map(ro + rd * t);
    if (h < 0.0008) return 0.0;
    float y = h * h / (2.0 * ph);
    float d = sqrt(max(h * h - y * y, 0.0));
    res = min(res, k * d / max(0.0001, t - y));
    ph = h;
    t += h;
  }
  return clamp(res, 0.0, 1.0);
}

// 5-tap standard AO: sample map() along the normal, compare against the unoccluded
// distance h, accumulate the (weighted, decaying) deficit.
float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.01 + 0.12 * float(i) / 4.0;
    float d = map(p + n * h);
    occ += (h - d) * sca;
    sca *= 0.95;
  }
  return clamp(1.0 - 2.5 * occ, 0.0, 1.0);
}

vec3 materialColor(vec3 p) {
  if (p.y < 0.01) {
    float checker = mod(floor(p.x) + floor(p.z), 2.0);
    return mix(vec3(0.82), vec3(0.5), checker);
  }
  return vec3(0.86, 0.42, 0.2);
}

vec3 skyColor(vec3 rd) {
  return mix(vec3(0.05, 0.06, 0.09), vec3(0.16, 0.19, 0.27), clamp(rd.y * 0.5 + 0.5, 0.0, 1.0));
}

void main() {
  vec3 ro = vec3(2.4 * sin(uTime * 0.15), 1.1, 2.4 * cos(uTime * 0.15) + 0.6);
  vec3 ta = vec3(0.0, 0.4, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);

  vec2 p = (vUv - 0.5) * 2.0;
  vec3 rd = normalize(p.x * uu + p.y * vv + 1.8 * ww);

  float t = raymarch(ro, rd);
  vec3 col = skyColor(rd);

  if (t > 0.0) {
    vec3 hit = ro + rd * t;
    vec3 n = calcNormal(hit);

    float a = radians(uLightAngle);
    vec3 lightDir = normalize(vec3(0.4, sin(a), cos(a)));
    float diff = max(dot(n, lightDir), 0.0);

    float shadow = 1.0;
    if (uShadowMode > 1.5) {
      shadow = softShadow(hit + n * 0.002, lightDir, 0.02, 12.0, uSoftK);
    } else if (uShadowMode > 0.5) {
      shadow = hardShadow(hit + n * 0.002, lightDir, 0.02, 12.0);
    }

    float ao = uAoEnabled > 0.5 ? mix(1.0, calcAO(hit, n), uAoStrength) : 1.0;

    vec3 albedo = materialColor(hit);
    vec3 ambient = albedo * 0.35;
    vec3 diffuse = albedo * diff * vec3(1.0, 0.95, 0.85);

    col = ambient * ao + diffuse * shadow;
  }

  gl_FragColor = vec4(col, 1.0);
}
