import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "book-of-shaders-uniforms",
    type: "article",
    title: "The Book of Shaders — Chapter 3: Uniforms",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/03/",
    note: {
      vi: "Giới thiệu gl_FragCoord và cách chuẩn hoá nó về khoảng 0..1 — đúng công thức pixel→UV của bài này, nhưng viết bằng GLSL thật thay vì giả định suông.",
      en: "Introduces gl_FragCoord and shows how to normalize it into the 0..1 range — the exact pixel-to-UV math this lesson covers, written as real GLSL instead of hand-waving.",
    },
  },
  {
    id: "webgl-fundamentals-3d-textures",
    type: "article",
    title: "WebGL Fundamentals — WebGL 3D Textures",
    authors: ["Gregg Tavares"],
    url: "https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html",
    note: {
      vi: "Giải thích texture coordinate (UV) 0..1 từ góc nhìn của người thực sự viết WebGL thuần — đọc trước khi vào Track 1 để thấy UV space được dùng thật, không chỉ trên lý thuyết.",
      en: "Explains texture coordinates (UV) 0..1 from the perspective of someone writing raw WebGL — read it before Track 1 to see UV space used for real, not just in theory.",
    },
  },
  {
    id: "scratchapixel-coordinate-systems",
    type: "article",
    title: "Scratchapixel — Geometry: Coordinate Systems",
    url: "https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/geometry/coordinate-systems.html",
    note: {
      vi: "Bài viết chặt chẽ nhất về Cartesian coordinates, left-handed/right-handed và quy tắc bàn tay phải — tra cứu khi công thức trong bài này chưa đủ chi tiết.",
      en: "The most rigorous treatment of Cartesian coordinates, left/right-handedness and the right-hand rule — the reference to reach for when this lesson's formulas need more depth.",
    },
  },
  {
    id: "khronos-webgl2-spec",
    type: "spec",
    title: "WebGL 2.0 Specification",
    authors: ["Khronos Group"],
    url: "https://registry.khronos.org/webgl/specs/latest/2.0/",
    note: {
      vi: "Nguồn chuẩn (không phải bài diễn giải lại) định nghĩa (qua OpenGL ES 3.0 spec mà nó tham chiếu) normalized device coordinates, clip space và viewport transform — nơi UV/toạ độ màn hình của bài này cuối cùng đổ vào.",
      en: "The authoritative source (not a paraphrase) defining normalized device coordinates, clip space and the viewport transform — where this lesson's UV/screen coordinates ultimately feed into.",
    },
  },
];
