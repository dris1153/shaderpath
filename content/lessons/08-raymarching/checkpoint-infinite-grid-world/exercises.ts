import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-infinite-grid-world",
    kind: "build",
    prompt: {
      vi: `Dựng một cảnh raymarch hoàn chỉnh trong GLSL Playground: một trường trụ lặp vô hạn theo hai trục ngang (xz), với đầy đủ shading stack của module — normal, soft shadow, ambient occlusion.

Yêu cầu: domain repetition kiểu round-based chỉ trên \`p.xz\` (giữ nguyên \`p.y\` — đây là sàn, không phải khối thể tích); mỗi trụ có chiều cao lệch nhẹ theo hash của cell-id; normal ước lượng bằng kỹ thuật tetrahedron; bóng đổ mềm từ một mặt trời thấp; ambient occlusion 5-tap làm tối chỗ trụ tiếp đất; vật liệu hai tông màu theo chiều cao trụ; camera trôi chậm theo \`uTime\` để cảm nhận được sự vô hạn.

Gợi ý cấu trúc: bốn TODO trong starter code, làm đúng thứ tự — (1) fold domain, (2) normal, (3) soft shadow, (4) AO.`,
      en: `Build a complete raymarched scene in the GLSL Playground: a field of pillars repeated infinitely along the two ground axes (xz), with the module's full shading stack — normals, soft shadows, ambient occlusion.

Requirements: round-based domain repetition on \`p.xz\` only (leave \`p.y\` untouched — this is a floor, not a volumetric block); every pillar's height varies slightly from a hash of its cell-id; normals from the tetrahedron technique; soft shadows cast by a low sun; 5-tap ambient occlusion darkening where pillars meet the ground; a two-tone material that varies by pillar height; a camera that drifts slowly on \`uTime\` so the infinity actually reads as infinite.

Suggested structure: four TODOs in the starter code, in order — (1) fold the domain, (2) normals, (3) soft shadows, (4) AO.`,
    },
    starterCode: `float hash31(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

const float CELL = 2.2;
const vec3 SUN_DIR_RAW = vec3(0.5, 0.35, 0.3); // low sun -> long, dramatic shadows

const int MAX_STEPS = 100;
const float MAX_DIST = 50.0;
const float SURF_DIST = 0.0009;

vec3 gCellId; // written by map(), snapshotted right after the hit is found

float map(vec3 p) {
  // TODO 1: fold p.xz into cell-local coordinates centered per cell, using
  // round-based repetition: q = p - c*round(p/c) (x and z only — leave
  // p.y untouched, this is a FLOOR grid, not a volumetric one). Store the
  // winning cell id (BEFORE folding) into gCellId for hashing.
  vec3 q = p;
  gCellId = vec3(0.0);

  float h = hash31(gCellId + 4.0); // per-cell height variation, already wired
  float halfH = mix(0.5, 2.6, h);
  vec3 pillar = vec3(q.x, q.y - halfH, q.z);
  float obj = sdRoundBox(pillar, vec3(0.35, halfH, 0.35), 0.05);

  float ground = p.y;
  return min(obj, ground);
}

vec3 calcNormal(vec3 p) {
  // TODO 2: estimate the normal with the tetrahedron technique — 4 calls to
  // map() at p + e.xyy / e.yyx / e.yxy / e.xxx, weighted by the same swizzle.
  return vec3(0.0, 1.0, 0.0); // placeholder: always "up"
}

float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  // TODO 3: penumbra-ratio soft shadow — march from ro along rd, tracking
  // the minimum ratio (k * d / t) seen so far. Called with ro already
  // offset along the surface normal (see main()) to dodge shadow acne.
  return 1.0;
}

float calcAO(vec3 p, vec3 n) {
  // TODO 4: 5-tap AO — sample map() at p + n*h for a few increasing h,
  // accumulate (h - d) weighted by a falling factor, then turn the sum
  // into an occlusion multiplier in [0, 1].
  return 1.0;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution - 0.5) * 2.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 ro = vec3(uTime * 0.6, 2.2, uTime * 0.3); // slow drift reveals the infinite field
  vec3 ta = ro + vec3(1.0, -0.15, 0.5);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.8 * ww);

  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 pos = ro + rd * t;
    float d = map(pos);
    if (d < SURF_DIST) { hit = true; break; }
    t += d;
    if (t > MAX_DIST) break;
  }

  vec3 skyLow = vec3(0.55, 0.62, 0.72);
  vec3 skyHigh = vec3(0.08, 0.1, 0.16);
  vec3 col = mix(skyLow, skyHigh, clamp(rd.y * 0.7 + 0.25, 0.0, 1.0));

  if (hit) {
    vec3 pos = ro + rd * t;
    map(pos); // refresh gCellId at the exact hit point before calcNormal disturbs it
    vec3 cellId = gCellId;
    vec3 nor = calcNormal(pos);
    vec3 sunDir = normalize(SUN_DIR_RAW);

    float diff = clamp(dot(nor, sunDir), 0.0, 1.0);
    float shadow = softShadow(pos + nor * 0.002, sunDir, 0.02, 12.0, 8.0);
    float ao = calcAO(pos, nor);

    bool onGround = pos.y < 0.02;
    float h = hash31(cellId + 4.0);
    vec3 low = vec3(0.28, 0.22, 0.16);
    vec3 high = vec3(0.85, 0.78, 0.65);
    vec3 base = onGround ? vec3(0.14, 0.15, 0.17) : mix(low, high, h);

    float sunAmt = diff * shadow;
    vec3 lit = base * (0.2 * ao + 0.8 * sunAmt);
    col = lit + base * 0.08 * ao; // faint sky fill so the shadow side isn't pure black

    float fogAmt = 1.0 - exp(-0.012 * t);
    col = mix(col, skyLow, fogAmt);
  }

  fragColor = vec4(col, 1.0);
}`,
    solutionCode: `float hash31(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

const float CELL = 2.2;
const vec3 SUN_DIR_RAW = vec3(0.5, 0.35, 0.3);

const int MAX_STEPS = 100;
const float MAX_DIST = 50.0;
const float SURF_DIST = 0.0009;

vec3 gCellId;

float map(vec3 p) {
  vec2 id2 = round(p.xz / CELL);
  gCellId = vec3(id2.x, 0.0, id2.y);
  vec3 q = vec3(p.x - CELL * id2.x, p.y, p.z - CELL * id2.y);

  float h = hash31(gCellId + 4.0);
  float halfH = mix(0.5, 2.6, h);
  vec3 pillar = vec3(q.x, q.y - halfH, q.z);
  float obj = sdRoundBox(pillar, vec3(0.35, halfH, 0.35), 0.05);

  float ground = p.y;
  return min(obj, ground);
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

float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
  float res = 1.0;
  float t = mint;
  for (int i = 0; i < 48; i++) {
    if (t >= maxt) break;
    float d = map(ro + rd * t);
    if (d < 0.0008) return 0.0;
    res = min(res, k * d / t);
    t += clamp(d, 0.01, 0.5);
  }
  return clamp(res, 0.0, 1.0);
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float weight = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.02 + 0.12 * float(i);
    float d = map(p + n * h);
    occ += (h - d) * weight;
    weight *= 0.6;
  }
  return clamp(1.0 - occ * 1.5, 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution - 0.5) * 2.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 ro = vec3(uTime * 0.6, 2.2, uTime * 0.3);
  vec3 ta = ro + vec3(1.0, -0.15, 0.5);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x * uu + uv.y * vv + 1.8 * ww);

  float t = 0.0;
  bool hit = false;
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 pos = ro + rd * t;
    float d = map(pos);
    if (d < SURF_DIST) { hit = true; break; }
    t += d;
    if (t > MAX_DIST) break;
  }

  vec3 skyLow = vec3(0.55, 0.62, 0.72);
  vec3 skyHigh = vec3(0.08, 0.1, 0.16);
  vec3 col = mix(skyLow, skyHigh, clamp(rd.y * 0.7 + 0.25, 0.0, 1.0));

  if (hit) {
    vec3 pos = ro + rd * t;
    map(pos);
    vec3 cellId = gCellId;
    vec3 nor = calcNormal(pos);
    vec3 sunDir = normalize(SUN_DIR_RAW);

    float diff = clamp(dot(nor, sunDir), 0.0, 1.0);
    float shadow = softShadow(pos + nor * 0.002, sunDir, 0.02, 12.0, 8.0);
    float ao = calcAO(pos, nor);

    bool onGround = pos.y < 0.02;
    float h = hash31(cellId + 4.0);
    vec3 low = vec3(0.28, 0.22, 0.16);
    vec3 high = vec3(0.85, 0.78, 0.65);
    vec3 base = onGround ? vec3(0.14, 0.15, 0.17) : mix(low, high, h);

    float sunAmt = diff * shadow;
    vec3 lit = base * (0.2 * ao + 0.8 * sunAmt);
    col = lit + base * 0.08 * ao;

    float fogAmt = 1.0 - exp(-0.012 * t);
    col = mix(col, skyLow, fogAmt);
  }

  fragColor = vec4(col, 1.0);
}`,
    hints: [
      {
        vi: "Round-based repetition: `id = round(p.xz / CELL)`, rồi `q.xz = p.xz - CELL*id` — ghi `id` vào `gCellId` TRƯỚC khi trừ, vì đó chính là chỉ số ô nguyên dùng để hash chiều cao. `p.y` không đụng tới.",
        en: "Round-based repetition: `id = round(p.xz / CELL)`, then `q.xz = p.xz - CELL*id` — write `id` into `gCellId` BEFORE subtracting, since that's the integer cell index used to hash the height. Leave `p.y` alone.",
      },
      {
        vi: "Tia bóng bắt đầu ngay TRÊN bề mặt sẽ tự báo `d ≈ 0` ở bước đầu tiên và toàn bộ cảnh thành đen — luôn gọi `softShadow` với gốc tia đã dịch một chút theo normal (`pos + nor * eps`), đúng như đã có sẵn ở `main()`.",
        en: "A shadow ray starting exactly ON the surface immediately reports `d ≈ 0` at the first step and the whole scene goes black — always call `softShadow` with the ray origin nudged along the normal (`pos + nor * eps`), exactly as already wired in `main()`.",
      },
      {
        vi: "AO lấy mẫu DỌC THEO NORMAL, không phải dọc theo ray hay một trục cố định — `p + n*h` với `h` tăng dần; hiệu `h - d` dương lớn nghĩa là xung quanh trống, gần 0 hoặc âm nghĩa là có hình học ở gần, occlusion cao.",
        en: "AO samples ALONG THE NORMAL, not along the ray or a fixed axis — `p + n*h` with `h` increasing; a large positive `h - d` means the surroundings are empty, near-zero or negative means geometry is close by, i.e. high occlusion.",
      },
    ],
    checklist: [
      {
        vi: "Không có khoảng hở hay chồng lấn giữa các trụ ở biên ô (không lộ đường lưới)",
        en: "No visible gap or overlap between pillars at cell borders (no grid seams showing)",
      },
      {
        vi: "Mỗi trụ có chiều cao hơi khác nhau nhờ hash theo cell-id, không đồng loạt một chiều cao",
        en: "Each pillar stands a subtly different height thanks to the per-cell hash, not all identical",
      },
      {
        vi: "Bóng đổ mềm dần theo khoảng cách tới vật cản (rõ nét gần chân trụ, nhoè dần xa)",
        en: "Shadows visibly soften with distance from the occluder (sharp near the base, blurrier further out)",
      },
      {
        vi: "AO làm tối rõ rệt chỗ trụ tiếp đất và các góc lõm",
        en: "AO visibly darkens where pillars meet the ground and at concave corners",
      },
      {
        vi: "Camera trôi chậm theo thời gian, liên tục để lộ các trụ mới ở phía trước — cảm giác một thế giới vô hạn",
        en: "The camera drifts slowly over time, continuously revealing new pillars ahead — the sense of an endless world",
      },
      {
        vi: "Giữ khung hình ổn định (không giật) trên toàn canvas ở độ phân giải mặc định",
        en: "Frame rate stays stable (no stutter) across the full canvas at default resolution",
      },
    ],
  },
];
