import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-animated-terrain-material",
    kind: "build",
    prompt: {
      vi: `Dựng một **material thủ tục chuyển động**, chọn một trong ba đề tài: nhìn địa hình từ trên cao, marble, hoặc vân gỗ. Bài tập này cung cấp starter/solution cho đề tài **địa hình** — nếu chọn đề tài khác, áp dụng đúng bốn nguyên tắc dưới đây cho đề tài đó.

Yêu cầu (đề tài địa hình): height field từ FBM bị **domain-warp** (đường bờ biển cong tự nhiên); tô màu bằng **dải elevation** nước sâu → nước cạn → cát → cỏ → đá → tuyết, chuyển màu mượt bằng \`smoothstep\`, không ranh giới cứng; chi tiết đá lởm chởm từ **Voronoi**, chỉ hiện ở vùng cao (mask theo height); chuyển động thật bằng noise 3D với trục thời gian (kỹ thuật slice) cho nước lấp lánh và bóng mây trôi chậm (hệ số làm tối nhân lên toàn cảnh) — trong khi hình dạng mặt đất đứng yên tuyệt đối; cường độ warp định hình đường bờ biển.

Gợi ý cấu trúc: bốn lớp theo thứ tự — (1) warp domain rồi tính height field, (2) chuỗi \`smoothstep\` làm dải elevation, (3) Voronoi mask theo height cho chi tiết đá, (4) một lớp noise/fbm thứ hai lấy mẫu theo \`uTime\` cho chuyển động, hoàn toàn tách biệt khỏi height field.`,
      en: `Build a **moving procedural material**, choosing one of three subjects: terrain from above, marble, or wood grain. This exercise ships starter/solution code for the **terrain** subject — if a different subject is chosen, apply the same four principles below to it.

Requirements (terrain subject): a height field from **domain-warped** FBM (naturally curving coastlines); colored with an **elevation ramp** deep water → shallow water → sand → grass → rock → snow, blended smoothly with \`smoothstep\`, no hard boundaries; jagged rock detail from **Voronoi**, only appearing at high elevations (masked by height); real motion via 3D noise with a time axis (the slice technique) for water shimmer and slowly drifting cloud shadows (a darkening multiplier over the whole scene) — while the land's shape itself stays perfectly still; warp strength shapes the coastlines.

Suggested structure: four layers in order — (1) warp the domain, then compute the height field, (2) a chain of \`smoothstep\`s as the elevation ramp, (3) a Voronoi mask by height for rock detail, (4) a second noise/fbm layer sampled over \`uTime\` for motion, fully decoupled from the height field.`,
    },
    starterCode: `// ---- library: hash, value noise (2D/3D), fbm (2D/3D), Voronoi F1 ----
// All fully working — no TODOs here, only in main() below.

float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453123);
}
float hash1(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash1(i);
  float b = hash1(i + vec2(1.0, 0.0));
  float c = hash1(i + vec2(0.0, 1.0));
  float d = hash1(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float c000 = hash1(i + vec3(0.0, 0.0, 0.0));
  float c100 = hash1(i + vec3(1.0, 0.0, 0.0));
  float c010 = hash1(i + vec3(0.0, 1.0, 0.0));
  float c110 = hash1(i + vec3(1.0, 1.0, 0.0));
  float c001 = hash1(i + vec3(0.0, 0.0, 1.0));
  float c101 = hash1(i + vec3(1.0, 0.0, 1.0));
  float c011 = hash1(i + vec3(0.0, 1.0, 1.0));
  float c111 = hash1(i + vec3(1.0, 1.0, 1.0));
  float x00 = mix(c000, c100, u.x);
  float x10 = mix(c010, c110, u.x);
  float x01 = mix(c001, c101, u.x);
  float x11 = mix(c011, c111, u.x);
  float y0 = mix(x00, x10, u.y);
  float y1 = mix(x01, x11, u.y);
  return mix(y0, y1, u.z);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise2(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

float fbm3(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise3(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

// Distance to the nearest feature point (F1), scanning the 3x3 neighborhood.
float voronoiF1(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float minDist = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = hash2(i + neighbor);
      vec2 diff = neighbor + point - f;
      minDist = min(minDist, length(diff));
    }
  }
  return minDist;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * 3.0;

  const float WARP_STRENGTH = 0.9;

  // TODO 1: domain warp — q = vec2(fbm(p), fbm(p + offset)), then
  // warped = p + WARP_STRENGTH * q. An un-warped p gives blobby, un-natural
  // coastlines; the warp is what makes them read as organic.
  vec2 warped = p;

  // TODO 2: height field from the WARPED coordinates (not raw p), clamped
  // into roughly [0, 1].
  float height = 0.5;

  // TODO 3: elevation ramp — chain smoothstep bands from deep water to
  // snow, each mix() blending the previous color into the next.
  vec3 waterDeep = vec3(0.02, 0.08, 0.25);
  vec3 waterShallow = vec3(0.05, 0.35, 0.55);
  vec3 sand = vec3(0.76, 0.70, 0.50);
  vec3 grass = vec3(0.25, 0.45, 0.18);
  vec3 rock = vec3(0.40, 0.36, 0.32);
  vec3 snow = vec3(0.95, 0.95, 0.98);
  vec3 color = waterDeep;

  // TODO 4: rocky detail — mask voronoiF1(warped * scale) to only show in
  // a height band (rock, not water/grass/snow), darken near cell borders.
  float rockBand = 0.0;

  // TODO 5: water shimmer — noise3(vec3(warped * scale, uTime * speed)),
  // masked to water-only elevation, added as a small brightness offset.
  float shimmer = 0.0;

  // TODO 6: cloud shadows — fbm3 sampled with a wind-drift offset in xy
  // AND uTime in the third slot (combining scroll + slice), remapped into
  // a [0.7, 1.0] darkening multiplier applied to the whole scene.
  float cloudShadow = 1.0;

  color *= cloudShadow;
  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `// ---- library: hash, value noise (2D/3D), fbm (2D/3D), Voronoi F1 ----

