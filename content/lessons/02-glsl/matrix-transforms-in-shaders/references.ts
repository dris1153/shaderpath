import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "book-of-shaders-2d-matrices",
    type: "article",
    title: "The Book of Shaders — Chapter 8: Matrices",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/08/",
    note: {
      vi: "Bài gốc dạy dùng ma trận xoay/scale trực tiếp trong GLSL để biến đổi UV — cùng kỹ thuật translate→transform→translate-back của bài này, minh hoạ bằng nhiều ví dụ trực quan.",
      en: "The source lesson for rotating/scaling UV directly in GLSL with matrices — the same translate→transform→translate-back technique this lesson covers, with plenty of visual examples.",
    },
  },
  {
    id: "songho-opengl-transform",
    type: "article",
    title: "OpenGL Transformation — Column-major Matrices",
    authors: ["Song Ho Ahn"],
    url: "https://www.songho.ca/opengl/gl_transform.html",
    note: {
      vi: "Giải thích chi tiết quy ước lưu trữ ma trận theo cột của OpenGL/GLSL — nguồn tham chiếu chuẩn cho lỗi 'gõ nhầm hàng thành cột' nêu trong bài.",
      en: "A detailed explanation of OpenGL/GLSL's column-major storage convention — the reference for the 'typed row-major into a column-major constructor' bug covered in this lesson.",
    },
  },
  {
    id: "khronos-glsl-es-300-spec",
    type: "spec",
    title: "The OpenGL ES Shading Language, Version 3.00",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/OpenGL/specs/es/3.0/GLSL_ES_Specification_3.00.pdf",
    note: {
      vi: "Nguồn chuẩn định nghĩa chính xác cách constructor mat2/mat3/mat4 điền giá trị theo cột — tra khi cần trích dẫn hành vi chính thức thay vì suy luận.",
      en: "The authoritative spec defining exactly how mat2/mat3/mat4 constructors fill values by column — the reference to cite instead of relying on inference.",
    },
  },
];
