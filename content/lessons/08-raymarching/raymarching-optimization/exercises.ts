import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "slab-method-by-hand",
    kind: "concept",
    prompt: {
      vi: `Một tia có gốc $ro = (0, 0, 5)$, hướng $rd = (0, 0, -1)$ (đã chuẩn hoá). Box bao có $bmin = (-2, -1, -3)$, $bmax = (2, 1, 3)$.

Không chạy code, tính $t_{near}$ và $t_{far}$ bằng slab method cho TỪNG trục $x, y, z$ riêng biệt (lưu ý: $invD.x$ và $invD.y$ chia cho 0 vì $rd.x = rd.y = 0$ — $\\pm\\infty$ theo IEEE 754 vẫn hợp lệ trong so sánh min/max, vì $ro.x$ và $ro.y$ nằm chặt bên trong dải của box trên hai trục đó). Sau đó suy ra $t_{near} = \\max(...)$, $t_{far} = \\min(...)$ trên cả ba trục, và kết luận tia có march hay bị bỏ qua.`,
      en: `A ray has origin $ro = (0, 0, 5)$, direction $rd = (0, 0, -1)$ (normalized). A bounding box has $bmin = (-2, -1, -3)$, $bmax = (2, 1, 3)$.

Without running code, compute $t_{near}$ and $t_{far}$ via the slab method for EACH axis $x, y, z$ separately (note: $invD.x$ and $invD.y$ divide by zero since $rd.x = rd.y = 0$ — $\\pm\\infty$ under IEEE 754 is still valid in a min/max comparison, since $ro.x$ and $ro.y$ sit strictly inside the box's range on those two axes). Then derive $t_{near} = \\max(...)$, $t_{far} = \\min(...)$ across all three axes, and conclude whether the ray marches or gets skipped.`,
    },
    hints: [
      {
        vi: "Trục x: invD.x = 1/0 = +∞. t0s.x = (-2-0)*∞ = -∞, t1s.x = (2-0)*∞ = +∞ — trục này không giới hạn gì cả (tia song song, luôn nằm trong dải x nếu ro.x nằm trong [bmin.x, bmax.x]).",
        en: "x-axis: invD.x = 1/0 = +∞. t0s.x = (-2-0)*∞ = -∞, t1s.x = (2-0)*∞ = +∞ — this axis constrains nothing (the ray runs parallel to it, and stays inside as long as ro.x sits within [bmin.x, bmax.x]).",
      },
      {
        vi: "Trục z là trục duy nhất mà rd khác 0: invD.z = 1/(-1) = -1. t0s.z = (-3-5)*(-1) = 8, t1s.z = (3-5)*(-1) = 2 — chú ý t0s > t1s vì rd.z âm, nên tsm.z = min(8,2) = 2, tbg.z = max(8,2) = 8.",
        en: "z is the only axis where rd is nonzero: invD.z = 1/(-1) = -1. t0s.z = (-3-5)*(-1) = 8, t1s.z = (3-5)*(-1) = 2 — note t0s > t1s since rd.z is negative, so tsm.z = min(8,2) = 2, tbg.z = max(8,2) = 8.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng trục x và y đều không giới hạn (-∞ đến +∞) vì rd song song với hai mặt đó",
        en: "I correctly found the x and y axes constrain nothing (-∞ to +∞) since rd runs parallel to those faces",
      },
      {
        vi: "Tôi tính đúng trục z cho tNear=2, tFar=8",
        en: "I correctly computed the z axis giving tNear=2, tFar=8",
      },
      {
        vi: "Tôi kết luận đúng tNear tổng = max(-∞,-∞,2) = 2, tFar tổng = min(∞,∞,8) = 8, và vì tFar ≥ max(tNear,0) tia CÓ march, bắt đầu tại t=2 chứ không phải t=0",
        en: "I correctly concluded overall tNear = max(-∞,-∞,2) = 2, tFar = min(∞,∞,8) = 8, and since tFar ≥ max(tNear,0) the ray DOES march, starting at t=2 rather than t=0",
      },
    ],
    solutionCode: `// x: rd.x=0 -> invD.x=+Inf -> [t0s.x,t1s.x] = [-Inf, +Inf] (no constraint)
// y: rd.y=0 -> invD.y=+Inf -> [t0s.y,t1s.y] = [-Inf, +Inf] (no constraint)
// z: rd.z=-1 -> invD.z=-1
//    t0s.z = (bmin.z - ro.z) * invD.z = (-3 - 5) * -1 = 8
//    t1s.z = (bmax.z - ro.z) * invD.z = ( 3 - 5) * -1 = 2
//    tsm.z = min(8,2) = 2, tbg.z = max(8,2) = 8
//
// tNear = max(-Inf, -Inf, 2) = 2
// tFar  = min( Inf,  Inf, 8) = 8
// tFar (8) >= max(tNear, 0) (2) -> the ray HITS the box.
// March starts at t=2 (box entry), stops at t=8 (box exit) — NOT from t=0.`,
  },
  {
    id: "bounded-scaled-epsilon-march",
    kind: "shader",
    prompt: {
      vi: `Trong playground, starter code đã có một cảnh sẵn (hai sphere hợp bằng smooth min) và hàm \`intersectSphere\` hoàn chỉnh, nhưng vòng lặp march trong \`main()\` vẫn march "ngây thơ" từ $t=0$ với epsilon cố định. Hoàn thành ba TODO: (1) dùng \`intersectSphere\` để bỏ qua hoàn toàn tia trượt khỏi bounding sphere, (2) march bắt đầu tại điểm vào bounding sphere thay vì $t=0$, (3) epsilon co giãn theo $t$.`,
      en: `In the playground, the starter code already has a scene (two spheres merged with smooth min) and a complete \`intersectSphere\` helper, but the march loop in \`main()\` still naively marches from $t=0$ with a fixed epsilon. Complete three TODOs: (1) use \`intersectSphere\` to fully skip rays that miss the bounding sphere, (2) start the march at the bounding sphere's entry point instead of $t=0$, (3) scale epsilon with $t$.`,
    },
    starterCode: `float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdSphere(vec3 p, vec3 c, float r) {
  return length(p - c) - r;
}

float sdScene(vec3 p) {
  float a = sdSphere(p, vec3(-0.35, 0.0, 0.0), 0.6);
  float b = sdSphere(p, vec3(0.45, 0.15, 0.0), 0.45);
  return smin(a, b, 0.35);
}

// Returns (tNear, tFar), or (-1, -1) if the ray misses the sphere entirely.
vec2 intersectSphere(vec3 ro, vec3 rd, vec3 center, float radius) {
  vec3 oc = ro - center;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - radius * radius;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

const vec3 BOUND_CENTER = vec3(0.0);
const float BOUND_RADIUS = 1.3;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(uv, -1.4));

  // TODO 1: call intersectSphere(ro, rd, BOUND_CENTER, BOUND_RADIUS). If it
  // misses (tFar < max(tNear, 0)), skip marching and output the background
  // color directly.
  vec2 tBound = vec2(0.0, 20.0);

  // TODO 2: march should start at max(tBound.x, 0.0), not 0.0.
  float t = 0.0;
  bool hit = false;

  for (int i = 0; i < 64; i++) {
    if (t > tBound.y) break;
    vec3 p = ro + rd * t;
    float d = sdScene(p);

    // TODO 3: scale epsilon with t (0.0015 * max(t, 1.0)) instead of a fixed 0.0015.
    float eps = 0.0015;
    if (d < eps) { hit = true; break; }
    t += d;
  }

  vec3 bg = mix(vec3(0.05, 0.06, 0.09), vec3(0.12, 0.14, 0.2), uv.y + 0.5);
  vec3 color = hit ? vec3(0.9, 0.55, 0.25) : bg;
  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float sdSphere(vec3 p, vec3 c, float r) {
  return length(p - c) - r;
}

float sdScene(vec3 p) {
  float a = sdSphere(p, vec3(-0.35, 0.0, 0.0), 0.6);
  float b = sdSphere(p, vec3(0.45, 0.15, 0.0), 0.45);
  return smin(a, b, 0.35);
}

vec2 intersectSphere(vec3 ro, vec3 rd, vec3 center, float radius) {
  vec3 oc = ro - center;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - radius * radius;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

const vec3 BOUND_CENTER = vec3(0.0);
const float BOUND_RADIUS = 1.3;

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(uv, -1.4));

  vec3 bg = mix(vec3(0.05, 0.06, 0.09), vec3(0.12, 0.14, 0.2), uv.y + 0.5);

  vec2 tBound = intersectSphere(ro, rd, BOUND_CENTER, BOUND_RADIUS);
  if (tBound.y < max(tBound.x, 0.0)) {
    fragColor = vec4(bg, 1.0);
    return;
  }

  float t = max(tBound.x, 0.0);
  bool hit = false;

  for (int i = 0; i < 64; i++) {
    if (t > tBound.y) break;
    vec3 p = ro + rd * t;
    float d = sdScene(p);

    float eps = 0.0015 * max(t, 1.0);
    if (d < eps) { hit = true; break; }
    t += d;
  }

  vec3 color = hit ? vec3(0.9, 0.55, 0.25) : bg;
  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "TODO 1 chỉ cần MỘT lần gọi intersectSphere trước vòng lặp, cộng một if trả về sớm (return) nếu tFar < max(tNear, 0) — không cần đổi gì bên trong vòng lặp cho TODO này.",
        en: "TODO 1 needs just ONE intersectSphere call before the loop, plus an early-return if if tFar < max(tNear, 0) — nothing inside the loop needs to change for this TODO.",
      },
      {
        vi: "TODO 2 chỉ đổi giá trị KHỞI TẠO của t, không đổi điều kiện dừng của for — march vẫn dừng ở tBound.y như cũ.",
        en: "TODO 2 only changes t's INITIAL value, not the for loop's stopping condition — the march still stops at tBound.y as before.",
      },
      {
        vi: "TODO 3 là một dòng: nhân 0.0015 với max(t, 1.0) — giữ nguyên toàn bộ cấu trúc if/break xung quanh.",
        en: "TODO 3 is one line: multiply 0.0015 by max(t, 1.0) — keep the surrounding if/break structure exactly as-is.",
      },
    ],
    checklist: [
      {
        vi: "Kéo chuột ra góc màn hình (tia trượt khỏi bounding sphere): hình nền hiện ngay, không có viền/artefact lạ quanh mép",
        en: "Drag toward a screen corner (ray misses the bounding sphere): the background shows immediately, no stray edge/artifact near the border",
      },
      {
        vi: "Hai sphere vẫn hợp mượt bằng smooth min như trước khi sửa — thay đổi không làm hỏng hình dạng cảnh",
        en: "The two spheres still blend smoothly via smooth min as before — the changes don't break the scene's shape",
      },
      {
        vi: "Không có lỗi biên dịch trong Playground; ảnh hiện đúng khối blend cam trên nền tối, cạnh mượt không răng cưa",
        en: "No compile errors in the Playground; the image shows the correct orange blended shape on a dark background, edges smooth with no jagged aliasing",
      },
    ],
  },
];
