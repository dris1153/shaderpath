import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "trace-a-vertex",
    kind: "concept",
    prompt: {
      vi: `Một vertex có attribute \`aPosition = (0.4, -0.2)\`. Vertex shader gán \`gl_Position = vec4(aPosition, 0.0, uW)\` với \`uW = 2.0\`. Canvas có drawing buffer $640 \\times 360$.

Không chạy code, tính tay toạ độ của đỉnh này ở ba trạm: clip space, NDC (sau perspective divide), và viewport (pixel, quy ước OpenGL gốc dưới-trái).

Sau đó giải thích bằng lời: nếu tăng \`uW\` lên trong khi giữ nguyên \`aPosition\`, điểm chiếu lên màn hình di chuyển về hướng nào, và vì sao — liên hệ với cách phép chia phối cảnh làm vật ở xa (w lớn) trông nhỏ/gần tâm màn hình hơn.`,
      en: `A vertex has attribute \`aPosition = (0.4, -0.2)\`. The vertex shader sets \`gl_Position = vec4(aPosition, 0.0, uW)\` with \`uW = 2.0\`. The canvas has a $640 \\times 360$ drawing buffer.

Without running any code, compute this vertex's coordinates by hand at three stations: clip space, NDC (after the perspective divide), and viewport (pixels, OpenGL bottom-left-origin convention).

Then explain in words: if \`uW\` increases while \`aPosition\` stays fixed, which direction does the projected point move on screen, and why — connect it to how the perspective divide makes distant objects (large w) look smaller and closer to screen center.`,
    },
    hints: [
      {
        vi: "Công thức: clip = (x, y, 0, w); NDC = clip.xyz / w. Đừng quên $w$ ở đây là 2.0, không phải 1.0 như ví dụ mặc định trong bài.",
        en: "Formula: clip = (x, y, 0, w); NDC = clip.xyz / w. Don't forget $w$ here is 2.0, not the 1.0 used in the lesson's default example.",
      },
      {
        vi: "Công thức viewport: $x_{px} = (x_{ndc} \\cdot 0.5 + 0.5) \\times \\text{canvasWidth}$, tương tự cho $y_{px}$ với canvasHeight — nhớ đây là toạ độ kiểu OpenGL (gốc dưới-trái).",
        en: "Viewport formula: $x_{px} = (x_{ndc} \\cdot 0.5 + 0.5) \\times \\text{canvasWidth}$, same shape for $y_{px}$ with canvasHeight — remember this is OpenGL-style (bottom-left origin).",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng NDC = (0.2, -0.1, 0) bằng cách chia x, y cho w = 2.0",
        en: "I correctly computed NDC = (0.2, -0.1, 0) by dividing x, y by w = 2.0",
      },
      {
        vi: "Tôi tính đúng toạ độ viewport ≈ (384, 162) px",
        en: "I correctly computed the viewport coordinate ≈ (384, 162) px",
      },
      {
        vi: "Tôi giải thích được vì sao tăng w kéo điểm lại gần tâm màn hình hơn (chia cho số lớn hơn → NDC nhỏ hơn về độ lớn)",
        en: "I explained why increasing w pulls the point closer to screen center (dividing by a larger number → smaller-magnitude NDC)",
      },
    ],
    solutionCode: `// Clip space: (x, y, 0, w) = (0.4, -0.2, 0, 2.0)
// NDC: chia x, y, z cho w → (0.4/2, -0.2/2, 0/2) = (0.2, -0.1, 0)
// Viewport (canvas 640x360, quy ước OpenGL gốc dưới-trái):
//   x_px = (0.2 * 0.5 + 0.5) * 640 = 0.6 * 640 = 384
//   y_px = (-0.1 * 0.5 + 0.5) * 360 = 0.45 * 360 = 162
//   → (384, 162) px
//
// Tăng uW trong khi x, y không đổi làm NDC = (x/w, y/w) nhỏ lại về độ lớn
// (tiến gần 0) → điểm chiếu di chuyển về TÂM màn hình. Đây chính là cơ chế
// phối cảnh: một vertex càng xa camera càng có w lớn (thường w ≈ độ sâu),
// nên bị chia mạnh hơn, trông nhỏ và gần đường chân trời hơn — "phối cảnh"
// không phải hiệu ứng vẽ tay, mà chỉ là một phép chia số học.`,
  },
  {
    id: "is-vertex-clipped",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`isVertexClipped(clip: [number, number, number, number]): boolean\` nhận vào một toạ độ clip-space \`[x, y, z, w]\` (giả định $w > 0$) và trả về \`true\` nếu đỉnh đó chắc chắn nằm ngoài view frustum ở ít nhất một trục — đúng nghi vấn thứ hai trong checklist "không thấy gì trên màn hình" của bài học.`,
      en: `Write a function \`isVertexClipped(clip: [number, number, number, number]): boolean\` that takes a clip-space coordinate \`[x, y, z, w]\` (assume $w > 0$) and returns \`true\` if that vertex definitely falls outside the view frustum on at least one axis — exactly the lesson's second "blank canvas" suspect.`,
    },
    starterCode: `function isVertexClipped(clip: [number, number, number, number]): boolean {
  const [x, y, z, w] = clip;
  // TODO: một trục bị clip khi giá trị của nó vượt quá +w hoặc dưới -w —
  // so sánh với w, KHÔNG phải với 1, vì phép chia phối cảnh chưa xảy ra.
  return false;
}`,
    solutionCode: `function isVertexClipped(clip: [number, number, number, number]): boolean {
  const [x, y, z, w] = clip;
  return Math.abs(x) > w || Math.abs(y) > w || Math.abs(z) > w;
}`,
    hints: [
      {
        vi: "Ở clip space, phép so sánh biên frustum luôn là với $\\pm w$, không phải $\\pm 1$ — phép chia để ra NDC $[-1,1]$ chỉ xảy ra ở bước sau, chưa xảy ra ở trạm này.",
        en: "In clip space, the frustum boundary check is always against $\\pm w$, not $\\pm 1$ — the divide that produces the $[-1,1]$ NDC range only happens at the next station, not this one.",
      },
      {
        vi: "Hàm này chỉ đúng cho MỘT đỉnh riêng lẻ. Một tam giác có 1-2 đỉnh bị hàm này báo \`true\` vẫn có thể hiện một phần trên màn hình — clipping thật sự hoạt động ở cấp độ tam giác, không phải cấp độ đỉnh đơn lẻ.",
        en: "This function only tells you about a single vertex in isolation. A triangle with 1-2 vertices flagged \`true\` here can still render partially — real clipping operates at the triangle level, not the single-vertex level.",
      },
    ],
    checklist: [
      {
        vi: "So sánh đúng với $w$ (không phải 1) cho cả ba trục x, y, z",
        en: "Compares against $w$ (not 1) correctly for all three of x, y, z",
      },
      {
        vi: "Trả về \`true\` khi bất kỳ trục nào vượt biên, \`false\` khi cả ba đều trong phạm vi $[-w, w]$",
        en: "Returns \`true\` when any axis exceeds the bound, \`false\` when all three stay within $[-w, w]$",
      },
      {
        vi: "Hiểu và giải thích được rằng hàm chỉ đánh giá một đỉnh, không quyết định cả tam giác có bị clip hết hay không",
        en: "Understands and can explain that the function evaluates one vertex only, not whether the whole triangle gets fully clipped",
      },
    ],
  },
];
