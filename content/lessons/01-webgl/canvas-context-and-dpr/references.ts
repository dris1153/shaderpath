import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "mdn-canvas-getcontext",
    type: "article",
    title: "MDN — HTMLCanvasElement: getContext() method",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext",
    note: {
      vi: "Danh sách đầy đủ WebGLContextAttributes (antialias, alpha, powerPreference, preserveDrawingBuffer...) và giá trị mặc định chính xác của từng cái.",
      en: "The full list of WebGLContextAttributes (antialias, alpha, powerPreference, preserveDrawingBuffer...) with the exact default value of each.",
    },
  },
  {
    id: "mdn-device-pixel-ratio",
    type: "article",
    title: "MDN — Window: devicePixelRatio property",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio",
    note: {
      vi: "Định nghĩa chính xác devicePixelRatio là gì, khi nào nó đổi (kéo cửa sổ qua màn hình khác, zoom trình duyệt) — lý do resize không chỉ chạy một lần lúc mount.",
      en: "The precise definition of devicePixelRatio and when it changes (dragging a window across displays, browser zoom) — the reason resize logic can't just run once on mount.",
    },
  },
  {
    id: "webglfundamentals-resizing",
    type: "article",
    title: "WebGL Fundamentals — WebGL Resizing the Canvas",
    authors: ["Gregg Tavares"],
    url: "https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html",
    note: {
      vi: "Bài viết gốc đề xuất chính công thức round(clientSize × dpr) và mẫu resize-on-demand dùng trong bài này, kèm giải thích vì sao gán canvas.width tốn kém.",
      en: "The original article proposing the round(clientSize × dpr) formula and the resize-on-demand pattern used in this lesson, with an explanation of why assigning canvas.width is expensive.",
    },
  },
  {
    id: "khronos-webgl2-spec-context",
    type: "spec",
    title: "WebGL 1.0 Specification — §5.2 WebGLContextAttributes",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/1.0/#5.2",
    note: {
      vi: "Nguồn chuẩn định nghĩa chính xác hành vi của từng WebGLContextAttributes ở tầng đặc tả — nơi tra cứu khi hành vi trình duyệt cụ thể có vẻ khác mô tả trong bài.",
      en: "The authoritative spec defining the exact behavior of each WebGLContextAttribute — the reference to check when a specific browser's behavior seems to diverge from this lesson's description.",
    },
  },
];
