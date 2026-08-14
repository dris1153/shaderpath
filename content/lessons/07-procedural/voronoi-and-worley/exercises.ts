import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "border-seam-by-hand",
    kind: "concept",
    prompt: {
      vi: `Xét ô lưới $(0, 0)$ với jitter $= 1$. Pixel đang xét nằm ở toạ độ cục bộ $f = (0.9, 0.5)$ trong ô đó (sát mép phải). Điểm hạt giống của chính ô $(0,0)$ có hash $h_0 = (0.15, 0.6)$. Điểm hạt giống của ô hàng xóm bên phải $(1, 0)$ có hash $h_1 = (0.2, 0.55)$.

Không chạy code, tính khoảng cách Euclid từ pixel đến điểm hạt giống của ô mình ($r_0 = h_0 - f$) và đến điểm hạt giống của ô hàng xóm (quy về hệ toạ độ ô hiện tại: $r_1 = (1,0) + h_1 - f$). Nếu shader chỉ quét ô $(0,0)$ mà bỏ qua ô $(1,0)$, giá trị $F_1$ nó báo cáo sẽ sai bao nhiêu so với $F_1$ đúng?`,
      en: `Consider grid cell $(0, 0)$ with jitter $= 1$. The pixel under test sits at local coordinate $f = (0.9, 0.5)$ inside that cell (hugging the right edge). Cell $(0,0)$'s own feature point has hash $h_0 = (0.15, 0.6)$. The feature point of the neighboring cell $(1, 0)$ to the right has hash $h_1 = (0.2, 0.55)$.

Without running code, compute the Euclidean distance from the pixel to its own cell's feature point ($r_0 = h_0 - f$) and to the neighboring cell's feature point (expressed in the current cell's frame: $r_1 = (1,0) + h_1 - f$). If the shader only scans cell $(0,0)$ and skips cell $(1,0)$, how wrong is the $F_1$ it reports compared to the true $F_1$?`,
    },
    hints: [
      {
        vi: "r0 = h0 - f = (0.15 - 0.9, 0.6 - 0.5). r1 = (1 + 0.2 - 0.9, 0.55 - 0.5) — cộng thêm (1,0) vì điểm đó thuộc ô bên phải.",
        en: "r0 = h0 - f = (0.15 - 0.9, 0.6 - 0.5). r1 = (1 + 0.2 - 0.9, 0.55 - 0.5) — add (1,0) since that point belongs to the cell to the right.",
      },
      {
        vi: "length(r) = sqrt(rx^2 + ry^2) cho cả hai vector — so sánh trực tiếp hai con số để biết ai thực sự thắng.",
        en: "length(r) = sqrt(rx^2 + ry^2) for both vectors — compare the two numbers directly to see which one actually wins.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng r0 = (-0.75, 0.1), |r0| ≈ 0.757",
        en: "I correctly computed r0 = (-0.75, 0.1), |r0| ≈ 0.757",
      },
      {
        vi: "Tôi tính đúng r1 = (0.3, 0.05), |r1| ≈ 0.304",
        en: "I correctly computed r1 = (0.3, 0.05), |r1| ≈ 0.304",
      },
      {
        vi: "Tôi kết luận được: bỏ ô lân cận báo cáo F1 ≈ 0.757 thay vì giá trị đúng ≈ 0.304 — sai gần gấp 2.5 lần, đúng tại vùng sát biên ô",
        en: "I concluded: skipping the neighbor reports F1 ≈ 0.757 instead of the true ≈ 0.304 — nearly 2.5x off, right at the region near the cell border",
      },
    ],
    solutionCode: `// r0 = h0 - f = (0.15 - 0.9, 0.6 - 0.5) = (-0.75, 0.1)
// |r0| = sqrt(0.75^2 + 0.1^2) = sqrt(0.5725) ≈ 0.7566
//
// r1 = (1,0) + h1 - f = (1 + 0.2 - 0.9, 0.55 - 0.5) = (0.3, 0.05)
// |r1| = sqrt(0.3^2 + 0.05^2) = sqrt(0.0925) ≈ 0.3041
//
// Điểm ô hàng xóm gần hơn HẲN (0.304 < 0.757). Một shader chỉ quét ô
// (0,0) sẽ báo F1 ≈ 0.757 — sai gần 2.5 lần so với F1 đúng ≈ 0.304 —
// đúng loại lỗi tạo ra đường ráp nối lởm chởm dọc mọi biên ô.`,
  },
  {
    id: "worley-f1-in-playground",
    kind: "shader",
    prompt: {
      vi: `Trong playground (uResolution, fragColor có sẵn), hoàn thành Worley F1 noise cơ bản: một lưới $6 \\times 6$ điểm hạt giống trên màn hình, quét khối $3 \\times 3$ ô lân cận (\`i, j\` từ $-1$ đến $1$), hash mỗi ô lân cận thành một điểm jitter đầy đủ ($h \\in [0,1)$, không cần slider jitter — coi như luôn bằng 1), giữ khoảng cách Euclid nhỏ nhất vào \`f1\`, rồi xuất \`f1\` ra grayscale.`,
      en: `In the playground (uResolution, fragColor are available), complete a basic Worley F1 noise: a $6 \\times 6$ grid of feature points across the screen, scanning the full $3 \\times 3$ neighborhood (\`i, j\` from $-1$ to $1$), hashing each neighbor into a fully jittered point ($h \\in [0,1)$, treat jitter as always 1 — no slider needed), keeping the smallest Euclidean distance in \`f1\`, then outputting \`f1\` as grayscale.`,
    },
    starterCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 6.0; // 6x6 grid of feature points across the screen
  vec2 cell = floor(p);
  vec2 f = fract(p);

  float f1 = 8.0;

  // TODO: scan the 3x3 neighborhood (i, j from -1 to 1). For each neighbor:
  //   1. hash (cell + b) into a jittered point h in [0,1) — a 2D hash built
  //      from two dot()s wrapped in sin()/fract() works, same pattern as
  //      the lesson's hash2()
  //   2. r = b + h - f, d = length(r)
  //   3. f1 = min(f1, d)

  fragColor = vec4(vec3(f1), 1.0);
}`,
    solutionCode: `void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = uv * 6.0;
  vec2 cell = floor(p);
  vec2 f = fract(p);

  float f1 = 8.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 b = vec2(float(i), float(j));
      vec2 c = cell + b;
      vec2 h = fract(sin(vec2(
        dot(c, vec2(127.1, 311.7)),
        dot(c, vec2(269.5, 183.3))
      )) * 43758.5453123);
      vec2 r = b + h - f;
      float d = length(r);
      f1 = min(f1, d);
    }
  }

  fragColor = vec4(vec3(f1), 1.0);
}`,
    hints: [
      {
        vi: "b là toạ độ tương đối của ô lân cận (-1..1 mỗi trục) — điểm hạt giống của ô đó, quy về hệ toạ độ ô hiện tại, là b + h, không phải h suông.",
        en: "b is the neighbor cell's relative offset (-1..1 per axis) — that cell's feature point, in the current cell's frame, is b + h, not h alone.",
      },
      {
        vi: "f1 phải khởi tạo bằng một số đủ lớn (8.0 an toàn vì khoảng cách tối đa trong lưới 3x3 luôn < 3) trước vòng lặp, rồi chỉ giữ min() sau mỗi lần so sánh.",
        en: "f1 must start at a sufficiently large number (8.0 is safe since the max distance within a 3x3 block is always < 3) before the loop, then only ever shrink via min() after each comparison.",
      },
    ],
    checklist: [
      {
        vi: "Ảnh hiện đúng pattern tế bào Worley cổ điển — các vùng grayscale toả tròn quanh mỗi điểm hạt giống",
        en: "The image shows the classic Worley cell pattern — grayscale regions radiating out from each feature point",
      },
      {
        vi: "Không có đường ráp nối lởm chởm hay đứt gãy đột ngột tại biên ô lưới 6x6",
        en: "No jagged seams or sudden breaks appear at the 6x6 grid's cell borders",
      },
      {
        vi: "f1 luôn nằm trong khoảng hợp lý (xấp xỉ 0 đến dưới 1), không có vùng trắng xoá toàn bộ do quên cập nhật f1 trong vòng lặp",
        en: "f1 stays in a sane range (roughly 0 to just under 1), with no fully blown-out white region from forgetting to update f1 inside the loop",
      },
    ],
  },
];
