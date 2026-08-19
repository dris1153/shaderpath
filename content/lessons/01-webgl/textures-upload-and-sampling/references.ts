import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "mdn-teximage2d",
    type: "article",
    title: "WebGLRenderingContext: texImage2D() method",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D",
    note: {
      vi: "Tài liệu tham chiếu đầy đủ mọi overload của texImage2D (từ pixel array, ImageBitmap, HTMLImageElement...) — tra khi cần biết chính xác thứ tự tham số.",
      en: "The full reference for every texImage2D overload (pixel array, ImageBitmap, HTMLImageElement...) — check here when the exact argument order matters.",
    },
  },
  {
    id: "mdn-webgl-best-practices",
    type: "article",
    title: "WebGL best practices",
    authors: ["MDN Contributors"],
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices",
    note: {
      vi: "Đề cập chi phí y-flip khi upload và có mục riêng về mipmap — nguồn thực dụng, không chỉ lý thuyết, cho đúng những cạm bẫy bài này nêu ra.",
      en: "Mentions the y-flip upload cost and has a dedicated mipmap section — a practical, not just theoretical, source for exactly the traps this lesson raises.",
    },
  },
  {
    id: "webgl2fundamentals-textures",
    type: "article",
    title: "WebGL2 Fundamentals — WebGL2 Textures",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-3d-textures.html",
    note: {
      vi: "Giải thích texture unit, sampler và wrap mode bằng hình minh hoạ trực quan — bổ sung tốt cho phần công thức của bài này.",
      en: "Explains texture units, samplers and wrap modes with visual diagrams — a good companion to this lesson's formula-heavy sections.",
    },
  },
  {
    id: "khronos-webgl2-spec-textures",
    type: "spec",
    title: "WebGL 2.0 Specification — Texture Objects",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Nguồn chuẩn định nghĩa chính xác hành vi của texParameteri, generateMipmap và các mã lỗi liên quan đến texture incomplete.",
      en: "The authoritative source defining the exact behavior of texParameteri, generateMipmap, and the error conditions around texture incompleteness.",
    },
  },
];
