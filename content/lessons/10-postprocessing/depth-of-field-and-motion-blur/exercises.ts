import type { Exercise } from "../../../types";

export const exercises: Exercise[] = [
  {
    id: "dof-linear-approximation",
    kind: "concept",
    prompt: {
      vi: `Một cảnh có \`focus = 10\`, \`aperture = 0.02\`, \`maxblur = 0.15\` (đúng convention của \`BokehPass\`). Điểm $A$ nằm ở depth (view-space, đơn vị world) $= 4$, điểm $B$ ở depth $= 25$.

Dùng công thức xấp xỉ tuyến tính \`blur = clamp((focus - depth) * aperture, -maxblur, maxblur)\`, tính giá trị \`blur\` cho cả $A$ và $B$ (giữ cả dấu). Sau đó giải thích: dấu của kết quả nói lên điều gì về vị trí của điểm so với mặt phẳng lấy nét — và vì sao \`clamp\` ở đây bắt buộc phải có \`maxblur\` chứ không chỉ \`0\`.`,
      en: `A scene has \`focus = 10\`, \`aperture = 0.02\`, \`maxblur = 0.15\` (matching \`BokehPass\`'s own convention). Point $A$ sits at view-space depth $= 4$, point $B$ at depth $= 25$.

Using the linear approximation \`blur = clamp((focus - depth) * aperture, -maxblur, maxblur)\`, compute \`blur\` for both $A$ and $B$ (keep the sign). Then explain: what does the sign of the result tell you about where that point sits relative to the focal plane — and why must the \`clamp\` here bound by \`maxblur\` on both sides rather than just clamping at \`0\`?`,
    },
    hints: [
      {
        vi: "Với A: (10 - 4) * 0.02 = 0.12, nằm trong [-0.15, 0.15] nên không bị clamp. Với B: (10 - 25) * 0.02 = -0.30, vượt maxblur nên bị kẹp về -0.15.",
        en: "For A: (10 - 4) * 0.02 = 0.12, inside [-0.15, 0.15] so it's not clamped. For B: (10 - 25) * 0.02 = -0.30, exceeds maxblur so it clamps to -0.15.",
      },
      {
        vi: "focus - depth dương nghĩa là điểm gần hơn mặt phẳng lấy nét (tiền cảnh); âm nghĩa là xa hơn (hậu cảnh). Bán kính blur trong shader dùng trực tiếp giá trị này nhân vào offset lấy mẫu.",
        en: "focus - depth positive means the point is closer than the focal plane (foreground); negative means farther (background). The shader multiplies this value directly into the sample offset.",
      },
    ],
    checklist: [
      {
        vi: "Tính đúng blur(A) = 0.12 và blur(B) = -0.15 (đã clamp)",
        en: "Computed blur(A) = 0.12 and blur(B) = -0.15 (clamped) correctly",
      },
      {
        vi: "Giải thích được dấu dương/âm tương ứng tiền cảnh/hậu cảnh so với focus",
        en: "Explained that a positive/negative sign corresponds to foreground/background relative to focus",
      },
      {
        vi: "Giải thích được vì sao thiếu cận dưới -maxblur sẽ cho vật rất xa một bán kính blur không giới hạn",
        en: "Explained why omitting the -maxblur lower bound would let very distant points get an unbounded blur radius",
      },
    ],
  },
  {
    id: "implement-dof-blur-radius",
    kind: "code",
    prompt: {
      vi: `Viết hàm \`dofBlurRadius\` cài đúng công thức xấp xỉ tuyến tính mà \`BokehShader\` của Three.js dùng để suy ra bán kính blur từ depth — cùng công thức vừa tính tay ở bài tập trước, giờ viết thành code chạy được và tổng quát cho mọi tham số.`,
      en: `Write a \`dofBlurRadius\` function implementing the exact linear approximation Three.js's \`BokehShader\` uses to turn depth into a blur radius — the same formula you computed by hand in the previous exercise, now as running code that works for any parameters.`,
    },
    starterCode: `interface DofParams {
  focus: number;
  aperture: number;
  maxblur: number;
}

function dofBlurRadius(depth: number, params: DofParams): number {
  // TODO: blur = clamp((focus - depth) * aperture, -maxblur, maxblur)
  return 0;
}`,
    solutionCode: `interface DofParams {
  focus: number;
  aperture: number;
  maxblur: number;
}

function dofBlurRadius(depth: number, params: DofParams): number {
  const { focus, aperture, maxblur } = params;
  const raw = (focus - depth) * aperture;
  return Math.min(maxblur, Math.max(-maxblur, raw));
}`,
    hints: [
      {
        vi: "Đây đúng dòng `vec2 dofblur = clamp(factor * aperture, -maxblur, maxblur)` trong BokehShader.js, chỉ khác factor = focus - depth (viewZ đã đổi dấu sẵn trong GLSL gốc).",
        en: "This is exactly the `vec2 dofblur = clamp(factor * aperture, -maxblur, maxblur)` line in BokehShader.js, just with factor = focus - depth (the GLSL original pre-negates viewZ).",
      },
      {
        vi: "JS không có clamp built-in — dùng Math.min(max, Math.max(min, x)).",
        en: "JS has no built-in clamp — use Math.min(max, Math.max(min, x)).",
      },
    ],
    checklist: [
      {
        vi: "dofBlurRadius(4, {focus:10, aperture:0.02, maxblur:0.15}) trả về 0.12",
        en: "dofBlurRadius(4, {focus:10, aperture:0.02, maxblur:0.15}) returns 0.12",
      },
      {
        vi: "dofBlurRadius(25, {focus:10, aperture:0.02, maxblur:0.15}) trả về -0.15 (đã clamp, không phải -0.3)",
        en: "dofBlurRadius(25, {focus:10, aperture:0.02, maxblur:0.15}) returns -0.15 (clamped, not -0.3)",
      },
      {
        vi: "dofBlurRadius(10, ...) trả về đúng 0 (điểm nằm tại mặt phẳng lấy nét, nét tuyệt đối)",
        en: "dofBlurRadius(10, ...) returns exactly 0 (the point sits on the focal plane, perfectly sharp)",
      },
    ],
  },
  {
    id: "camera-only-velocity-reconstruction",
    kind: "concept",
    prompt: {
      vi: `Kỹ thuật motion blur "chỉ-từ-camera" dùng đúng hai ma trận $4\\times4$ để tái tạo vector vận tốc màn hình của một pixel, không cần buffer vận tốc riêng. Nêu tên chính xác hai ma trận đó, ma trận nào dùng để làm gì (unproject hay reproject), và giải thích bằng một câu vì sao kỹ thuật này cho vệt mờ sai (bằng 0) với một nhân vật đang chạy giữa một cảnh tĩnh, dù camera đứng yên hay di chuyển.`,
      en: `The "camera-only" motion blur technique uses exactly two $4\\times4$ matrices to reconstruct a pixel's screen-space velocity vector, with no dedicated velocity buffer. Name the two matrices precisely, state which one unprojects and which one reprojects, and explain in one sentence why this technique produces zero blur for a character running through an otherwise static scene, whether or not the camera moves.`,
    },
    hints: [
      {
        vi: "Ma trận thứ nhất nghịch đảo view-projection của camera HIỆN TẠI (dùng để đi từ depth+UV về world position). Ma trận thứ hai là view-projection (không nghịch đảo) của camera FRAME TRƯỚC.",
        en: "The first matrix is the CURRENT camera's inverse view-projection (used to go from depth+UV back to world position). The second is the PREVIOUS frame's (non-inverted) view-projection matrix.",
      },
      {
        vi: "Depth buffer chỉ lưu vị trí hiện tại của bề mặt — nó không biết vật thể đó đã ở đâu một frame trước nếu chính vật đó đã di chuyển, chỉ camera thay đổi mới được mô hình hoá đúng.",
        en: "The depth buffer only stores where a surface is right now — it has no record of where that surface itself was one frame earlier if the object moved; only camera changes are modeled correctly.",
      },
    ],
    checklist: [
      {
        vi: "Nêu đúng: ma trận nghịch đảo view-projection của camera hiện tại, và ma trận view-projection (thuận) của camera frame trước",
        en: "Correctly named: current camera's inverse view-projection matrix, and previous frame's (forward) view-projection matrix",
      },
      {
        vi: "Giải thích đúng chiều dùng: nghịch đảo để unproject (depth+UV → world), thuận để reproject (world → clip-space frame trước)",
        en: "Correctly explained the direction of use: inverse to unproject (depth+UV → world), forward to reproject (world → previous frame's clip-space)",
      },
      {
        vi: "Giải thích được: world position tái tạo lại luôn là vị trí HIỆN TẠI của bề mặt, nên vật tự di chuyển bị tính nhầm là đứng yên",
        en: "Explained that the reconstructed world position is always the surface's CURRENT position, so a self-moving object gets miscounted as stationary",
      },
    ],
  },
];
