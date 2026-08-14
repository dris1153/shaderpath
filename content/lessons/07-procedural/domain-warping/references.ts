import type { Citation } from "../../../types";

export const references: Citation[] = [
  {
    id: "iquilezles-domain-warping",
    type: "article",
    title: "Domain Warping",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/warp/",
    note: {
      vi: "Bài gốc đặt tên và giải thích kỹ thuật của bài học này — công thức f(p + g(p)) và ví dụ nested warp marble/agate dùng chính q, r để tô màu.",
      en: "The original article naming and explaining this lesson's technique — the f(p + g(p)) formula and the nested-warp marble/agate example coloring by q and r directly.",
    },
  },
  {
    id: "iquilezles-fbm",
    type: "article",
    title: "fbm — Fractional Brownian Motion",
    authors: ["Inigo Quilez"],
    url: "https://iquilezles.org/articles/fbm/",
    note: {
      vi: "Nguồn của hàm fbm() dùng làm nền cho mọi lớp warp trong bài — bao gồm phần bàn về chi phí octave mà bài này áp dụng để tính ngân sách warp layer.",
      en: "The source of the fbm() function underlying every warp layer in this lesson — including the octave-cost discussion this lesson applies to budget warp layers.",
    },
  },
  {
    id: "book-of-shaders-fbm",
    type: "article",
    title: "The Book of Shaders — Chapter 13: Fractal Brownian Motion",
    authors: ["Patricio Gonzalez Vivo", "Jen Lowe"],
    url: "https://thebookofshaders.com/13/",
    note: {
      vi: "Bản giải thích fbm() dễ tiếp cận hơn bài của Quilez, kèm ví dụ trực quan cho từng octave — đọc trước nếu công thức fbm() trong bài này còn mơ hồ.",
      en: "A more approachable walkthrough of fbm() than Quilez's own article, with a visual breakdown of each octave — read this first if the fbm() formula in this lesson still feels fuzzy.",
    },
  },
];
