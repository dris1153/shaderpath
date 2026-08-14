import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "book-of-shaders-noise",
    type: "article",
    title: "The Book of Shaders — Chapter 11: Noise",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/11/",
    note: {
      vi: "Giới thiệu value noise từ 1D lên 2D bằng nội suy giữa các điểm lưới — đúng nền tảng bilinear mà bài này mở rộng thêm fade function và gradient noise.",
      en: "Introduces value noise from 1D to 2D via interpolation between grid points — the exact bilinear foundation this lesson extends with fade functions and gradient noise.",
    },
  },
  {
    id: "perlin-improving-noise",
    type: "paper",
    title: "Improving Noise",
    authors: ["Ken Perlin"],
    year: 2002,
    url: "https://mrl.cs.nyu.edu/~perlin/paper445.pdf",
    note: {
      vi: "Bài báo gốc giới thiệu hàm fade quintic $6t^5-15t^4+10t^3$ dùng trong bài này, cùng lý do smoothstep chưa đủ (đạo hàm bậc hai vẫn gián đoạn).",
      en: "The original paper introducing the quintic fade $6t^5-15t^4+10t^3$ used in this lesson, and why smoothstep alone isn't enough (its second derivative still isn't continuous).",
    },
  },
  {
    id: "iq-more-noise",
    type: "article",
    title: "Inigo Quilez — More Noise",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/morenoise/",
    note: {
      vi: "Phân tích đạo hàm của value noise và ảnh hưởng của việc nội suy tuyến tính vs mượt lên độ liên tục của đạo hàm — cùng vấn đề \"vết hình thoi\" bài này giải thích.",
      en: "Analyzes value noise's derivatives and how linear vs smooth interpolation affects derivative continuity — the same \"diamond artifact\" problem this lesson explains.",
    },
  },
];
