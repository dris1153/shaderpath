import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "perlin-1985-image-synthesizer",
    type: "paper",
    title: "An Image Synthesizer",
    authors: ["Ken Perlin"],
    year: 1985,
    url: "https://dl.acm.org/doi/10.1145/325165.325247",
    note: {
      vi: "Bài SIGGRAPH gốc giới thiệu Perlin noise — nguồn của bảng permutation, gradient dựng sẵn và cubic fade $3t^2-2t^3$ mà bài này so sánh với bản 2002.",
      en: "The original SIGGRAPH paper introducing Perlin noise — the source of the permutation table, the predefined gradients, and the cubic fade $3t^2-2t^3$ this lesson contrasts with the 2002 revision.",
    },
  },
  {
    id: "perlin-2002-improving-noise",
    type: "paper",
    title: "Improving Noise",
    authors: ["Ken Perlin"],
    year: 2002,
    url: "https://mrl.cs.nyu.edu/~perlin/paper445.pdf",
    note: {
      vi: "Bài ngắn tự sửa thuật toán 1985 của chính Perlin — nguồn của quintic fade curve $C^2$-liên tục dùng trong demo và hàm perlin2D của bài học.",
      en: "Perlin's own short revision of his 1985 algorithm — the source of the $C^2$-continuous quintic fade curve used in this lesson's demo and perlin2D function.",
    },
  },
  {
    id: "gustavson-2005-simplex-demystified",
    type: "paper",
    title: "Simplex Noise Demystified",
    authors: ["Stefan Gustavson"],
    year: 2005,
    url: "https://www.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf",
    note: {
      vi: "Giải thích chi tiết thuật toán skew/unskew và kernel bán kính của Simplex — nguồn của các hằng số $F_2$, $G_2$ dùng trong công thức KaTeX của bài học.",
      en: "A detailed walkthrough of Simplex's skew/unskew procedure and radial kernel — the source of the $F_2$, $G_2$ constants used in this lesson's KaTeX formulas.",
    },
  },
  {
    id: "us-patent-6867776b2",
    type: "spec",
    title: "US6867776B2 — Standard for Perlin Noise",
    authors: ["Ken Perlin"],
    url: "https://patents.google.com/patent/US6867776B2/en",
    note: {
      vi: "Bằng sáng chế Simplex noise cho tổng hợp texture 3D+ — hết hạn 8/1/2022, nguồn xác nhận mốc thời gian bài học trích dẫn.",
      en: "The Simplex noise patent covering 3D+ texture synthesis — expired January 8, 2022, the source confirming the expiration date this lesson cites.",
    },
  },
  {
    id: "webgl-noise-repo",
    type: "repo",
    title: "webgl-noise",
    authors: ["Ashima Arts", "Stefan Gustavson"],
    url: "https://github.com/stegu/webgl-noise",
    note: {
      vi: "Thư viện GLSL nguồn của hàm simplex2D trong demo bài học — lựa chọn thực dụng được dùng rộng rãi thay vì tự viết lại Simplex từ đầu.",
      en: "The GLSL library this lesson's demo simplex2D function is lifted from — the pragmatic, widely-used choice instead of reimplementing Simplex from scratch.",
    },
  },
  {
    id: "opensimplex2-repo",
    type: "repo",
    title: "OpenSimplex2",
    authors: ["Kurt Spencer (KdotJPG)"],
    url: "https://github.com/KdotJPG/OpenSimplex2",
    note: {
      vi: "Cài đặt tham chiếu (kèm GLSL) của OpenSimplex, thuật toán thay thế không dính patent do chính tác giả gốc duy trì.",
      en: "The reference implementation (GLSL included) of OpenSimplex, the patent-free alternative maintained by its original author.",
    },
  },
];
