import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "uv-pixel-mapping",
    kind: "concept",
    prompt: {
      vi: `Một texture có kích thước $W = 512$, $H = 384$ pixel. Không chạy code, hãy tính toạ độ UV của **tâm** pixel $(x, y) = (256, 192)$ theo công thức $u = \\frac{x + 0.5}{W}$ và $v = \\frac{y + 0.5}{H}$.

Sau đó trả lời: nếu bỏ quên số hạng $0.5$ (tâm pixel), sai số của $u$ là bao nhiêu — và vì sao sai số này *nhìn thấy được* khi texture nhỏ (ví dụ 8×8) nhưng gần như vô hình khi texture 4096×4096?`,
      en: `A texture measures $W = 512$ by $H = 384$ pixels. Without running code, compute the UV coordinates of the **center** of pixel $(x, y) = (256, 192)$ using $u = \\frac{x + 0.5}{W}$ and $v = \\frac{y + 0.5}{H}$.

Then answer: if you drop the half-pixel term $0.5$, how large is the error in $u$ — and why is that error *visible* on a tiny texture (say 8×8) yet nearly invisible at 4096×4096?`,
    },
    hints: [
      {
        vi: "Thay số trực tiếp: u = (256 + 0.5) / 512. Đừng làm tròn vội — giữ đủ chữ số thập phân.",
        en: "Substitute directly: u = (256 + 0.5) / 512. Don't round early — keep the decimals.",
      },
      {
        vi: "Sai số tuyệt đối khi bỏ 0.5 là 0.5/W. Hãy so sánh đại lượng này với kích thước của MỘT texel trong không gian UV (1/W).",
        en: "The absolute error from dropping 0.5 is 0.5/W. Compare that with the size of ONE texel in UV space (1/W).",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính được u và v chính xác (u ≈ 0.500977, v ≈ 0.501302)",
        en: "I computed u and v exactly (u ≈ 0.500977, v ≈ 0.501302)",
      },
      {
        vi: "Tôi giải thích được sai số 0.5/W tương đương nửa texel",
        en: "I can explain that the 0.5/W error equals half a texel",
      },
      {
        vi: "Tôi nêu được vì sao texture càng lớn thì nửa texel càng khó thấy",
        en: "I can state why half a texel becomes invisible as textures grow",
      },
    ],
    solutionCode: `// u = (256 + 0.5) / 512  = 256.5 / 512 ≈ 0.500977
// v = (192 + 0.5) / 384  = 192.5 / 384 ≈ 0.501302
//
// Bỏ 0.5 → u' = 0.5 đúng ranh giới giữa 2 texel, lệch 0.5/W = 1/1024
// (nửa texel). Trên texture 8×8, nửa texel = 1/16 UV — lệch hẳn sang màu
// texel bên cạnh khi lọc NEAREST. Trên 4096×4096, nửa texel = 1/8192 UV,
// nhỏ hơn 1 pixel màn hình nên mắt không phân biệt được.`,
  },
  {
    id: "normalize-canvas-coords",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`normalizeMouse\` nhận sự kiện chuột và canvas, trả về toạ độ trong **hai** hệ: \`uv\` trong $[0, 1]^2$ (gốc dưới-trái, trục v hướng lên như WebGL) và \`ndc\` trong $[-1, 1]^2$. Code phải đúng khi canvas bị CSS scale (dùng \`getBoundingClientRect\`, không dùng \`canvas.width\`).`,
      en: `Write a \`normalizeMouse\` function taking a mouse event and a canvas, returning coordinates in **two** spaces: \`uv\` in $[0, 1]^2$ (bottom-left origin, v pointing up like WebGL) and \`ndc\` in $[-1, 1]^2$. It must stay correct when the canvas is CSS-scaled (use \`getBoundingClientRect\`, not \`canvas.width\`).`,
    },
    starterCode: `interface Normalized {
  uv: [number, number];   // [0,1]², v hướng lên / v points up
  ndc: [number, number];  // [-1,1]²
}

function normalizeMouse(
  e: { clientX: number; clientY: number },
  canvas: HTMLCanvasElement,
): Normalized {
  const rect = canvas.getBoundingClientRect();
  // TODO: tính u, v (nhớ lật trục y!) rồi suy ra ndc từ uv
  return { uv: [0, 0], ndc: [0, 0] };
}`,
    solutionCode: `function normalizeMouse(
  e: { clientX: number; clientY: number },
  canvas: HTMLCanvasElement,
): Normalized {
  const rect = canvas.getBoundingClientRect();
  const u = (e.clientX - rect.left) / rect.width;
  // clientY tăng XUỐNG dưới, còn v của WebGL tăng LÊN trên → lật trục
  const v = 1 - (e.clientY - rect.top) / rect.height;
  // NDC là phép remap tuyến tính [0,1] → [-1,1]: nhân 2 trừ 1
  return { uv: [u, v], ndc: [u * 2 - 1, v * 2 - 1] };
}`,
    hints: [
      {
        vi: "clientX/clientY là toạ độ viewport — trừ rect.left/rect.top trước, rồi chia cho rect.width/height (KHÔNG phải canvas.width).",
        en: "clientX/clientY are viewport coordinates — subtract rect.left/rect.top first, then divide by rect.width/height (NOT canvas.width).",
      },
      {
        vi: "Trục y của chuột hướng xuống, trục v của WebGL hướng lên: v = 1 - y/height. Còn [0,1] → [-1,1] chỉ là *2 - 1.",
        en: "Mouse y points down, WebGL v points up: v = 1 - y/height. And [0,1] → [-1,1] is just *2 - 1.",
      },
    ],
    checklist: [
      {
        vi: "uv trả về đúng [0,1]² với v = 1 tại mép trên canvas (đã lật trục so với toạ độ chuột)",
        en: "uv lands in [0,1]² with v = 1 at the top edge of the canvas (axis flipped from mouse space)",
      },
      {
        vi: "ndc = uv * 2 - 1 cho cả hai thành phần",
        en: "ndc = uv * 2 - 1 for both components",
      },
      {
        vi: "Kết quả không đổi khi canvas bị CSS scale (thử style.width = 50%)",
        en: "Results stay correct when the canvas is CSS-scaled (try style.width = 50%)",
      },
    ],
  },
];
