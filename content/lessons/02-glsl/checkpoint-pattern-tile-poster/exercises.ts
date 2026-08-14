import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "build-pattern-tile-poster",
    kind: "build",
    prompt: {
      vi: `Dựng một **poster fullscreen lát gạch động**, chỉ bằng GLSL của module này — SDF, tiling, ma trận và gradient.

Yêu cầu: chia màn hình thành lưới đều bằng \`fract\`/\`floor\`; mỗi ô hiện MỘT trong ít nhất 2 motif SDF khác nhau (ví dụ hình tròn và hình vuông bo góc), chọn theo cell-id; mỗi ô tự xoay theo \`uTime\` bằng \`mat2\` dựng đúng constructor cột; toàn cảnh phủ một gradient tint toàn cục; biên mỗi motif anti-alias bằng \`smoothstep\`, không răng cưa.

Gợi ý cấu trúc: \`cellId = floor(uv * N)\` để chọn motif, \`cellUv = fract(uv * N) - 0.5\` làm toạ độ cục bộ để xoay quanh tâm ô, một hàm \`hash(cellId)\` để các ô không đồng bộ hoàn toàn.`,
      en: `Build an **animated, fullscreen tiled poster**, using only this module's GLSL — SDFs, tiling, matrices and gradients.

Requirements: tile the screen into an even grid with \`fract\`/\`floor\`; each cell shows ONE of at least 2 distinct SDF motifs (e.g. a circle and a rounded box), chosen by cell-id; each cell spins on its own with \`uTime\` via a \`mat2\` built with the correct column constructor; the whole scene carries a global gradient tint; every motif's edge is anti-aliased with \`smoothstep\`, no jagged pixels.

Suggested structure: \`cellId = floor(uv * N)\` to pick the motif, \`cellUv = fract(uv * N) - 0.5\` as local coordinates to rotate around the cell's center, a \`hash(cellId)\` helper so cells don't spin in perfect sync.`,
    },
    starterCode: `float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

mat2 rotate2d(float a) {
  float c = cos(a);
  float s = sin(a);
  // TODO 1: tra ve dung constructor cot: cot 0 = (c, s), cot 1 = (-s, c)
  return mat2(1.0, 0.0, 0.0, 1.0);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  const float GRID = 6.0;
  vec2 gridUv = uv * GRID;
  // TODO 2: tinh cellId = floor(gridUv) va cellUv = fract(gridUv) - 0.5
  vec2 cellId = vec2(0.0);
  vec2 cellUv = uv;

  float h = hash(cellId);

  // TODO 3: xoay cellUv bang rotate2d(uTime * 0.6 + h * 6.2831853)
  vec2 p = cellUv;

  // TODO 4: chon motif theo parity cua cellId (circle hay box), tinh SDF d
  float parity = mod(cellId.x + cellId.y, 2.0);
  float d = sdCircle(p, 0.3);

  // TODO 5: chuyen d thanh mask anti-alias bang smoothstep (bien mem, khong rang cua)
  float mask = 1.0;

  vec3 bg = vec3(0.06, 0.07, 0.11);
  // TODO 6: dung mix(tintA, tintB, uv.x) lam gradient tint toan cuc, tron voi mask
  vec3 color = bg;

  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

mat2 rotate2d(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c); // column-major: col0=(c,s), col1=(-s,c)
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  const float GRID = 6.0;
  vec2 gridUv = uv * GRID;
  vec2 cellId = floor(gridUv);
  vec2 cellUv = fract(gridUv) - 0.5; // local coords, centered on the cell

  float h = hash(cellId); // deterministic per-cell randomness

  // Per-cell rotation: shared spin from uTime, phase offset from hash so cells desync
  float angle = uTime * 0.6 + h * 6.2831853;
  vec2 p = rotate2d(angle) * cellUv;

  // Alternate between two motifs by cell-id parity
  float parity = mod(cellId.x + cellId.y, 2.0);
  float d = parity < 0.5 ? sdCircle(p, 0.3) : sdBox(p, vec2(0.24));

  // Anti-aliased mask: smoothstep across a small, fixed edge width
  float mask = 1.0 - smoothstep(-0.015, 0.015, d);

  vec3 bg = vec3(0.06, 0.07, 0.11);
  vec3 tintA = vec3(0.95, 0.4, 0.2);
  vec3 tintB = vec3(0.2, 0.55, 0.95);
  vec3 tint = mix(tintA, tintB, uv.x); // global gradient tint across the poster
  vec3 motif = mix(tint, vec3(1.0), 0.2 * h); // per-cell brightness variation

  vec3 color = mix(bg, motif, mask);
  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "mat2(a,b,c,d) điền theo CỘT: cột 0=(a,b), cột 1=(c,d) — với R(θ), cột 0=(cosθ,sinθ), cột 1=(-sinθ,cosθ). Bài Ma trận biến đổi trong shader đã nói kỹ lỗi gõ nhầm hàng-thành-cột.",
        en: "mat2(a,b,c,d) fills by COLUMN: column 0=(a,b), column 1=(c,d) — for R(θ), column 0=(cosθ,sinθ), column 1=(-sinθ,cosθ). The Matrix Transforms lesson covered the row-typed-as-column mistake in depth.",
      },
      {
        vi: "cellId = floor(gridUv) là 'toạ độ ô'; cellUv = fract(gridUv) - 0.5 là toạ độ CỤC BỘ trong ô với tâm ô ở (0,0) — trừ 0.5 để SDF vẽ đúng tâm ô, không phải góc ô.",
        en: "cellId = floor(gridUv) is the cell's grid coordinate; cellUv = fract(gridUv) - 0.5 is the LOCAL coordinate inside the cell with the cell's center at (0,0) — subtract 0.5 so the SDF draws around the cell's center, not its corner.",
      },
      {
        vi: "smoothstep(-w, w, d) với w nhỏ (khoảng 0.01-0.02) cho viền mượt không răng cưa; đảo dấu bằng 1.0 - smoothstep(...) nếu muốn trong hình = 1, ngoài hình = 0.",
        en: "smoothstep(-w, w, d) with a small w (about 0.01-0.02) gives a smooth, jagged-free edge; flip it with 1.0 - smoothstep(...) if you want inside-the-shape = 1, outside = 0.",
      },
    ],
    checklist: [
      {
        vi: "Lưới lát gạch đều, không chồng lấn và không có khoảng trống giữa các ô",
        en: "The tile grid is even, with no overlap and no gaps between cells",
      },
      {
        vi: "Ít nhất 2 motif khác nhau (ví dụ tròn/vuông) xuất hiện xen kẽ theo cell-id",
        en: "At least 2 distinct motifs (e.g. circle/box) alternate according to cell-id",
      },
      {
        vi: "Mỗi ô tự xoay theo uTime, và các ô không đồng bộ hoàn toàn nhờ offset lấy từ hash(cellId)",
        en: "Each cell spins on uTime, and cells are not perfectly in sync thanks to the hash(cellId) offset",
      },
      {
        vi: "Ma trận xoay dùng đúng constructor cột — thử gõ sai để xác nhận cả lưới xoay ngược chiều nếu đảo cột",
        en: "The rotation matrix uses the correct column constructor — deliberately swap it to confirm the whole grid spins the wrong way if columns are reversed",
      },
      {
        vi: "Biên mỗi motif mượt, không răng cưa — kiểm tra bằng cách phóng to gần một cạnh",
        en: "Every motif's edge is smooth, no jagged pixels — verify by zooming in near an edge",
      },
      {
        vi: "Gradient tint phủ toàn cảnh, bố cục tổng thể dễ đọc chứ không rối mắt",
        en: "The gradient tint covers the whole scene, and the overall composition reads clearly instead of looking noisy",
      },
    ],
  },
];
