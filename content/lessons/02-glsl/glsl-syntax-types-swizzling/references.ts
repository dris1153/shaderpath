import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "khronos-glsl-data-types",
    type: "article",
    title: "OpenGL Wiki — Data Type (GLSL)",
    authors: ["Khronos Group"],
    url: "https://www.khronos.org/opengl/wiki/Data_Type_(GLSL)",
    note: {
      vi: "Định nghĩa chính thức các kiểu vô hướng, vector, ma trận và luật swizzle (ba bộ tên xyzw/rgba/stpq không được trộn) — tra cứu khi cần chắc chắn một cú pháp có hợp lệ hay không.",
      en: "The authoritative reference for scalar, vector and matrix types plus the swizzle rules (the xyzw/rgba/stpq sets can't be mixed) — the place to check when unsure whether a piece of syntax is legal.",
    },
  },
  {
    id: "webgl2fundamentals-shaders-and-glsl",
    type: "article",
    title: "WebGL2 Fundamentals — Shaders and GLSL",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html",
    note: {
      vi: "Giải thích 'GLSL rất nghiêm ngặt về kiểu' bằng đúng ví dụ `float f = 1;` gây lỗi biên dịch, cùng ví dụ swizzle `.yyyy`/`.bgra` — góc nhìn thực dụng của người viết WebGL thuần.",
      en: "Walks through 'GLSL is very type strict' with the exact `float f = 1;` compile-error example plus `.yyyy`/`.bgra` swizzle examples — the pragmatic view from someone writing raw WebGL.",
    },
  },
  {
    id: "khronos-glsl-es-3.00-spec-types",
    type: "spec",
    title: "The OpenGL ES Shading Language, Version 3.00 — §5.4 Constructors, §5.5 Vector Components",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf",
    note: {
      vi: "Nguồn chuẩn định nghĩa chính xác luật constructor và swizzle — nơi mọi bài viết diễn giải lại (kể cả bài này) cuối cùng phải khớp theo.",
      en: "The authoritative source defining the exact constructor and swizzle rules — what every paraphrased article (including this lesson) ultimately has to match.",
    },
  },
];