float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453123);
}
float hash1(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash1(i);
  float b = hash1(i + vec2(1.0, 0.0));
  float c = hash1(i + vec2(0.0, 1.0));
  float d = hash1(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  float c000 = hash1(i + vec3(0.0, 0.0, 0.0));
  float c100 = hash1(i + vec3(1.0, 0.0, 0.0));
  float c010 = hash1(i + vec3(0.0, 1.0, 0.0));
  float c110 = hash1(i + vec3(1.0, 1.0, 0.0));
  float c001 = hash1(i + vec3(0.0, 0.0, 1.0));
  float c101 = hash1(i + vec3(1.0, 0.0, 1.0));
  float c011 = hash1(i + vec3(0.0, 1.0, 1.0));
  float c111 = hash1(i + vec3(1.0, 1.0, 1.0));
  float x00 = mix(c000, c100, u.x);
  float x10 = mix(c010, c110, u.x);
  float x01 = mix(c001, c101, u.x);
  float x11 = mix(c011, c111, u.x);
  float y0 = mix(x00, x10, u.y);
  float y1 = mix(x01, x11, u.y);
  return mix(y0, y1, u.z);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise2(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

float fbm3(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise3(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

// Distance to the nearest feature point (F1), scanning the 3x3 neighborhood.
float voronoiF1(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float minDist = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = hash2(i + neighbor);
      vec2 diff = neighbor + point - f;
      minDist = min(minDist, length(diff));
    }
  }
  return minDist;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (uv - 0.5) * 3.0;

  const float WARP_STRENGTH = 0.9;

  // Domain warp: distort p with a low-frequency fbm BEFORE the height fbm
  // reads it — this is what turns blobby noise into organic coastlines.
  vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
  vec2 warped = p + WARP_STRENGTH * q;

  // Height field from the warped coordinates only — nothing time-based
  // touches this, so the land's shape never moves.
  float height = clamp(fbm(warped * 1.1), 0.0, 1.0);

  vec3 waterDeep = vec3(0.02, 0.08, 0.25);
  vec3 waterShallow = vec3(0.05, 0.35, 0.55);
  vec3 sand = vec3(0.76, 0.70, 0.50);
  vec3 grass = vec3(0.25, 0.45, 0.18);
  vec3 rock = vec3(0.40, 0.36, 0.32);
  vec3 snow = vec3(0.95, 0.95, 0.98);

  vec3 color = waterDeep;
  color = mix(color, waterShallow, smoothstep(0.30, 0.38, height));
  color = mix(color, sand, smoothstep(0.38, 0.42, height));
  color = mix(color, grass, smoothstep(0.42, 0.55, height));
  color = mix(color, rock, smoothstep(0.55, 0.72, height));
  color = mix(color, snow, smoothstep(0.80, 0.88, height));

  // Rocky detail: only in the rock band (not water/grass/snow), darker
  // right along the Voronoi cell borders so it reads as broken rock.
  float rockBand = smoothstep(0.55, 0.63, height) * (1.0 - smoothstep(0.88, 0.94, height));
  float voro = voronoiF1(warped * 9.0);
  float crack = 1.0 - smoothstep(0.0, 0.07, voro);
  vec3 rockyDetail = mix(rock, rock * 0.55, crack);
  color = mix(color, rockyDetail, rockBand);

  // Water shimmer: noise3 with uTime as the third axis (the slice
  // technique) — every frame reads a different 2D slab, so highlights
  // boil instead of sliding in one direction.
  float waterMask = 1.0 - smoothstep(0.30, 0.38, height);
  float shimmer = noise3(vec3(warped * 8.0, uTime * 0.8));
  color += waterMask * (shimmer - 0.5) * 0.12 * vec3(0.6, 0.8, 1.0);

  // Cloud shadows: fbm3 combines a wind-direction scroll offset (xy) with
  // a slice time axis (z) — clouds drift AND slowly change shape, exactly
  // the "scroll + slice together" technique from the previous lesson.
  vec2 windDrift = vec2(0.05, 0.02) * uTime;
  float clouds = fbm3(vec3(warped * 0.6 + windDrift, uTime * 0.05));
  float cloudShadow = mix(0.72, 1.0, smoothstep(0.35, 0.65, clouds));

  color *= cloudShadow;
  fragColor = vec4(color, 1.0);
}`,
    referenceImage: "/figures/07-procedural/checkpoint-animated-terrain-material.png",
    hints: [
      {
        vi: "Domain warp đúng thứ tự: TÍNH \`q\` từ \`p\` gốc trước (\`q = vec2(fbm(p), fbm(p + offset))\`), rồi mới cộng \`WARP_STRENGTH * q\` vào \`p\` để ra \`warped\` — mọi lời gọi fbm/voronoi SAU đó phải dùng \`warped\`, không phải \`p\` gốc, nếu không warp không có tác dụng gì.",
        en: "Get the domain warp order right: compute \`q\` from the ORIGINAL \`p\` first (\`q = vec2(fbm(p), fbm(p + offset))\`), then add \`WARP_STRENGTH * q\` to \`p\` to get \`warped\` — every fbm/voronoi call AFTER that must use \`warped\`, not the original \`p\`, or the warp does nothing.",
      },
      {
        vi: "Dải elevation là một CHUỖI \`mix\`, không phải if/else độc lập: mỗi \`color = mix(color, nextColor, smoothstep(lo, hi, height))\` ghi đè lên kết quả của bước trước — thứ tự các dòng phải đi từ thấp lên cao (nước → tuyết), đảo thứ tự sẽ làm dải cao đè nhầm lên dải thấp.",
        en: "The elevation ramp is a CHAIN of \`mix\` calls, not independent if/else branches: each \`color = mix(color, nextColor, smoothstep(lo, hi, height))\` overwrites the previous step's result — the lines must go from low to high (water → snow); reversing the order makes a low band incorrectly overwrite a high one.",
      },
      {
        vi: "Chuyển động (shimmer, cloudShadow) chỉ được phép đọc \`uTime\` và \`warped\` — TUYỆT ĐỐI không được ghi ngược vào biến \`height\` hay đổi \`warped\` sau khi height đã tính xong, nếu không mặt đất sẽ nhấp nhô sai theo nhịp noise động thay vì đứng yên.",
        en: "Motion (shimmer, cloudShadow) is only allowed to READ \`uTime\` and \`warped\` — it must NEVER write back into \`height\` or mutate \`warped\` after height has already been computed, or the land will incorrectly bob along with the animated noise instead of staying still.",
      },
    ],
    checklist: [
      {
        vi: "Đường bờ biển cong tự nhiên, không có vùng lồi lõm tròn đều kiểu \"chấm bi\" (dấu hiệu domain warp chưa có tác dụng)",
        en: "Coastlines curve organically, with no perfectly round \"polka dot\" bumps (a sign the domain warp isn't doing anything)",
      },
      {
        vi: "Các dải màu (nước/cát/cỏ/đá/tuyết) chuyển tiếp mượt, không có đường ranh giới cứng hay răng cưa",
        en: "Color bands (water/sand/grass/rock/snow) transition smoothly, with no hard edges or banding artifacts",
      },
      {
        vi: "Nước lấp lánh/animate được, nhưng đường bờ biển và hình dạng đất liền hoàn toàn đứng yên — không nhấp nhô theo animation",
        en: "Water shimmers/animates, but the coastline and land shape stay perfectly still — no bobbing in sync with the animation",
      },
      {
        vi: "Bóng mây trôi chậm và mượt qua địa hình, làm tối theo hệ số nhân chứ không đổi màu gốc của từng dải elevation",
        en: "Cloud shadows drift slowly and smoothly across the terrain, darkening via a multiplier rather than replacing each elevation band's base color",
      },
      {
        vi: "Chi tiết đá lởm chởm chỉ xuất hiện ở vùng cao (đá/gần tuyết), không tràn xuống nước hay đồng cỏ",
        en: "Rocky detail only appears at high elevations (rock/near-snow), never bleeding down into water or grassland",
      },
      {
        vi: "Chạy mượt ở kích thước canvas đầy đủ trong playground, không giật hình khi kéo qua các octave FBM",
        en: "Runs smoothly at the playground's full canvas size, with no stutter across the FBM octave loop",
      },
    ],
  },
];
