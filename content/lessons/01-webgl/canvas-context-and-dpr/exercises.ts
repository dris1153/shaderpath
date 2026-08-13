import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "canvas-buffer-size-math",
    kind: "concept",
    prompt: {
      vi: `Một canvas có CSS size $800 \\times 450$ px (đo bằng \`clientWidth\`/\`clientHeight\`). Màn hình hiển thị nó có \`devicePixelRatio = 2\`. Không chạy code, hãy tính kích thước drawing buffer bằng công thức $\\text{buffer} = \\operatorname{round}(\\text{clientSize} \\times \\text{dpr})$.

Sau đó trả lời: buffer ở dpr $2$ có bao nhiêu pixel so với buffer ở dpr $1$ (cùng CSS size) — và vì sao tỉ lệ đó là $\\text{dpr}^2$ chứ không phải $\\text{dpr}$?`,
      en: `A canvas has CSS size $800 \\times 450$ px (measured via \`clientWidth\`/\`clientHeight\`). The screen showing it reports \`devicePixelRatio = 2\`. Without running code, compute the drawing buffer size using $\\text{buffer} = \\operatorname{round}(\\text{clientSize} \\times \\text{dpr})$.

Then answer: how many pixels does the dpr $2$ buffer have compared to a dpr $1$ buffer at the same CSS size — and why is that ratio $\\text{dpr}^2$ rather than $\\text{dpr}$?`,
    },
    hints: [
      {
        vi: "Thay số trực tiếp: width = round(800 × 2) = 1600, height = round(450 × 2) = 900.",
        en: "Substitute directly: width = round(800 × 2) = 1600, height = round(450 × 2) = 900.",
      },
      {
        vi: "Tổng pixel = width × height. So sánh 1600×900 với 800×450 — cả hai chiều đều nhân dpr riêng biệt, nên tổng diện tích nhân dpr².",
        en: "Total pixels = width × height. Compare 1600×900 with 800×450 — both dimensions are independently multiplied by dpr, so the total area is multiplied by dpr².",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng buffer = 1600×900",
        en: "I computed buffer = 1600×900 correctly",
      },
      {
        vi: "Tôi tính đúng tổng pixel: 1.440.000 (dpr=2) so với 360.000 (dpr=1)",
        en: "I computed the total pixel counts correctly: 1,440,000 (dpr=2) vs 360,000 (dpr=1)",
      },
      {
        vi: "Tôi giải thích được vì sao tỉ lệ là dpr² — cả chiều rộng lẫn chiều cao đều nhân dpr",
        en: "I can explain why the ratio is dpr² — both width and height are each multiplied by dpr",
      },
    ],
    solutionCode: `// buffer.width  = round(800 * 2) = 1600
// buffer.height = round(450 * 2) = 900
//
// Tổng pixel dpr=2: 1600 * 900 = 1.440.000
// Tổng pixel dpr=1:  800 * 450 =   360.000
// Tỉ lệ: 1.440.000 / 360.000 = 4 = 2²
//
// dpr nhân riêng từng chiều (width *= dpr, height *= dpr), nên diện tích
// (width * height) nhân dpr * dpr = dpr² — không phải dpr đơn thuần.`,
  },
  {
    id: "correct-resize-routine",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`resizeCanvasToDisplaySize\` nhận một \`HTMLCanvasElement\`, một \`WebGL2RenderingContext\`, và một trần DPR tối đa \`dprCap\`. Hàm phải tính buffer size bằng $\\operatorname{round}(\\text{clientSize} \\times \\min(\\text{devicePixelRatio}, \\text{dprCap}))$, chỉ gán lại \`canvas.width\`/\`height\` và gọi \`gl.viewport\` khi kích thước thực sự đổi, rồi trả về \`true\`/\`false\` cho biết có resize hay không.`,
      en: `Write a \`resizeCanvasToDisplaySize\` function taking an \`HTMLCanvasElement\`, a \`WebGL2RenderingContext\`, and a maximum DPR cap \`dprCap\`. It must compute the buffer size as $\\operatorname{round}(\\text{clientSize} \\times \\min(\\text{devicePixelRatio}, \\text{dprCap}))$, only reassign \`canvas.width\`/\`height\` and call \`gl.viewport\` when the size actually changed, and return \`true\`/\`false\` indicating whether it resized.`,
    },
    starterCode: `function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  dprCap: number,
): boolean {
  // TODO 1: dpr = min(devicePixelRatio hiện tại, dprCap) — nhớ fallback || 1
  // TODO 2: width/height = round(clientWidth/clientHeight * dpr)
  // TODO 3: chỉ gán canvas.width/height + gọi gl.viewport khi size đổi
  // TODO 4: trả về true nếu đã resize, false nếu không
  return false;
}`,
    solutionCode: `function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  dprCap: number,
): boolean {
  const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
  const width = Math.round(canvas.clientWidth * dpr);
  const height = Math.round(canvas.clientHeight * dpr);
  const changed = canvas.width !== width || canvas.height !== height;
  if (changed) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
  return changed;
}`,
    hints: [
      {
        vi: "window.devicePixelRatio có thể undefined trên môi trường cũ — dùng `|| 1` để có giá trị mặc định an toàn trước khi Math.min.",
        en: "window.devicePixelRatio can be undefined in older environments — use `|| 1` for a safe default before Math.min.",
      },
      {
        vi: "So sánh canvas.width/height hiện tại (số nguyên đã làm tròn từ lần resize trước) với width/height mới tính — chỉ gán lại khi khác nhau.",
        en: "Compare the current canvas.width/height (rounded integers from the last resize) against the newly computed width/height — only reassign when they differ.",
      },
    ],
    checklist: [
      {
        vi: "dpr được clamp đúng bằng Math.min(devicePixelRatio || 1, dprCap)",
        en: "dpr is correctly clamped with Math.min(devicePixelRatio || 1, dprCap)",
      },
      {
        vi: "width/height dùng Math.round, không phải Math.floor hay ép kiểu number trực tiếp",
        en: "width/height use Math.round, not Math.floor or a direct numeric cast",
      },
      {
        vi: "gl.viewport chỉ được gọi khi canvas.width/height thực sự đổi, không gọi mỗi lần hàm chạy",
        en: "gl.viewport is only called when canvas.width/height actually changed, not on every function call",
      },
    ],
  },
];
