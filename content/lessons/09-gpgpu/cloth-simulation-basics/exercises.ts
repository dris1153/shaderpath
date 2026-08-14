import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "verlet-step-by-hand",
    kind: "concept",
    prompt: {
      vi: `Một điểm vải không bị ghim có $\\vec{x}_t = (0, 2.000, 0)$ và $\\vec{x}_{t-1} = (0, 2.020, 0)$ (đã đi xuống ở bước trước). Damping $d = 0.98$, trọng lực $\\vec a = (0, -9.8, 0)\\, \\text{m/s}^2$, $\\Delta t = 1/60\\,\\text{s}$. Không chạy code, áp dụng công thức Verlet $\\vec{x}_{t+1} = \\vec{x}_t + (\\vec{x}_t - \\vec{x}_{t-1}) \\cdot d + \\vec a \\, \\Delta t^2$ để tính $\\vec{x}_{t+1}.y$ chính xác đến 4 chữ số thập phân.

Sau đó trả lời: nếu $d = 1$ thay vì $0.98$ (không damping), bước tích hợp Verlet tự nó có bảo toàn năng lượng không — và vì sao constraint-solving mỗi frame (không phải riêng bước tích hợp) là lý do thực sự khiến $d$ phải nhỏ hơn 1 để vải tắt dần thay vì dao động mãi?`,
      en: `An unpinned cloth point has $\\vec{x}_t = (0, 2.000, 0)$ and $\\vec{x}_{t-1} = (0, 2.020, 0)$ (it moved downward the previous step). Damping $d = 0.98$, gravity $\\vec a = (0, -9.8, 0)\\, \\text{m/s}^2$, $\\Delta t = 1/60\\,\\text{s}$. Without running code, apply the Verlet formula $\\vec{x}_{t+1} = \\vec{x}_t + (\\vec{x}_t - \\vec{x}_{t-1}) \\cdot d + \\vec a \\, \\Delta t^2$ to compute $\\vec{x}_{t+1}.y$ to 4 decimal places.

Then answer: if $d = 1$ instead of $0.98$ (no damping), does the Verlet integration step itself conserve energy — and why is constraint-solving each frame (not the integration step alone) the real reason $d$ needs to be below 1 for cloth to settle instead of oscillating forever?`,
    },
    hints: [
      {
        vi: "Vận tốc ngầm là $\\vec{x}_t - \\vec{x}_{t-1} = (0, 2.000 - 2.020, 0) = (0, -0.020, 0)$ — một số ÂM vì điểm đang đi xuống. Nhân số âm này với $d$, cộng thêm số hạng gia tốc (cũng âm), rồi cộng vào $\\vec{x}_t.y$.",
        en: "The implicit velocity is $\\vec{x}_t - \\vec{x}_{t-1} = (0, 2.000 - 2.020, 0) = (0, -0.020, 0)$ — negative because the point is moving down. Multiply that negative number by $d$, add the (also negative) acceleration term, then add the result to $\\vec{x}_t.y$.",
      },
      {
        vi: "$\\Delta t^2 = (1/60)^2 \\approx 0.0002778$ — dễ quên bình phương $\\Delta t$ và chỉ nhân $\\vec a$ với $\\Delta t$ (đúng cho vận tốc, sai cho vị trí trong công thức Verlet).",
        en: "$\\Delta t^2 = (1/60)^2 \\approx 0.0002778$ — it's easy to forget to square $\\Delta t$ and multiply $\\vec a$ by $\\Delta t$ instead (correct for velocity, wrong for position in the Verlet formula).",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng vận tốc ngầm là -0.020, và $\\vec{x}_{t+1}.y \\approx 1.9777$",
        en: "I correctly computed the implicit velocity as -0.020, and $\\vec{x}_{t+1}.y \\approx 1.9777$",
      },
      {
        vi: "Tôi giải thích được với $d=1$, riêng bước tích hợp Verlet không tự thêm hay bớt năng lượng — nó chỉ tái sử dụng đúng vận tốc ngầm từ bước trước",
        en: "I can explain that with $d=1$, the Verlet integration step alone neither adds nor removes energy — it simply reuses the exact implicit velocity from the previous step",
      },
      {
        vi: "Tôi nêu được lý do thật: constraint relaxation mỗi frame nắn lại vị trí theo cách không hoàn toàn bảo toàn năng lượng (nhất là với Jacobi hữu hạn vòng lặp), nên cần $d < 1$ để rò rỉ bớt phần năng lượng dư đó, chứ không phải bản thân công thức Verlet gây mất ổn định",
        en: "I can state the real reason: constraint relaxation each frame nudges positions in a way that isn't perfectly energy-conserving (especially Jacobi with a finite iteration count), so $d < 1$ is needed to bleed off that extra energy — the Verlet formula itself isn't the source of instability",
      },
    ],
    solutionCode: `// implicit velocity: x_t - x_(t-1) = 2.000 - 2.020 = -0.020
// damped velocity term: -0.020 * 0.98 = -0.0196
// dt^2 = (1/60)^2 ~= 0.00027778
// accel term: -9.8 * 0.00027778 ~= -0.0027222
//
// x_(t+1).y = 2.000 + (-0.0196) + (-0.0027222) ~= 1.9776778
//           ~= 1.9777 (4 decimal places)
//
// With d = 1, the integration step alone is energy-neutral: it just
// carries the previous step's implicit velocity forward unchanged aside
// from acceleration. The actual energy gain comes from constraint
// relaxation nudging positions afterward — a finite-iteration Jacobi pass
// isn't a perfectly energy-conserving operation, so each frame's
// relaxation can inject a small amount of numerical energy. d < 1 bleeds
// that leftover energy back out, which is why cloth settles instead of
// slowly gaining energy and oscillating forever.`,
  },
  {
    id: "add-bend-constraints",
    kind: "code",
    prompt: {
      vi: `Bài lý thuyết nói: thêm constraint bend chỉ là lặp lại đúng khuôn mẫu \`correction()\` với offset gấp đôi. Hoàn thành hàm \`main()\` bên dưới (trích từ pass relax của bài) bằng cách thêm 4 lời gọi \`correction()\` cho bend constraint — nối mỗi điểm với 4 hàng xóm CÁCH HAI bước lưới theo trục ngang/dọc (bỏ qua điểm ở giữa), dùng \`uRestBend\` làm chiều dài nghỉ. Nhớ cộng \`hit\` vào \`count\` sau mỗi lời gọi, giống structural/shear đã có.`,
      en: `The theory lesson says adding a bend constraint is just repeating the \`correction()\` pattern with a doubled offset. Complete the \`main()\` function below (excerpted from this lesson's relax pass) by adding 4 \`correction()\` calls for the bend constraint — linking each point to its 4 neighbors TWO grid steps away along the horizontal/vertical axes (skipping the point in between), using \`uRestBend\` as the rest length. Remember to add \`hit\` into \`count\` after each call, same as structural/shear already do.`,
    },
    starterCode: `uniform sampler2D uPosition;
uniform sampler2D uInitial;
uniform vec2 uTexel;
uniform float uRestStructural;
uniform float uRestShear;
uniform float uRestBend;

vec3 correction(vec3 self, vec2 uv, vec2 offset, float restLen, out float hit) {
  vec2 nUv = uv + offset;
  if (nUv.x < 0.0 || nUv.x > 1.0 || nUv.y < 0.0 || nUv.y > 1.0) {
    hit = 0.0;
    return vec3(0.0);
  }
  vec3 neighbor = texture2D(uPosition, nUv).xyz;
  vec3 delta = neighbor - self;
  float dist = length(delta);
  hit = 1.0;
  if (dist < 1e-5) return vec3(0.0);
  return delta * ((dist - restLen) / dist) * 0.5;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 initial = texture2D(uInitial, uv);
  vec4 data = texture2D(uPosition, uv);
  vec3 pos = data.xyz;

  if (initial.w > 0.5) {
    gl_FragColor = vec4(initial.xyz, data.w);
    return;
  }

  vec3 sum = vec3(0.0);
  float count = 0.0;
  float hit;

  // structural (up/down/left/right) — given, working
  sum += correction(pos, uv, vec2(uTexel.x, 0.0), uRestStructural, hit); count += hit;
  sum += correction(pos, uv, vec2(-uTexel.x, 0.0), uRestStructural, hit); count += hit;
  sum += correction(pos, uv, vec2(0.0, uTexel.y), uRestStructural, hit); count += hit;
  sum += correction(pos, uv, vec2(0.0, -uTexel.y), uRestStructural, hit); count += hit;

  // shear (4 diagonals) — given, working
  sum += correction(pos, uv, vec2(uTexel.x, uTexel.y), uRestShear, hit); count += hit;
  sum += correction(pos, uv, vec2(-uTexel.x, uTexel.y), uRestShear, hit); count += hit;
  sum += correction(pos, uv, vec2(uTexel.x, -uTexel.y), uRestShear, hit); count += hit;
  sum += correction(pos, uv, vec2(-uTexel.x, -uTexel.y), uRestShear, hit); count += hit;

  // TODO: bend — 4 neighbors TWO texels away (up/down/left/right), using
  // uRestBend as the rest length. Same correction()/count pattern as above.

  vec3 corrected = count > 0.0 ? pos + sum / count : pos;
  gl_FragColor = vec4(corrected, data.w);
}`,
    solutionCode: `uniform sampler2D uPosition;
uniform sampler2D uInitial;
uniform vec2 uTexel;
uniform float uRestStructural;
uniform float uRestShear;
uniform float uRestBend;

vec3 correction(vec3 self, vec2 uv, vec2 offset, float restLen, out float hit) {
  vec2 nUv = uv + offset;
  if (nUv.x < 0.0 || nUv.x > 1.0 || nUv.y < 0.0 || nUv.y > 1.0) {
    hit = 0.0;
    return vec3(0.0);
  }
  vec3 neighbor = texture2D(uPosition, nUv).xyz;
  vec3 delta = neighbor - self;
  float dist = length(delta);
  hit = 1.0;
  if (dist < 1e-5) return vec3(0.0);
  return delta * ((dist - restLen) / dist) * 0.5;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 initial = texture2D(uInitial, uv);
  vec4 data = texture2D(uPosition, uv);
  vec3 pos = data.xyz;

  if (initial.w > 0.5) {
    gl_FragColor = vec4(initial.xyz, data.w);
    return;
  }

  vec3 sum = vec3(0.0);
  float count = 0.0;
  float hit;

  sum += correction(pos, uv, vec2(uTexel.x, 0.0), uRestStructural, hit); count += hit;
  sum += correction(pos, uv, vec2(-uTexel.x, 0.0), uRestStructural, hit); count += hit;
  sum += correction(pos, uv, vec2(0.0, uTexel.y), uRestStructural, hit); count += hit;
  sum += correction(pos, uv, vec2(0.0, -uTexel.y), uRestStructural, hit); count += hit;

  sum += correction(pos, uv, vec2(uTexel.x, uTexel.y), uRestShear, hit); count += hit;
  sum += correction(pos, uv, vec2(-uTexel.x, uTexel.y), uRestShear, hit); count += hit;
  sum += correction(pos, uv, vec2(uTexel.x, -uTexel.y), uRestShear, hit); count += hit;
  sum += correction(pos, uv, vec2(-uTexel.x, -uTexel.y), uRestShear, hit); count += hit;

  // bend — same correction()/count pattern, offset doubled, uRestBend
  sum += correction(pos, uv, vec2(uTexel.x * 2.0, 0.0), uRestBend, hit); count += hit;
  sum += correction(pos, uv, vec2(-uTexel.x * 2.0, 0.0), uRestBend, hit); count += hit;
  sum += correction(pos, uv, vec2(0.0, uTexel.y * 2.0), uRestBend, hit); count += hit;
  sum += correction(pos, uv, vec2(0.0, -uTexel.y * 2.0), uRestBend, hit); count += hit;

  vec3 corrected = count > 0.0 ? pos + sum / count : pos;
  gl_FragColor = vec4(corrected, data.w);
}`,
    hints: [
      {
        vi: "Offset bend chỉ là offset structural nhân đôi: \`vec2(uTexel.x * 2.0, 0.0)\` thay vì \`vec2(uTexel.x, 0.0)\` — bốn hướng còn lại (trái/lên/xuống) làm tương tự.",
        en: "A bend offset is just the structural offset doubled: \`vec2(uTexel.x * 2.0, 0.0)\` instead of \`vec2(uTexel.x, 0.0)\` — the other three directions (left/up/down) follow the same pattern.",
      },
      {
        vi: "Đừng quên \`count += hit;\` sau MỖI lời gọi correction() mới — thiếu dòng này, texel gần biên (nơi hàng xóm bend nằm ngoài lưới) sẽ chia trung bình sai vì count không khớp số hạng đã cộng vào sum.",
        en: "Don't forget \`count += hit;\` after EVERY new correction() call — skip it and edge texels (where a bend neighbor falls outside the grid) average incorrectly, since count won't match the number of terms actually added to sum.",
      },
    ],
    checklist: [
      {
        vi: "4 lời gọi correction() mới dùng offset gấp đôi structural (±2·uTexel.x, ±2·uTexel.y) và uRestBend làm restLen",
        en: "The 4 new correction() calls use structural offsets doubled (±2·uTexel.x, ±2·uTexel.y) and uRestBend as restLen",
      },
      {
        vi: "count += hit theo sau đúng mỗi lời gọi correction() mới, không thiếu dòng nào",
        en: "count += hit follows every new correction() call, none skipped",
      },
      {
        vi: "Texel ở hai hàng/cột gần biên (nơi hàng xóm bend cách 2 bước rơi ra ngoài lưới) không NaN hay giật — nhờ nhánh out-of-range có sẵn trong correction()",
        en: "Texels in the two rows/columns near the edge (where a bend neighbor 2 steps away falls off the grid) don't NaN or glitch — thanks to correction()'s existing out-of-range branch",
      },
    ],
  },
];
