import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "webgl2fundamentals-shaders-glsl",
    type: "article",
    title: "WebGL2 Shaders and GLSL",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html",
    note: {
      vi: "Giải thích shader như một hàm nhận attribute/uniform và trả về gl_Position hoặc màu — nền tảng của cả ba con đường dữ liệu trong bài này.",
      en: "Explains a shader as a function taking attributes/uniforms and returning gl_Position or a color — the foundation for all three data roads in this lesson.",
    },
  },
  {
    id: "webgl2fundamentals-attributes",
    type: "article",
    title: "WebGL2 Attributes",
    authors: ["Gregg Tavares"],
    url: "https://webgl2fundamentals.org/webgl/lessons/webgl-attributes.html",
    note: {
      vi: "Đi sâu vào cách attribute, buffer và VAO phối hợp — đọc cùng phần 'Attribute: dữ liệu theo từng đỉnh' của bài này để thấy đúng API thật.",
      en: "Digs into how attributes, buffers and VAOs cooperate — pair it with this lesson's 'Attribute: Data Per Vertex' section to see the real API in action.",
    },
  },
  {
    id: "mdn-webgl-uniform",
    type: "article",
    title: "WebGLRenderingContext: uniform[1234][fi][v]() method",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform",
    note: {
      vi: "Danh sách đầy đủ họ hàm gl.uniform* và kiểu GLSL tương ứng — tra cứu khi chọn đúng hàm cho float/vec3/mat4.",
      en: "The full list of the gl.uniform* function family and their matching GLSL types — the reference for picking the right call for float/vec3/mat4.",
    },
  },
  {
    id: "khronos-glsl-es-300-spec",
    type: "spec",
    title: "The OpenGL ES Shading Language 3.00 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf",
    note: {
      vi: "Nguồn chuẩn định nghĩa chính xác qualifier in/out/uniform và cách rasterizer nội suy varying — nơi bảng phạm vi/tần suất của bài này bắt nguồn.",
      en: "The authoritative source defining the in/out/uniform qualifiers and how the rasterizer interpolates varyings — where this lesson's scope/frequency table comes from.",
    },
  },
];
