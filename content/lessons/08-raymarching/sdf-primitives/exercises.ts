import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "box-sdf-inside-and-outside-by-hand",
    kind: "concept",
    prompt: {
      vi: `Một box SDF tâm gốc, nửa-cạnh $b = (0.5, 0.3, 0.5)$: $d(p) = \\|\\max(q, 0)\\| + \\min(\\max(q_x, q_y, q_z), 0)$ với $q = |p| - b$ (trừ theo từng thành phần). Không chạy code, tính tay $d(p)$ tại hai điểm: $p_1 = (0.6, 0.1, 0.0)$ (ngoài hộp) và $p_2 = (0.2, 0.1, 0.1)$ (trong hộp).

Với $p_2$, hãy chỉ rõ: trong ba trục X, Y, Z, trục nào quyết định giá trị $d(p_2)$ — và giải thích bằng lời vì sao chính trục đó, không phải hai trục còn lại, là trục "gần biên nhất".`,
      en: `A box SDF centered at the origin, half-extents $b = (0.5, 0.3, 0.5)$: $d(p) = \\|\\max(q, 0)\\| + \\min(\\max(q_x, q_y, q_z), 0)$ where $q = |p| - b$ (componentwise). Without running code, hand-compute $d(p)$ at two points: $p_1 = (0.6, 0.1, 0.0)$ (outside the box) and $p_2 = (0.2, 0.1, 0.1)$ (inside the box).

For $p_2$, state which of the three axes X, Y, Z determines $d(p_2)$'s value — and explain in words why that axis, not the other two, is the "closest to a face."`,
    },
    hints: [
      {
        vi: "Tính $q = |p| - b$ cho từng điểm trước, rồi mới xác định số hạng nào của công thức khác 0.",
        en: "Compute $q = |p| - b$ for each point first, then figure out which term of the formula is actually nonzero.",
      },
      {
        vi: "Với điểm nằm trong hộp, cả ba thành phần của $q$ đều âm — $\\max(q_x, q_y, q_z)$ chọn ra thành phần ÍT ÂM NHẤT, tức trục còn ít khoảng trống nhất tới biên.",
        en: "For a point inside the box, all three components of $q$ are negative — $\\max(q_x, q_y, q_z)$ picks the LEAST negative one, i.e. the axis with the smallest remaining margin to a face.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng $d(p_1) \\approx 0.1$ cho điểm ngoài hộp",
        en: "I correctly computed $d(p_1) \\approx 0.1$ for the outside point",
      },
      {
        vi: "Tôi tính đúng $d(p_2) = -0.2$ cho điểm trong hộp",
        en: "I correctly computed $d(p_2) = -0.2$ for the inside point",
      },
      {
        vi: "Tôi giải thích được vì sao trục Y (không phải X hay Z) quyết định $d(p_2)$",
        en: "I can explain why the Y axis (not X or Z) determines $d(p_2)$",
      },
    ],
    solutionCode: `// p1 = (0.6, 0.1, 0.0), b = (0.5, 0.3, 0.5)
// q = |p1| - b = (0.1, -0.2, -0.5)
// max(q, 0) = (0.1, 0, 0)         -> length = 0.1
// max(q.x, q.y, q.z) = max(0.1, -0.2, -0.5) = 0.1 (>0)
// min(0.1, 0) = 0
// d(p1) = 0.1 + 0 = 0.1  -> ngoài hộp đúng 0.1 đơn vị theo trục X
//
// p2 = (0.2, 0.1, 0.1), b = (0.5, 0.3, 0.5)
// q = |p2| - b = (-0.3, -0.2, -0.4)
// max(q, 0) = (0, 0, 0)           -> length = 0
// max(q.x, q.y, q.z) = max(-0.3, -0.2, -0.4) = -0.2  -> Y quyết định
// min(-0.2, 0) = -0.2
// d(p2) = 0 + (-0.2) = -0.2  -> trong hộp, cách mặt gần nhất 0.2 đơn vị
//
// Trục Y thắng vì còn b.y - |p2.y| = 0.3 - 0.1 = 0.2 là khoảng cách BÉ
// NHẤT tới một mặt trong ba trục (X còn 0.3, Z còn 0.4) -- max() luôn
// chọn đúng trục "chật" nhất, đúng định nghĩa "gần biên nhất".`,
  },
  {
    id: "capsule-2d-contour-follows-mouse",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uTime, uResolution, uMouse, fragColor có sẵn), cài đặt phiên bản 2D của \`sdCapsule\`: đoạn thẳng từ $a$ đến $b$, bán kính $r$. Cố định $a = (-0.25, 0.0)$ (đã dịch tâm về gốc), cho đầu $b$ bám theo \`uMouse\` (cũng dịch về gốc), $r = 0.08$. Dùng banded coloring đã học (\`sign(d)\`, \`exp(-abs(d))\`, \`cos\`) để vẽ contour, kiểm chứng bằng mắt rằng cả hai đầu capsule đều tròn đều, không vuông góc.`,
      en: `In the playground (uTime, uResolution, uMouse, fragColor are all available), implement the 2D version of \`sdCapsule\`: a segment from $a$ to $b$, radius $r$. Fix $a = (-0.25, 0.0)$ (already centered at the origin), let endpoint $b$ follow \`uMouse\` (also centered), $r = 0.08$. Use the banded coloring technique (\`sign(d)\`, \`exp(-abs(d))\`, \`cos\`) to draw the contour, and visually verify both capsule ends are round, not square.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv - 0.5;

  vec2 a = vec2(-0.25, 0.0);
  vec2 b = uMouse - 0.5; // đầu B bám theo chuột
  float r = 0.08;

  // TODO 1: pa = p - a, ba = b - a
  vec2 pa = vec2(0.0);
  vec2 ba = vec2(0.0);

  // TODO 2: h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0)
  // (đây chính là công thức chiếu từ Track 0, kẹp vào đoạn [a,b])
  float h = 0.0;

  // TODO 3: d = length(pa - ba*h) - r
  float d = 0.0;

  vec3 col = vec3(1.0) - sign(d) * vec3(0.1, 0.4, 0.7);
  col *= 1.0 - exp(-3.0 * abs(d));
  col *= 0.8 + 0.2 * cos(140.0 * d);
  col = mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.015, abs(d)));

  fragColor = vec4(col, 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv - 0.5;

  vec2 a = vec2(-0.25, 0.0);
  vec2 b = uMouse - 0.5;
  float r = 0.08;

  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  float d = length(pa - ba * h) - r;

  vec3 col = vec3(1.0) - sign(d) * vec3(0.1, 0.4, 0.7);
  col *= 1.0 - exp(-3.0 * abs(d));
  col *= 0.8 + 0.2 * cos(140.0 * d);
  col = mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.015, abs(d)));

  fragColor = vec4(col, 1.0);
}`,
    hints: [
      {
        vi: "`h` chính là công thức chiếu (projection) đã học ở Track 0 — chỉ thêm `clamp(...,0.0,1.0)` để kẹp điểm chiếu vào bên trong đoạn `[a,b]`, không cho nó chạy ra ngoài hai đầu.",
        en: "`h` is exactly the projection formula from Track 0 — just add `clamp(...,0.0,1.0)` to keep the projected point inside segment `[a,b]`, not past either end.",
      },
      {
        vi: "Khi `h = 0`, điểm gần nhất trên đoạn là `a`; khi `h = 1`, đó là `b` — trừ `r` ở cuối biến 'khoảng cách tới đoạn thẳng' thành 'khoảng cách tới capsule', tự động bo tròn cả hai đầu.",
        en: "When `h = 0`, the closest point on the segment is `a`; when `h = 1`, it's `b` — subtracting `r` at the end turns 'distance to the segment' into 'distance to the capsule', automatically rounding both ends.",
      },
    ],
    checklist: [
      {
        vi: "Kéo chuột quanh màn hình, đầu B của capsule bám đúng theo vị trí chuột",
        en: "Moving the mouse around, capsule endpoint B correctly follows the cursor",
      },
      {
        vi: "Hai đầu capsule tròn đều (không có góc vuông) nhờ phần `- r` sau `length(...)`",
        en: "Both capsule ends are round (no square corners) thanks to the `- r` after `length(...)`",
      },
      {
        vi: "Các dải contour hiện đối xứng đều quanh toàn bộ biên capsule, kể cả ở hai đầu tròn",
        en: "Contour bands appear evenly symmetric around the entire capsule boundary, including the rounded ends",
      },
    ],
  },
];
