precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform float uCellSize;
uniform float uMode;      // 0 = infinite (mod), 1 = finite (round + clamp)
uniform float uClampN;    // clamp radius in cells, finite mode only
uniform float uVariation; // 0/1 hash-driven per-cell height/hue
uniform float uAxisMode;  // 0 = xz floor grid, 1 = xyz volume

float hash31(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

vec3 gCellId; // written by map(), snapshotted right after the hit is found

// Folds p on the axes flagged by mask (1.0 = repeated, 0.0 = passed through
// untouched), writing the winning cell's integer id (BEFORE folding) into
// gCellId so it can be hashed for per-cell variation.
vec3 repeatDomain(vec3 p, vec3 mask) {
  vec3 c = vec3(uCellSize);
  if (uMode < 0.5) {
    // Classic infinite repetition (Quilez opRep): one centered copy per cell.
    gCellId = floor(p / c + 0.5) * mask;
    vec3 q = mod(p + 0.5 * c, c) - 0.5 * c;
    return mix(p, q, mask);
  }
  // Limited repetition (Quilez opRepLim): clamp the cell id -> finite field.
  vec3 rawId = clamp(round(p / c), vec3(-uClampN), vec3(uClampN));
  gCellId = rawId * mask;
  vec3 q = p - c * rawId;
  return mix(p, q, mask);
}

float map(vec3 p) {
  vec3 mask = uAxisMode < 0.5 ? vec3(1.0, 0.0, 1.0) : vec3(1.0);
  vec3 q = repeatDomain(p, mask);

  float h = uVariation > 0.5 ? hash31(gCellId + 11.3) : 0.5;
  float halfH = uAxisMode < 0.5 ? mix(0.35, 1.1, h) : mix(0.18, 0.28, h);
  vec3 halfExt = uAxisMode < 0.5 ? vec3(0.3, halfH, 0.3) : vec3(halfH);

  vec3 local = q;
  if (uAxisMode < 0.5) local.y = q.y - halfH; // pillar base sits on y = 0

  float obj = sdRoundBox(local, halfExt, 0.04);

  if (uAxisMode < 0.5) {
    float ground = p.y; // the ground itself is always infinite; only the pillars repeat
    return min(obj, ground);
  }
  return obj;
}

vec3 calcNormal(vec3 p) {
  const vec2 k = vec2(1.0, -1.0);
  const float eps = 0.0005;
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
    if (d < 0.0008) return t;
    t += d;
    if (t > 40.0) break;
  }
  return -1.0;
}

void main() {
  vec3 ro = vec3(cos(uTime * 0.15) * 7.0, 3.2, sin(uTime * 0.15) * 7.0);
  vec3 ta = vec3(0.0, 0.4, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);

  vec2 p = (vUv - 0.5) * 2.0;
  vec3 rd = normalize(p.x * uu + p.y * vv + 1.7 * ww);

  vec3 skyHorizon = vec3(0.5, 0.6, 0.75);
  vec3 skyTop = vec3(0.05, 0.07, 0.12);
  vec3 col = mix(skyHorizon, skyTop, clamp(rd.y * 0.6 + 0.3, 0.0, 1.0));

  float t = raymarch(ro, rd);
  if (t > 0.0) {
    vec3 hit = ro + rd * t;
    map(hit); // refresh gCellId at the exact hit point before calcNormal disturbs it
    vec3 cellId = gCellId;
    vec3 n = calcNormal(hit);

    vec3 lightDir = normalize(vec3(0.6, 0.7, 0.35));
    float diff = clamp(dot(n, lightDir), 0.0, 1.0);
    float amb = 0.5 + 0.5 * n.y;

    vec3 base = vec3(0.75, 0.45, 0.3);
    bool onGround = uAxisMode < 0.5 && hit.y < 0.02;
    if (onGround) {
      base = vec3(0.16, 0.17, 0.2);
    } else if (uVariation > 0.5) {
      float hue = hash31(cellId + 7.1);
      base = mix(vec3(0.9, 0.35, 0.25), vec3(0.3, 0.55, 0.9), hue);
    }

    col = base * (diff * 0.65 + amb * 0.35);

    float fogAmt = 1.0 - exp(-0.015 * t);
    col = mix(col, skyHorizon, fogAmt);
  }

  gl_FragColor = vec4(col, 1.0);
}
