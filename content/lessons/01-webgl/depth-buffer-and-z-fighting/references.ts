import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "learnopengl-depth-testing",
    type: "article",
    title: "LearnOpenGL — Depth Testing",
    authors: ["Joey de Vries"],
    url: "https://learnopengl.com/Advanced-OpenGL/Depth-testing",
    note: {
      vi: "Nguồn của công thức depth phi tuyến dùng trong bài này, kèm hình minh hoạ trực quan vì sao giá trị 0.5 trong buffer không nằm giữa near và far.",
      en: "The source of the non-linear depth formula used in this lesson, with visuals showing why a buffer value of 0.5 is nowhere near the midpoint between near and far.",
    },
  },
  {
    id: "sjbaker-love-your-zbuffer",
    type: "article",
    title: "Learning to Love Your Z-buffer",
    authors: ["Steve Baker"],
    url: "https://web.archive.org/web/2024/https://www.sjbaker.org/steve/omniv/love_your_z_buffer.html",
    note: {
      vi: "Bài viết kinh điển giải thích z_buffer_value = (1<<N)*(a + b/z) và mô tả trực tiếp hiện tượng z-fighting ('flimmering') mà bài này tái tạo trong demo.",
      en: "The classic writeup deriving z_buffer_value = (1<<N)*(a + b/z) and directly describing the z-fighting ('flimmering') artifact this lesson's demo reproduces.",
    },
  },
  {
    id: "khronos-gles3-gldepthfunc",
    type: "spec",
    title: "OpenGL ES 3.0 Reference Pages — glDepthFunc",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL-Refpages/es3.0/html/glDepthFunc.xhtml",
    note: {
      vi: "Trang tham chiếu chính thức liệt kê đầy đủ các depthFunc (LESS, LEQUAL, ALWAYS...) và ngữ nghĩa so sánh chính xác của từng hàm.",
      en: "The official reference page listing every depthFunc value (LESS, LEQUAL, ALWAYS...) and the exact comparison semantics of each.",
    },
  },
  {
    id: "khronos-webgl2-spec",
    type: "spec",
    title: "WebGL 2.0 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Nguồn cho cam kết 'ít nhất 16 bit' của depth buffer mặc định khi tạo context, và định nghĩa depthRange dùng để map NDC z sang giá trị buffer.",
      en: "The source for the 'at least 16 bits' guarantee on a context's default depth buffer, and the definition of depthRange used to map NDC z into a buffer value.",
    },
  },
];
