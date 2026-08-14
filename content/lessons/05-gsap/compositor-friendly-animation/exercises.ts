import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "layout-thrash-frame-budget",
    kind: "concept",
    prompt: {
      vi: `Một danh sách cuộn có 150 hàng, mỗi hàng animate \`margin-left\` mỗi frame (không dùng transform). Ước lượng: mỗi lần một hàng đổi \`margin-left\`, layout engine phải tính lại trung bình 40 node anh em phía sau nó trong flow, và mỗi node bị chạm tốn khoảng $0.02\\text{ms}$.

Tính tổng chi phí layout ước lượng cho một frame khi cả 150 hàng cùng animate (worst case: mỗi hàng cộng dồn độc lập). So sánh con số đó với ngân sách $1000/60 \\approx 16.7\\text{ms}$ của một frame ở 60fps, rồi giải thích vì sao đổi toàn bộ animation này sang \`transform: translateX\` gần như xoá sạch chi phí đó — không phải giảm bớt, mà gần như bằng 0.`,
      en: `A scrolling list has 150 rows, each animating \`margin-left\` every frame (no transform). Estimate: each time a row changes \`margin-left\`, the layout engine recomputes an average of 40 sibling nodes following it in flow, and each touched node costs about $0.02\\text{ms}$.

Compute the estimated total layout cost for one frame when all 150 rows animate simultaneously (worst case: each row's cost adds independently). Compare that number against a 60fps frame budget of $1000/60 \\approx 16.7\\text{ms}$, then explain why switching this entire animation to \`transform: translateX\` nearly erases that cost — not just reduces it, but brings it close to zero.`,
    },
    hints: [
      {
        vi: "Nhân số hàng đang animate với số node bị chạm mỗi lần thay đổi, rồi nhân với chi phí ước lượng mỗi node — không cộng gộp gì thêm.",
        en: "Multiply the number of animating rows by the number of nodes touched per change, then by the estimated cost per node — nothing else to add.",
      },
      {
        vi: "So kết quả với ngân sách 16.7ms bằng phép chia, không phải phép trừ — tỉ lệ đó cho biết animation rớt khung hình nghiêm trọng đến mức nào, không chỉ là 'hơi giật'.",
        en: "Compare the result to the 16.7ms budget with division, not subtraction — that ratio tells you how severely this drops frames, not just that it's 'a bit janky'.",
      },
    ],
    checklist: [
      {
        vi: "Tôi tính đúng tổng chi phí layout ước lượng ≈ 150 × 40 × 0.02ms = 120ms mỗi frame",
        en: "I computed the estimated total layout cost ≈ 150 × 40 × 0.02ms = 120ms per frame correctly",
      },
      {
        vi: "Tôi so sánh được 120ms với ngân sách 16.7ms và kết luận animation này rớt khung hình nghiêm trọng (khoảng 7 lần ngân sách, tương đương dưới 10fps)",
        en: "I compared 120ms against the 16.7ms budget and concluded this animation drops frames severely (about 7x over budget, roughly sub-10fps)",
      },
      {
        vi: "Tôi giải thích được vì sao transform: translateX loại gần hết chi phí này: GPU chỉ dịch layer bitmap đã raster sẵn, không cần biết đến 40 node anh em nào cả — chi phí gần như hằng số dù animate 1 hay 1000 phần tử",
        en: "I explained why transform: translateX removes nearly all of this cost: the GPU just translates an already-rasterized layer bitmap, with no need to know about any of the 40 sibling nodes — the cost stays roughly constant whether 1 or 1000 elements animate",
      },
    ],
    solutionNote: {
      vi: `Chi phí layout ước lượng = số hàng animate × số node bị chạm mỗi lần × chi phí/node $= 150 \\times 40 \\times 0.02\\text{ms} = 120\\text{ms}$ mỗi frame.

Ngân sách 60fps $= 1000/60 \\approx 16.7\\text{ms}$ → 120ms gấp ~7.2 lần ngân sách, tương đương tụt xuống dưới 10fps trong lúc animation chạy — jank rõ rệt, không phải chỉ "hơi giật".

Đổi sang \`transform: translateX(...)\` loại gần hết chi phí layout: GPU chỉ dịch layer bitmap đã raster sẵn, không cần biết đến 40 node anh em nào cả — chi phí gần như hằng số dù animate 1 hay 1000 phần tử cùng lúc, vì compositor không lan invalidation qua containing block như layout engine.`,
      en: `Estimated layout cost = number of animating rows × nodes touched per change × cost/node $= 150 \\times 40 \\times 0.02\\text{ms} = 120\\text{ms}$ per frame.

60fps budget $= 1000/60 \\approx 16.7\\text{ms}$ → 120ms is ~7.2x over budget, equivalent to dropping below 10fps while the animation runs — clearly visible jank, not just "a bit choppy".

Switching to \`transform: translateX(...)\` removes nearly all of that layout cost: the GPU just translates an already-rasterized layer bitmap, with no need to know about any of those 40 sibling nodes — the cost stays roughly constant whether 1 or 1000 elements animate simultaneously, since the compositor never propagates invalidation through the containing block the way the layout engine does.`,
    },
  },
  {
    id: "scalex-progress-bar",
    kind: "code",
    prompt: {
      vi: `Viết hai hàm cho một progress bar chạy thuần compositor: \`initProgressBar(el)\` set neo scale một lần duy nhất, và \`setProgressCompositor(el, ratio)\` cập nhật tỉ lệ đã hoàn thành mỗi lần gọi. Không được set \`el.style.width\` ở đâu cả — đó là đường layout, không phải compositor.`,
      en: `Write two functions for a purely compositor-driven progress bar: \`initProgressBar(el)\` sets the scale anchor exactly once, and \`setProgressCompositor(el, ratio)\` updates the completed ratio on every call. Never set \`el.style.width\` anywhere — that's the layout path, not the compositor one.`,
    },
    starterCode: `function initProgressBar(el: HTMLElement): void {
  // TODO: set transform-origin exactly once, anchored to the left
  // (default is 50% 50% — center — not the left edge)
}

function setProgressCompositor(el: HTMLElement, ratio: number): void {
  // TODO: clamp ratio to [0, 1] then set el.style.transform = scaleX(...)
  // Do NOT set el.style.width here
}`,
    solutionCode: `function initProgressBar(el: HTMLElement): void {
  el.style.transformOrigin = "left center";
}

function setProgressCompositor(el: HTMLElement, ratio: number): void {
  const clamped = Math.min(1, Math.max(0, ratio));
  el.style.transform = \`scaleX(\${clamped})\`;
}`,
    hints: [
      {
        vi: "transform-origin mặc định là 50% 50% — muốn progress bar lớn dần từ mép trái như width vẫn làm, phải dịch neo scale về bên trái, và chỉ cần làm việc này một lần.",
        en: "transform-origin defaults to 50% 50% — to have the bar grow from the left edge the way width naturally does, shift the scale anchor left, and only do this once.",
      },
      {
        vi: "scaleX(0) và scaleX(1) tương ứng 0% và 100% — ratio chính là hệ số scale, không cần nhân hay chia thêm gì.",
        en: "scaleX(0) and scaleX(1) correspond to 0% and 100% — ratio IS the scale factor directly, no extra multiplication or division needed.",
      },
    ],
    checklist: [
      {
        vi: "initProgressBar chỉ set transform-origin một lần, không gọi lại mỗi frame",
        en: "initProgressBar sets transform-origin exactly once, never called again per frame",
      },
      {
        vi: "setProgressCompositor luôn clamp ratio về [0,1] trước khi dùng",
        en: "setProgressCompositor always clamps ratio to [0,1] before using it",
      },
      {
        vi: "Không có chỗ nào trong code set el.style.width",
        en: "Nowhere in the code sets el.style.width",
      },
    ],
  },
];
