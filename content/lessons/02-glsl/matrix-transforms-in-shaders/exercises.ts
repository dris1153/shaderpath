import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "column-major-rotation-direction",
    kind: "concept",
    prompt: {
      vi: `Cho đoạn GLSL sau:

\`\`\`glsl
mat2 m = mat2(0.0, 1.0, -1.0, 0.0);
vec2 p2 = m * vec2(1.0, 0.0);
\`\`\`

Nhớ rằng \`mat2(a, b, c, d)\` điền theo CỘT: cột 0 là \`(a, b)\`, cột 1 là \`(c, d)\`. Tính tay giá trị \`p2\`, rồi xác định \`m\` tương ứng với phép xoay bao nhiêu độ và theo chiều nào (trục X sang phải, Y hướng lên).

Sau đó: nếu người viết ĐỊNH xoay $90°$ ngược kim đồng hồ nhưng liệt kê 4 số của $R(90°)$ theo thứ tự đọc trên giấy (hàng trước, hàng sau) rồi gõ thẳng vào \`mat2()\`, họ sẽ tạo ra ma trận nào — và ma trận đó thực sự xoay bao nhiêu độ, theo chiều nào?`,
      en: `Given this GLSL:

\`\`\`glsl
mat2 m = mat2(0.0, 1.0, -1.0, 0.0);
vec2 p2 = m * vec2(1.0, 0.0);
\`\`\`

Recall \`mat2(a, b, c, d)\` fills by COLUMN: column 0 is \`(a, b)\`, column 1 is \`(c, d)\`. Compute \`p2\` by hand, then determine what rotation angle \`m\` represents and which direction (X pointing right, Y pointing up).

Then: if someone MEANT to rotate $90°$ counter-clockwise but listed $R(90°)$'s four numbers in paper reading order (row by row) and typed that straight into \`mat2()\`, what matrix would they actually build — and what angle and direction does that matrix really rotate by?`,
    },
    hints: [
      {
        vi: "Cột 0 của m là ảnh của basis vector (1,0) sau biến đổi — chính là m * vec2(1,0). Đọc thẳng từ hai tham số đầu của constructor.",
        en: "Column 0 of m is the image of the basis vector (1,0) after the transform — literally m * vec2(1,0). Read it straight off the constructor's first two args.",
      },
      {
        vi: "Ma trận xoay chuẩn R(θ) có cột 0 = (cosθ, sinθ). So khớp (0, 1) với (cosθ, sinθ) để suy ra θ.",
        en: "The standard rotation matrix R(θ) has column 0 = (cosθ, sinθ). Match (0, 1) against that to solve for θ.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng p2 = (0.0, 1.0) — bằng đúng cột 0 của m",
        en: "I computed p2 = (0.0, 1.0) correctly — exactly column 0 of m",
      },
      {
        vi: "Tôi xác định đúng m = R(90°) — xoay 90° ngược kim đồng hồ",
        en: "I correctly identified m = R(90°) — a 90° counter-clockwise rotation",
      },
      {
        vi: "Tôi chỉ ra được gõ nhầm hàng-thành-cột cho mat2(0,-1,1,0) = R(-90°), tức xoay NGƯỢC chiều mong muốn",
        en: "I showed that the row-typo mistake yields mat2(0,-1,1,0) = R(-90°), rotating the OPPOSITE direction from intended",
      },
    ],
    solutionNote: {
      vi: `$p_2 = m \\times \\mathrm{vec2}(1,0) = $ cột 0 của $m$ $= (0.0, 1.0)$. So khớp với cột 0 của $R(\\theta) = (\\cos\\theta, \\sin\\theta)$: $\\cos\\theta = 0$, $\\sin\\theta = 1$ → $\\theta = 90^\\circ$ → $m$ chính là $R(90^\\circ)$: xoay $90^\\circ$ NGƯỢC chiều kim đồng hồ (X phải, Y lên).

Gõ nhầm hàng-thành-cột cho $R(90^\\circ)$: liệt kê 4 số theo thứ tự đọc trên giấy $(\\cos 90^\\circ, -\\sin 90^\\circ, \\sin 90^\\circ, \\cos 90^\\circ) = (0, -1, 1, 0)$, nhét thẳng vào \`mat2()\` → \`mat2(0.0, -1.0, 1.0, 0.0)\` — GLSL đọc thành cột 0$=(0,-1)$, cột 1$=(1,0)$ → đây chính là $R(-90^\\circ)$: xoay $90^\\circ$ THEO chiều kim đồng hồ — NGƯỢC hướng dự định.`,
      en: `$p_2 = m \\times \\mathrm{vec2}(1,0) = $ column 0 of $m$ $= (0.0, 1.0)$. Matching that against column 0 of $R(\\theta) = (\\cos\\theta, \\sin\\theta)$: $\\cos\\theta = 0$, $\\sin\\theta = 1$ → $\\theta = 90^\\circ$ → $m$ is exactly $R(90^\\circ)$: a $90^\\circ$ counter-clockwise rotation (X right, Y up).

The row-typed-as-column mistake for $R(90^\\circ)$: listing the 4 numbers in paper reading order $(\\cos 90^\\circ, -\\sin 90^\\circ, \\sin 90^\\circ, \\cos 90^\\circ) = (0, -1, 1, 0)$ and typing that straight into \`mat2()\` → \`mat2(0.0, -1.0, 1.0, 0.0)\` — GLSL reads that as column 0$=(0,-1)$, column 1$=(1,0)$ → that's exactly $R(-90^\\circ)$: a $90^\\circ$ CLOCKWISE rotation — the OPPOSITE of what was intended.`,
    },
  },
  {
    id: "rotate-uv-around-pivot",
    kind: "shader",
    prompt: {
      vi: `Viết hàm \`rotateAroundPivot(vec2 uv, vec2 pivot, float angle)\` áp dụng đúng ba bước translate → rotate → translate-back, rồi dùng nó để vẽ một pattern caro xoay quanh tâm màn hình \`(0.5, 0.5)\` với góc lấy từ \`uTime\`. Điền vào các chỗ \`TODO\` bên dưới — \`fragColor\` là output, \`uTime\`/\`uResolution\`/\`uMouse\` đã có sẵn.`,
      en: `Write a \`rotateAroundPivot(vec2 uv, vec2 pivot, float angle)\` function that applies the three translate → rotate → translate-back steps correctly, then use it to draw a checker pattern spinning around the screen center \`(0.5, 0.5)\` with an angle driven by \`uTime\`. Fill in the \`TODO\` spots below — \`fragColor\` is the output, \`uTime\`/\`uResolution\`/\`uMouse\` are already available.`,
    },
    starterCode: `mat2 rotate2d(float a) {
  float c = cos(a);
  float s = sin(a);
  // TODO 1: return the correct column constructor: column 0 = (c, s), column 1 = (-s, c)
  return mat2(1.0, 0.0, 0.0, 1.0);
}

vec2 rotateAroundPivot(vec2 uv, vec2 pivot, float angle) {
  vec2 p = uv; // TODO 2: shift p to the origin by subtracting pivot
  p = rotate2d(angle) * p; // TODO 3: apply the rotation matrix (already given)
  return p; // TODO 4: shift p back to its original position by adding pivot
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = rotateAroundPivot(uv, vec2(0.5), uTime * 0.5);

  vec2 cell = floor(p * 6.0);
  float parity = mod(cell.x + cell.y, 2.0);
  vec3 color = mix(vec3(0.95, 0.5, 0.2), vec3(0.08, 0.1, 0.18), parity);
  fragColor = vec4(color, 1.0);
}`,
    solutionCode: `mat2 rotate2d(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

vec2 rotateAroundPivot(vec2 uv, vec2 pivot, float angle) {
  vec2 p = uv - pivot;
  p = rotate2d(angle) * p;
  return p + pivot;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = rotateAroundPivot(uv, vec2(0.5), uTime * 0.5);

  vec2 cell = floor(p * 6.0);
  float parity = mod(cell.x + cell.y, 2.0);
  vec3 color = mix(vec3(0.95, 0.5, 0.2), vec3(0.08, 0.1, 0.18), parity);
  fragColor = vec4(color, 1.0);
}`,
    hints: [
      {
        vi: "mat2(a,b,c,d) điền theo CỘT — cột 0 = (a,b), cột 1 = (c,d). Với R(θ), cột 0 = (cosθ, sinθ), cột 1 = (-sinθ, cosθ).",
        en: "mat2(a,b,c,d) fills by COLUMN — column 0 = (a,b), column 1 = (c,d). For R(θ), column 0 = (cosθ, sinθ), column 1 = (-sinθ, cosθ).",
      },
      {
        vi: "Thứ tự bắt buộc: trừ pivot trước, xoay, rồi CỘNG pivot lại — đảo thứ tự bước đầu/cuối sẽ xoay quanh gốc (0,0) thay vì quanh pivot.",
        en: "The order is mandatory: subtract pivot first, rotate, then ADD pivot back — swapping the first/last step rotates around the origin (0,0) instead of the pivot.",
      },
    ],
    checklist: [
      {
        vi: "rotate2d trả về đúng cột 0 = (cosθ, sinθ), cột 1 = (-sinθ, cosθ)",
        en: "rotate2d returns column 0 = (cosθ, sinθ), column 1 = (-sinθ, cosθ) correctly",
      },
      {
        vi: "Pattern caro xoay đúng quanh tâm màn hình, không lệch tâm và không văng ra ngoài khung hình",
        en: "The checker pattern spins correctly around the screen center, not off-center or swinging outside the frame",
      },
      {
        vi: "Đổi pivot thành vec2(0.0) và quan sát pattern xoay quanh góc màn hình thay vì tâm — xác nhận hiểu vai trò của pivot",
        en: "Changed pivot to vec2(0.0) and observed the pattern swing around the screen corner instead of the center — confirms understanding of pivot's role",
      },
    ],
  },
];
