import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-procedural-cloud-scene",
    kind: "build",
    prompt: {
      vi: `Dựng một cảnh mây thủ tục hoàn chỉnh trong GLSL Playground, chỉ bằng hash, noise và FBM đã có sẵn trong starter code.

Yêu cầu: một sky gradient dọc theo \`uv.y\` (chân trời sáng hơn đỉnh trời); một lớp mây định hình bằng \`smoothstep(COVERAGE, COVERAGE + SOFTNESS, raw)\` với \`COVERAGE\` và \`SOFTNESS\` là hằng số khai báo sẵn; \`raw\` là tổ hợp của hai lần gọi \`fbm()\` trôi theo \`uTime\` ở hai tốc độ khác nhau (một lớp nhanh, một lớp chậm hơn) để có cảm giác song song thị sai chứ không phải một texture cuộn đều; một phép warp nhẹ lên toạ độ lấy mẫu trước khi tính \`raw\` cuối cùng, để mây không phải khối tròn đều đặn; và một quầng sáng ấm hơn ở đúng dải biên mây khi gần vị trí \`SUN_POS\`.

Gợi ý cấu trúc: viết đúng năm TODO trong starter code theo thứ tự — sky gradient, hai lớp FBM trôi song song, warp toạ độ, định hình mật độ bằng smoothstep, rồi viền sáng theo khoảng cách tới mặt trời.`,
      en: `Build a complete procedural cloud scene in the GLSL Playground, using only the hashing, noise and FBM already provided in the starter code.

Requirements: a vertical sky gradient across \`uv.y\` (horizon brighter than zenith); a cloud layer shaped by \`smoothstep(COVERAGE, COVERAGE + SOFTNESS, raw)\` with \`COVERAGE\` and \`SOFTNESS\` as pre-declared constants; \`raw\` combining two \`fbm()\` calls drifting on \`uTime\` at two different speeds (one fast layer, one slower) for a parallax feel instead of one uniformly scrolling texture; a light warp on the sampling coordinate before the final \`raw\` evaluation, so clouds aren't uniform round blobs; and a warmer glow exactly at the cloud's edge band near \`SUN_POS\`.

Suggested structure: fill in the five TODOs in the starter code, in order — sky gradient, two parallel-drifting FBM layers, coordinate warp, density shaping via smoothstep, then sun-distance edge glow.`,
    },
    starterCode: `// Hash, noise và fbm() đã dựng sẵn — dùng chúng, không cần viết lại.
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

// Hằng số hình dạng mây: coverage cao = nhiều mây hơn, softness = biên mềm hơn.
const float COVERAGE = 0.55;
const float SOFTNESS = 0.15;
const vec2 SUN_POS = vec2(0.75, 0.8);

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 3.0;

  // TODO 1: sky gradient dọc — mix 2 màu theo uv.y (chân trời sáng hơn đỉnh trời)
  vec3 sky = vec3(0.1, 0.2, 0.5);

  // TODO 2: hai lớp fbm() trôi theo uTime ở 2 tốc độ khác nhau, trộn lại làm mật độ thô
  float raw = fbm(p);

  // TODO 3: warp nhẹ toạ độ p trước khi lấy fbm cuối, để mây không phải khối tròn đều
  // (gợi ý: vec2 warp = vec2(fbm(...), fbm(...)); rồi mix raw với fbm(p + warp * strength))

  // TODO 4: định hình mật độ mây bằng smoothstep(COVERAGE, COVERAGE + SOFTNESS, raw)
  float density = raw;

  vec3 cloudColor = vec3(1.0);
  vec3 color = mix(sky, cloudColor, density);

  // TODO 5: viền sáng ấm hơn gần SUN_POS — dùng distance(uv, SUN_POS) và density*(1.0-density)
  // để quầng sáng chỉ xuất hiện đúng ở dải biên mây, không tràn vào lõi hay bầu trời trống

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

const float COVERAGE = 0.55;
const float SOFTNESS = 0.15;
const vec2 SUN_POS = vec2(0.75, 0.8);

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 3.0;

  vec3 horizonColor = vec3(0.65, 0.78, 0.92);
  vec3 zenithColor = vec3(0.15, 0.35, 0.75);
  vec3 sky = mix(horizonColor, zenithColor, uv.y);

  // Two layers at different scale + drift speed: the faster/finer one reads
  // as the near layer, the slower/coarser one as the far layer -> parallax.
  float layerNear = fbm(p + vec2(uTime * 0.06, 0.0));
  float layerFar = fbm(p * 0.5 + vec2(uTime * 0.015, uTime * 0.01));
  float raw = layerNear * 0.6 + layerFar * 0.4;

  // Domain-warp the sampling coordinate before the final density read so
  // cloud shapes get a wispy, uneven silhouette instead of round blobs.
  vec2 warp = vec2(fbm(p * 1.5 + 4.0), fbm(p * 1.5 - 7.0));
  raw = mix(raw, fbm(p + warp * 0.4), 0.5);

  float density = smoothstep(COVERAGE, COVERAGE + SOFTNESS, raw);

  vec3 cloudColor = vec3(1.0);
  vec3 color = mix(sky, cloudColor, density);

  // density * (1.0 - density) peaks exactly where density crosses 0.5 (the
  // soft edge band), so the glow never bleeds into the solid core or clear sky.
  float sunFalloff = 1.0 - smoothstep(0.0, 0.35, distance(uv, SUN_POS));
  float edgeGlow = sunFalloff * density * (1.0 - density) * 4.0;
  color += vec3(1.0, 0.75, 0.4) * edgeGlow;

  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "smoothstep(COVERAGE, COVERAGE + SOFTNESS, raw) là toàn bộ logic \"định hình\": raw dưới COVERAGE ra 0 (trời trong), raw trên COVERAGE+SOFTNESS ra 1 (mây đặc), dải giữa chuyển tiếp mượt — không cần if nào cả.",
        en: "smoothstep(COVERAGE, COVERAGE + SOFTNESS, raw) is the entire shaping logic: raw below COVERAGE gives 0 (clear sky), above COVERAGE+SOFTNESS gives 1 (solid cloud), the band between transitions smoothly — no if needed at all.",
      },
      {
        vi: "Để có parallax thật, hai lớp fbm phải khác nhau ở CẢ tần số không gian (nhân p với hệ số khác nhau) LẪN tốc độ trôi theo uTime — chỉ đổi một trong hai trông vẫn như một lớp cuộn đơn.",
        en: "For real parallax, the two fbm layers must differ in BOTH spatial frequency (multiply p by different factors) AND drift speed on uTime — changing only one still reads as a single scrolling layer.",
      },
      {
        vi: "density * (1.0 - density) là mẹo rẻ để chỉ bắt đúng dải biên (nơi density ở khoảng giữa 0 và 1) mà không cần tính đạo hàm hay so sánh ngưỡng thủ công — nhân thêm hệ số fade theo khoảng cách tới SUN_POS để quầng sáng tắt dần ra xa mặt trời.",
        en: "density * (1.0 - density) is a cheap trick to isolate exactly the edge band (where density sits between 0 and 1) without derivatives or manual threshold checks — multiply by a distance-based fade from SUN_POS so the glow fades out away from the sun.",
      },
    ],
    checklist: [
      {
        vi: "Mây đọc được là khối mềm liên tục, không phải nhiễu hạt lởm chởm hay đốm rời rạc",
        en: "Clouds read as a soft continuous volume, not grainy noise or scattered speckles",
      },
      {
        vi: "Chuyển động trông như gió thổi (parallax hai lớp tốc độ khác nhau), không phải một texture đang cuộn đều một hướng",
        en: "Motion looks like wind (two-layer parallax at different speeds), not a single texture scrolling uniformly in one direction",
      },
      {
        vi: "Viền mây sáng lên rõ rệt, ấm màu hơn khi ở gần SUN_POS, mờ dần khi ra xa",
        en: "Cloud edges visibly brighten with a warmer tint near SUN_POS, fading out with distance",
      },
      {
        vi: "Không có banding cứng (đường ranh giới sắc cạnh) giữa vùng mây và bầu trời",
        en: "No hard banding (a sharp cutoff line) between cloud and sky regions",
      },
      {
        vi: "Chạy dài (vài phút) không thấy điểm lặp lại rõ ràng hay reset đột ngột",
        en: "Runs for several minutes with no obviously repeating loop or sudden reset",
      },
      {
        vi: "Không có lỗi biên dịch trong Playground; shader chạy mượt, không giật hình",
        en: "No compile errors in the Playground; the shader runs smoothly with no stutter",
      },
    ],
  },
];
