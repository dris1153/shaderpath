import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "book-of-shaders-colors",
    type: "article",
    title: "The Book of Shaders — Chapter 6: Colors",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/06/",
    note: {
      vi: "Giới thiệu mix() để nội suy màu theo toạ độ uv — nền tảng của linear gradient trong bài, trước khi mở rộng sang radial bằng length().",
      en: "Introduces mix() to interpolate color across uv coordinates — the foundation of this lesson's linear gradient, before extending it to radial via length().",
    },
  },
  {
    id: "book-of-shaders-patterns",
    type: "article",
    title: "The Book of Shaders — Chapter 9: Patterns",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/09/",
    note: {
      vi: "Chương gốc của fract(uv*N) làm toán tử tiling, gồm cả brick offset — đúng kỹ thuật bài này dùng, viết bằng GLSL thật thay vì mô tả suông.",
      en: "The original chapter on fract(uv*N) as the tiling operator, including brick offset — the exact technique this lesson uses, in real GLSL rather than a paraphrase.",
    },
  },
  {
    id: "book-of-shaders-2d-matrices",
    type: "article",
    title: "The Book of Shaders — Chapter 8: 2D Matrices",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/08/",
    note: {
      vi: "Nguồn của hàm rotate2d dùng trong bài để xoay toạ độ cục bộ từng ô — cùng công thức ma trận xoay R(θ) đã học ở Track 0, viết lại thành GLSL.",
      en: "The source of the rotate2d function used in this lesson to rotate each cell's local coordinate — the same R(θ) rotation matrix from Track 0, rewritten in GLSL.",
    },
  },
];
