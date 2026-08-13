import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "learnopengl-blending",
    type: "article",
    title: "LearnOpenGL — Blending",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-OpenGL/Blending",
    note: {
      vi: "Giải thích phương trình blend, discard cho alpha cắt cứng, và vì sao vật trong suốt cần sort back-to-front — nền tảng cho phần thứ tự vẽ của bài này.",
      en: "Explains the blend equation, discard for hard-cutout alpha, and why transparent objects need back-to-front sorting — the foundation for this lesson's draw-order section.",
    },
  },
  {
    id: "webglfundamentals-alpha",
    type: "article",
    title: "WebGL Fundamentals — WebGL and Alpha",
    authors: ["Gregg Tavares"],
    url: "https://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html",
    note: {
      vi: "Bài viết trực diện nhất về premultipliedAlpha trong context WebGL và halo artifact khi canvas composite lên trang — đúng chủ đề phần premultiplied alpha của bài này.",
      en: "The most direct treatment of premultipliedAlpha in a WebGL context and the halo artifact that shows up when the canvas composites onto the page — exactly this lesson's premultiplied alpha section.",
    },
  },
  {
    id: "khronos-gles3-glblendfunc",
    type: "spec",
    title: "OpenGL ES 3.0 Reference Pages — glBlendFunc",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glBlendFunc.xhtml",
    note: {
      vi: "Trang tham chiếu chính thức liệt kê đầy đủ các blend factor (SRC_ALPHA, ONE_MINUS_SRC_ALPHA, DST_COLOR, ZERO...) dùng trong cả ba preset của bài này.",
      en: "The official reference page listing every blend factor (SRC_ALPHA, ONE_MINUS_SRC_ALPHA, DST_COLOR, ZERO...) used across all three presets in this lesson.",
    },
  },
  {
    id: "khronos-opengl-wiki-blending",
    type: "article",
    title: "OpenGL Wiki — Blending",
    authors: ["Khronos Group"],
    url: "https://www.khronos.org/opengl/wiki/blending",
    note: {
      vi: "Tham khảo thêm cho blendEquation, blendFuncSeparate và các cách kết hợp factor phổ biến (bao gồm multiply qua DST_COLOR/ZERO như bài này dùng).",
      en: "A further reference on blendEquation, blendFuncSeparate and common factor combinations — including the DST_COLOR/ZERO multiply trick used in this lesson.",
    },
  },
];
